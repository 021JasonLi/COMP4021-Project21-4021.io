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
                    GameFrontPage.userPanelUpdate(Authentication.getUser());
                    GameFrontPage.userPanelShow();
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

const GameFrontPage = (function() {
    // This function initializes the UI
    const initialize = function() {
        // Hide the user panel
        userPanelHide();

        // Click event for the signout button
        $("#signout-button").on("click", () => {
            // Send a signout request
            Authentication.signout(
                () => {
                    Socket.disconnect(); 
                    userPanelHide();
                    SignInForm.show();
                }
            );
        });
    }

    // This function shows the user panel
    const userPanelShow = function(user) {
        $("#user-panel").show();
    };

    // This function hides the user panel
    const userPanelHide = function() {
        $("#user-panel").hide();
    };

    // This function updates the user panel
    const userPanelUpdate = function(user) {
        if (user) {
            $("#user-panel .user-name").text(user.name);
        }
        else {
            $("#user-panel .user-name").text("");
        }
    };

    // This function updates the online users panel
    const onlineUserPanelUpdate = function(onlineUsers) {
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
	const onlineUserPanelAddUser = function(user) {
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
	const onlineUserPanelRemoveUser = function(user) {
        const onlineUsersArea = $("#online-users-area");
		// Find the user
		const userDiv = onlineUsersArea.find("#username-" + user.username);
		// Remove the user
		if (userDiv.length > 0) userDiv.remove();
	};

    return { initialize, userPanelShow, userPanelHide, userPanelUpdate, 
        onlineUserPanelUpdate, onlineUserPanelAddUser, onlineUserPanelRemoveUser };
})();

const GamePlayPage = (function() {
    // This function initializes the UI
    const initialize = function() {
        // Hide it
        $("#game-play-page").hide();

    }

    return { initialize };
})();

const GameOverPage = (function() {
    // This function initializes the UI
    const initialize = function() {
        // Hide it
        $("#game-over-page").hide();

    }

    return { initialize };
})();

const UI = (function() {
    // This function gets the user display
    const getUserDisplay = function(user) {
        return $("<div class='field-content row shadow'></div>")
            .append($("<span class='user-name'>" + user.name + "</span>"));
    };

    // The components of the UI are put here
    const components = [SignInForm, GameFrontPage, GamePlayPage, GameOverPage];

    // This function initializes the UI
    const initialize = function() {
        // Initialize the components
        for (const component of components) {
            component.initialize();
        }
    };

    return { getUserDisplay, initialize };
})();
