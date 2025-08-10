fetch('/navbar/navbar.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('navbar-id').innerHTML = data;

        let signoutBtn = document.getElementById("signout");
        if (signoutBtn) {
            signoutBtn.addEventListener("click", function() {
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

        let profileBtn = document.getElementById("profile");
        if (profileBtn) {
            profileBtn.addEventListener("click", function() {
                window.location.href = "/profile";
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
