
document.querySelector("form.register")?.addEventListener("submit", (e)=>{
    let data = new FormData(e.target)
    let login = data.get("login")
    let password = data.get("password")
    let passwordR = data.get("passwordR")
    e.preventDefault();
    console.log(login, password, passwordR)
    if(password != passwordR){
        alert("Паролі не збігаються")
        return
    }
    fetch("/api/register", {
        method: "POST",
        body: JSON.stringify({login, password})
    }).then(res=>res.json()).then(res=>{
        if(res.status == "User exist"){
            alert("колистувач з таким логіном вже існує")
        }else if(res.status == "ok"){
            window.location = "/login"
        }
    })
})


document.querySelector("form.login")?.addEventListener("submit", (e)=>{
    let data = new FormData(e.target)
    let login = data.get("login")
    let password = data.get("password")
    e.preventDefault();
    
    fetch("/api/login", {
        method: "POST",
        body: JSON.stringify({login, password})
    }).then(res=>res.json()).then(res=>{
        if(res.status == "error"){
            alert("Логін чи пароль невірні")
        }else if(res.status == "ok"){
            window.location = "/"
        }
    })
})