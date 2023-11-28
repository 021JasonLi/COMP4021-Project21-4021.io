// TODO: UI elements for the game play page


const GamePlayPageUI = (function() {

    // This function initializes the UI
    const initialize = function() {
        // Hide it
        $("#game-play-page").hide();
    };

    const getSocket = function() {
        return socket;
    };

    const canvas = document.querySelector('canvas')
    const c = canvas.getContext('2d')
    
    const socket = io();
    
    const devicePixelRatio = window.devicePixelRatio || 1
    
    canvas.width = 1024 * devicePixelRatio
    canvas.height = 576 * devicePixelRatio
    
    c.scale(devicePixelRatio, devicePixelRatio)
    
    const x = canvas.width / 2
    const y = canvas.height / 2

    const totalGameTime = 180;
    let gameStartTime = 0;
    let timecheck1 = 0;
    let timecheck2 = 0;
    let start = false;

    const sounds = {
      background: new Audio("sound/game-play-music.mp3")
    };
    
    const frontEndPlayers = {}
    const frontEndProjectiles = {}
    const frontEndScoreBoxs = {}
    const frontEndHitboxs = {}

    class Player {
        constructor({ x, y, radius, color, username, hp}) {
          this.x = x,
          this.y = y,
          this.radius = radius,
          this.color = color,
          this.username = username,
          this.hp = hp
        }
      
        draw() {
          c.font = '13px sans-serif'
          c.fillStyle = 'black'
          c.fillText(this.username, this.x - 10, this.y + 20)
          c.save()
          c.shadowColor = this.color
          c.shadowBlur = 5
          c.beginPath()
          c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
          c.fillStyle = this.color
          c.fill()
          c.restore()
        }
    }

    class Projectile {
        constructor({ x, y, radius, color = 'white', velocity }) {
          this.x = x
          this.y = y
          this.radius = radius
          this.color = color
          this.velocity = velocity
        }
      
        draw() {
          c.save()
          c.shadowColor = this.color
          c.shadowBlur = 5
          c.beginPath()
          c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
          c.fillStyle = this.color
          c.fill()
          c.restore()
        }
      
        update() {
          this.draw()
          this.x = this.x + this.velocity.x
          this.y = this.y + this.velocity.y
        }
    }

    class Scorebox {
        constructor({ x, y, radius, color = 'yellow'}) {
          this.x = x
          this.y = y
          this.radius = radius
          this.color = color
        }
      
        draw() {
          c.save()
          c.shadowColor = this.color
          c.shadowBlur = 20
          c.beginPath()
          c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
          c.fillStyle = this.color
          c.fill()
          c.restore()
        }
    }

    class Hitbox {
        constructor({ x, y, radius, color = 'yellow'}) {
          this.x = x
          this.y = y
          this.radius = radius
          this.color = color
        }
      
        draw() {
          c.save()
          c.shadowColor = this.color
          c.shadowBlur = 5
          c.beginPath()
          // c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
          c.rect(this.x - this.radius, this.y - this.radius, this.radius*2, this.radius*2)
          c.fillStyle = this.color
          c.fill()
          c.restore()
        }
    }

    socket.on('updateHitboxs', (backEndHitboxs) => {
        for (const id in backEndHitboxs) {
            const backEndHitbox = backEndHitboxs[id]
        
            if (!frontEndHitboxs[id]) {
                frontEndHitboxs[id] = new Hitbox({
                    x: backEndHitbox.x,
                    y: backEndHitbox.y,
                    radius: backEndHitbox.radius,
                    hp: backEndHitbox.hp, 
                    color: "black"
                })
            } else {
              frontEndHitboxs[id].x += backEndHitboxs[id].velocity.x;
              frontEndHitboxs[id].y += backEndHitboxs[id].velocity.y;
              frontEndHitboxs[id].radius = backEndHitboxs[id].radius;
            }
        }
        
        for (const frontEndHitboxId in frontEndHitboxs) {
            if (!backEndHitboxs[frontEndHitboxId]) {
                delete frontEndHitboxs[frontEndHitboxId]
            }
        }
    })

    

    socket.on('updateScoreBoxs', (backEndScoreBoxs) => {
        for (const id in backEndScoreBoxs) {
            const backEndScoreBox = backEndScoreBoxs[id]
        
            if (!frontEndScoreBoxs[id]) {
                frontEndScoreBoxs[id] = new Scorebox({
                    x: backEndScoreBox.x,
                    y: backEndScoreBox.y,
                    radius: 5,
                    color: "yellow"
                })
            }
        }
        
        for (const frontEndScoreBoxId in frontEndScoreBoxs) {
            if (!backEndScoreBoxs[frontEndScoreBoxId]) {
                delete frontEndScoreBoxs[frontEndScoreBoxId]
            }
        }
    })

    
    socket.on('updateProjectiles', (backEndProjectiles) => {
      for (const id in backEndProjectiles) {
        const backEndProjectile = backEndProjectiles[id]
    
        if (!frontEndProjectiles[id]) {
          frontEndProjectiles[id] = new Projectile({
            x: backEndProjectile.x,
            y: backEndProjectile.y,
            radius: 5,
            color: frontEndPlayers[backEndProjectile.playerId]?.color,
            velocity: backEndProjectile.velocity
          })
        } else {
          frontEndProjectiles[id].x += backEndProjectiles[id].velocity.x
          frontEndProjectiles[id].y += backEndProjectiles[id].velocity.y
        }
      }
    
      for (const frontEndProjectileId in frontEndProjectiles) {
        if (!backEndProjectiles[frontEndProjectileId]) {
          delete frontEndProjectiles[frontEndProjectileId]
        }
      }
    })
    
    socket.on('updatePlayers', (backEndPlayers) => {
      for (const id in backEndPlayers) {
        const backEndPlayer = backEndPlayers[id]
    
        if (!frontEndPlayers[id]) {
            frontEndPlayers[id] = new Player({
                x: backEndPlayer.x,
                y: backEndPlayer.y,
                radius: 10,
                color: backEndPlayer.color,
                username: backEndPlayer.username,
                hp: backEndPlayer.hp,
                hitrate: backEndPlayer.hitrate
            })
    
            document.querySelector(
                '#playerLabels'
            ).innerHTML += `<div data-id="${id}" data-score="${backEndPlayer.score}">${backEndPlayer.username} (Score: ${backEndPlayer.score}, HP: ${backEndPlayer.hp}, Hit Rate: ${backEndPlayer.hitrate}) </div>`
        } else {
            document.querySelector(
                `div[data-id="${id}"]`
            ).innerHTML = `${backEndPlayer.username} (Score: ${backEndPlayer.score}, HP: ${backEndPlayer.hp}, Hit Rate: ${backEndPlayer.hitrate})`
    
            document
                .querySelector(`div[data-id="${id}"]`)
                .setAttribute('data-score', backEndPlayer.score)
            
    
            // sorts the players divs
            const parentDiv = document.querySelector('#playerLabels')
            const childDivs = Array.from(parentDiv.querySelectorAll('div'))
    
            childDivs.sort((a, b) => {
            const scoreA = Number(a.getAttribute('data-score'))
            const scoreB = Number(b.getAttribute('data-score'))
    
            return scoreB - scoreA
        })
    
        // removes old elements
        childDivs.forEach((div) => {
            parentDiv.removeChild(div)
        })

        // adds sorted elements
        childDivs.forEach((div) => {
            parentDiv.appendChild(div)
        })
    
        frontEndPlayers[id].target = {
            x: backEndPlayer.x,
            y: backEndPlayer.y
        }
    
        if (id === socket.id) {
            const lastBackendInputIndex = playerInputs.findIndex((input) => {
              return backEndPlayer.sequenceNumber === input.sequenceNumber
            })
    
            if (lastBackendInputIndex > -1)
              playerInputs.splice(0, lastBackendInputIndex + 1)
    
            playerInputs.forEach((input) => {
              frontEndPlayers[id].target.x += input.dx
              frontEndPlayers[id].target.y += input.dy
            })
          }
        }
      }
    
      // this is where we delete frontend players
      for (const id in frontEndPlayers) {
        if (!backEndPlayers[id]) {
          const divToDelete = document.querySelector(`div[data-id="${id}"]`)
          divToDelete.parentNode.removeChild(divToDelete)
    
          delete frontEndPlayers[id]
        }
      }
    //   console.log(frontEndPlayers);
    })
    
    let animationId
    function animate() {
        socket.on("start", () => {
            start = true;
            sounds.background.play();
        })
        if (start){
            now = Date.now();
            // console.log(now);
            if (gameStartTime == 0) gameStartTime = now;

            /* Update the time remaining */
            const gameTimeSoFar = now - gameStartTime;
            const timeRemaining = Math.ceil((totalGameTime * 1000 - gameTimeSoFar) / 1000);
            // console.log(timeRemaining);
            

            if ((timeRemaining % 10 == 0) && (timecheck1 != timeRemaining)){
                timecheck1 = timeRemaining;
                // console.log("Get");
                socket.emit('generate-scorebox');
                // console.log(frontEndScoreBoxs)
            }
            if ((timeRemaining % 15 == 0) && (timecheck2 != timeRemaining)){
                timecheck2 = timeRemaining;
                // console.log("Get");
                socket.emit('generate-hitbox');
                // console.log(frontHitboxs)
            }
            // $("#timecount").text(timeRemaining);
            document.querySelector('#timecount').innerHTML = `Time Left: <tspan>${timeRemaining}</tspan>`

            console.log(Object.keys(frontEndPlayers).length);
            if ((timeRemaining < 0) || (Object.keys(frontEndPlayers).length == 1)){
              start = false;
              sounds.background.pause();
              gameStartTime = 0;

              console.log(totalGameTime);
              socket.emit("GameEnd");
              GameOverPageUI.show();
            }
        }


        animationId = requestAnimationFrame(animate)
        // c.fillStyle = 'rgba(0, 0, 0, 0.1)'
        c.clearRect(0, 0, canvas.width, canvas.height)
    
        for (const id in frontEndPlayers) {
            const frontEndPlayer = frontEndPlayers[id]
        
            // linear interpolation
            if (frontEndPlayer.target) {
            frontEndPlayers[id].x +=
                (frontEndPlayers[id].target.x - frontEndPlayers[id].x) * 0.5
            frontEndPlayers[id].y +=
                (frontEndPlayers[id].target.y - frontEndPlayers[id].y) * 0.5
            }
            
            frontEndPlayer.draw()
        }
        
        for (const id in frontEndProjectiles) {
            const frontEndProjectile = frontEndProjectiles[id]
            frontEndProjectile.draw()
        }

        for (const id in frontEndScoreBoxs) {
            const frontEndScoreBox = frontEndScoreBoxs[id]
            frontEndScoreBox.draw()
        }

        for (const id in frontEndHitboxs) {
            const frontEndHitbox = frontEndHitboxs[id]
            frontEndHitbox.draw()
        }
    }
    
    animate()
    
    const keys = {
      w: {
        pressed: false
      },
      a: {
        pressed: false
      },
      s: {
        pressed: false
      },
      d: {
        pressed: false
      },
      shift: {
        pressed: false
      }
    }
    
    const SPEED = 5
    const playerInputs = []
    let sequenceNumber = 0
    setInterval(() => {
      if (keys.w.pressed) {
        sequenceNumber++;
        playerInputs.push({ sequenceNumber, dx: 0, dy: -SPEED });
        // frontEndPlayers[socket.id].y -= SPEED;
        socket.emit('keydown', { keycode: 'KeyW', sequenceNumber });
      }
    
      if (keys.a.pressed) {
        sequenceNumber++;
        playerInputs.push({ sequenceNumber, dx: -SPEED, dy: 0 });
        // frontEndPlayers[socket.id].x -= SPEED;
        socket.emit('keydown', { keycode: 'KeyA', sequenceNumber });
      }
    
      if (keys.s.pressed) {
        sequenceNumber++;
        playerInputs.push({ sequenceNumber, dx: 0, dy: SPEED });
        // frontEndPlayers[socket.id].y += SPEED;
        socket.emit('keydown', { keycode: 'KeyS', sequenceNumber });
      }
    
      if (keys.d.pressed) {
        sequenceNumber++;
        playerInputs.push({ sequenceNumber, dx: SPEED, dy: 0 });
        // frontEndPlayers[socket.id].x += SPEED;
        socket.emit('keydown', { keycode: 'KeyD', sequenceNumber });
      }

      // console.log(keys.shift.pressed);
      if (keys.shift.pressed) {
        socket.emit('cheat', ({check: keys.shift.pressed, socketid: socket.id}));
      }
      else{
        socket.emit('cheat', ({check: keys.shift.pressed, socketid: socket.id}));
      }

    }, 15)
    
    document.addEventListener('keydown', (event) => {
      if (!frontEndPlayers[socket.id]) return
    
      switch (event.code) {
        case 'KeyW':
            keys.w.pressed = true;
            break;
    
        case 'KeyA':
            keys.a.pressed = true;
            break;
    
        case 'KeyS':
            keys.s.pressed = true;
            break;
    
        case 'KeyD':
            keys.d.pressed = true;
            break;
        
        case 'ShiftLeft':
            keys.shift.pressed = true;
            break;
      }
    })
    
    document.addEventListener('keyup', (event) => {
      if (!frontEndPlayers[socket.id]) return
    
      switch (event.code) {
        case 'KeyW':
            keys.w.pressed = false;
            break;
    
        case 'KeyA':
            keys.a.pressed = false;
            break;
    
        case 'KeyS':
            keys.s.pressed = false;
            break;
    
        case 'KeyD':
            keys.d.pressed = false;
            break;
        
        case 'ShiftLeft':
            keys.shift.pressed = false;
            break;
      }
    })
    

    addEventListener('click', (event) => {
        const canvas = document.querySelector('canvas');
        const { top, left } = canvas.getBoundingClientRect();

        const playerPosition = {
          y: frontEndPlayers[socket.id].y,
          x: frontEndPlayers[socket.id].x
        }
      
        const angle = Math.atan2(
          event.clientY - top - playerPosition.y,
          event.clientX - left - playerPosition.x
        )
      
        socket.emit('shoot', {
          x: playerPosition.x,
          y: playerPosition.y,
          angle
        })
    })


    return { initialize, getSocket };
})();
