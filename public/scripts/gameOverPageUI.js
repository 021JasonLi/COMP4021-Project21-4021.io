const UserPanelOverPage = (function() {
    // This function initializes the UI
    const initialize = function() {
        // Hide it
        $("#user-panel-over-page").hide();
        // Click event for the signout button
        $("#signout-button2").on("click", () => {
            // Send a signout request
            Authentication.signout(
                () => {
                    Socket.disconnect();
                    hide();
                    UserPanel.hide();
                    SignInForm.show();
                    $("#ready-button").prop("disabled", false);
                }
            );
            // Hide the game over page
            $("#game-over-page").hide();
            // Show the game front page
            $("#game-front-page").show();
        });
    };

    // This function shows the form with the user
    const show = function() {
        $("#user-panel-over-page").show();
    };

    // This function hides the form
    const hide = function() {
        $("#user-panel-over-page").hide();
    };

    // This function updates the user panel
    const update = function(user) {
        if (user) {
            $("#user-panel-over-page .user-name").text(user.name);
        }
        else {
            $("#user-panel-over-page .user-name").text("");
        }
    };

    return { initialize, show, hide, update };
})();

const GameOverPageUI = (function() {
    // This function initializes the UI
    const initialize = function() {
        // Hide it
        $("#game-over-page").hide();

        // Initialize the user panel
        UserPanelOverPage.initialize();

        // Set up the play again button
        $("#play-again-button").on("click", () => {
            $("#game-over-page").hide();
            $("#game-front-page").show();
        });
    };

    const show = function() {
        // Get the data from backend
        fetch("/game-over-data")
            .then((res) => res.json())
            .then((json) => {
                if (json.status == "success") {
                    const winner = json.winner;
                    $("#game-over-winner").text(winner + " wins!");

                    const playersStats = json.players;
                    const playersStatsTable = $("#player-stats");
                    playersStatsTable.find("tbody").empty(); // Clear the table body

                    for (const player in playersStats) {
                        const stats = playersStats[player];
                        const row = $("<tr></tr>");
                        const playerCell = $("<td></td>").text(player);
                        const scoreCell = $("<td></td>").text(stats.Score);
                        const deathCell = $("<td></td>").text(stats.Hitrate);
                        row.append(playerCell);
                        row.append(scoreCell);
                        row.append(killCell);
                        row.append(deathCell);
                        playersStatsTable.append(row);
                    }
                }
            })

        // Hide the game play page
        $("#game-play-page").hide();
        // Disable the ready button
        $("#ready-button").prop("disabled", false);
        // Show the game over page
        $("#game-over-page").show();
    }

    return { initialize, show };
})();
