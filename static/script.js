const server = io()
let cookies = document.cookie.split(";")
let nickname = cookies.find((cookie) => cookie.includes("token")).split("=")[1]
let id = cookies.find((cookie) => cookie.includes("id")).split("=")[1]

console.log(nickname, id)
document.querySelector(".form button").addEventListener("click", sendMessage)

function sendMessage(){
    let input = document.querySelector(".form input").value
    document.querySelector(".form input").value = ""
    server.emit("message", JSON.stringify({
        user: parseInt(id),
        message: input
    }))
}

server.on("update", (data)=>{
    let chat = JSON.parse(data)
    console.log(chat)
    let main = document.querySelector("main")
    main.innerHTML = ""
    chat.forEach((message)=>{
        main.innerHTML += `<div class="message">${message.user}: ${message.message}</div>`
    })
})


document.querySelector("header button").addEventListener("click", ()=>{
    window.location.assign("/login")
})