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

// const backEndPlayers = {}

io.on("connection", (socket) => {

    // console.log('a user connected')

    // io.emit('updatePlayers', backEndPlayers)

    // backEndPlayers[socket.id] = {
    //     x:500 * Math.random(),
    //     y:500 * Math.random()
    // }

    if (socket.request.session.user) {
        // Add a new user to the online user list
        onlineUsers[socket.request.session.user.username] = {
            name: socket.request.session.user.name,
            ready: false
        };
        // Broadcast to all clients to add user
        io.emit("add user", JSON.stringify(socket.request.session.user));
    }

    socket.on("disconnect", (reason) => {
        if (socket.request.session.user) {
            // Remove the user from the online user list
            delete onlineUsers[socket.request.session.user.username];
            // Broadcast to all clients to remove user
            io.emit("remove user", JSON.stringify(socket.request.session.user));
        }

        // console.log(reason)
        // delete backEndPlayers[socket.id]
        // io.emit('updatePlayers', backEndPlayers)
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
let projectileId = 0

io.on('connection', (socket) => {

    console.log('a user connected')

    backEndPlayers[socket.id] = {
        x:500 * Math.random(),
        y:500 * Math.random(),
        code: 0,
        radius: 8
    } 

    io.emit('updatePlayers', backEndPlayers)

    socket.on('initCanvas', ({width, height}) => {
        backEndPlayers[socket.id].canvas ={
            width,
            height
        }
    })

    socket.on('shoot', ({ x, y, angle }) => {
        projectileId++
    
        const velocity = {
          x: Math.cos(angle) * 1,
          y: Math.sin(angle) * 1
        }
    
        backEndProjectiles[projectileId] = {
          x,
          y,
          velocity,
          playerId: socket.id
        }
    
        console.log(backEndProjectiles)
    })

    socket.on('disconnect', (reason) => {
        console.log(reason)
        delete backEndPlayers[socket.id]
        io.emit('updatePlayers', backEndPlayers)
    })

    socket.on('keydown', (keycode) => {
        switch (keycode) {
            case 'KeyW':
              // keys.w.pressed = true
              backEndPlayers[socket.id].code = 2;
              break;
        
            case 'KeyA':
              // keys.a.pressed = true
              backEndPlayers[socket.id].code = 1;
              break
        
            case 'KeyS':
              // keys.s.pressed = true
              backEndPlayers[socket.id].code = 4;
              break
        
            case 'KeyD':
              // keys.d.pressed = true
              backEndPlayers[socket.id].code = 3;
              break
        }
    })

    socket.on('keyup', (keycode) => {
        switch (keycode) {
            case 'KeyW':
              // keys.w.pressed = true
              backEndPlayers[socket.id].code = 6;
              break;
        
            case 'KeyA':
              // keys.a.pressed = true
              backEndPlayers[socket.id].code = 5;
              break
        
            case 'KeyS':
              // keys.s.pressed = true
              backEndPlayers[socket.id].code = 8;
              break
        
            case 'KeyD':
              // keys.d.pressed = true
              backEndPlayers[socket.id].code = 7;
              break
        }
    })
    

    // console.log(backEndPlayers);
})

//backend ticker
setInterval(() => {
    for (const id in backEndProjectiles) {
        backEndProjectiles[id].x += backEndProjectiles[id].velocity.x;
        backEndProjectiles[id].y += backEndProjectiles[id].velocity.y;

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
      
                console.log(backEndPlayers[backEndProjectiles[id].playerId])
                delete backEndProjectiles[id]
                delete backEndPlayers[playerId]
                break
            }
        }
    }

    io.emit('updateProjectiles', backEndProjectiles) ;
    io.emit('updatePlayers', backEndPlayers);
})


// Use a web server to listen at port 8000
httpServer.listen(8000, () => {
    console.log("The chat server has started...");
});
