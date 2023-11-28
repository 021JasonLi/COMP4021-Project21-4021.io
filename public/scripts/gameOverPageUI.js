const GameOverPageUI = (function() {
    // This function initializes the UI
    const initialize = function() {
        // Hide it
        $("#game-over-page").hide();

        // Set up the play again button
        $("#play-again-button").on("click", () => {
            $("#game-over-page").hide();
            $("#game-front-page").show();
            Socket.resetReady();
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
                        const scoreCell = $("<td></td>").text(stats.score);
                        const killCell = $("<td></td>").text(stats.hp);
                        const deathCell = $("<td></td>").text(stats.hitrate);
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
        // Show the game over page
        $("#game-over-page").show();
    }

    return { initialize, show };
})();
