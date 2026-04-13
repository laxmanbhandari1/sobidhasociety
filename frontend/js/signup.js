/* ══════════════════════════════════════════
   GreenVale Society — Signup JS
   3-step wizard with per-step validation,
   password strength meter, Google sign-in,
   and Supabase auth + profile saving.
══════════════════════════════════════════ */

var supabaseClient = window.supabase.createClient(
  'https://wqqhwfpndcmpbkhclhlc.supabase.co',
  'sb_publishable_h9NayWVGmNHCNZToonGaag_PO2Q7Bht'
)

// ── Google Sign-up ───────────────────────────────────────────
document.getElementById('google-signup-btn').addEventListener('click', async () => {
  await supabaseClient.auth.signInWithOAuth({          // ✅ was: supabase.auth
    provider: 'google',
    options: {
      redirectTo: 'http://127.0.0.1:5501/frontend/pages/index.html'
    }
  })
})

// ── State ───────────────────────────────────────────────────
let currentStep = 1;
const TOTAL_STEPS = 3;

// ── DOM refs ────────────────────────────────────────────────
const nextBtn         = document.getElementById('next-btn');
const backStepBtn     = document.getElementById('back-step-btn');
const googleSection   = document.getElementById('google-section');
const formWrap        = document.getElementById('form-wrap');
const successPanel    = document.getElementById('signup-success');
const mobileStepFill  = document.getElementById('mobile-step-fill');
const mobileStepLabel = document.getElementById('mobile-step-label');
const stepHeading     = document.getElementById('step-heading');
const stepSubheading  = document.getElementById('step-subheading');
const errorToast      = document.getElementById('error-toast');
const errorToastMsg   = document.getElementById('error-toast-message');
const googleToast     = document.getElementById('google-toast');
const googleToastTitle= document.getElementById('google-toast-title');
const googleToastMsg  = document.getElementById('google-toast-msg');

// Step meta
const stepMeta = {
  1: { heading: 'Create your account',  sub: 'Tell us a bit about yourself.',        mobileLabel: 'Step 1 of 3 — Personal Details', progress: '33%' },
  2: { heading: 'Where do you live?',   sub: 'Link your account to your apartment.', mobileLabel: 'Step 2 of 3 — Residence',         progress: '66%' },
  3: { heading: 'Secure your account',  sub: 'Choose a strong password.',            mobileLabel: 'Step 3 of 3 — Security',          progress: '99%' },
};

// ── Utilities ───────────────────────────────────────────────
let toastTimeout = null;

function showToast(toastEl, duration = 4500) {
  [errorToast, googleToast].forEach(t => t.classList.remove('show'));
  clearTimeout(toastTimeout);
  requestAnimationFrame(() => {
    toastEl.classList.add('show');
    toastTimeout = setTimeout(() => toastEl.classList.remove('show'), duration);
  });
}

function showError(toastMsg) {
  errorToastMsg.textContent = toastMsg;
  showToast(errorToast);
}

function setError(inputEl, errorEl, msg) {
  if (!inputEl || !errorEl) return;
  if (msg) {
    inputEl.classList.add('error');
    errorEl.textContent = msg;
    errorEl.classList.add('visible');
  } else {
    inputEl.classList.remove('error');
    errorEl.textContent = '';
    errorEl.classList.remove('visible');
  }
}

function clearStepErrors(stepNum) {
  document.querySelectorAll(`#step-${stepNum} .field-error`).forEach(el => {
    el.textContent = '';
    el.classList.remove('visible');
  });
  document.querySelectorAll(`#step-${stepNum} input`).forEach(el => {
    el.classList.remove('error');
  });
  if (stepNum === 3) {
    const te = document.getElementById('terms-error');
    if (te) { te.textContent = ''; te.classList.remove('visible'); }
  }
}

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

// ── Update UI for current step ───────────────────────────────
function renderStep(step) {
  document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
  document.getElementById(`step-${step}`).classList.add('active');

  document.querySelectorAll('.signup-step').forEach((el, i) => {
    const n = i + 1;
    el.classList.remove('active', 'done');
    if (n < step)   el.classList.add('done');
    if (n === step) el.classList.add('active');
  });

  document.querySelectorAll('.step-connector').forEach((el, i) => {
    el.classList.toggle('filled', i + 1 < step);
  });

  mobileStepFill.style.width  = stepMeta[step].progress;
  mobileStepLabel.textContent = stepMeta[step].mobileLabel;
  stepHeading.textContent     = stepMeta[step].heading;
  stepSubheading.textContent  = stepMeta[step].sub;

  googleSection.style.display = step === 1 ? '' : 'none';
  backStepBtn.style.display   = step > 1 ? 'flex' : 'none';

  const btnText = nextBtn.querySelector('.btn-text');
  btnText.textContent = step < TOTAL_STEPS ? 'Continue' : 'Create Account';
}

// ── Validation per step ──────────────────────────────────────
function validateStep(step) {
  clearStepErrors(step);
  let valid = true;

  const err = (inputId, errorId, msg) => {
    const input = document.getElementById(inputId);
    const errEl = document.getElementById(errorId);
    setError(input, errEl, msg);
    valid = false;
  };

  if (step === 1) {
    const fn = document.getElementById('signup-firstname').value.trim();
    const ln = document.getElementById('signup-lastname').value.trim();
    const em = document.getElementById('signup-email').value.trim();
    const ph = document.getElementById('signup-phone').value.trim();

    if (!fn)                    err('signup-firstname', 'firstname-error', 'First name is required.');
    if (!ln)                    err('signup-lastname',  'lastname-error',  'Last name is required.');
    if (!em)                    err('signup-email',     'email-error',     'Email address is required.');
    else if (!isValidEmail(em)) err('signup-email',     'email-error',     'Please enter a valid email.');
    if (!ph)                    err('signup-phone',     'phone-error',     'Phone number is required.');
  }

  if (step === 2) {
    const flat = document.getElementById('signup-flat').value.trim();
    if (!flat) err('signup-flat', 'flat-error', 'Flat/apartment number is required.');
  }

  if (step === 3) {
    const pwd    = document.getElementById('signup-password').value;
    const conf   = document.getElementById('signup-confirm').value;
    const terms  = document.getElementById('signup-terms');
    const termsErr = document.getElementById('terms-error');

    if (!pwd || pwd.length < 8) err('signup-password', 'password-error', 'Password must be at least 8 characters.');
    if (!conf)                  err('signup-confirm',  'confirm-error',  'Please confirm your password.');
    else if (conf !== pwd)      err('signup-confirm',  'confirm-error',  'Passwords do not match.');
    if (!terms.checked) {
      termsErr.textContent = 'You must agree to the terms to continue.';
      termsErr.classList.add('visible');
      valid = false;
    }
  }

  return valid;
}

// ── Step navigation ──────────────────────────────────────────
nextBtn.addEventListener('click', async () => {
  if (!validateStep(currentStep)) return;

  if (currentStep < TOTAL_STEPS) {
    currentStep++;
    renderStep(currentStep);
    return;
  }

  // Final step — submit
  nextBtn.classList.add('loading');
  nextBtn.disabled = true;
  backStepBtn.disabled = true;

  await registerUser();
});

backStepBtn.addEventListener('click', () => {
  if (currentStep > 1) {
    currentStep--;
    renderStep(currentStep);
  }
});

// ── Real Supabase register ────────────────────────────────────
async function registerUser() {
  const firstName  = document.getElementById('signup-firstname').value.trim();
  const lastName   = document.getElementById('signup-lastname').value.trim();
  const email      = document.getElementById('signup-email').value.trim();
  const phone      = document.getElementById('signup-phone').value.trim();
  const flat       = document.getElementById('signup-flat').value.trim();
  const block      = document.getElementById('signup-block').value.trim();
  const password   = document.getElementById('signup-password').value;

  // 1. Create auth account
  const { data, error } = await supabaseClient.auth.signUp({ email, password })

  if (error) {
    nextBtn.classList.remove('loading');
    nextBtn.disabled = false;
    backStepBtn.disabled = false;

    // Handle common errors with friendly messages
    if (error.message.includes('already registered')) {
      showError('This email is already registered. Try signing in instead.');
    } else {
      showError(error.message || 'Something went wrong. Please try again.');
    }
    return;
  }

  // 2. Save profile details
  const { error: profileError } = await supabaseClient
    .from('profiles')
    .insert({
      id:          data.user.id,
      full_name:   `${firstName} ${lastName}`,
      phone:       phone,
      flat_number: flat,
      block:       block || null,
    })

  if (profileError) {
    console.error('Profile save error:', profileError.message);
    // Auth account was created, profile failed — non-blocking, still show success
  }

  // 3. Show success
  nextBtn.classList.remove('loading');
  nextBtn.disabled = false;
  backStepBtn.disabled = false;

  formWrap.style.display = 'none';
  successPanel.querySelector('#success-name-msg').textContent =
    `Welcome, ${firstName}! Your account is ready.`;
  successPanel.classList.add('show');
}

// ── Password strength meter ───────────────────────────────────
const pwdInput      = document.getElementById('signup-password');
const strengthBar   = document.getElementById('strength-bar');
const strengthLabel = document.getElementById('strength-label');

const levels = [
  { width: '0%',   color: '#e0ddd8', text: 'Enter a password', labelColor: '#b8b2aa' },
  { width: '25%',  color: '#d94f4f', text: 'Weak',             labelColor: '#d94f4f' },
  { width: '50%',  color: '#f6a623', text: 'Fair',             labelColor: '#c47d00' },
  { width: '75%',  color: '#68d391', text: 'Good',             labelColor: '#2e7d5a' },
  { width: '100%', color: '#38a169', text: 'Strong',           labelColor: '#276749' },
];

pwdInput.addEventListener('input', () => {
  const v = pwdInput.value;
  let score = 0;
  if (v.length >= 8)           score++;
  if (/[A-Z]/.test(v))        score++;
  if (/[0-9]/.test(v))        score++;
  if (/[^A-Za-z0-9]/.test(v)) score++;

  const level = v.length === 0 ? levels[0] : (levels[score] || levels[1]);
  strengthBar.style.width      = level.width;
  strengthBar.style.background = level.color;
  strengthLabel.textContent    = v.length === 0 ? 'Enter a password' : level.text;
  strengthLabel.style.color    = level.labelColor;

  if (document.getElementById('password-error').classList.contains('visible')) {
    setError(pwdInput, document.getElementById('password-error'), '');
  }
});

// ── Password toggles ─────────────────────────────────────────
function makeToggle(btnId, inputId, iconId) {
  const btn   = document.getElementById(btnId);
  const input = document.getElementById(inputId);
  const icon  = document.getElementById(iconId);
  if (!btn) return;

  btn.addEventListener('click', () => {
    const hidden = input.type === 'password';
    input.type   = hidden ? 'text' : 'password';
    btn.setAttribute('aria-label', hidden ? 'Hide password' : 'Show password');
    icon.innerHTML = hidden
      ? `<path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" stroke="currentColor" stroke-width="1.3"/>
         <line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>`
      : `<ellipse cx="8" cy="8" rx="6" ry="4" stroke="currentColor" stroke-width="1.3"/>
         <circle cx="8" cy="8" r="1.8" fill="currentColor"/>`;
  });
}

makeToggle('toggle-pwd1', 'signup-password', 'eye-icon-1');
makeToggle('toggle-pwd2', 'signup-confirm',  'eye-icon-2');

// ── Live clear errors on input ────────────────────────────────
['signup-firstname','signup-lastname','signup-email','signup-phone',
 'signup-flat','signup-confirm'].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  const errEl = document.getElementById(id.replace('signup-', '') + '-error')
             || document.getElementById(id + '-error');
  if (!errEl) return;
  el.addEventListener('input', () => {
    if (errEl.classList.contains('visible')) setError(el, errEl, '');
  });
});