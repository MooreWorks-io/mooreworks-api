// public/scripts/mooreboard.js
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('addJobModal');
  const form = document.getElementById('addJobForm');
  const jobList = document.getElementById('jobList');
  const cancelBtn = document.getElementById('cancelJobModalBtn');
  const openModalBtn = document.querySelector('.add-job-btn');

  // Open modal
  openModalBtn.addEventListener('click', () => {
    form.reset();
    modal.style.display = 'flex';
  });

  // Close modal
  cancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Submit job
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const job = {
      clientName: form.clientName.value,
      address: form.address.value,
      jobType: form.jobType.value,
      status: form.status.value
    };

    try {
      const res = await fetch('/api/mooreboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(job)
      });

      if (res.ok) {
        form.reset();
        modal.style.display = 'none';
        loadJobs();
      } else {
        alert('Failed to save job.');
      }
    } catch (err) {
      console.error('Error submitting job:', err);
    }
  });

  // Load all jobs
  async function loadJobs() {
    try {
      const res = await fetch('/api/mooreboard', { credentials: 'include' });
      const jobs = await res.json();
      jobList.innerHTML = '';

      if (!jobs.length) {
        jobList.innerHTML = '<p style="text-align:center; color:#777">No jobs yet.</p>';
        return;
      }

      jobs.forEach(job => {
        const card = document.createElement('div');
        card.className = 'job-card';

        card.innerHTML = `
          <h3>${job.clientName}</h3>
          <p><strong>Address:</strong> ${job.address}</p>
          <p><strong>Type:</strong> ${job.jobType}</p>
          <p><strong>Status:</strong> <span class="status">${job.status}</span></p>
          <p><small>Created: ${new Date(job.createdAt).toLocaleDateString()}</small></p>
        `;

        jobList.appendChild(card);
      });
    } catch (err) {
      console.error('Error loading jobs:', err);
    }
  }

  loadJobs();
});