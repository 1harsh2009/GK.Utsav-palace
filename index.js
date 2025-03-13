const express = require("express");
const mongoose = require("mongoose");
const ex = express();
const path = require('path');
const User = require("./userModel");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const nodemailer = require('nodemailer');

ex.set('views', path.join(__dirname, 'views'));
ex.set('view engine', 'ejs');

const uri = "mongodb+srv://harshuu001:harsh@cluster0.flyzgd7.mongodb.net/your_database_name?retryWrites=true&w=majority";

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

ex.use(express.static(path.join(__dirname, 'pages')));
ex.use(express.urlencoded({ extended: true }));
ex.use(express.json());

ex.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const AdminName = 'Admin';
        const AdminPass = 'Admin123';

        if (username === AdminName) {
            if (password === AdminPass) {
                return done(null, { username: AdminName });
            }
        }

        return done(null, false, { message: 'Invalid credentials' });

    } catch (err) {
        return done(err);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.username);
});

passport.deserializeUser((username, done) => {
    done(null, { username });
});

ex.use(passport.initialize());
ex.use(passport.session());

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'gkutsavpalaceoffical@gmail.com',
//         pass: 'harsh-123@'
//     }
// });

ex.get("/admin", (req, res) => {
    res.render('loginP');
});

const { ObjectId } = mongoose.Types;

ex.get('/reviewed/:Id', async function (req, res) {
    try {
        // Validate ObjectId
        if (!ObjectId.isValid(req.params.Id)) {
            return res.status(400).send('Invalid User ID');
        }

        const user = await User.findOneAndUpdate(
            { _id: req.params.Id },
            { $set: { Reviwed: 'Yes' } },
            { new: true }  // Returns the updated document
        );

        if (!user) {
            return res.status(404).send('User not found');
        }

        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Admin login route with explicit error handling
ex.post('/admin/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Authentication Error');
        }
        if (!user) {
            return res.redirect('/admin');
        }
        req.logIn(user, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Login Failed');
            }
            return res.redirect('/admin/dashboard');
        });
    })(req, res, next);
});

ex.post('/admin/login', passport.authenticate('local', {
    successRedirect: '/admin/dashboard',
    failureRedirect: '/admin',
}));

// Admin login route with explicit error handling
ex.post('/admin/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Authentication Error');
        }
        if (!user) {
            return res.redirect('/admin');
        }
        req.logIn(user, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Login Failed');
            }
            return res.redirect('/admin/dashboard');
        });
    })(req, res, next);
});
ex.post('/admin/login', passport.authenticate('local', {
    successRedirect: '/admin/dashboard',
    failureRedirect: '/admin',
}));

ex.get("/admin/dashboard", isLoggedIn, async (req, res) => {
    try {
        const users = await User.find();
        res.render("index", { users });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

ex.get("/reg/:name/:email/:number", async (req, res) => {
    try {
        const newUser = new User({
            name: req.params.name,
            email: req.params.email,
            number: req.params.number
        });

        // Uncomment this if you want to send an email
        // const mailOptions = {
        //     from: 'gkutsavpalaceoffical@gmail.com',
        //     to: 'gkutsavpalaceoffical@gmail.com',
        //     subject: `User Registration: ${req.params.name}`,
        //     text: `${req.params.name} sent a request. Email: ${req.params.email}, Phone Number: ${req.params.number}. Please review it!`
        // };

        // transporter.sendMail(mailOptions, async (error, info) => {
        //     if (error) {
        //         console.error('Error sending email:', error);
        //         return res.status(500).send('Error sending email');
        //     } else {
        //         console.log('Email sent:', info.response);
        //         const savedUser = await newUser.save();
        //         res.send(savedUser);
        //     }
        // });

        // If you’re not sending emails, just save the user directly
        const savedUser = await newUser.save();
        res.send(savedUser);

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/admin');
}

ex.listen(3000, () => {
    console.log("server running on port 3000");
});
