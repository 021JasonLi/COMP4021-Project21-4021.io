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
        // const frontEndProjectiles = {}

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
              else{
                //if a player already exists
                switch (backEndPlayer.code) {
                  case 2:
                    frontEndPlayers[id].move(2);
                    break;
              
                  case 1:
                    frontEndPlayers[id].move(1);
                    break
              
                  case 4:
                    frontEndPlayers[id].move(4);
                    break
              
                  case 3:
                    frontEndPlayers[id].move(3);
                    break

                  case 6:
                    frontEndPlayers[id].stop(2);
                    break;
              
                  case 5:
                    frontEndPlayers[id].stop(1);
                    break
              
                  case 8:
                    frontEndPlayers[id].stop(4);
                    break
              
                  case 7:
                    frontEndPlayers[id].stop(3);
                    break
                }

                // if (backEndPlayer.code == 2){
                //   frontEndPlayers[id].move(2);
                // }

                // if (backEndPlayer.code == 1){
                //   frontEndPlayers[id].move(1);
                // }

                // if (backEndPlayer.code == 4){
                //   frontEndPlayers[id].move(4);
                // }

                // if (backEndPlayer.code == 3){
                //   frontEndPlayers[id].move(3);
                // }

                // if (backEndPlayer.code == 6){
                //   frontEndPlayers[id].stop(2);
                // }

                // if (backEndPlayer.code == 5){
                //   frontEndPlayers[id].stop(1);
                // }

                // if (backEndPlayer.code == 8){
                //   frontEndPlayers[id].stop(4);
                // }

                // if (backEndPlayer.code == 7){
                //   frontEndPlayers[id].stop(3);
                // }

              }
            }
            for (const id in frontEndPlayers){
              if (!backEndPlayers[id]){
                delete frontEndPlayers[id];
              }
            }
            // console.log(frontEndPlayers);
        })
        


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

      /* faster response? = false */
      // const keys = {
      //   w: {
      //     pressed: false
      //   },
      //   a: {
      //     pressed: false
      //   },
      //   s: {
      //     pressed: false
      //   },
      //   d: {
      //     pressed: false
      //   }
      // }

      // setInterval(() => {
      //   if (keys.w.pressed) {
      //     frontEndPlayers[socket.id].move(2);
      //     socket.emit('keydown', 'KeyW');
      //   }
      //   else{
      //     frontEndPlayers[socket.id].stop(2);
      //     socket.emit('keyup', 'KeyW');
      //   }
      
      //   if (keys.a.pressed) {
      //     frontEndPlayers[socket.id].move(1);
      //     socket.emit('keydown', 'KeyA');
      //   }
      //   else{
      //     frontEndPlayers[socket.id].stop(1);
      //     socket.emit('keyup', 'KeyA');
      //   }
      
      //   if (keys.s.pressed) {
      //     frontEndPlayers[socket.id].move(4);
      //     socket.emit('keydown', 'KeyS');
      //   }
      //   else{
      //     frontEndPlayers[socket.id].stop(4);
      //     socket.emit('keyup', 'KeyS');
      //   }
      
      //   if (keys.d.pressed) {
      //     frontEndPlayers[socket.id].move(3);
      //     socket.emit('keydown', 'KeyD');
      //   }
      //   else{
      //     frontEndPlayers[socket.id].stop(3);
      //     socket.emit('keyup', 'KeyD');
      //   }
      // })

      window.addEventListener('keydown', (event) => {
        if (!frontEndPlayers[socket.id]) return
      
        switch (event.code) {
          case 'KeyW':
            frontEndPlayers[socket.id].move(2);
            socket.emit('keydown', 'KeyW');
            break;
      
          case 'KeyA':
            frontEndPlayers[socket.id].move(1);
            socket.emit('keydown', 'KeyA');
            break
      
          case 'KeyS':
            frontEndPlayers[socket.id].move(4);
            socket.emit('keydown', 'KeyS');
            break
      
          case 'KeyD':
            frontEndPlayers[socket.id].move(3);
            socket.emit('keydown', 'KeyD');
            break
        }
      })

      window.addEventListener('keyup', (event) => {
        if (!frontEndPlayers[socket.id]) return
      
        switch (event.code) {
          case 'KeyW':
            frontEndPlayers[socket.id].stop(2);
            socket.emit('keyup', 'KeyW');
            break
      
          case 'KeyA':
            frontEndPlayers[socket.id].stop(1);
            socket.emit('keyup', 'KeyA');
            break
      
          case 'KeyS':
            frontEndPlayers[socket.id].stop(4);
            socket.emit('keyup', 'KeyS');
            break
      
          case 'KeyD':
            frontEndPlayers[socket.id].stop(3);
            socket.emit('keyup', 'KeyD');
            break
        }
      })

      /* Handle the start of the game */

      requestAnimationFrame(doFrame);


      // Movement

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
