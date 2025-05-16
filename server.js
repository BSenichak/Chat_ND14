require("dotenv").config();
let db = require("./db");
let http = require("http");
let path = require("path");
let fs = require("fs");
let socket = require("socket.io");
let bcrypt = require("bcrypt");
let jwt = require("jsonwebtoken");

let SecretKey = process.env.SECRET_KEY;

let pathToIndex = path.join(__dirname, "static", "index.html");
let index = fs.readFileSync(pathToIndex, "utf-8");

let pathToStyle = path.join(__dirname, "static", "style.css");
let style = fs.readFileSync(pathToStyle, "utf-8");

let pathToScript = path.join(__dirname, "static", "script.js");
let script = fs.readFileSync(pathToScript, "utf-8");

let pathToRegister = path.join(__dirname, "static", "register.html");
let register = fs.readFileSync(pathToRegister, "utf-8");

let pathToLogin = path.join(__dirname, "static", "login.html");
let loginPage = fs.readFileSync(pathToLogin, "utf-8");

let pathToAuthScript = path.join(__dirname, "static", "auth.js");
let authScript = fs.readFileSync(pathToAuthScript, "utf-8");

let server = http
    .createServer(function (req, res) {
        switch (req.url) {
            case "/":
                let user = guarded(req, res)
                if(!user)return
                res.setHeader("Set-Cookie", "login=" + user.login);
                res.setHeader("Set-Cookie", "id=" + user.id);
                res.writeHead(200, { "content-type": "text/html" });
                res.end(index);
                break;
            case "/style.css":
                res.writeHead(200, { "content-type": "text/css" });
                res.end(style);
                break;
            case "/script.js":
                res.writeHead(200, { "content-type": "text/js" });
                res.end(script);
                break;
            case "/register":
                if (req.method === "POST") return regsterUser(req, res);
                if (req.method === "GET") {
                    res.writeHead(200, { "content-type": "text/html" });
                    res.end(register);
                }
                break;
            case "/login":
                if (req.method === "POST") return loginUser(req, res);
                if (req.method === "GET") {
                    res.writeHead(200, { "content-type": "text/html" });
                    res.end(loginPage);
                }
                break;
            case "/auth.js":
                res.writeHead(200, { "content-type": "text/js" });
                res.end(authScript);
                break;
            default:
                res.writeHead(404, { "content-type": "text/html" });
                res.end("<h1>GO AWAY!</h1>");
        }
    })
    .listen(3000, () => console.log("server is on!"));

let io = new socket.Server(server);

io.on("connection", async (s) => {
    console.log("User id: " + s.id);
    let messages = await db.getMessages();
    io.emit(
        "update",
        JSON.stringify(
            messages?.map((message) => ({
                user: message.login,
                message: message.content,
            }))
        )
    );
    s.on("message", async (data) => {
        let message = JSON.parse(data);
        await db.addMessage(message.message, message.user);
        let messages = await db.getMessages();
        io.emit(
            "update",
            JSON.stringify(
                messages.map((message) => ({
                    user: message.login,
                    message: message.content,
                }))
            )
        );
    });
});

async function regsterUser(req, res) {
    let body = "";
    req.on("data", (data) => {
        body += data;
    });
    req.on("end", async () => {
        let data = JSON.parse(body);
        let exist = await db.existUser(data.login);
        if (exist) {
            res.writeHead(400, { "content-type": "text/plain" });
            res.end(JSON.stringify({ message: "User already exist" }));
            return;
        }
        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(data.password, salt);
        await db.addUser(data.login, hash);
        res.end(JSON.stringify({ message: "User created" }));
    });
}


async function loginUser(req, res) {
    let body = "";
    req.on("data", (data) => {
        body += data;
    });
    req.on("end", async () => {
        let data = JSON.parse(body);
        let user = await db.getUser(data.login);
        if (user.length === 0) {
            res.writeHead(400, { "content-type": "text/plain" });
            res.end(JSON.stringify({ message: "User not found" }));
            return;
        }
        let unhash = await bcrypt.compare(data.password, user[0].password);
        if (!unhash) {
            res.writeHead(400, { "content-type": "text/plain" });
            res.end(JSON.stringify({ message: "Wrong password" }));
            return;
        }
        let token = jwt.sign(
            { id: user[0].id, login: user[0].login },
            SecretKey,
            { expiresIn: "1h" },
        )
        res.setHeader("Set-Cookie", "token=" + token);
        res.end(JSON.stringify({ message: "User logged in" }));
    });
}

function guarded(req, res){
    if (req.headers.cookie === undefined) {
        res.writeHead(302, { "location": "/login" });
        res.end();
        return;
    }
    let cookies = req.headers.cookie.split(";")
    let token = cookies.find((cookie) => cookie.includes("token")).split("=")[1]
    let decoded = jwt.verify(token, SecretKey);
    if (!decoded) {
        res.writeHead(302, { "location": "/login" });
        res.end();
        return;
    }else{
        return decoded;
    }
}