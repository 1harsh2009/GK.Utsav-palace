const mongoose = require("mongoose");

// Define the schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    number: {
        type: String,
        required: true,
    }
});

// Create a model from the schema
const User = mongoose.model("User", userSchema);

module.exports = User;
