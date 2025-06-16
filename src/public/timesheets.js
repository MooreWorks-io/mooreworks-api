document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('timesheetModal');
  const form = document.getElementById('timesheetForm');
  const cancelBtn = document.getElementById('cancelModalBtn');
  const addEntryBtn = document.querySelector('.add-entry-btn');
  const timesheetGrid = document.querySelector('.timesheet-grid');

  // Open modal
  addEntryBtn.addEventListener('click', () => {
    form.reset();
    modal.style.display = 'flex';
  });

  // Close modal
  cancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Submit form
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const entry = {
      date: form.date.value,
      job: form.job.value,
      fieldHours: parseFloat(form.fieldHours.value) || 0,
      officeHours: parseFloat(form.officeHours.value) || 0,
      notes: form.notes.value
    };

    try {
      const res = await fetch('/api/timesheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(entry)
      });

      const data = await res.json();

      if (res.ok) {
        console.log('✅ Timesheet saved:', data.entry);
        alert('Entry saved!');
        modal.style.display = 'none';
        form.reset();
        loadEntries(); // ✅ Refresh grid after save
      } else {
        alert('Failed to save entry.');
      }
    } catch (err) {
      console.error('❌ Error saving entry:', err);
      alert('Server error.');
    }
  });

  // Load and display entries
  async function loadEntries() {
    try {
      const res = await fetch('/api/timesheets', { credentials: 'include' });
      const entries = await res.json();

      timesheetGrid.innerHTML = '';

      if (!entries.length) {
        timesheetGrid.innerHTML = '<p style="text-align:center; color:#777;">No entries yet.</p>';
        return;
      }

      entries.forEach(entry => {
        const card = document.createElement('div');
        card.className = 'timesheet-entry';

        const date = new Date(entry.date).toLocaleDateString('en-US', {
          weekday: 'short', month: 'short', day: 'numeric'
        });

        card.innerHTML = `
          <div><strong>${date}</strong></div>
          <div>👤 You</div>
          <div>📍 ${entry.job}</div>
          <div>⏱ ${entry.fieldHours}h Field / ${entry.officeHours}h Office</div>
          <div>📝 ${entry.notes || '—'}</div>
          <div>Status: <span class="status ${entry.paid ? 'paid' : 'unpaid'}">
            ${entry.paid ? 'Paid' : 'Unpaid'}
          </span></div>
        `;

        timesheetGrid.appendChild(card);
      });
    } catch (err) {
      console.error('❌ Failed to load timesheets:', err);
      timesheetGrid.innerHTML = '<p style="color:red;">Error loading entries.</p>';
    }
  }

  loadEntries(); // ✅ Load entries on page load
});