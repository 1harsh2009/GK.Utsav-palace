const express = require("express");
const mongoose = require("mongoose");
const ex = express();
const path = require('path');
const User = require("./userModel"); // Import the User model


ex.set('view engine', 'ejs');

const uri = "mongodb+srv://harshuu001:harsh@cluster0.flyzgd7.mongodb.net/your_database_name?retryWrites=true&w=majority";

mongoose.connect(uri, {
    useNewUrlParser: true
});
// appendFile.get("/",function(req,res){
//     res.redirect("/index")
// })
ex.use(express.static(path.join(__dirname, 'pages')));

ex.get("/dashboard", async function (req, res) {
    try {
        // Fetch all users from the database
        const users = await User.find();

        // Render the "index" view with the fetched user data
        res.render("index", { users });
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


ex.get("/reg/:name/:email/:number", async function(req, res) {
    try {
        // Create a new user instance
        const newUser = new User({
            name: req.params.name,
            email: req.params.email,
            number:req.params.number
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
