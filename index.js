const express = require("express");
const path = require("path");
const app = express();
const { v4: uuidv4 }=require('uuid');
const mysql = require('mysql2');
const methodOverrider=require("method-override");

function getFormattedDate() {
    const timestamp = Date.now(); // or new Date().getTime()
    const date = new Date(timestamp);

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
} 

app.use(methodOverrider("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'todosite',
    password: 'Jha@2023'
});
let query='show tables;'
try {
    connection.query(query, (err, result) => {
        if (err) throw err;
        // let count = result[0]["count(*)"];
        console.log(result);
        // res.render("home", { count });
    });
} catch (err) {
    console.log(err);
}
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
// app.get("/todo",(req,res)=>{
//     res.render("home.ejs");
// });
app.get("/signup",(req,res)=>{
    res.render("signup");
});
app.post("/signup",(req,res)=>{
    let {username,email,password}=req.body;
    let query=`INSERT INTO user (id, username, email, password) VALUES (?, ?, ?, ?);`
    const values=[uuidv4(),username,email,password];
    try {
        connection.query(query,values,(err, result) => {
            if (err) throw err;
            // let count = result[0]["count(*)"];
            console.log(result);
            res.redirect("signin");
            // res.send();
            // res.render("home", { count });
        });
    } catch (err) {
        console.log(err);
    }
    console.log(username,email,password);
});
app.get("/signin",(req,res)=>{
    res.render("signin");
    // res.send("sign in page.");
});

app.post("/signin",(req,res)=>{
    let {username,password}=req.body;
    let searchQ=`select * from user where username='${username}' and password='${password}';`
    try {
        connection.query(searchQ,(err, result) => {
            if (err) throw err;
            console.log(result);
            if(result.length!=0){
                let data=result[0];
                console.log(data);
                res.render('index.ejs',{data});
                
                // res.send("logged in");
            }else{
                res.send("no such record");
            }
        });
    } catch (err) {
        console.log(err);
        res.send("Wrong user name or password.")
    }
    // console.log("user logged in");
});

app.post("/addtask/:id",(req,res)=>{
    let {task}=req.body;
    let {id}=req.params;
    const timestamp = getFormattedDate();
    let addQuery='insert into tasks (id,task,time,status,taskid) values (?,?,?,?,?);'
    const values=[id,task,timestamp,false,uuidv4()];
    try {
        connection.query(addQuery,values,(err, result) => {
            if (err) throw err;
            console.log(result);
            console.log("added");
        });
    } catch (err) {
        console.log(err);
        res.send("Wrong user name or password.")
    }
})
// connection.end();
app.listen(8000, () => {
    console.log(`App is listening on port 8000`);
});