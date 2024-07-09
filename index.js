const express = require("express");
const path = require("path");
const app = express();
const { v4: uuidv4 } = require('uuid');
const mysql = require('mysql2');
const methodOverride = require("method-override");
const session = require('express-session');
const crypto = require('crypto');

// Generate a secret key for session
const secret = crypto.randomBytes(32).toString('hex');

// Function to format date
function getFormattedDate() {
    const timestamp = Date.now();
    const date = new Date(timestamp);

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Set up middleware
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// MySQL connection setup
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'todosite',
    password: 'Jha@2023'
});

// Check MySQL connection
connection.connect(err => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Middleware for session
app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: false
}));

// Show tables query (example)
let query = 'show tables;';
try {
    connection.query(query, (err, result) => {
        if (err) throw err;
        console.log(result);
    });
} catch (err) {
    console.log(err);
}

// Home route
app.get("/", (req, res) => {
    let query = 'select count(*) from user;';
    try {
        connection.query(query, (err, result) => {
            if (err) throw err;
            let count = result[0]["count(*)"];
            res.render("home", { count });
        });
    } catch (err) {
        console.log(err);
    }
});

// Signup route
app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post("/signup", (req, res) => {
    let { username, email, password } = req.body;
    let query = `INSERT INTO user (id, username, email, password) VALUES (?, ?, ?, ?);`;
    const values = [uuidv4(), username, email, password];
    try {
        connection.query(query, values, (err, result) => {
            if (err) throw err;
            console.log(result);
            res.redirect("/signin");
        });
    } catch (err) {
        console.log(err);
    }
});

// Signin route
app.get("/signin", (req, res) => {
    res.render("signin");
});

app.post("/signin", (req, res) => {
    let { username, password } = req.body;
    let searchQ = `SELECT id FROM user WHERE username='${username}' AND password='${password}';`;
    try {
        connection.query(searchQ, (err, result) => {
            if (err) throw err;
            console.log(result);
            if (result.length !== 0) {
                let id = result[0].id;
                req.session.userId = id; // Store user id in session
                res.redirect(`/user/task/${id}`);
            } else {
                res.send("No such record");
            }
        });
    } catch (err) {
        console.log(err);
        res.send("Wrong username or password.");
    }
});

// User task route
app.get("/user/task/:id", (req, res) => {
    let { id } = req.params;
    if (!req.session.userId || req.session.userId !== id) {
        return res.redirect("/signin"); // Redirect to signin if session is not valid
    }
    let name;
    let searchQ = `SELECT username FROM user WHERE id='${id}';`;
    try {
        connection.query(searchQ, (err, result) => {
            if (err) throw err;
            console.log(result);
            if (result.length !== 0) {
                let username = result[0].username;
                name=username;
            } else {
                res.send("No such record");
            }
        });
    } catch (err) {
        console.log(err);
        res.send("Wrong username or password.");
    }
    let searchq = `SELECT taskid, task FROM tasks WHERE id='${id}' AND status=false ORDER BY time DESC;`;
    try {
        connection.query(searchq, (err, result) => {
            if (err) throw err;
            console.log(result);
            let data = result;
            res.render("index", { data, id,name });
        });
    } catch (err) {
        console.log(err);
        res.send("Error retrieving tasks.");
    }
});

// Add task route
app.post("/addtask/:id", (req, res) => {
    let { task } = req.body;
    let { id } = req.params;
    const timestamp = getFormattedDate();
    let addQuery = 'INSERT INTO tasks (id, task, time, status, taskid) VALUES (?, ?, ?, ?, ?);';
    const values = [id, task, timestamp, false, uuidv4()];
    try {
        connection.query(addQuery, values, (err, result) => {
            if (err) throw err;
            console.log("Added task successfully");
            res.redirect(`/user/task/${id}`);
        });
    } catch (err) {
        console.log(err);
        res.send("Error adding task.");
    }
});

// Delete task route
app.delete("/user/task/:id/:taskid", (req, res) => {
    let { id, taskid } = req.params;
    let deletequery = `DELETE FROM tasks WHERE taskid='${taskid}';`;
    try {
        connection.query(deletequery, (err, result) => {
            if (err) throw err;
            console.log("Deleted task successfully");
            res.redirect(`/user/task/${id}`);
        });
    } catch (err) {
        console.log(err);
        res.send("Error deleting task.");
    }
});

//edit
app.patch("/user/task/:id/:taskid",(req,res)=>{
    let {id,taskid}=req.params;
    let{task}=req.body;
    let updateQuery = `UPDATE tasks SET task='${task.replace(/'/g, "''")}' WHERE id='${id}' AND taskid='${taskid}';`;

    try {
        connection.query(updateQuery, (err, result) => {
            if (err) throw err;
            console.log("updated task successfully");
            res.redirect(`/user/task/${id}`);
        });
    } catch (err) {
        console.log(err);
        res.send("Error deleting task.");
    }
});
// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.send('Error logging out');
        }
        res.redirect('/'); // Redirect to home page or login page after logout
    });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`);
});
