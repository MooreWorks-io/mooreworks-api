document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  console.log("🔐 Attempting login...", { email });

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    console.log("📬 Response:", res);

    const data = await res.json();
    console.log("📦 Data:", data);

    if (res.ok) {
      alert('Login successful!');
      window.location.href = '/tool'; // real tool
    } else {
      alert(`Login failed: ${data.message}`);
    }

  } catch (err) {
    console.error("❌ Caught error:", err);
    alert("Unexpected login error.");
  }
});