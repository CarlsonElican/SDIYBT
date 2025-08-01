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

    fetch("/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    })
    .then(res => {
        let message = document.getElementById("message");

        if (res.status === 200) {
            message.textContent = "Account created successfully!";
        } else {
            message.textContent = "Signup failed. Try a different username.";
        }
    })
    .catch(err => {
        console.error(err);
    });
});
