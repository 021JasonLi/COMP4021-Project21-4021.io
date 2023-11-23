const Socket = (function() {
    // This stores the current Socket.IO socket
    let socket = null;

    // This function gets the socket from the module
    const getSocket = function() {
        return socket;
    };

    // This function connects the server and initializes the socket
    const connect = function() {
        socket = io();

        // Wait for the socket to connect successfully
        socket.on("connect", () => {
            // Get the online user list
            socket.emit("get users");
        });

        // Set up the users event
        socket.on("users", (onlineUsers) => {
            onlineUsers = JSON.parse(onlineUsers);
            // Show the online users
            OnlineUsersPanel.update(onlineUsers);
        });

        // Set up the add user event
        socket.on("add user", (user) => {
            user = JSON.parse(user);
            // Add the online user
            OnlineUsersPanel.addUser(user);
        });

        // Set up the remove user event
        socket.on("remove user", (user) => {
            user = JSON.parse(user);
            // Remove the online user
            OnlineUsersPanel.removeUser(user);
        });

        // Set up the update user event
        socket.on("update user", (user) => {
            user = JSON.parse(user);
            // Update the online user
            OnlineUsersPanel.updateUser(user);
        });

        // Set up the start game event
        socket.on("start game", () => {
            // Hide the game front page
            // GameFrontPageUI.hide();
            // Show the game play page
            // GamePlayPage.show();
        });

    };

    // This function disconnects the socket from the server
    const disconnect = function() {
        socket.disconnect();
        socket = null;
    };

    // This function sends a ready request
    const ready = function() {
        socket.emit("ready");
    };

    return { getSocket, connect, disconnect, ready };
})();
