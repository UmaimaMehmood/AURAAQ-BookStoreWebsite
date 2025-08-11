document.addEventListener('DOMContentLoaded', function () {
  // ==== Scroll-triggered animation for "BUSINESS?" underline ====
  const highlightWord = document.querySelector('.highlight');

  if (highlightWord) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          highlightWord.classList.remove('animate'); // reset
          void highlightWord.offsetWidth;            // trigger reflow
          highlightWord.classList.add('animate');    // re-add to replay
        }
      });
    }, { threshold: 0.6 });

    observer.observe(highlightWord);
  }

  // ==== Flipbook Animation ====
  const pages = document.getElementsByClassName('page');

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    if (i % 2 === 0) {
      page.style.zIndex = (pages.length - i);
    }
  }

  for (let i = 0; i < pages.length; i++) {
    pages[i].pageNum = i + 1;
    pages[i].onclick = function () {
      if (this.pageNum % 2 === 0) {
        this.classList.remove('flipped');
        this.previousElementSibling.classList.remove('flipped');
      } else {
        this.classList.add('flipped');
        this.nextElementSibling.classList.add('flipped');
      }
    };
  }

  // ==== Typing Animation ====
  const words = [
    "blank pages to plotted plans",
    "stories to dreams",
    "ink to intention",
    "novels to new beginnings"
  ];
  let currentWord = 0;
  let currentChar = 0;
  let isDeleting = false;

  const taglineEl = document.querySelector(".dynamic-tagline");
  const typingSpeed = 100;
  const backspaceSpeed = 50;
  const pauseTime = 1200;

  function type() {
    const word = words[currentWord];
    if (isDeleting) {
      taglineEl.textContent = word.substring(0, currentChar--);
    } else {
      taglineEl.textContent = word.substring(0, currentChar++);
    }

    if (!isDeleting && currentChar === word.length + 1) {
      isDeleting = true;
      setTimeout(type, pauseTime);
    } else if (isDeleting && currentChar === 0) {
      isDeleting = false;
      currentWord = (currentWord + 1) % words.length;
      setTimeout(type, 300);
    } else {
      setTimeout(type, isDeleting ? backspaceSpeed : typingSpeed);
    }
  }

  if (taglineEl) {
    type();
  }

  // ==== Modal Logic ====
  const loginIcon = document.getElementById('loginIcon');
  const authModal = document.getElementById('authModal');
  const closeModalBtn = document.getElementById('closeModal');
  const showSignup = document.getElementById('showSignup');
  const showLogin = document.getElementById('showLogin');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  if (loginIcon && authModal) {
    loginIcon.addEventListener('click', function (e) {
      e.preventDefault();
      authModal.style.display = 'block';
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', function () {
      authModal.style.display = 'none';
    });
  }

  window.addEventListener('click', function (e) {
    if (e.target === authModal) {
      authModal.style.display = 'none';
    }
  });

  if (showSignup && signupForm && loginForm) {
    showSignup.addEventListener('click', function (e) {
      e.preventDefault();
      loginForm.style.display = 'none';
      signupForm.style.display = 'block';
    });
  }

  if (showLogin && signupForm && loginForm) {
    showLogin.addEventListener('click', function (e) {
      e.preventDefault();
      signupForm.style.display = 'none';
      loginForm.style.display = 'block';
    });
  }

  // ==== Password Validation ====
  function validatePassword(password) {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    if (password.length < minLength) errors.push(`At least ${minLength} characters`);
    if (!hasUppercase) errors.push('One uppercase letter');
    if (!hasLowercase) errors.push('One lowercase letter');
    if (!hasNumbers) errors.push('One number');
    if (!hasSpecialChar) errors.push('One special character');

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  function showPasswordError(elementId, errors) {
    const errorElement = document.getElementById(elementId);
    if (errors.length > 0) {
      errorElement.innerHTML = `
        <div style="color: #e74c3c; font-size: 12px; margin-top: 5px;">
          <strong>Password must include:</strong><br>
          ${errors.map(error => `• ${error}`).join('<br>')}
        </div>
      `;
      errorElement.style.display = 'block';
    } else {
      errorElement.style.display = 'none';
    }
  }

  const signupPasswordInput = document.getElementById('signupPassword');
  if (signupPasswordInput) {
    signupPasswordInput.addEventListener('input', function () {
      const validation = validatePassword(this.value);
      showPasswordError('signupPasswordError', validation.errors);
    });
  }

  // ==== Login Form Handler ====
  loginForm?.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = this.querySelector('input[type="email"]').value;
    const password = this.querySelector('input[type="password"]').value;

    if (!email || !password) {
      showError('Please fill in all fields');
      return;
    }

    handleLogin(email, password);
  });

  // ==== Signup Form Handler ====
  signupForm?.addEventListener('submit', function(e) {
    e.preventDefault();
    const fullName = this.querySelector('input[placeholder="Full Name"]').value;
    const email = this.querySelector('input[type="email"]').value;
    const password = this.querySelector('input[placeholder="Password"]').value;
    const confirmPassword = this.querySelector('input[placeholder="Confirm Password"]').value;

    if (!fullName || !email || !password || !confirmPassword) {
      showError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      showError('Password must be at least 6 characters long');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError('Please enter a valid email address');
      return;
    }

    const userData = { name: fullName, email, password };
    handleSignup(userData);
  });

  // ==== Modal Utility Functions ====
  window.openLoginModal = function () {
    document.getElementById('loginModal')?.classList.add('active');
  };

  window.openSignupModal = function () {
    document.getElementById('signupModal')?.classList.add('active');
  };

  window.closeModal = function () {
    document.getElementById('loginModal')?.classList.remove('active');
    document.getElementById('signupModal')?.classList.remove('active');
  };

  window.switchToSignup = function () {
    document.getElementById('loginModal')?.classList.remove('active');
    document.getElementById('signupModal')?.classList.add('active');
  };

  window.switchToLogin = function () {
    document.getElementById('signupModal')?.classList.remove('active');
    document.getElementById('loginModal')?.classList.add('active');
  };

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
});

// ==== Utility Functions ====
function showLoading(buttonElement) {
  buttonElement.disabled = true;
  buttonElement.textContent = 'Loading...';
}

function hideLoading(buttonElement, originalText) {
  buttonElement.disabled = false;
  buttonElement.textContent = originalText;
}

function showError(message) {
  alert(message);
}

function showSuccess(message) {
  alert(message);
}

async function handleLogin(email, password) {
  try {
    showLoading(document.querySelector('.login-btn'));

    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      showSuccess('Login successful!');
      closeModal();
    } else {
      showError(data.message || 'Login failed');
    }
  } catch (error) {
    showError('Network error. Please try again.');
  } finally {
    hideLoading(document.querySelector('.login-btn'), 'Login');
  }
}

async function handleSignup(userData) {
  try {
    showLoading(document.querySelector('.submit-btn'));

    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (response.ok) {
      showSuccess('Account created successfully! Please login.');
      switchToLogin();
    } else {
      showError(data.message || 'Registration failed');
    }
  } catch (error) {
    showError('Network error. Please try again.');
  } finally {
    hideLoading(document.querySelector('.submit-btn'), 'Sign Up');
  }
}