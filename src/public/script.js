// === MooreWorks Email Generator Script ===

const emailType = document.getElementById('emailType');
const form = document.getElementById('emailForm');
const previewBox = document.getElementById('previewBox');
const emailSubject = document.getElementById('emailSubject');
const toneSelect = document.getElementById('toneSelect');

const groups = {
  estimate: document.getElementById('estimate'),
  schedule: document.getElementById('schedule'),
  finalReport: document.getElementById('finalReport'),
  infoRequest: document.getElementById('infoRequest'),
  delay: document.getElementById('delay'),
  thankYou: document.getElementById('thankYou'),
};

function showSelectedForm(type) {
  Object.values(groups).forEach(g => g.classList.remove('active'));
  if (groups[type]) groups[type].classList.add('active');
}

emailType.addEventListener('change', () => showSelectedForm(emailType.value));

function getValue(id) {
  return document.getElementById(id)?.value || '';
}

function getPDFReminder(id) {
  const file = document.getElementById(id)?.files?.[0];
  return file ? `\n\n(PDF attachment: ${file.name} — please remember to attach before sending)` : '';
}

async function generateEmail(e) {
  e.preventDefault();
  const selected = emailType.value;
  let data = { type: selected, tone: toneSelect.value };
  previewBox.value = 'Generating...';

  switch (selected) {
    case 'estimate':
      Object.assign(data, {
        clientName: getValue('estClient'),
        address: getValue('estAddress'),
        discussed: getValue('estDiscussed'),
        surveyType: getValue('estSurveyType'),
        price: getValue('estPrice'),
        timeline: getValue('estTimeline'),
        details: getValue('estDetails'),
      });
      data.pdfReminder = getPDFReminder('estPdf');
      break;

    case 'schedule':
      Object.assign(data, {
        clientName: getValue('schedClient'),
        address: getValue('schedAddress'),
        jobType: getValue('schedType'),
        access: getValue('schedAccess'),
        presence: getValue('schedPresence'),
        dates: getValue('schedDates'),
        contact: getValue('schedContact'),
        notes: getValue('schedNotes'),
      });
      break;

    case 'finalReport':
      Object.assign(data, {
        clientName: getValue('finalName'),
        address: getValue('finalAddress'),
        reportType: getValue('finalType'),
        deliveryMethod: getValue('finalDelivery'),
        moreDocs: getValue('finalMoreDocs'),
        notes: getValue('finalNotes'),
      });
      data.pdfReminder = getPDFReminder('finalPdf');
      break;

    case 'infoRequest':
      const checklist = [...document.getElementById('infoChecklist').selectedOptions].map(o => o.value);
      Object.assign(data, {
        clientName: getValue('infoName'),
        address: getValue('infoAddress'),
        checklist,
        notes: getValue('infoNotes'),
      });
      data.pdfReminder = getPDFReminder('infoPdf');
      break;

    case 'delay':
      Object.assign(data, {
        clientName: getValue('delayName'),
        address: getValue('delayAddress'),
        reason: getValue('delayReason'),
        timeline: getValue('delayTimeline'),
        apology: getValue('delayApology'),
        notes: getValue('delayNotes'),
      });
      break;

    case 'thankYou':
      Object.assign(data, {
        clientName: getValue('thankName'),
        address: getValue('thankAddress'),
        completedWork: getValue('thankWork'),
        review: getValue('thankReview'),
        referral: getValue('thankReferral'),
        finalNote: getValue('thankNote'),
      });
      break;
  }

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    let fullEmail = result.email || '';
    if (data.pdfReminder) fullEmail += data.pdfReminder;

    emailSubject.value = result.subject || 'Survey Email';
    previewBox.value = fullEmail;
  } catch (err) {
    previewBox.value = 'Error generating email.';
    console.error(err);
  }
}

function copyToClipboard() {
  previewBox.focus();
  previewBox.select();
  try {
    document.execCommand('copy');
    const success = document.getElementById('copySuccess');
    success.style.display = 'inline';
    setTimeout(() => { success.style.display = 'none'; }, 2000);
  } catch {
    alert('Failed to copy text. Please copy manually.');
  }
}

function sendViaEmailApp() {
  const body = previewBox.value.trim();
  const subject = emailSubject.value.trim() || 'Survey Email';
  if (!body) return alert("Please generate an email before sending.");
  const link = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = link;
}

function openInGmail() {
  setTimeout(() => {
    const body = previewBox.value.trim();
    const subject = emailSubject.value.trim() || 'Survey Email';
    if (!body) return alert("Please generate an email before sending.");
    const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailLink, '_blank');
  }, 100);
}

if (!form.dataset.listenerAttached) {
  form.dataset.listenerAttached = 'true';
  form.addEventListener('submit', generateEmail);
  document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
  document.getElementById('emailBtn').addEventListener('click', sendViaEmailApp);
  document.getElementById('gmailBtn').addEventListener('click', openInGmail);
  showSelectedForm(emailType.value);
}