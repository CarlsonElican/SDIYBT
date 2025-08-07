let button = document.getElementById("generate");
if (button){
    button.addEventListener("click", function() {
        fetch("/generate-pet", {
            method: "POST",
            credentials: "include"
        })
        .then(res => res.json())
        .then(data => {
            console.log("Pet generated:", data);
        })
        .catch(err => {
            console.error("Failed to generate pet", err);
        });
    });
}