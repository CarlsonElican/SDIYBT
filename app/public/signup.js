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
  const message = document.getElementById("message");
  const originalText = button.textContent;
  let willRedirect = false;

  const user = {
    username: usernameInput.value,
    password: passwordInput.value
  };

  button.disabled = true;
  button.textContent = "Creating...";

  fetch("/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user)
  })
    .then(res => {
      if (res.status === 200) {
        message.textContent = "Sign Up Successful. Returning to Log In";
        willRedirect = true;
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1500);
      } else {
        message.textContent = "Signup failed. Try a different username.";
      }
    })
    .catch(err => {
      console.error(err);
      message.textContent = "Something went wrong. Please try again.";
    })
    .finally(() => {
      if (!willRedirect) {
        button.disabled = false;
        button.textContent = originalText;
      }
    });
});
