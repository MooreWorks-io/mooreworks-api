document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        window.location.reload();
      } else {
        alert('Logout failed.');
      }
    });
  }
});