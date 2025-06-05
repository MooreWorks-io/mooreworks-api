document.addEventListener('DOMContentLoaded', async () => {
  const navButtons = document.getElementById('nav-buttons');

  const res = await fetch('/api/auth/check-auth', {
    credentials: 'include'
  });

  if (res.ok) {
    // Logged in — show tools + logout
    navButtons.innerHTML = `
      <a href="/tool" class="cta-button small">Email Generator</a>
      <a href="/calendar" class="cta-button small">Calendar Tool</a>
      <button id="logoutBtn" class="cta-button small" style="background: var(--brand-purple);">Logout</button>
    `;

    document.getElementById('logoutBtn').addEventListener('click', async () => {
      const logoutRes = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      if (logoutRes.ok) {
        window.location.reload();
      } else {
        alert('Logout failed');
      }
    });

  } else {
    // Not logged in — show login button
    navButtons.innerHTML = `
      <a href="/login" class="cta-button small">Login</a>
    `;
  }
});