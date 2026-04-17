/* ══════════════════════════════════════════
   GreenVale Society — Login JS
   Handles: form validation, password toggle,
            Google Sign-In, toast notifications
══════════════════════════════════════════ */

var supabaseClient = window.supabase.createClient(
    'https://wqqhwfpndcmpbkhclhlc.supabase.co',
   'sb_publishable_h9NayWVGmNHCNZToonGaag_PO2Q7Bht'
  )


  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('google-signin-btn').addEventListener('click', async () => {
      await supabaseClient.auth.signInWithOAuth({  
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/frontend/pages/index.html'
        }
      })
    })
  })

 

// ── DOM refs ────────────────────────────────────────────────
const loginForm       = document.getElementById('login-form');
const emailInput      = document.getElementById('login-email');
const passwordInput   = document.getElementById('login-password');
const emailError      = document.getElementById('login-email-error');
const passwordError   = document.getElementById('login-password-error');
const togglePwdBtn    = document.getElementById('toggle-pwd');
const submitBtn       = document.getElementById('submit-btn');
const successToast    = document.getElementById('success-toast');
const errorToast      = document.getElementById('error-toast');
const toastMessage    = document.getElementById('toast-message');
const errorToastMsg   = document.getElementById('error-toast-message');

// ── Utility: show/hide toast ─────────────────────────────────
let toastTimeout = null;

function showToast(toastEl, duration = 4500) {
  // Hide any open toast first
  [successToast, errorToast].forEach(t => t.classList.remove('show'));
  clearTimeout(toastTimeout);

  requestAnimationFrame(() => {
    toastEl.classList.add('show');
    toastTimeout = setTimeout(() => toastEl.classList.remove('show'), duration);
  });
}

// ── Utility: field validation display ───────────────────────
function setError(inputEl, errorEl, msg) {
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

function clearErrors() {
  setError(emailInput, emailError, '');
  setError(passwordInput, passwordError, '');
}

// ── Utility: email regex ─────────────────────────────────────
function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

// ── Live validation: clear error on input ────────────────────
emailInput.addEventListener('input', () => {
  if (emailError.classList.contains('visible')) setError(emailInput, emailError, '');
});

passwordInput.addEventListener('input', () => {
  if (passwordError.classList.contains('visible')) setError(passwordInput, passwordError, '');
});

// ── Password toggle ──────────────────────────────────────────
togglePwdBtn.addEventListener('click', () => {
  const isHidden = passwordInput.type === 'password';
  passwordInput.type = isHidden ? 'text' : 'password';

  // swap icon: open eye vs. closed eye
  const icon = document.getElementById('eye-icon');
  if (isHidden) {
    icon.innerHTML = `
      <path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" stroke="currentColor" stroke-width="1.3"/>
      <line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>`;
  } else {
    icon.innerHTML = `
      <ellipse cx="8" cy="8" rx="6" ry="4" stroke="currentColor" stroke-width="1.3"/>
      <circle cx="8" cy="8" r="1.8" fill="currentColor"/>`;
  }
  togglePwdBtn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
  
    const emailVal = emailInput.value.trim();
    const passwordVal = passwordInput.value;
  
    let valid = true;
  
    if (!emailVal) {
      setError(emailInput, emailError, 'Please enter your email address.');
      valid = false;
    } else if (!isValidEmail(emailVal)) {
      setError(emailInput, emailError, 'Please enter a valid email address.');
      valid = false;
    }
  
    if (!passwordVal) {
      setError(passwordInput, passwordError, 'Please enter your password.');
      valid = false;
    } else if (passwordVal.length < 6) {
      setError(passwordInput, passwordError, 'Password must be at least 6 characters.');
      valid = false;
    }
  
    if (!valid) return;
  
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
  
    await loginUser(emailVal, passwordVal);
  });
 



  async function loginUser(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({  // ← was supabase
      email,
      password
    })
  
    if (error) {
      errorToastMsg.textContent = error.message
      showToast(errorToast)
      submitBtn.classList.remove('loading')
      submitBtn.disabled = false
      return
    }
  
    window.location.href = 'index.html'
  }

  
// ── Keyboard shortcut: Enter key on email → focus password ──
emailInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      passwordInput.focus();
    }
});

