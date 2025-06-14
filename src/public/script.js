// ==============================
// Dynamic Email Form Injection
// ==============================

document.addEventListener('DOMContentLoaded', () => {
  const emailType = document.getElementById('emailType');
  const formContainer = document.getElementById('dynamicFields');

  emailType.addEventListener('change', () => {
    const selected = emailType.value;
    formContainer.innerHTML = '';
    if (selected && formTemplates[selected]) {
      formContainer.innerHTML = formTemplates[selected];
    }
  });
});

// ========== Template Strings for Each Form ==========
const formTemplates = {
  estimate: `
    <div class="form-group">
      <div class="section-title">Estimate Details</div>
      <label>Client Name:</label>
      <input type="text" id="estClient" />
      <label>Project Address:</label>
      <input type="text" id="estAddress" />
      <label>Was this discussed by phone?</label>
      <select id="estDiscussed">
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>
      <label>Type of Survey:</label>
      <select id="estSurveyType">
        <option value="">-- Select one --</option>
        <option value="Mark corners only (no plat)">Mark corners only (no plat)</option>
        <option value="Boundary survey with plat">Boundary survey with plat</option>
        <option value="ALTA/NSPS survey">ALTA/NSPS survey</option>
        <option value="Elevation certificate">Elevation certificate</option>
        <option value="Topographic/tree map">Topographic/tree map</option>
        <option value="Cut line + stake (land management)">Cut line + stake (land management)</option>
        <option value="Large acreage (>50 acres)">Large acreage (>50 acres)</option>
        <option value="Re-establish lost corners">Re-establish lost corners</option>
      </select>
      <label>Estimated Price ($):</label>
      <input type="text" id="estPrice" />
      <label>Estimated Timeline:</label>
      <input type="text" id="estTimeline" />
      <label>Additional Notes or Justification:</label>
      <textarea id="estDetails" rows="3"></textarea>
      <label for="estPdf">Attach PDF (optional reminder):</label>
      <input type="file" id="estPdf" accept=".pdf" />
    </div>
  `,
  schedule: `
    <div class="form-group">
      <div class="section-title">Scheduling Information</div>
      <label>Client Name:</label>
      <input type="text" id="schedClient" />
      <label>Project Address:</label>
      <input type="text" id="schedAddress" />
      <label>Type of Job:</label>
      <input type="text" id="schedType" />
      <label>Is the property accessible?</label>
      <select id="schedAccess">
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>
      <label>Does the client need to be present?</label>
      <select id="schedPresence">
        <option value="optional">Optional</option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>
      <label>Available Dates:</label>
      <input type="text" id="schedDates" />
      <label>Preferred Contact Method:</label>
      <input type="text" id="schedContact" />
      <label>Additional Notes:</label>
      <textarea id="schedNotes" rows="3"></textarea>
    </div>
  `,
  finalReport: `
    <div class="form-group">
      <div class="section-title">Final Deliverables</div>
      <label>Client Name:</label>
      <input type="text" id="finalName" />
      <label>Project Address:</label>
      <input type="text" id="finalAddress" />
      <label>Type of Report:</label>
      <select id="finalType">
        <option value="">-- Select One --</option>
        <option value="Plat">Plat</option>
        <option value="Elevation Certificate">Elevation Certificate</option>
        <option value="PDF/DWG File">PDF/DWG File</option>
        <option value="Map Amendment Letter">Map Amendment Letter</option>
      </select>
      <label>Delivery Method:</label>
      <select id="finalDelivery">
        <option value="Email">Email</option>
        <option value="Physical Copy">Physical Copy</option>
        <option value="Delivered to Office">Delivered to Office</option>
      </select>
      <label>Are additional documents expected later?</label>
      <select id="finalMoreDocs">
        <option value="no">No</option>
        <option value="yes">Yes</option>
      </select>
      <label>Additional Instructions or Notes:</label>
      <textarea id="finalNotes" rows="3"></textarea>
      <label for="finalPdf">Attach PDF (optional reminder):</label>
      <input type="file" id="finalPdf" accept=".pdf" />
    </div>
  `,
  infoRequest: `
    <div class="form-group">
      <div class="section-title">Missing Information Request</div>
      <label>Client Name:</label>
      <input type="text" id="infoName" />
      <label>Project Address:</label>
      <input type="text" id="infoAddress" />
      <label>Which records are needed?</label>
      <select id="infoChecklist" multiple size="6">
        <optgroup label="Tax Assessor’s Office">
          <option value="Ownership plat">Ownership plat</option>
          <option value="Parcel listing/assessment report">Parcel listing / assessment report</option>
        </optgroup>
        <optgroup label="Clerk of Court">
          <option value="Deed">Deed</option>
          <option value="Subdivision plat or previous surveys">Subdivision plat or previous surveys</option>
        </optgroup>
      </select>
      <label>Custom Message (Optional):</label>
      <textarea id="infoNotes" rows="3"></textarea>
      <label for="infoPdf">Attach PDF (optional reminder):</label>
      <input type="file" id="infoPdf" accept=".pdf" />
    </div>
  `,
  delay: `
    <div class="form-group">
      <div class="section-title">Job Delay Notice</div>
      <label>Client Name:</label>
      <input type="text" id="delayName" />
      <label>Project Address:</label>
      <input type="text" id="delayAddress" />
      <label>Reason for Delay:</label>
      <select id="delayReason">
        <option value="Weather conditions">Weather conditions</option>
        <option value="Access not granted">Access not granted</option>
        <option value="Field crew backup">Field crew backup</option>
        <option value="Equipment issues">Equipment issues</option>
        <option value="Scheduling conflict">Scheduling conflict</option>
        <option value="Prior job overrun">Prior job overrun</option>
        <option value="Office processing delay">Office processing delay</option>
      </select>
      <label>New Estimated Timeline:</label>
      <input type="text" id="delayTimeline" />
      <label>Include apology note?</label>
      <select id="delayApology">
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>
      <label>Additional Notes (Optional):</label>
      <textarea id="delayNotes" rows="3"></textarea>
    </div>
  `,
  thankYou: `
    <div class="form-group">
      <div class="section-title">Project Closeout</div>
      <label>Client Name:</label>
      <input type="text" id="thankName" />
      <label>Project Address:</label>
      <input type="text" id="thankAddress" />
      <label>What Was Completed:</label>
      <textarea id="thankWork" rows="2"></textarea>
      <label>Include Review Request?</label>
      <select id="thankReview">
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>
      <label>Include Referral Mention?</label>
      <select id="thankReferral">
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>
      <label>Final Note:</label>
      <textarea id="thankNote" rows="2"></textarea>
    </div>
  `
};
