require('dotenv').config(); 
const express = require("express");
const mongoose = require("mongoose");
const ex = express();
const path = require('path');
const User = require("./userModel");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const { put, list } = require('@vercel/blob');
const { handleUpload } = require('@vercel/blob/client');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// 1. DATABASE CONNECTION
const uri = process.env.MONGODB_URI || "mongodb+srv://harshuu001:harsh@cluster0.flyzgd7.mongodb.net/your_database_name?retryWrites=true&w=majority";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// 2. APP SETTINGS
ex.set('views', path.join(__dirname, 'views'));
ex.set('view engine', 'ejs');
ex.use(express.static(path.join(__dirname, 'pages')));
ex.use(express.urlencoded({ extended: true }));
ex.use(express.json());

// 3. SESSION & PASSPORT (MUST BE BEFORE ROUTES)
ex.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const AdminName = 'Admin';
        const AdminPass = 'Admin123';
        if (username === AdminName && password === AdminPass) {
            return done(null, { username: AdminName });
        }
        return done(null, false, { message: 'Invalid credentials' });
    } catch (err) { return done(err); }
}));

passport.serializeUser((user, done) => done(null, user.username));
passport.deserializeUser((username, done) => done(null, { username }));

ex.use(passport.initialize());
ex.use(passport.session());

// 4. MIDDLEWARE
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/admin');
}

// 5. ROUTES

// --- Auth Routes ---
ex.get("/admin", (req, res) => res.render('loginP'));

ex.post('/admin/login', passport.authenticate('local', {
    successRedirect: '/admin/dashboard',
    failureRedirect: '/admin',
}));

// --- Dashboard & Gallery ---
ex.get("/admin/dashboard", isLoggedIn, async (req, res) => {
    try {
        const users = await User.find();
        res.render("index", { users });
    } catch (error) { res.status(500).send("Error fetching users"); }
});

ex.get("/gallery", async (req, res) => {
    try {
        const { blobs } = await list();
        res.render("gallery", { blobs });
    } catch (error) { res.status(500).send("Error fetching gallery"); }
});

// --- Upload Logic (Client-Side Token) ---
ex.post('/admin/upload', async (req, res) => {
    try {
        const jsonResponse = await handleUpload({
            body: req.body,
            request: req,
            onBeforeGenerateToken: async (pathname) => {
                if (!req.isAuthenticated()) throw new Error('Unauthorized');
                return {
                    allowedContentTypes: ['video/mp4', 'image/jpeg', 'image/png'],
                    tokenPayload: JSON.stringify({ userId: 'admin' }),
                };
            },
            onUploadCompleted: async (payload) => {
                console.log('Upload completed in Vercel:', payload);
            },
        });
        return res.status(200).json(jsonResponse);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

// --- User Actions ---
ex.get('/reviewed/:Id', isLoggedIn, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.Id)) return res.status(400).send('Invalid ID');
        await User.findByIdAndUpdate(req.params.Id, { $set: { Reviwed: 'Yes' } });
        res.redirect('/admin/dashboard');
    } catch (error) { res.status(500).send('Server Error'); }
});

ex.get("/reg/:name/:email/:number", async (req, res) => {
    try {
        const newUser = new User({
            name: req.params.name,
            email: req.params.email,
            number: req.params.number
        });
        const savedUser = await newUser.save();
        res.send(savedUser);
    } catch (error) { res.status(500).send("Registration Error"); }
});

ex.listen(3000, () => console.log("Server running on port 3000"));