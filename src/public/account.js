document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('accountForm');
  const deleteBtn = document.getElementById('deleteAccountBtn');

  // Load user info on page load
  try {
    const res = await fetch('/api/user');
    const user = await res.json();

    document.getElementById('name').value = user.name || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('fieldRate').value = user.fieldRate || '';
    document.getElementById('officeRate').value = user.officeRate || '';
    document.getElementById('courthouseRate').value = user.courthouseRate || '';
  } catch (err) {
    console.error('❌ Failed to load user info:', err);
  }

  // Save changes
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const password = document.getElementById('password').value;
    const fieldRate = parseFloat(document.getElementById('fieldRate').value) || 0;
    const officeRate = parseFloat(document.getElementById('officeRate').value) || 0;
    const courthouseRate = parseFloat(document.getElementById('courthouseRate').value) || 0;

    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          password,
          fieldRate,
          officeRate,
          courthouseRate
        })
      });

      if (res.ok) {
        alert('✅ Account updated successfully!');
        document.getElementById('password').value = '';
      } else {
        alert('⚠️ Error updating account.');
      }
    } catch (err) {
      console.error('❌ Failed to update account:', err);
      alert('Server error.');
    }
  });

  // Delete account
  deleteBtn.addEventListener('click', async () => {
    const confirmDelete = confirm('Are you sure you want to delete your account? This cannot be undone.');
    if (!confirmDelete) return;

    try {
      const res = await fetch('/api/user', { method: 'DELETE' });

      if (res.ok) {
        alert('🗑️ Your account has been deleted.');
        window.location.href = '/';
      } else {
        alert('⚠️ Error deleting account.');
      }
    } catch (err) {
      console.error('❌ Failed to delete account:', err);
      alert('Server error.');
    }
  });
});