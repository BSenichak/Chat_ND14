let mysql = require("mysql2")
require("dotenv").config()

let db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS
})

let adb = db.promise()

async function getUsers(){
    try{
        let [users, fields] = await adb.query("SELECT * FROM User1")
        return users
    }catch(err){
        throw err.message
    }
}

async function addMessage(content, author_id){
    try{
        let [users, fields] = await adb
            .query("insert into Message1(content, author_id) values(?, ?)", [content, author_id])
        return users
    }catch(err){
        throw err.message
    }
}

async function getMessages(){
    try{
        let [users, fields] = await adb
            .query(`SELECT m.id, m.content, m.author_id, u.login
            FROM Message1 as m
            JOIN User1 as u
            ON m.author_id = u.id`)
        return users
    }catch(err){
        throw err.message
    }
}

module.exports = {
    getUsers,
    getMessages,
    addMessage
}