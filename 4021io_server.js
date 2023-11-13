const express = require("express");

const bcrypt = require("bcrypt");
const fs = require("fs");
const session = require("express-session");

const { createServer } = require("http");
const { Server } = require("socket.io");

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
        name: users[username].name
    };
    req.session.user = output;
    res.json({
        status: "success",
        user: output
    });

});

// Handle the /validate endpoint
app.get("/validate", (req, res) => {
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
const io = new Server(httpServer); 

io.use((socket, next) => {
    chatSession(socket.request, {}, next);
});

// TODO: Socket connection

// Use a web server to listen at port 8000
httpServer.listen(8000, () => {
    console.log("The chat server has started...");
});
