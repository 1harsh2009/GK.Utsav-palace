const express = require("express");
const mongoose = require("mongoose");
const ex = express();
const path = require('path');
const User = require("./userModel"); // Import the User model

const uri = "mongodb+srv://harshuu001:harsh@cluster0.flyzgd7.mongodb.net/your_database_name?retryWrites=true&w=majority";

mongoose.connect(uri, {
    useNewUrlParser: true
});

ex.use(express.static(path.join(__dirname, 'pages')));

ex.get("/reg/:name/:email", async function(req, res) {
    try {
        // Create a new user instance
        const newUser = new User({
            name: req.params.name,
            email: req.params.email,
        });

        // Save the user to the database
        const savedUser = await newUser.save();

        // Send a response
        res.send(savedUser);
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

ex.listen(3000, () => {
    console.log("server running on port 3000");
});
