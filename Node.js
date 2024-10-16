const express = require('express');
const app = express();
app.use(express.json());

let profiles = [];

// API endpoint to accept profile data
app.post('/api/profiles', (req, res) => {
    const profile = req.body;
    profiles.push(profile);
    res.status(200).send("Profile received");
});

app.get('/profiles', (req, res) => {
    let html = '<h1>Requested Profiles</h1>';
    profiles.forEach((profile, index) => {
        html += `<div style="border: 1px solid black; padding: 10px; margin: 10px;">
                    <h3>Profile ${index + 1}</h3>
                    <pre>${JSON.stringify(profile, null, 2)}</pre>
                 </div>`;
    });
    res.send(html);
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
