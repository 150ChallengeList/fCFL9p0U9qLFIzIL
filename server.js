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

// API endpoint to delete a profile by index
app.delete('/api/profiles/:index', (req, res) => {
    const index = parseInt(req.params.index);
    if (isNaN(index) || index < 0 || index >= profiles.length) {
        return res.status(400).send("Invalid profile index");
    }

    profiles.splice(index, 1); // Remove the profile at the specified index
    res.status(200).send("Profile deleted successfully");
});

app.get('/dashboard', (req, res) => {
    // Stats calculations
    const totalProfiles = profiles.length; 
    const averageAge = totalProfiles > 0 ? (profiles.reduce((sum, profile) => sum + profile.age, 0) / totalProfiles).toFixed(2) : 0;

    // Calculate average gender and sexuality distribution
    const genderCount = profiles.reduce((acc, profile) => {
        acc[profile.gen] = (acc[profile.gen] || 0) + 1;
        return acc;
    }, {});

    const sexualityCount = profiles.reduce((acc, profile) => {
        acc[profile.sex] = (acc[profile.sex] || 0) + 1;
        return acc;
    }, {});

    const averageGender = Object.entries(genderCount)
        .map(([gender, count]) => ({ gender, percentage: ((count / totalProfiles) * 100).toFixed(2) }))
        .filter(item => item.percentage > 0);

    const averageSexuality = Object.entries(sexualityCount)
        .map(([sex, count]) => ({ sex, percentage: ((count / totalProfiles) * 100).toFixed(2) }))
        .filter(item => item.percentage > 0);

    // Get the 10 most recent profiles
    const recentProfiles = profiles.slice(-10).reverse(); // Get the last 10 added profiles and reverse for display

    // HTML for dashboard with stats and recent profiles table
    let html = `
    <html>
    <head>
        <title>Dashboard</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f9f9f9;
                margin: 0;
                padding: 0;
                display: flex;
                height: 100vh;
                overflow: hidden; /* Prevent scrolling */
            }
            .sidebar {
                width: 70px;
                background-color: white;
                border-right: 1px solid #ddd;
                padding: 10px 0;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                /* Removed display: flex */
                /* Added text-align center to center buttons */
                text-align: center; /* Center the buttons */
            }

            .sidebar button {
                background-color: transparent;
                border: none;
                margin: 10px auto; /* Center the buttons */
                cursor: pointer;
                transition: background-color 0.3s;
                height: 50px; /* Set a fixed height for buttons */
                width: 50px; /* Set a fixed width for buttons */
                display: block; /* Make buttons block elements */
            }

            .sidebar button:hover {
                background-color: #e0f7fa;
                border-radius: 50%;
            }

            .sidebar img {
                width: 30px;
                height: 30px;
                vertical-align: middle; /* Align the image vertically */
            }
            .container {
                flex: 1;
                padding: 10px;
                display: flex;
                flex-direction: column;
            }
            .header {
                text-align: center;
                color: #333;
                margin-bottom: 10px;
                font-size: 20px; /* Reduced font size */
            }
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr); /* Three equal columns */
                gap: 10px; /* Space between cards */
                flex: 1; /* Allow grid to take up available space */
            }
            .card {
                background-color: white;
                border-radius: 8px;
                padding: 10px; /* Padding for cards */
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                text-align: center;
                display: flex;
                flex-direction: column;
                justify-content: center; /* Center content vertically */
                height: 30%; /* Make all cards equal height */
            }
            .chart-container {
                position: relative;
                margin: auto;
                width: 100%;
                height: 120px; /* Increased height for charts */
            }
            .table-container {
                background-color: white;
                border-radius: 8px;
                padding: 10px; /* Padding for the table */
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                margin-top: 10px; /* Space above the table */
                overflow: auto; /* Allow scrolling within the container if needed */
                max-height: 200px; /* Height for the table */
            }
            table {
                width: 100%;
                border-collapse: collapse;
            }
            table, th, td {
                border: 1px solid #ddd;
            }
            th, td {
                padding: 8px; /* Padding for table cells */
                text-align: left;
                font-size: 14px; /* Font size for table */
            }
            th {
                background-color: #00796b;
                color: white;
            }
        </style>
    </head>
    <body>
        <div class="sidebar">
            <button onclick="window.location.href='/dashboard'"><img src="https://img.icons8.com/ios-filled/40/000000/home.png" alt="Home Icon"></button>
            <button onclick="window.location.href='/profiles'"><img src="https://img.icons8.com/ios-filled/40/000000/user.png" alt="Profiles Icon"></button>
            <button onclick="window.location.href='/matchsystem'"><img src="https://img.icons8.com/?size=100&id=59805&format=png&color=000000" alt="Match System Icon"></button>
            <button onclick="alert('Settings clicked')"><img src="https://img.icons8.com/ios-filled/40/000000/settings.png" alt="Settings Icon"></button>
            <button onclick="alert('Logout clicked')"><img src="https://img.icons8.com/ios-filled/40/000000/logout-rounded-left.png" alt="Logout Icon"></button>
        </div>
        <div class="container">
            <h1 class="header">Dashboard Overview</h1>
            <div class="stats-grid">
                <div class="card">
                    <h3>Age Distribution</h3>
                    <div class="chart-container">
                        <canvas id="ageChart"></canvas>
                    </div>
                </div>
                <div class="card">
                    <h3>Gender Distribution</h3>
                    <div class="chart-container">
                        <canvas id="genderChart"></canvas>
                    </div>
                </div>
                <div class="card">
                    <h3>Sexuality Distribution</h3>
                    <div class="chart-container">
                        <canvas id="sexualityChart"></canvas>
                    </div>
                </div>
            </div>
            <div class="table-container">
                <h3>Recent Users</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Username</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    recentProfiles.forEach(profile => {
        html += `
                        <tr>
                            <td>${profile.username}</td>
                        </tr>
        `;
    });

    html += `
                    </tbody>
                </table>
            </div>
        </div>
        <script>
            // Age Distribution Chart
            const ageCtx = document.getElementById('ageChart').getContext('2d');
            const ageChart = new Chart(ageCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Average Age', 'Remaining'],
                    datasets: [{
                        label: 'Age Distribution',
                        data: [${averageAge}, 100 - ${averageAge}],
                        backgroundColor: ['#2196f3', '#ddd'],
                        borderColor: ['#0d47a1', '#aaa'],
                        borderWidth: 1,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false,
                        }
                    }
                }
            });

            // Gender Distribution Chart
            const genderCtx = document.getElementById('genderChart').getContext('2d');
            const genderLabels = ${JSON.stringify(averageGender.map(item => item.gender))};
            const genderData = ${JSON.stringify(averageGender.map(item => item.percentage))};
            const genderColors = ['#f44336', '#2196f3', '#ffeb3b', '#4caf50'];

            const genderChart = new Chart(genderCtx, {
                type: 'doughnut',
                data: {
                    labels: genderLabels,
                    datasets: [{
                        label: 'Gender Distribution',
                        data: genderData,
                        backgroundColor: genderColors.slice(0, genderLabels.length),
                        borderColor: ['#aaa'],
                        borderWidth: 1,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false,
                        }
                    }
                }
            });

            // Sexuality Distribution Chart
            const sexualityCtx = document.getElementById('sexualityChart').getContext('2d');
            const sexualityLabels = ${JSON.stringify(averageSexuality.map(item => item.sex))};
            const sexualityData = ${JSON.stringify(averageSexuality.map(item => item.percentage))};
            const sexualityColors = ['#8e24aa', '#1976d2', '#388e3c', '#f57c00'];

            const sexualityChart = new Chart(sexualityCtx, {
                type: 'doughnut',
                data: {
                    labels: sexualityLabels,
                    datasets: [{
                        label: 'Sexuality Distribution',
                        data: sexualityData,
                        backgroundColor: sexualityColors.slice(0, sexualityLabels.length),
                        borderColor: ['#aaa'],
                        borderWidth: 1,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false,
                        }
                    }
                }
            });
        </script>
    </body>
    </html>
    `;

    res.send(html);
});

// Match system route
app.get('/matchsystem', (req, res) => {
    let html = `
    <html>
    <head>
        <title>Match System</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f9f9f9;
                margin: 0;
                padding: 0;
                display: flex;
                height: 100vh; /* Full height for sidebar and content */
            }
            .sidebar {
                width: 70px;
                background-color: white;
                border-right: 1px solid #ddd;
                padding: 10px 0;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                text-align: center; /* Center the buttons */
            }
            .sidebar button {
                background-color: transparent;
                border: none;
                margin: 10px auto; /* Center the buttons */
                cursor: pointer;
                transition: background-color 0.3s;
                height: 50px; /* Set a fixed height for buttons */
                width: 50px; /* Set a fixed width for buttons */
                display: block; /* Make buttons block elements */
            }
            .sidebar button:hover {
                background-color: #e0f7fa;
                border-radius: 50%;
            }
            .sidebar img {
                width: 30px;
                height: 30px;
                vertical-align: middle; /* Align the image vertically */
            }
            .container {
                flex: 1;
                padding: 20px; /* Added padding for a cleaner layout */
                display: flex;
                flex-direction: column;
                align-items: center; /* Center items horizontally */
                justify-content: center; /* Center items vertically */
                max-width: 600px; /* Max width for the container */
                margin: auto; /* Center container in the middle */
                background-color: white;
                border-radius: 10px; /* Rounded corners */
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                color: #333;
                margin-bottom: 20px;
            }
            input {
                width: calc(100% - 20px); /* Adjust width to match button size */
                padding: 10px;
                margin: 10px 0;
                border: 1px solid #ddd;
                border-radius: 5px;
                box-sizing: border-box; /* Include padding in width calculation */
            }
            button {
                background-color: #4caf50;
                color: white;
                border: none;
                padding: 10px;
                border-radius: 5px;
                cursor: pointer;
                width: calc(100% - 20px); /* Button takes full width of its container */
                margin-top: 10px; /* Space above button */
            }
            button:hover {
                background-color: #388e3c;
            }
            .notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background-color: #4caf50;
                color: white;
                padding: 10px 20px;
                border-radius: 5px;
                opacity: 0; /* Start as invisible */
                transition: opacity 0.5s ease; /* Fade transition */
                z-index: 1000; /* Ensure it appears above other elements */
            }
            .fade-in {
                opacity: 1; /* Fully visible */
            }
            .fade-out {
                opacity: 0; /* Fully invisible */
            }
        </style>
    </head>
    <body>
        <div class="sidebar">
            <button onclick="window.location.href='/dashboard'"><img src="https://img.icons8.com/ios-filled/40/000000/home.png" alt="Home Icon"></button>
            <button onclick="window.location.href='/profiles'"><img src="https://img.icons8.com/ios-filled/40/000000/user.png" alt="Profiles Icon"></button>
            <button onclick="window.location.href='/matchsystem'"><img src="https://img.icons8.com/?size=100&id=59805&format=png&color=000000" alt="Match System Icon"></button>
            <button onclick="alert('Settings clicked')"><img src="https://img.icons8.com/ios-filled/40/000000/settings.png" alt="Settings Icon"></button>
            <button onclick="alert('Logout clicked')"><img src="https://img.icons8.com/ios-filled/40/000000/logout-rounded-left.png" alt="Logout Icon"></button>
        </div>
        <div class="container">
            <h2 class="header">Match System</h2>
            <form id="matchForm">
                <input type="text" id="userId1" placeholder="Enter User ID 1" required />
                <input type="text" id="userId2" placeholder="Enter User ID 2" required />
                <button type="submit">Match</button>
            </form>
            <p id="result"></p>
        </div>
        <div id="notification" class="notification"></div>
        <script>
            document.getElementById('matchForm').addEventListener('submit', function(event) {
                event.preventDefault();
                const userId1 = document.getElementById('userId1').value;
                const userId2 = document.getElementById('userId2').value;

                // Show notification
                const notification = document.getElementById('notification');
                notification.innerText = \`Matched User IDs: \${userId1} and \${userId2}\`;
                notification.classList.add('fade-in');

                // Clear input fields after submission
                document.getElementById('userId1').value = '';
                document.getElementById('userId2').value = '';

                // Fade out notification after 3 seconds
                setTimeout(() => {
                    notification.classList.remove('fade-in');
                    notification.classList.add('fade-out');
                }, 3000);
                
                // Remove notification from DOM after fade out
                setTimeout(() => {
                    notification.innerText = '';
                    notification.classList.remove('fade-out');
                }, 3500);
            });
        </script>
    </body>
    </html>
    `;
    res.send(html);
});


// Endpoint to retrieve profiles in HTML format with the parsed fields
app.get('/profiles', (req, res) => {
    let html = `
    <html>
    <head>
        <title>Profiles</title>
        <style>
                        body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f9f9f9;
                margin: 0;
                padding: 0;
                display: flex;
                height: 100vh;
                overflow: hidden; /* Prevent scrolling */
            }
            .sidebar {
                width: 70px; /* Fixed width */
                background-color: white;
                border-right: 1px solid #ddd;
                padding: 10px 0;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                text-align: center; /* Center the content */
            }

            .sidebar button {
                background-color: transparent;
                border: none;
                margin: 10px auto; /* Space between buttons */
                cursor: pointer;
                transition: background-color 0.3s;
                height: 50px; /* Set a fixed height for buttons */
                width: 50px; /* Set a fixed width for buttons */
                display: block; /* Make buttons block elements */
            }

            .sidebar button img {
                width: 30px; /* Set the image size */
                height: 30px; /* Set the image size */
            }

            .sidebar button:hover {
                background-color: #e0f7fa; /* Change background on hover */
                border-radius: 50%; /* Round corners on hover */
            }


            .container {
                flex: 1;
                padding: 10px;
                display: flex;
                flex-direction: column;
            }
            .container {
                flex: 1;
                background-color: white;
                margin: 20px;
                border-radius: 15px;
                padding: 20px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            h1 {
                text-align: center;
                color: #00796b;
                margin-bottom: 20px;
            }
            .profile {
                background-color: #e6e6e6;
                border-radius: 10px;
                padding: 15px;
                margin-bottom: 15px;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
            }
            .profile h3 {
                margin: 0;
                color: #00796b;
            }
            .profile p {
                margin: 5px 0;
                font-size: 16px;
            }
            .button {
                display: block;
                width: 100%;
                background-color: #4caf50;
                color: white;
                border: none;
                padding: 10px;
                border-radius: 8px;
                font-size: 16px;
                text-align: center;
                cursor: pointer;
                margin-top: 10px;
            }
            .button:hover {
                background-color: #388e3c;
            }
            footer {
                text-align: center;
                margin-top: 20px;
                color: #78909c;
            }
        </style>
    </head>
    <body>
        <div class="sidebar">
            <button onclick="window.location.href='/dashboard'"><img src="https://img.icons8.com/ios-filled/40/000000/home.png" alt="Home Icon"></button>
            <button onclick="window.location.href='/profiles'"><img src="https://img.icons8.com/ios-filled/40/000000/user.png" alt="Profiles Icon"></button>
            <button onclick="window.location.href='/matchsystem'"><img src="https://img.icons8.com/?size=100&id=59805&format=png&color=000000" alt="Match System Icon"></button>
            <button onclick="alert('Settings clicked')"><img src="https://img.icons8.com/ios-filled/40/000000/settings.png" alt="Settings Icon"></button>
            <button onclick="alert('Logout clicked')"><img src="https://img.icons8.com/ios-filled/40/000000/logout-rounded-left.png" alt="Logout Icon"></button>
        </div>
        <div class="container">
            <h1>Requested Profiles</h1>
    `;

    profiles.forEach((profile, index) => {
        html += `
        <div class="profile">
            <h3>Profile ${index + 1}</h3>
            <p><strong>Username:</strong> ${profile.username}</p>
            <p><strong>UserID:</strong> ${profile.uId}</p>
            <p><strong>Age:</strong> ${profile.age}</p>
            <p><strong>Bundesland:</strong> ${profile.cont.toUpperCase()}</p>
            <p><strong>Geschlecht:</strong> ${profile.gen}</p>
            <p><strong>Sexualität:</strong> ${profile.sex}</p>
            <p><strong>Über dich:</strong> ${profile.abt}</p>
            <p><strong>Interessen:</strong> ${profile.interest}</p>
            <p><strong>Icks:</strong> ${profile.icks}</p>
            <p><strong>Index:</strong> ${profile.index}</p>
            <button class="button" onclick="deleteProfile(${index})">Delete Profile</button>
        </div>`;
    });

    html += `
        </div>
        <footer>
            <p>&copy; 2024 Profiles Manager</p>
        </footer>
        <script>
            function deleteProfile(index) {
                fetch('/api/profiles/' + index, {
                    method: 'DELETE'
                })
                .then(response => {
                    if (response.ok) {
                        location.reload(); // Reload the page to refresh the profiles
                    } else {
                        alert('Failed to delete profile');
                    }
                });
            }
        </script>
    </body>
    </html>`;

    res.send(html);
});



app.listen(42864, () => {
    console.log('Server is running on http://localhost:42864');
});
