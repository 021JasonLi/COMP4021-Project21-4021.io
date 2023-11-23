// TODO: UI elements for the game over page


const GameOverPageUI = (function() {
    // The components of the UI are put here
    const components = [];

    // This function initializes the UI
    const initialize = function() {
        // Hide it
        $("#game-over-page").hide();
        // Initialize the components
        for (const component of components) {
            component.initialize();
        }
    };

    return { initialize };
})();
