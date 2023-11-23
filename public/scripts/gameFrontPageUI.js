const SignInForm = (function() {
    // This function initializes the UI
    const initialize = function() {
        // Hide it
        $("#signin-overlay").hide();

        // Submit event for the signin form
        $("#signin-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const username = $("#signin-username").val().trim();
            const password = $("#signin-password").val().trim();

            // Send a signin request
            Authentication.signin(username, password,
                () => {
                    hide();
                    UserPanel.update(Authentication.getUser());
                    UserPanel.show();
                    Socket.connect();
                },
                (error) => { $("#signin-message").text(error); }
            );
        });

        // Submit event for the register form
        $("#register-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const username = $("#register-username").val().trim();
            const name     = $("#register-name").val().trim();
            const password = $("#register-password").val().trim();
            const confirmPassword = $("#register-confirm").val().trim();

            // Password and confirmation does not match
            if (password != confirmPassword) {
                $("#register-message").text("Passwords do not match.");
                return;
            }

            // Send a register request
            Registration.register(username, name, password,
                () => {
                    $("#register-form").get(0).reset();
                    $("#register-message").text("You can sign in now.");
                },
                (error) => { $("#register-message").text(error); }
            );
        });
    };

    // This function shows the form
    const show = function() {
        $("#signin-overlay").fadeIn(500);
    };

    // This function hides the form
    const hide = function() {
        $("#signin-form").get(0).reset();
        $("#signin-message").text("");
        $("#register-message").text("");
        $("#signin-overlay").fadeOut(500);
    };

    return { initialize, show, hide };
})();

const UserPanel = (function() {
    // This function initializes the UI
    const initialize = function() {
        // Hide it
        $("#user-panel").hide();
        // Click event for the signout button
        $("#signout-button").on("click", () => {
            // Send a signout request
            Authentication.signout(
                () => {
                    Socket.disconnect();
                    hide();
                    SignInForm.show();
                    $("#ready-button").prop("disabled", false);
                }
            );
        });
    };

    // This function shows the form with the user
    const show = function() {
        $("#user-panel").show();
    };

    // This function hides the form
    const hide = function() {
        $("#user-panel").hide();
    };

    // This function updates the user panel
    const update = function(user) {
        if (user) {
            $("#user-panel .user-name").text(user.name);
        }
        else {
            $("#user-panel .user-name").text("");
        }
    };

    return { initialize, show, hide, update };
})();

const OnlineUsersPanel = (function() {
    // This function initializes the UI
    const initialize = function() {};
    // This function updates the online users panel
    const update = function(onlineUsers) {
        const onlineUsersArea = $("#online-users-area");
        // Clear the online users area
        onlineUsersArea.empty();
		// Get the current user
        const currentUser = Authentication.getUser();
        // Add the user one-by-one
        for (const username in onlineUsers) {
            if (username != currentUser.username) {
                onlineUsersArea.append(
                    $("<div id='username-" + username + "'></div>")
                        .append(UI.getUserDisplay(onlineUsers[username]))
                );
            }
        }
    };

    // This function adds a user in the panel
	const addUser = function(user) {
        const onlineUsersArea = $("#online-users-area");
		// Find the user
		const userDiv = onlineUsersArea.find("#username-" + user.username);
		// Add the user
		if (userDiv.length == 0) {
			onlineUsersArea.append(
				$("<div id='username-" + user.username + "'></div>")
					.append(UI.getUserDisplay(user))
			);
		}
	};

    // This function removes a user from the panel
	const removeUser = function(user) {
        const onlineUsersArea = $("#online-users-area");
		// Find the user
		const userDiv = onlineUsersArea.find("#username-" + user.username);
		// Remove the user
		if (userDiv.length > 0) userDiv.remove();
	};

    // This functions updates a user from not ready to ready
    const updateUser = function(user) {
        const onlineUsersArea = $("#online-users-area");
        // Find the user
        const userDiv = onlineUsersArea.find("#username-" + user.username);
        // Remove the user
        if (userDiv.length > 0) {
            userDiv.empty();
            userDiv.append(UI.getUserDisplay(user));
        }
    }

    return { initialize, update, addUser, removeUser, updateUser };
})();

const HowToPlayPanel = (function() {
    // This function initializes the UI
    const initialize = function() {
         // Click event for the ready button
         $("#ready-button").on("click", () => {
            // Send a ready request
            Socket.ready();
            // Disable the ready button
            $("#ready-button").prop("disabled", true);
        });
    };

    return { initialize };
})();

const CountDownOverlay = (function() {
    // This function initializes the UI
    const initialize = function() {
        // Hide it
        $("#countdown-overlay").hide();
    };

    // This function shows the overlay and starts the countdown
    const show = function() {
        let timeRemaining = parseInt($("#countdown").text());

        function countdown() {
            // Decrease the remaining time
            timeRemaining -= 1;

            // Continue the countdown if there is still time;
            // otherwise, start the game when the time is up
            if (timeRemaining > 0) {
                $("#countdown").text(timeRemaining);
                setTimeout(countdown, 1000);
            } else {
                $("#countdown").text("Start!");
                GameFrontPageUI.startGame();
            }
        }

        // Show the countdown overlay
        $("#countdown-overlay").show();
        // Start the countdown
        setTimeout(countdown, 1000);
    };

    return { initialize, show };
})();

const GameFrontPageUI = (function() {
    // The components of the UI are put here
    const components = [SignInForm, UserPanel, OnlineUsersPanel, HowToPlayPanel, CountDownOverlay];

    // This function initializes the UI
    const initialize = function() {
        // Initialize the components
        for (const component of components) {
            component.initialize();
        }
    };

    // This functions starts the game
    const startGame = function() {
        // Fade out the countdown overlay
        $("#countdown-overlay").fadeOut(300);
        // Hide the game front page
        $("#game-front-page").hide();
        // Show the game play page
        $("#game-play-page").show();
    };

    return { initialize, startGame };
})();
