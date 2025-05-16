document.querySelector("#register")?.addEventListener("submit", (e) => {
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
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.message === "User created") {
                    window.location.assign("/login");
                }
            });
    } else {
        alertify.error("Паролі не співпадають");
    }
});

document.querySelector(".login")?.addEventListener("submit", (e) => {
    e.preventDefault();
    let data = new FormData(e.target);
    let login = data.get("login");
    let password = data.get("password");
    fetch("/login", {
        method: "POST",
        body: JSON.stringify({
            login,
            password,
        }),
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.message === "User logged in") {
                window.location.assign("/");
            }
        });
});
