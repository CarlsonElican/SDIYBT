document.addEventListener("DOMContentLoaded", () => {
  const howToPlayBtn = document.getElementById("howToPlayBtn");
  const howToPlayModal = document.getElementById("howToPlayModal");
  const closeHowToPlay = document.getElementById("closeHowToPlay");

  if (howToPlayBtn && howToPlayModal && closeHowToPlay) {
    howToPlayBtn.addEventListener("click", () => {
      howToPlayModal.classList.add("is-open");
    });

    closeHowToPlay.addEventListener("click", () => {
      howToPlayModal.classList.remove("is-open");
    });

    howToPlayModal.addEventListener("click", (e) => {
      if (e.target === howToPlayModal) {
        howToPlayModal.classList.remove("is-open");
      }
    });
  }
});
