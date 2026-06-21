// server.js - FINAL VERSION WITH ADMIN USER/QC MANAGEMENT AND CORRECT USER LOADING

// --- MODULE REQUIRES ---
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const xlsx = require('xlsx'); // For handling Excel files
const fs = require('fs');      // For file system operations (reading/writing files)
const axios = require('axios'); // For making HTTP requests (if needed)
const session = require('express-session'); // For managing user sessions
const bcrypt = require('bcryptjs'); // For password hashing

const app = express(); // Create an Express application instance

// --- FILE PATHS DEFINITION ---
// Paths to our data files. Make sure these folders and files exist.
const usersFilePath = path.join(__dirname, 'data', 'users.json'); // Path for initial login users

// --- NEW: Paths for User and QC ID data ---
const userDataExcelPath = path.join(__dirname, 'data', 'users.xlsx');   // Path to the Excel file for user credentials (for admin)
const qcIdsExcelPath = path.join(__dirname, 'data', 'qc-ids.xlsx');     // Path to the Excel file for QC IDs (for admin)
const formSubmissionsFilePath = path.join(__dirname, 'data', 'form-data.xlsx');  // For submitted form data

// --- HELPER FUNCTIONS FOR EXCEL READ/WRITE ---
/**
 * Reads data from an Excel file and returns it as a JSON array of objects.
 * @param {string} filePath - The path to the Excel file.
 * @returns {Array<Object>} An array of objects representing the Excel sheet data, or an empty array on error/file not found.
 */
 const readExcel = (filePath) => {
    console.log(`Attempting to read Excel file from: ${filePath}`); // <<< ADD THIS LOG
    if (fs.existsSync(filePath)) {
        try {
            console.log(`File exists: ${filePath}`); // <<< ADD THIS LOG
            const workbook = xlsx.readFile(filePath); // Read the workbook
            console.log(`Workbook read successfully.`); // <<< ADD THIS LOG

            // Debugging: Log sheet names to ensure we pick the right one
            console.log(`Sheet names in workbook: ${workbook.SheetNames}`); // <<< ADD THIS LOG

            // Ensure there's at least one sheet
            if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
                console.log(`ERROR: Workbook ${filePath} has no sheets.`);
                return [];
            }

            const sheetName = workbook.SheetNames[0]; // Assume data is on the first sheet
            console.log(`Using sheet name: ${sheetName}`); // <<< ADD THIS LOG

            const worksheet = workbook.Sheets[sheetName]; // Get the worksheet object
            console.log(`Worksheet object retrieved.`); // <<< ADD THIS LOG

            // Convert the worksheet data into a JSON array of objects
            const jsonData = xlsx.utils.sheet_to_json(worksheet); // Convert the worksheet data into a JSON array of objects
            console.log(`Successfully converted to JSON. Found ${jsonData.length} rows.`); // <<< ADD THIS LOG
            // console.log('Parsed JSON data:', jsonData); // Log the parsed data if needed
            return jsonData;
        } catch (err) {
            console.error(`Error reading Excel file ${filePath}:`, err);
            console.log('Error occurred during Excel read process.'); // <<< ADD THIS LOG
            return []; // Return empty array if reading fails
        }
    } else {
        console.log(`File NOT found: ${filePath}`); // <<< ADD THIS LOG
        return []; // Return empty array if the file does not exist
    }
};

/**
 * Writes an array of JavaScript objects to an Excel file.
 * @param {string} filePath - The path to save the Excel file.
 * @param {Array<Object>} data - The data to write, as an array of objects.
 */
const writeExcel = (filePath, data) => {
    try {
        const workbook = xlsx.utils.book_new(); // Create a new Excel workbook
        // Convert the data array into an Excel worksheet
        const worksheet = xlsx.utils.json_to_sheet(data);
        // Append the worksheet to the workbook with a name ('Sheet1' is common)
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        // Write the workbook to the specified file path
        xlsx.writeFile(workbook, filePath);
        console.log(`Successfully wrote data to ${filePath}`); // Log success
    } catch (err) {
        console.error(`Error writing to Excel file ${filePath}:`, err);
    }
};

// --- LOAD INITIAL DATA ---
// Load users from users.json for login authentication.
let users = []; // Initialize users array
if (fs.existsSync(usersFilePath)) { // Check if users.json exists
    try {
        users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8')); // Read and parse users.json
        console.log(`Successfully loaded ${users.length} users from users.json`); // Log successful load
    } catch (err) {
        console.error(`Error loading or parsing users.json:`, err);
        console.log('Proceeding with an empty user list. Login will fail.');
    }
} else {
    console.log('WARNING: users.json file not found at', usersFilePath);
    console.log('Login will fail until users.json is created correctly.');
}

// Basic validation for the loaded users (optional but good practice)
if (users.length === 0) {
    console.log('WARNING: No users loaded from users.json. Please check its location and content.');
}

// --- MIDDLEWARE SETUP ---
// These are functions that run on every incoming request, in order.

// Parse incoming request bodies in JSON format
app.use(bodyParser.json());
// Parse incoming request bodies in URL-encoded format
app.use(bodyParser.urlencoded({ extended: true }));

// Setup session management
app.use(session({
    secret: 'a-very-strong-secret-key-that-is-hard-to-guess', // CHANGE THIS to a strong, unique secret in production
    resave: false, // Don't save session if it hasn't changed
    saveUninitialized: false, // Don't create session until something is stored
    cookie: { secure: false } // Set to true in production if using HTTPS
}));

// --- AUTHENTICATION HELPER FUNCTIONS ---
/**
 * Middleware to check if a user is authenticated. If not, redirects to login.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
const checkAuthenticated = (req, res, next) => {
    if (req.session.user) { // Check if a user object exists in the session
        return next(); // User is authenticated, proceed to the next middleware/route handler
    }
    res.redirect('/login.html'); // User is not authenticated, redirect to the login page
};

/**
 * Middleware to check if the authenticated user is an admin. If not, sends a 403 Forbidden response.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
const checkAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        return next(); // User is an admin, proceed
    }
    // User is not an admin, send a 403 Forbidden status code and message
    res.status(403).send('Access Denied: Admins only.');
};


// --- ROUTE DEFINITIONS ---
// These define how the server responds to different URLs (endpoints) and HTTP methods.

// POST route for handling login requests
app.post('/login', async (req, res) => {
    console.log('\n\n--- NEW LOGIN ATTEMPT ---');
    const { username, password } = req.body; // Get username and password from the request body
    console.log(`1. BROWSER SENT: Username='${username}', Password='${password}'`);

    // Find the user in our 'users' array (loaded from users.json)
    const user = users.find(u => u.username === username);
    console.log('2. DATABASE LOOKUP: Found this user ->', user);

    // If the username is not found, send an invalid credentials error
    if (!user) {
        console.log('3. CONCLUSION: Username not found in database. Sending error.');
        return res.status(401).json({ message: 'Invalid credentials' }); // 401 Unauthorized
    }

    // Compare the provided password with the hashed password stored in the database
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('3. PASSWORD CHECK: Do the passwords match? ->', isMatch);

    // If passwords don't match, send an invalid credentials error
    if (!isMatch) {
        console.log('4. CONCLUSION: Passwords do not match. Sending error.');
        return res.status(401).json({ message: 'Invalid credentials' }); // 401 Unauthorized
    }

    // If credentials are valid, create a session for the user
    console.log('4. CONCLUSION: Success! Creating session and redirecting.');
    req.session.user = { id: user.id, username: user.username, role: user.role }; // Store user info in the session

    // Determine the redirect URL based on user role
    const redirectUrl = user.role === 'admin' ? '/admin.html' : '/'; // Redirect admin to admin.html, others to the root
    res.json({ redirectUrl }); // Send back the redirect URL to the client
});

// GET route for logging out
app.get('/logout', (req, res) => {
    // Destroy the session and clear the session cookie
    req.session.destroy(err => {
        if (err) return res.redirect('/'); // If there's an error, redirect somewhere (e.g., home)
        res.clearCookie('connect.sid'); // Clear the session cookie itself
        res.redirect('/login.html'); // Redirect to the login page after logout
    });
});

// GET route for the main application page (accessible only if authenticated)
app.get('/', checkAuthenticated, (req, res) => {
    // Serve the index.html file from the public directory
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// POST route for submitting form data
app.post('/submit', checkAuthenticated, async (req, res) => { // Make it async for await
    const formData = req.body; // Get the form data from the request body
    const filePath = path.join(__dirname, 'data', 'form-data.xlsx'); // Path to the form data Excel file

    // --- START: Logic for assigning QC User ---
    let assignedQCUser = "Unassigned"; // Default value
    const qcData = readExcel(qcIdsExcelPath); // Read QC user data

    if (qcData.length > 0) {
        // Simple Round-Robin logic: Pick the user assigned to the QC ID with the highest ID.
        // This is a basic strategy. For a real application, you'd track assignments persistently.
        try {
             // Ensure data is valid before processing
             if (Array.isArray(qcData) && qcData.length > 0) {
                // Find the record with the maximum 'id' and use its 'assigned_to_username'
                const qcRecord = qcData.reduce((prev, current) => {
                    // Ensure 'id' and 'assigned_to_username' exist and are valid
                    const currentId = current.id || 0;
                    const prevId = prev.id || 0;
                    return currentId > prevId ? current : prev;
                }, qcData[0]); // Start reduction with the first element

                if (qcRecord && qcRecord.assigned_to_username) {
                    assignedQCUser = qcRecord.assigned_to_username;
                } else {
                    console.warn("QC data is malformed or missing assigned_to_username.");
                }
             } else {
                console.warn("QC data is empty or not an array.");
             }
        } catch (e) {
            console.error("Error processing QC data for assignment:", e);
        }
    } else {
        console.log("No QC IDs found, submissions will be unassigned.");
    }

    // Add QC-related fields to the submitted data
    formData.qc_status = "Pending";
    formData.assigned_to_username = assignedQCUser;
    // --- END: Logic for assigning QC User ---

    // Ensure the data directory exists
    if (!fs.existsSync(path.join(__dirname, 'data'))){
        fs.mkdirSync(path.join(__dirname, 'data'));
    }

    let workbook, worksheet;
    if (fs.existsSync(filePath)) {
        workbook = xlsx.readFile(filePath);
        worksheet = workbook.Sheets['Form Data'];
        const existingData = xlsx.utils.sheet_to_json(worksheet);
        existingData.push(formData);
        const updatedWorksheet = xlsx.utils.json_to_sheet(existingData);
        workbook.Sheets['Form Data'] = updatedWorksheet;
    } else {
        workbook = xlsx.utils.book_new();
        worksheet = xlsx.utils.json_to_sheet([formData]);
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Form Data');
    }
    xlsx.writeFile(workbook, filePath);
    res.json({ message: 'Form submitted successfully and assigned for QC!' }); // Update message
});

// GET route for retrieving all form submissions (for admin page)
app.get('/admin/data', checkAuthenticated, checkAdmin, (req, res) => {
    const filePath = path.join(__dirname, 'data', 'form-data.xlsx');
    // Check if the form data file exists
    if (fs.existsSync(filePath)) {
        const workbook = xlsx.readFile(filePath); // Read the workbook
        const worksheet = workbook.Sheets['Form Data']; // Get the sheet
        const data = xlsx.utils.sheet_to_json(worksheet); // Convert data to JSON
        res.json(data); // Send the data as JSON
    } else {
        res.json([]); // If file doesn't exist, send an empty array
    }
});

// Serve static files (HTML, CSS, JS, Images) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to provide a list of image filenames to the frontend (e.g., for the carousel)
app.get('/images', (req, res) => {
    const imagesDirectory = path.join(__dirname, 'public', 'images'); // Path to the images folder
    fs.readdir(imagesDirectory, (err, files) => { // Read the contents of the directory
        if (err) {
            console.error("Could not list the directory.", err);
            // If the 'images' folder doesn't exist, return an empty list gracefully
            if (err.code === 'ENOENT') {
                return res.json([]);
            }
            // For other errors, return a server error
            return res.status(500).json({ message: "Internal Server Error" });
        }
        // Filter the files to include only common image extensions and map them to their public URLs
        const imageFiles = files
            .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file)) // Regex to check for image file extensions
            .map(file => `/images/${file}`); // Create the correct URL path for accessing the image via the server
        res.json(imageFiles); // Send the list of image URLs as JSON
    });
});

// Placeholder for pincode lookup logic (you can replace this with actual API calls or a database)
app.get('/pincode/:pincode', async (req, res) => {
    // --- MOCK PINCODE DATA (REPLACE WITH REAL API OR DATABASE LOOKUP) ---
    const mockPincodeData = {
        "560027": { "state": "Karnataka", "district": "Bengaluru", "taluk": "Bengaluru" },
        "400001": { "state": "Maharashtra", "district": "Mumbai", "taluk": "Mumbai City" },
        "110001": { "state": "Delhi", "district": "Central Delhi", "taluk": "Delhi" }
        // Add more pincodes as needed
    };
    const { pincode } = req.params; // Get the pincode from the URL parameters
    const location = mockPincodeData[pincode]; // Look up the pincode in our mock data

    if (location) {
        res.json(location); // Send location data if found
    } else {
        res.status(404).json({ message: "Pincode not found" }); // Send 404 if not found
    }
});

// Placeholder for last submission logic
app.get('/last-submission', (req, res) => {
    // ... (your existing last-submission logic)
    // Example placeholder:
    res.json({ lastSubmission: "No last submission data available." });
});

// --- NEW: Admin Routes for User Management ---

/**
 * GET /admin/users - Retrieves a list of all users (excluding passwords).
 * Requires authentication and admin role.
 */
 app.get('/admin/users', checkAuthenticated, checkAdmin, (req, res) => {
    const usersData = readExcel(userDataExcelPath); // Read users from the Excel file
    // Filter out sensitive information (password hash) before sending to the frontend
    const displayUsers = usersData.map(user => ({
        id: user.id,
        username: user.username,
        role: user.role
    }));
    res.json(displayUsers); // Send the user list as JSON
});

/**
 * POST /admin/users/create - Creates a new user.
 * Requires authentication and admin role.
 */
app.post('/admin/users/create', checkAuthenticated, checkAdmin, async (req, res) => {
    const { username, password, role } = req.body; // Extract data from the request body

    // Basic validation: ensure all required fields are present
    if (!username || !password || !role) {
        return res.status(400).json({ message: 'Username, password, and role are required.' });
    }

    const usersData = readExcel(userDataExcelPath); // Get current users

    // Check if the username already exists to prevent duplicates
    if (usersData.some(user => user.username === username)) {
        return res.status(409).json({ message: 'Username already exists.' }); // 409 Conflict is appropriate for duplicate resource
    }

    // Securely hash the password
    const salt = await bcrypt.genSalt(10); // Generate a salt for hashing
    const hashedPassword = await bcrypt.hash(password, salt); // Hash the password

    // Determine the next sequential ID for the new user
    const maxUserId = usersData.length > 0 ? Math.max(...usersData.map(u => u.id || 0)) : 0; // Use 0 if id is missing or file is empty
    const nextId = maxUserId + 1;

    // Create the new user object
    const newUser = {
        id: nextId,
        username: username,
        password: hashedPassword, // Store the securely hashed password
        role: role
    };

    // Add the new user to the array
    usersData.push(newUser);
    // Write the updated array back to the Excel file
    writeExcel(userDataExcelPath, usersData);

    // Respond with success message and the new user's ID
    res.status(201).json({ message: 'User created successfully!', userId: newUser.id }); // 201 Created status code
});

/**
 * GET /admin/qc-ids - Retrieves a list of all QC IDs.
 * Requires authentication and admin role.
 */
app.get('/admin/qc-ids', checkAuthenticated, checkAdmin, (req, res) => {
    const qcIdsData = readExcel(qcIdsExcelPath); // Read QC IDs from the Excel file
    res.json(qcIdsData); // Send the QC IDs list as JSON
});

/**
 * POST /admin/qc-ids/create - Creates a new QC ID.
 * Requires authentication and admin role.
 */
 app.post('/admin/qc-ids/create', checkAuthenticated, checkAdmin, (req, res) => {
    const { qc_id, assigned_to_username } = req.body; // Extract data from the request body

    // Basic validation: ensure both fields are provided
    if (!qc_id || !assigned_to_username) {
        return res.status(400).json({ message: 'QC ID and assigned username are required.' });
    }

    const qcIdsData = readExcel(qcIdsExcelPath); // Get current QC IDs

    // Check if the QC ID already exists
    if (qcIdsData.some(qc => qc.qc_id === qc_id)) {
        return res.status(409).json({ message: 'QC ID already exists.' }); // 409 Conflict
    }

    // Determine the next sequential ID for the new QC ID entry
    const maxQcId = qcIdsData.length > 0 ? Math.max(...qcIdsData.map(q => q.id || 0)) : 0; // Use 0 if id is missing or file is empty
    const nextId = maxQcId + 1;

    // Create the new QC ID object
    const newQcId = {
        id: nextId,
        qc_id: qc_id,
        assigned_to_username: assigned_to_username
    };

    // Add the new QC ID to the array
    qcIdsData.push(newQcId);
    // Write the updated array back to the Excel file
    writeExcel(qcIdsExcelPath, qcIdsData);

    // Respond with success message and the new QC ID's entry ID
    res.status(201).json({ message: 'QC ID created successfully!', qcId: newQcId.id });
});


// --- NEW ROUTE FOR ADMIN.HTML ---
// This route specifically serves the admin.html file ONLY if the user is authenticated and an admin.
app.get('/admin.html', checkAuthenticated, checkAdmin, (req, res) => {
    // If the checks pass, send the admin.html file from the project's root directory
    res.sendFile(path.join(__dirname, 'admin.html'));
});


// --- START THE SERVER ---
const PORT = process.env.PORT || 3000; // Set the port to listen on
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log("Login debugging is active. Check terminal for spy messages.");
});