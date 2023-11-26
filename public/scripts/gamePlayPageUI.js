// TODO: UI elements for the game play page
const Game = (function() {
    
    const initialize = function() {
        const cv = $("canvas").get(0);
        const context = cv.getContext("2d");

        const socket = io()

        cv.width = 1024
        cv.height = 576

        const x = cv.width / 2
        const y = cv.height / 2

        const totalGameTime = 1000;   // Total game time in seconds
        const gemMaxAge = 3000;     // The maximum age of the gems in milliseconds
        let gameStartTime = 0;      // The timestamp when the game starts
        let collectedGems = 0;      // The number of gems collected in the game

         const frontEndPlayers = {}

        /* Create the game area */
        const gameArea = BoundingBox(context, 0, 0, cv.height, cv.width);

        /* Create the sprites in the game */

        // const player = Player(context, 427, 240, gameArea); // The player
        // const gem = Gem(context, 427, 350, "green");        // The gem
        // const Fire = [
        //     fire(context, gameArea.getLeft(), gameArea.getTop()),
        //     fire(context, gameArea.getRight(), gameArea.getTop()),
        //     fire(context, gameArea.getLeft(), gameArea.getBottom()),
        //     fire(context, gameArea.getRight(), gameArea.getBottom()),
        // ];

        // gem.randomize(gameArea);

        socket.on('updatePlayers', (backEndPlayers) => {
            for (const id in backEndPlayers) {
              const backEndPlayer = backEndPlayers[id]
          
              if (!frontEndPlayers[id]) {
                frontEndPlayers[id] = Player(context, backEndPlayer.x, backEndPlayer.y, gameArea);
          
              }
            }

            for (const id in frontEndPlayers){
              if (!backEndPlayers[id]){
                delete frontEndPlayers[id];
              }
            }

            console.log(frontEndPlayers);
        })
        
        // let animationId
        // function animate() {
        //   animationId = requestAnimationFrame(animate)
        //   // c.fillStyle = 'rgba(0, 0, 0, 0.1)'
        //   context.clearRect(0, 0, cv.width, cv.height)
      
        //   for (const id in frontEndPlayers) {
        //       const frontEndPlayer = frontEndPlayers[id]
      
        //       frontEndPlayer.draw()
        //   }
        // }
        // animate()

        function doFrame(now) {
          if (gameStartTime == 0) gameStartTime = now;

          /* Update the time remaining */
          const gameTimeSoFar = now - gameStartTime;
          const timeRemaining = Math.ceil((totalGameTime * 1000 - gameTimeSoFar) / 1000);
          $("#time-remaining").text(timeRemaining);


          /* TODO */
          /* Handle the game over situation here */
          if (timeRemaining == 0){
              // sounds.background.pause();
              // sounds.collect.pause();
              // sounds.gameover.play();
              $("#final-gems").text(collectedGems);
              $("#game-over").show();
              return;
          }


          /* Update the sprites */
          // gem.update(now);
          // player.update(now);
          // Fire[0].update(now);
          // Fire[1].update(now);
          // Fire[2].update(now);
          // Fire[3].update(now);
          for (const id in frontEndPlayers) {
            const frontEndPlayer = frontEndPlayers[id]
            frontEndPlayer.update(now);
          }


          /* TODO */
          /* Randomize the gem and collect the gem here */
          // if (gem.getAge(now) > gemMaxAge){
          //     gem.randomize(gameArea);
          // }

          // gem_position = gem.getXY();
          // // console.log(gem_position);
          // // console.log(player.getBoundingBox().isPointInBox(gem_position["x"],gem_position["y"]));
          // if (player.getBoundingBox().isPointInBox(gem_position["x"],gem_position["y"])){
          //     sounds.collect.play();
          //     collectedGems++;
          //     gem.randomize(gameArea);
          // }
          // console.log(collectedGems);

          /* Clear the screen */
          context.clearRect(0, 0, cv.width, cv.height);

          /* Draw the sprites */
          // gem.draw();
          // player.draw();
          // Fire[0].draw();
          // Fire[1].draw();
          // Fire[2].draw();
          // Fire[3].draw();
          for (const id in frontEndPlayers) {
            const frontEndPlayer = frontEndPlayers[id]
            frontEndPlayer.draw()
          }



          /* Process the next frame */
          requestAnimationFrame(doFrame);
      }

      /* Handle the start of the game */

      requestAnimationFrame(doFrame);


    };
    return { initialize};
})();

const GamePlayPageUI = (function() {
    // The components of the UI are put here
    const components = [Game];

    // This function initializes the UI
    const initialize = function() {
        // Hide it
        $("#game-play-page").hide();
        // Initialize the components
        for (const component of components) {
            component.initialize();
        }
    };

    return { initialize };
})();
