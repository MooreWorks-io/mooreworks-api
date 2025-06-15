document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const form = document.getElementById('resetForm');
  const messageBox = document.getElementById('message');

  if (!token) {
    messageBox.textContent = 'Invalid or missing reset token.';
    form.style.display = 'none';
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    if (res.ok) {
      messageBox.textContent = 'Password updated! You can now log in.';
      form.reset();
    } else {
      messageBox.textContent = data.error || 'Error resetting password.';
    }
  });
});