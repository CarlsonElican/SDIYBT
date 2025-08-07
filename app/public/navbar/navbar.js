fetch('/navbar/navbar.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('navbar-placeholder').innerHTML = data;

        let button = document.getElementById("signout");
        if (button) {
            button.addEventListener("click", function() {
                fetch("/logout", {
                    method: "POST",
                    credentials: "include"
                })
                .then(res => {
                    if (res.status === 200) {
                        window.location.href = "/";
                    }
                });
            });
        }

        fetch("/me", { credentials: "include" })
            .then(res => res.status === 200 ? res.json() : null)
            .then(data => {
                if (data && data.username) {
                    const greeting = document.getElementById("navbar-greeting");
                    if (greeting) {
                        greeting.textContent = "Hi, " + data.username;
                    }
                }
            });
    });
