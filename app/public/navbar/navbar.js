fetch('/navbar/navbar.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('navbar-id').innerHTML = data;

    const signoutBtn = document.getElementById("signout");
    const trainerBtn = document.getElementById("trainer");
    const leaderBtn  = document.getElementById("leaderboard");

    if (signoutBtn) {
      signoutBtn.addEventListener("click", function () {
        fetch("/logout", { method: "POST", credentials: "include" })
          .then(res => { if (res.status === 200) window.location.href = "/"; });
      });
    }

    if (trainerBtn) {
      trainerBtn.addEventListener("click", function () {
        window.location.href = "/trainer";    
      });
    }

    if (leaderBtn) {
      leaderBtn.addEventListener("click", function () {
        window.location.href = "/leaderboard"; 
      });
    }

    fetch("/me", { credentials: "include" })
      .then(res => res.status === 200 ? res.json() : null)
      .then(data => {
        if (data?.username) {
          const greeting = document.getElementById("navbar-greeting");
          if (greeting) greeting.textContent = "Hi, " + data.username;
        }
      });
  });
