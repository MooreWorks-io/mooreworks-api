const emailType = document.getElementById('emailType');
  const form = document.getElementById('emailForm');

  const groups = {
    estimate: document.getElementById('estimate'),
    schedule: document.getElementById('schedule'),
    finalReport: document.getElementById('finalReport'),
    infoRequest: document.getElementById('infoRequest'),
    delay: document.getElementById('delay'),
    thankYou: document.getElementById('thankYou')
  };

  emailType.addEventListener('change', () => {
    Object.values(groups).forEach(g => g.classList.remove('active'));
    const selected = emailType.value;
    if (groups[selected]) {
      groups[selected].classList.add('active');
    }
  });

  if (!form.dataset.listenerAttached) {
  form.dataset.listenerAttached = "true";

  form.addEventListener('submit', async (e) => {
  e.preventDefault();
    const selected = emailType.value;
    let data = { type: selected };
    document.getElementById('previewBox').value = 'Generating...';


    if (selected === 'estimate') {
      data = {
        ...data,
        clientName: document.getElementById('estClient').value,
        address: document.getElementById('estAddress').value,
        discussed: document.getElementById('estDiscussed').value,
        surveyType: document.getElementById('estSurveyType').value,
        price: document.getElementById('estPrice').value,
        timeline: document.getElementById('estTimeline').value,
        details: document.getElementById('estDetails').value
      };

 data.tone = document.getElementById('toneSelect').value;
 const estPdfFile = document.getElementById('estPdf')?.files?.[0];
  if (estPdfFile) {
    data.pdfReminder = `\n\n(PDF attachment: ${estPdfFile.name} — please remember to attach before sending)`;
  }

    } else if (selected === 'schedule') {
      data = {
        ...data,
        clientName: document.getElementById('schedClient').value,
        address: document.getElementById('schedAddress').value,
        jobType: document.getElementById('schedType').value,
        access: document.getElementById('schedAccess').value,
        presence: document.getElementById('schedPresence').value,
        dates: document.getElementById('schedDates').value,
        contact: document.getElementById('schedContact').value,
        notes: document.getElementById('schedNotes').value
      };

      data.tone = document.getElementById('toneSelect').value;
    } else if (selected === 'finalReport') {
      data = {
        ...data,
        clientName: document.getElementById('finalName').value,
        address: document.getElementById('finalAddress').value,
        reportType: document.getElementById('finalType').value,
        deliveryMethod: document.getElementById('finalDelivery').value,
        moreDocs: document.getElementById('finalMoreDocs').value,
        notes: document.getElementById('finalNotes').value
      };

const finalPdfFile = document.getElementById('finalPdf')?.files?.[0];
if (finalPdfFile) {
  data.pdfReminder = `\n\n(PDF attachment: ${finalPdfFile.name} — please remember to attach before sending)`;
}

    } else if (selected === 'infoRequest') {
      const options = [...document.getElementById('infoChecklist').selectedOptions];
      const selectedItems = options.map(o => o.value);
      data = {
        ...data,
        clientName: document.getElementById('infoName').value,
        address: document.getElementById('infoAddress').value,
        checklist: selectedItems,
        notes: document.getElementById('infoNotes').value
      };

data.tone = document.getElementById('toneSelect').value;
const infoPdfFile = document.getElementById('infoPdf')?.files?.[0];
if (infoPdfFile) {
  data.pdfReminder = `\n\n(PDF attachment: ${infoPdfFile.name} — please remember to attach before sending)`;
}

    } else if (selected === 'delay') {
      data = {
        ...data,
        clientName: document.getElementById('delayName').value,
        address: document.getElementById('delayAddress').value,
        reason: document.getElementById('delayReason').value,
        timeline: document.getElementById('delayTimeline').value,
        apology: document.getElementById('delayApology').value,
        notes: document.getElementById('delayNotes').value
      };
      data.tone = document.getElementById('toneSelect').value;

    } else if (selected === 'thankYou') {
      data = {
        ...data,
        clientName: document.getElementById('thankName').value,
        address: document.getElementById('thankAddress').value,
        completedWork: document.getElementById('thankWork').value,
        review: document.getElementById('thankReview').value,
        referral: document.getElementById('thankReferral').value,
        finalNote: document.getElementById('thankNote').value
      };
      data.tone = document.getElementById('toneSelect').value;
    }

    try {
  const res = await fetch('https://mooreworks-api.onrender.com/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });


  const result = await res.json();
  let fullEmail = result.email || '';

  if (data.pdfReminder) {
    fullEmail += data.pdfReminder;
  }

  document.getElementById('emailSubject').value = result.subject || 'Survey Email';
  document.getElementById('previewBox').value = fullEmail;

} catch (err) {
  document.getElementById('previewBox').value = 'Error generating email.';
  console.error(err);
}
  });

document.getElementById('copyBtn').addEventListener('click', () => {
  const previewBox = document.getElementById('previewBox');
previewBox.focus();
previewBox.select();

try {
  document.execCommand('copy');
  const success = document.getElementById('copySuccess');
  success.style.display = 'inline';
  setTimeout(() => { success.style.display = 'none'; }, 2000);
} catch (err) {
  alert('Failed to copy text. Please copy manually.');
}
});

const selectedInit = emailType.value;
if (groups[selectedInit]) {
  groups[selectedInit].classList.add('active');
}

document.getElementById('emailBtn').addEventListener('click', () => {
  const emailBody = document.getElementById('previewBox').value.trim();
  if (!emailBody) {
    alert("Please generate an email before sending.");
    return;
  }

 const subject = document.getElementById('emailSubject').value.trim() || 'Survey Email'; 
const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

  const tempLink = document.createElement('a');
  tempLink.href = mailtoLink;
  tempLink.style.display = 'none';
  document.body.appendChild(tempLink);
  tempLink.click();
  document.body.removeChild(tempLink);
});

document.getElementById('gmailBtn').addEventListener('click', () => {
  setTimeout(() => {
    const emailBody = document.getElementById('previewBox').value.trim();
    const subject = document.getElementById('emailSubject').value.trim() || 'Survey Email';

    if (!emailBody) {
      alert("Please generate an email before sending.");
      return;
    }

    const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(gmailLink, '_blank');
  }, 100); // short delay to ensure updated value is read
});
  }

   
  