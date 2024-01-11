// script/db.js

const Mongoose = require('mongoose');

// Your Mongoose code here

var form = document.querySelector('.fl_b');
form.addEventListener("submit", (e) => {
    e.preventDefault(); // Prevents the default form submission behavior
    console.log("hwe");
});
