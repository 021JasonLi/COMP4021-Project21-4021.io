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

    // This function initializes the UI
    const initialize = function() {
        // Initialize each page
        GameFrontPageUI.initialize();
        GamePlayPageUI.initialize();
        GameOverPageUI.initialize();
    };

    return { getUserDisplay, initialize };
})();
