document.querySelector("#register").addEventListener("submit", (e) => {
    e.preventDefault();
    let data = new FormData(e.target);
    let login = data.get("login");
    let password = data.get("password");
    let password2 = data.get("password2");
    if (password === password2) {
        fetch("/register", {
            method: "POST",
            body: JSON.stringify({
                login,
                password,
            }),
        });
    }else{
        alertify.error("Паролі не співпадають")
    }
})