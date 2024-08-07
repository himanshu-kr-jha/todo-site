const express = require("express");
const path = require("path");
const app = express();
const { v4: uuidv4 } = require('uuid');
const mysql = require('mysql2');
const methodOverride = require("method-override");
const session = require('express-session');
const crypto = require('crypto');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("AIzaSyBPG4YT2HOSf44pl4GaRctn10E87mFZHTM");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Generate a secret key for session
const secret = crypto.randomBytes(32).toString('hex');

async function run(prompt) {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    return text.replace(/\*/g, '');  // Remove asterisks from the response
}
function count(id) {
    
}

function timeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;

    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;

    if (diff < msPerMinute) {
        return Math.round(diff / 1000) + ' seconds ago';
    } else if (diff < msPerHour) {
        return Math.round(diff / msPerMinute) + ' minutes ago';
    } else if (diff < msPerDay) {
        return Math.round(diff / msPerHour) + ' hours ago';
    } else if (diff < msPerMonth) {
        return Math.round(diff / msPerDay) + ' days ago';
    } else if (diff < msPerYear) {
        return Math.round(diff / msPerMonth) + ' months ago';
    } else {
        return Math.round(diff / msPerYear) + ' years ago';
    }
}

// Example usage:

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
app.get("/users", (req, res) => {
    let query = 'select * from user order by username;';
    try {
        connection.query(query, (err, users) => {
            if (err) throw err;
            res.render("users", { users });
        });
    } catch (err) {
        console.log(err);
    }
});
app.get("/users/:id/edit", (req, res) => {
    let { id } = req.params;
    let query = `SELECT * FROM user WHERE id='${id}';`;
    try {
        connection.query(query, (err, result) => {
            if (err) throw err;
            res.render("edit", { result: result[0] });
        });
    } catch (err) {
        console.log(err);
    }
});

app.patch("/users/:id", (req, res) => {
    let { id } = req.params;
    let { username, password } = req.body;
    let query = `SELECT * FROM user WHERE id='${id}';`;
    try {
        connection.query(query, (err, result) => {
            if (err) throw err;
            if (password === result[0].password) {
                let updateQuery = `UPDATE user SET username='${username}' WHERE id='${id}';`;
                connection.query(updateQuery, (err, updateResult) => {
                    if (err) throw err;
                    res.redirect('/users');
                });
            } else {
                res.send("Wrong password");
            }
        });
    } catch (err) {
        console.log(err);
    }
});

app.get("/users/:id/delete", (req, res) => {
    let { id } = req.params;
    let query = `SELECT * FROM user WHERE id='${id}';`;
    try {
        connection.query(query, (err, result) => {
            if (err) throw err;
            res.render("delete", { result: result[0] });
        });
    } catch (err) {
        console.log(err);
    }
});

app.delete("/users/:id", (req, res) => {
    let { id } = req.params;
    let { password } = req.body;
    let query = `SELECT * FROM user WHERE id='${id}';`;
    try {
        connection.query(query, (err, result) => {
            if (err) throw err;
            if (password === result[0].password) {
                let deleteQuery = `DELETE FROM user WHERE id='${id}';`;
                connection.query(deleteQuery, (err, deleteResult) => {
                    if (err) throw err;
                    res.redirect('/users');
                });
            } else {
                res.send("Wrong password");
            }
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

    let countQuery = `SELECT status, COUNT(*) AS count FROM tasks WHERE id='${id}' GROUP BY status;`;
    const statuslist=count(id);
    let s0;
    let s1;
    let total;
    
    connection.query(countQuery, (err, result) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(result);
        let statusCount = {
            0: 0,
            1: 0
        };

        result.forEach(item => {
            const status = item.status;
            const count = item.count;

            if (statusCount[status] !== undefined) {
                statusCount[status] += count;
            } else {
                statusCount[status] = count;
            }
        });

        s0=statusCount[0];
        s1=statusCount[1];
        total=statusCount[0]+statusCount[1];
        console.log(s0+" "+s1+" "+total);
    });

    let searchq = `SELECT taskid ,task ,time,status FROM tasks WHERE id='${id}'and status=0 ORDER BY time DESC;`;
    try {
        connection.query(searchq, (err, result) => {
            if (err) throw err;
            console.log(result);
            let data = result;
            data.forEach(item => {
                console.log(item.status);
            });
            res.render("index", { data, id,name,s0 });
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

app.get("/user/:id/complete",(req,res)=>{
    let {id}=req.params;
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
    let countQuery = `SELECT status, COUNT(*) AS count FROM tasks WHERE id='${id}' GROUP BY status;`;
    // const statuslist=count(id);
    let s0;
    let s1;
    let total;
    
    connection.query(countQuery, (err, result) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(result);
        let statusCount = {
            0: 0,
            1: 0
        };

        result.forEach(item => {
            const status = item.status;
            const count = item.count;

            if (statusCount[status] !== undefined) {
                statusCount[status] += count;
            } else {
                statusCount[status] = count;
            }
        });

        s0=statusCount[0];
        s1=statusCount[1];
        total=statusCount[0]+statusCount[1];
        console.log(s0+" "+s1+" "+total);
    });
    let searchq = `SELECT taskid ,task ,time,status FROM tasks WHERE id='${id}'and status =1 ORDER BY time;`;
    try {
        connection.query(searchq, (err, result) => {
            if (err) throw err;
            console.log(result);
            let data = result;
            data.forEach(item => {
                console.log(item.status);
            });
            let percentage=(s1*100)/total;
            percentage=parseFloat(percentage.toFixed(2));
            console.log("------------------------------"+percentage);
            res.render("completed", { data, id,percentage,name});
        });
    } catch (err) {
        console.log(err);
        res.send("Error retrieving tasks.");
    }
    // res.send("at completed task page.")
});

app.patch("/task/status1/:id/:taskid",(req,res)=>{
    // res.send("working");
    let {id,taskid}=req.params;
    let updateQuery=`update tasks set status=${1} where id='${id}' and taskid='${taskid}';`;
    try {
        connection.query(updateQuery, (err, result) => {
            if (err) throw err;
            console.log(result);
            res.redirect(`/user/task/${id}`);
        });
    } catch (err) {
        console.log(err);
        res.send("Error retrieving tasks.");
    }
});
//
app.patch("/task/status0/:id/:taskid",(req,res)=>{
    // res.send("working");
    let {id,taskid}=req.params;
    let updateQuery=`update tasks set status=${0} where id='${id}' and taskid='${taskid}';`;
    try {
        connection.query(updateQuery, (err, result) => {
            if (err) throw err;
            console.log(result);
            res.redirect(`/user/${id}/complete`);
        });
    } catch (err) {
        console.log(err);
        res.send("Error retrieving tasks.");
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
app.get("/search/:id",(req,res)=>{
    // res.send("searach with ai");
    let {id}=req.params;
    res.render("search.ejs",{id});
});

app.post("/search", async (req, res) => {
    let { search } = req.body;
    console.log(search);
    try {
        let result = await run(search);
        console.log(result);
        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error processing request");
    }
});
// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`);
});
