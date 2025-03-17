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
    },
    date: {
        type: Date,
        default: Date.now,  // Sets current date/time when a document is created
    },
    Reviwed: {
        type: String,
        default: 'No'
    }
});

// Create a model from the schema
const User = mongoose.model("User", userSchema);

module.exports = User;
