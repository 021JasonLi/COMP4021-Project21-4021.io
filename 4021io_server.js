const express = require("express");

const bcrypt = require("bcrypt");
const fs = require("fs");
const session = require("express-session");

const { createServer } = require("http");
const { Server } = require("socket.io");

const onlineUsers = {};

// Create the Express app
const app = express();

// Use the 'public' folder to serve static files
app.use(express.static("public"));

// Use the json middleware to parse JSON data
app.use(express.json());

// Use the session middleware to maintain sessions
const chatSession = session({
    secret: "game",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { maxAge: 300000 }
});
app.use(chatSession);

// This helper function checks whether the text only contains word characters
function containWordCharsOnly(text) {
    return /^\w+$/.test(text);
}

// Handle the /register endpoint
app.post("/register", (req, res) => {
    // Get the JSON data from the body
    const { username, name, password } = req.body;

    // Reading the users.json file
    const users = JSON.parse(fs.readFileSync("./data/users.json"));

    // Checking for the user data correctness
    // 1. Username, name and password are not empty
    if ((!username) || (!name) || (!password)) {
        res.json({
            status: "error",
            error: "Username/name/password cannot be empty."
        });
        return;
    }
    // 2. The username contains only underscores, letters or numbers 
    if (!containWordCharsOnly(username)) {
        res.json({
            status: "error",
            error: "Username contains invalid characters."
        });
        return;
    }
    // 3. The username does not exist in the current list of users 
    if (username in users) {
        res.json({
            status: "error",
            error: "Username has already been used."
        });
        return;
    }

    // Adding the new user account
    const hash = bcrypt.hashSync(password, 10);

    // Saving the users.json file
    users[username] = { name, password: hash };
    fs.writeFileSync("./data/users.json", JSON.stringify(users, null, "  "));

    // Sending a success response to the browser
    res.json({ status: "success" });

});

// Handle the /signin endpoint
app.post("/signin", (req, res) => {
    // Only allow sign in if no more than 4 users are online
    if (Object.keys(onlineUsers).length >= 4) {
        res.json({
            status: "error",
            error: "Too many users online."
        });
        return;
    }

    // Get the JSON data from the body
    const { username, password } = req.body;

    // Reading the users.json file
    const users = JSON.parse(fs.readFileSync("./data/users.json"));

    // Checking for username/password
    if (!(username in users)) {
        res.json({
            status: "error",
            error: "Incorrect username/password."
        });
        return;
    }

    const hashedPassword = users[username].password;
    if (!bcrypt.compareSync(password, hashedPassword)) {
        res.json({
            status: "error",
            error: "Incorrect username/password."
        });
        return;
    }

    // Sending a success response with the user account
    const output = { 
        username,
        name: users[username].name,
        ready: false
    };
    req.session.user = output;
    res.json({
        status: "success",
        user: output
    });

});

// Handle the /validate endpoint
app.get("/validate", (req, res) => {
    // Only allow sign in if no more than 4 users are online
    if (Object.keys(onlineUsers).length >= 4) {
        res.json({
            status: "error",
            error: "Too many users online."
        });
        return;
    }

    // Getting req.session.user
    const user = req.session.user;
    if (!user) {
        res.json({
            status: "error",
            error: "Session expired.",
        });
        return;
    }

    // Sending a success response with the user account
    res.json({
        status: "success",
        user
    });
 
});

// Handle the /signout endpoint
app.get("/signout", (req, res) => {
    // Deleting req.session.user
    delete req.session.user;
    
    // Sending a success response
    res.json({
        status: "success"
    });

});

// Create the socket server
const httpServer = createServer(app);
const io = new Server(httpServer, { pingInterval: 2000, pingTimeout: 5000 }); 

io.use((socket, next) => {
    chatSession(socket.request, {}, next);
});

io.on("connection", (socket) => {
    if (socket.request.session.user) {
        // Add a new user to the online user list
        onlineUsers[socket.request.session.user.username] = {
            name: socket.request.session.user.name,
            ready: false
        };
        // Broadcast to all clients to add user
        io.emit("add user", JSON.stringify(socket.request.session.user));
    }

    socket.on("disconnect", () => {
        if (socket.request.session.user) {
            // Remove the user from the online user list
            delete onlineUsers[socket.request.session.user.username];
            // Broadcast to all clients to remove user
            io.emit("remove user", JSON.stringify(socket.request.session.user));
        }
    });

    socket.on("get users", () => {
        // Send the online users to the browser
        socket.emit("users", JSON.stringify(onlineUsers));
    });

    socket.on("ready", () => {
        // Update the ready status of the user
        onlineUsers[socket.request.session.user.username].ready = true;
        socket.request.session.user.ready = true;
        // Broadcast to all clients to update user
        io.emit("update user", JSON.stringify(socket.request.session.user));

        // Check if everyone is ready
        let everyoneReady = true;
        if (Object.keys(onlineUsers).length < 2) {
            everyoneReady = false;
        }
        else {
            for (const username in onlineUsers) {
                if (!onlineUsers[username].ready) {
                    everyoneReady = false;
                    break;
                }
            }
        }  
        // If everyone is ready, start the game
        if (everyoneReady) {
            // Broadcast to all clients to start the game
            io.emit("start game");
        }

    });
    
});


//game play

const backEndPlayers = {}
const backEndProjectiles = {}

const SPEED = 5
const RADIUS = 10
const PROJECTILE_RADIUS = 5
let projectileId = 0

io.on('connection', (socket) => {
  console.log('a user connected')

  io.emit('updatePlayers', backEndPlayers)

  socket.on('shoot', ({ x, y, angle }) => {
    projectileId++

    const velocity = {
      x: Math.cos(angle) * 5,
      y: Math.sin(angle) * 5
    }

    backEndProjectiles[projectileId] = {
      x,
      y,
      velocity,
      playerId: socket.id
    }

    // console.log(backEndProjectiles)
  })

  socket.on('initGame', ({ username, width, height }) => {
    backEndPlayers[socket.id] = {
      x: 1024 * Math.random(),
      y: 576 * Math.random(),
      color: `hsl(${360 * Math.random()}, 100%, 50%)`,
      sequenceNumber: 0,
      score: 0,
      username
    }

    // where we init our canvas
    backEndPlayers[socket.id].canvas = {
      width,
      height
    }

    backEndPlayers[socket.id].radius = RADIUS
  })

  socket.on('disconnect', (reason) => {
    console.log(reason)
    delete backEndPlayers[socket.id]
    io.emit('updatePlayers', backEndPlayers)
  })

  socket.on('keydown', ({ keycode, sequenceNumber }) => {
    const backEndPlayer = backEndPlayers[socket.id]

    if (!backEndPlayers[socket.id]) return

    backEndPlayers[socket.id].sequenceNumber = sequenceNumber
    switch (keycode) {
      case 'KeyW':
        backEndPlayers[socket.id].y -= SPEED
        break

      case 'KeyA':
        backEndPlayers[socket.id].x -= SPEED
        break

      case 'KeyS':
        backEndPlayers[socket.id].y += SPEED
        break

      case 'KeyD':
        backEndPlayers[socket.id].x += SPEED
        break
    }

    const playerSides = {
      left: backEndPlayer.x - backEndPlayer.radius,
      right: backEndPlayer.x + backEndPlayer.radius,
      top: backEndPlayer.y - backEndPlayer.radius,
      bottom: backEndPlayer.y + backEndPlayer.radius
    }

    if (playerSides.left < 0) backEndPlayers[socket.id].x = backEndPlayer.radius

    if (playerSides.right > 1024)
      backEndPlayers[socket.id].x = 1024 - backEndPlayer.radius

    if (playerSides.top < 0) backEndPlayers[socket.id].y = backEndPlayer.radius

    if (playerSides.bottom > 576)
      backEndPlayers[socket.id].y = 576 - backEndPlayer.radius
  })

//   console.log(backEndPlayers);
})

// backend ticker
setInterval(() => {
  // update projectile positions
  for (const id in backEndProjectiles) {
    backEndProjectiles[id].x += backEndProjectiles[id].velocity.x
    backEndProjectiles[id].y += backEndProjectiles[id].velocity.y

    const PROJECTILE_RADIUS = 5
    if (
      backEndProjectiles[id].x - PROJECTILE_RADIUS >=
        backEndPlayers[backEndProjectiles[id].playerId]?.canvas?.width ||
      backEndProjectiles[id].x + PROJECTILE_RADIUS <= 0 ||
      backEndProjectiles[id].y - PROJECTILE_RADIUS >=
        backEndPlayers[backEndProjectiles[id].playerId]?.canvas?.height ||
      backEndProjectiles[id].y + PROJECTILE_RADIUS <= 0
    ) {
      delete backEndProjectiles[id]
      continue
    }

    for (const playerId in backEndPlayers) {
      const backEndPlayer = backEndPlayers[playerId]

      const DISTANCE = Math.hypot(
        backEndProjectiles[id].x - backEndPlayer.x,
        backEndProjectiles[id].y - backEndPlayer.y
      )

      // collision detection
      if (
        DISTANCE < PROJECTILE_RADIUS + backEndPlayer.radius &&
        backEndProjectiles[id].playerId !== playerId
      ) {
        if (backEndPlayers[backEndProjectiles[id].playerId])
          backEndPlayers[backEndProjectiles[id].playerId].score++

        // console.log(backEndPlayers[backEndProjectiles[id].playerId])
        delete backEndProjectiles[id]
        delete backEndPlayers[playerId]
        break
      }
    }
  }

  io.emit('updateProjectiles', backEndProjectiles)
  io.emit('updatePlayers', backEndPlayers)
}, 15)



// Use a web server to listen at port 8000
httpServer.listen(8000, () => {
    console.log("The game server has started...");
});
