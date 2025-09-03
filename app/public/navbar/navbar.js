fetch('/navbar/navbar.html')
  .then(r => r.text())
  .then(html => {
    document.getElementById('navbar-id').innerHTML = html;

    const signoutBtn = document.getElementById("signout");
    const trainerBtn = document.getElementById("trainer");
    const leaderBtn  = document.getElementById("leaderboard");

    const modal      = document.getElementById('signout-modal');
    const confirmBtn = document.getElementById('signout-confirm');
    const cancelBtn  = document.getElementById('signout-cancel');
    const backdrop   = modal?.querySelector('[data-close]');
    let lastFocused;

    function openModal() {
      if (!modal) return;
      lastFocused = document.activeElement;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      confirmBtn?.focus();
      document.addEventListener('keydown', onKeydown);
    }

    function closeModal() {
      if (!modal) return;
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.removeEventListener('keydown', onKeydown);
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }

    function onKeydown(e) {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'Tab') trapFocus(e);
    }

    function trapFocus(e) {
      const focusables = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last  = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }

    if (signoutBtn) {
      signoutBtn.addEventListener("click", function (e) {
        e.preventDefault();
        openModal();
      });
    }

    if (confirmBtn) {
      confirmBtn.addEventListener('click', async () => {
        try {
          const res = await fetch("/logout", { method: "POST", credentials: "include" });
          if (res.status === 200) {
            window.location.href = "/";
          } else {
            closeModal();
          }
        } catch {
          closeModal();
        }
      });
    }

    cancelBtn?.addEventListener('click', (e) => { e.preventDefault(); closeModal(); });
    backdrop?.addEventListener('click', closeModal);

    if (trainerBtn) {
      trainerBtn.addEventListener("click", function (e) {
        window.location.href = "/trainer";
      });
    }

    if (leaderBtn) {
      leaderBtn.addEventListener("click", function (e) {
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
