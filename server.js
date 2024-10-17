const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const flash = require('connect-flash');
const { body, validationResult } = require('express-validator');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(express.static('public')); // Serve static files from the 'public' directory

// Session configuration
app.use(session({
    secret: 'your-secret-key', // Change this to a secure key
    resave: false,
    saveUninitialized: true
}));

app.use(flash());

// User "database" (in-memory)
let users = [
    { username: 'admin', password: '$2b$10$T1y.y/14Er2ALoE8TTrj/.ybQFrGfiZ0pMyuv2XYD8sFlWS.Gy5XG' } // Password: 'password'
];

// Middleware for checking authentication
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login'); // Redirect to login if not authenticated
}

// API endpoint to accept profile data
let profiles = [];
app.post('/api/profiles', (req, res) => {
    const profile = req.body;
    profiles.push(profile);
    res.status(200).send("Profile received");
});

// API endpoint to get profiles data
app.get('/api/profiles', (req, res) => {
    res.json(profiles); // Send profiles as JSON
});

// Login page
app.get('/login', (req, res) => {
    const errorMsg = req.flash('error'); // Get flash error messages
    res.send(`
        <h1>Login</h1>
        ${errorMsg.length > 0 ? `<p style="color:red;">${errorMsg}</p>` : ''}
        <form method="POST" action="/login">
            <input type="text" name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>
    `);
});

// Handle login
app.post('/login', [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array().map(error => error.msg).join(', '));
        return res.redirect('/login');
    }

    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = user; // Store user session
        return res.redirect('/admin'); // Redirect to the admin page
    } else {
        req.flash('error', 'Invalid username or password');
        return res.redirect('/login');
    }
});

// Admin UI for viewing profiles
app.get('/admin', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Serve the admin HTML
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/admin');
        }
        res.redirect('/login');
    });
});

app.listen(42864, () => {
    console.log('Server is running on http://localhost:42864');
});
