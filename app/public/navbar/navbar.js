document.addEventListener("DOMContentLoaded", function() {
    fetch('navbar/navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-placeholder').innerHTML = data;

            fetch("/me", { credentials: "include" })
                .then(res => {
                    if (res.status === 200) {
                        return res.json();
                    }
                })
                .then(data => {
                    if (data && data.username) {
                        const greeting = document.getElementById("navbar-greeting");
                        if (greeting) {
                            greeting.textContent = "Hi, " + data.username;
                        }
                    }
                });

            const btn = document.getElementById("signout");
            if(btn) {
                btn.addEventListener("click", function() {
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
        });
});
