document.getElementById('forgotForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const messageBox = document.getElementById('message');
  messageBox.textContent = 'Sending reset link...';

  try {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (res.ok) {
      messageBox.textContent = 'Check your email for a reset link.';
    } else {
      messageBox.textContent = data.error || 'Something went wrong.';
    }
  } catch (err) {
    messageBox.textContent = 'Error contacting server.';
    console.error(err);
  }
});