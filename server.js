require("dotenv").config();
let db = require("./db");
let http = require("http");
let path = require("path");
let fs = require("fs");
let socket = require("socket.io");
let bcrypt = require("bcrypt")

let pathToIndex = path.join(__dirname, "static", "index.html");
let index = fs.readFileSync(pathToIndex, "utf-8");

let pathToStyle = path.join(__dirname, "static", "style.css");
let style = fs.readFileSync(pathToStyle, "utf-8");

let pathToScript = path.join(__dirname, "static", "script.js");
let script = fs.readFileSync(pathToScript, "utf-8");

let pathToRegister = path.join(__dirname, "static", "register.html");
let register = fs.readFileSync(pathToRegister, "utf-8");

let pathToLoginPage = path.join(__dirname, "static", "login.html");
let loginPage= fs.readFileSync(pathToLoginPage, "utf-8");

let pathToAuth = path.join(__dirname, "static", "auth.js");
let auth = fs.readFileSync(pathToAuth, "utf-8");

let server = http
    .createServer(function (req, res) {
        switch (req.url) {
            case "/":
                res.writeHead(200, { "content-type": "text/html" });
                res.end(index);
                break;
            case "/register":
                res.writeHead(200, { "content-type": "text/html" });
                res.end(register);
                break;
            case "/login":
                res.writeHead(200, { "content-type": "text/html" });
                res.end(loginPage);
                break;
            case "/auth.js":
                res.writeHead(200, { "content-type": "text/js" });
                res.end(auth);
                break;
            case "/style.css":
                res.writeHead(200, { "content-type": "text/css" });
                res.end(style);
                break;
            case "/script.js":
                res.writeHead(200, { "content-type": "text/js" });
                res.end(script);
                break;
            case "/api/register":
                let data = ""
                req.on("data", (chunk)=> data += chunk)
                req.on("end",async ()=>{
                    data = JSON.parse(data)
                    console.log(data)
                    if(await db.existsUser(data.login)){
                        res.end(JSON.stringify({status: "User exist"}))
                        return
                    }
                    let hash = await bcrypt.hash(data.password, 10)
                    console.log(data.password, hash)
                    await db.addUser(data.login, hash)
                    res.end(JSON.stringify({status: "ok"}))
                })
                break;
            case "/api/login":
                let datalogin = ""
                req.on("data", (chunk)=> datalogin += chunk)
                req.on("end",async ()=>{
                    datalogin = JSON.parse(datalogin)
                    
                    res.end(JSON.stringify({status: "ok"}))
                })
                break;
            default:
                res.writeHead(404, { "content-type": "text/html" });
                res.end("<h1>GO AWAY!</h1>");
        }
    })
    .listen(3000, () => console.log("server is on!"));

let io = new socket.Server(server);

let chat = [];

io.on("connection",async (s) => {
    console.log("User id: " + s.id);
    let messages = await db.getMessages()
    console.log(messages)
    let chat = messages.map(m=>({user: m.login, message: m.content}))
    io.emit("update", JSON.stringify(chat));
    s.on("message", async (data) => {
        let message = JSON.parse(data);
        let text = message.message

        await db.addMessage(text, 1)

        let messages = await db.getMessages()
        console.log(messages)
        let chat = messages.map(m=>({user: m.login, message: m.content}))
        
        io.emit("update", JSON.stringify(chat));
    });
});


