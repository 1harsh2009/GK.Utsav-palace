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
    age: {
        type: Number,
        default: 0,
    }
});

// Create a model from the schema
const User = mongoose.model("User", userSchema);

module.exports = User;
