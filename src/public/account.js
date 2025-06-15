document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('accountForm');
  const deleteBtn = document.getElementById('deleteAccountBtn');

  // Fetch user info on load (optional)
  try {
    const res = await fetch('/api/user');
    const user = await res.json();
    document.getElementById('name').value = user.name;
    document.getElementById('email').value = user.email;
  } catch (err) {
    console.error('Failed to load user info:', err);
  }

  // Save changes
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const password = document.getElementById('password').value;

    const res = await fetch('/api/user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password }),
    });

    if (res.ok) {
      alert('Account updated successfully!');
      document.getElementById('password').value = ''; // Clear password field
    } else {
      alert('Error updating account.');
    }
  });

  // Delete account
  deleteBtn.addEventListener('click', async () => {
    const confirmDelete = confirm('Are you sure you want to delete your account? This cannot be undone.');

    if (!confirmDelete) return;

    const res = await fetch('/api/user', {
      method: 'DELETE',
    });

    if (res.ok) {
      alert('Your account has been deleted.');
      window.location.href = '/';
    } else {
      alert('Error deleting account.');
    }
  });
});