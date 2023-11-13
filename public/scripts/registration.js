const Registration = (function() {
    // This function sends a register request to the server
    // * `username`  - The username for the sign-in
    // * `name`      - The name of the user
    // * `password`  - The password of the user
    // * `onSuccess` - This is a callback function to be called when the
    //                 request is successful in this form `onSuccess()`
    // * `onError`   - This is a callback function to be called when the
    //                 request fails in this form `onError(error)`
    const register = function(username, name, password, onSuccess, onError) {

        // Preparing the user data
        const input = JSON.stringify({ username, name, password });
 
        // Sending the AJAX request to the server
        fetch("/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: input
        })
        .then((res) => res.json())
        .then((json) => { 
            // Handling the success response from the server
            if (json.status == "success") {
                onSuccess();
            }
            // Processing any error returned by the server
            else if (onError) onError(json.error);
        })
        .catch((err) => { console.log("Error: " + err); });

    };
    return { register };
})();
