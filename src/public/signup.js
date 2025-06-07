document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value
  };

  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(formData)
    });

    const data = await res.json();

    if (res.ok) {
      window.location.href = '/tool'; // Or use '/calendar' if that's the preferred first tool
    } else {
      alert(`Signup failed: ${data.message}`);
    }

  } catch (err) {
    console.error("❌ Signup error:", err);
    alert("Unexpected signup error.");
  }
});