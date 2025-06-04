document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      alert('Login successful!');
      window.location.href = '/';
    } else {
      alert(`Login failed: ${data.message}`);
    }
  } catch (err) {
    console.error('❌ Login error:', err);
    alert('Unexpected login error.');
  }
});