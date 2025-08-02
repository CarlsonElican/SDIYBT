let button = document.getElementById("submit");
let usernameInput = document.getElementById("un");
let passwordInput = document.getElementById("pw");
const showBtn = document.getElementById("showPW");

showBtn.addEventListener("click", () => {
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        showBtn.textContent = "Hide Password";
    } else {
        passwordInput.type = "password";
        showBtn.textContent = "Show Password";
    }
});

button.addEventListener("click", () => {
    let user = {
        username: usernameInput.value,
        password: passwordInput.value
    };

    fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user),
        credentials: "include"
    })
    .then(res => {
        let message = document.getElementById("message");

        if (res.status === 200) {
            fetch("/me", { credentials: "include" })
                .then(meRes => {
                    if (meRes.status === 200) {
                        return meRes.json();
                    }
                })
                .then(data => {
                    if (data && data.username) {
                        message.textContent = "Login successful! Welcome " + data.username;
                    } else {
                        message.textContent = "Login successful!";
                    }
                    setTimeout(() => {
                        window.location.href = "/main";
                    }, 1500);
                });
        } else {
            message.textContent = "Invalid username or password";
        }
    })
    .catch(err => {
        console.error(err);
    });
});
