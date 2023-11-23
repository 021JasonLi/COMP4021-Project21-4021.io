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
        if (user.ready) {
            return $("<div class='field-content row shadow'></div>")
                .append($("<span class='user-name'>" + user.name + " &#9989; READY!" + "</span>"))
        }
        else {
            return $("<div class='field-content row shadow'></div>")
                .append($("<span class='user-name'>" + user.name + "</span>"));
        }
    };

    // The components of the UI are put here
    const components = [GamePlayPage, GameOverPage];
    
    // This function initializes the UI
    const initialize = function() {
        // Initialize the components
        GameFrontPageUI.initialize();
        for (const component of components) {
            component.initialize();
        }
    };

    return { getUserDisplay, initialize };
})();
