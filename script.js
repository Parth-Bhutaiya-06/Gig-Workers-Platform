// ===== Authentication System =====
const authOverlay = document.getElementById('authOverlay');
const authClose = document.getElementById('authClose');
const authTabs = document.querySelectorAll('.auth-tab');
const authForms = document.querySelectorAll('.auth-form');
const signinForm = document.getElementById('signinForm');
const signupForm = document.getElementById('signupForm');
const authSuccess = document.getElementById('authSuccess');
const successClose = document.getElementById('successClose');
const signInButtons = document.querySelectorAll('.btn-secondary');
const getStartedButtons = document.querySelectorAll('.btn-primary, .btn-hero-primary');

// Open auth modal
function openAuthModal(tab = 'signin') {
    authOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    switchAuthTab(tab);
}

// Close auth modal
function closeAuthModal() {
    authOverlay.classList.remove('active');
    document.body.style.overflow = '';
    authSuccess.classList.remove('active');
    authForms.forEach(form => form.classList.remove('active'));
    document.getElementById('signinForm').classList.add('active');
}

// Switch between tabs
function switchAuthTab(tab) {
    authTabs.forEach(t => {
        t.classList.remove('active');
        if (t.dataset.tab === tab) {
            t.classList.add('active');
        }
    });

    authForms.forEach(form => {
        form.classList.remove('active');
        if (form.id === `${tab}Form`) {
            form.classList.add('active');
        }
    });
}

// Event listeners for opening modal
signInButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        openAuthModal('signin');
    });
});

getStartedButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        openAuthModal('signup');
    });
});

// Close modal events
authClose.addEventListener('click', closeAuthModal);
authOverlay.addEventListener('click', (e) => {
    if (e.target === authOverlay) {
        closeAuthModal();
    }
});

// Tab switching
authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        switchAuthTab(tab.dataset.tab);
    });
});

// Switch to signup/signin links
document.querySelectorAll('.switch-to-signup').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthTab('signup');
    });
});

document.querySelectorAll('.switch-to-signin').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthTab('signin');
    });
});

// Password toggle
document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const input = document.getElementById(targetId);

        if (input.type === 'password') {
            input.type = 'text';
            btn.textContent = '🙈';
        } else {
            input.type = 'password';
            btn.textContent = '👁️';
        }
    });
});

// User type selection
document.querySelectorAll('.user-type-option').forEach(option => {
    option.addEventListener('click', () => {
        document.querySelectorAll('.user-type-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        option.classList.add('selected');
        document.getElementById('userType').value = option.dataset.type;
    });
});

// Sign In Form Submit
signinForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(signinForm);
    const email = formData.get('email') || signinForm.querySelector('input[type="text"]').value;
    const password = formData.get('password') || document.getElementById('signinPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // Simulate authentication
    console.log('Signing in...', { email, password, rememberMe });

    // Store user session
    const user = {
        email: email,
        name: email.split('@')[0],
        type: 'worker',
        loggedIn: true,
        timestamp: new Date().toISOString()
    };

    localStorage.setItem('kaamsetu-user', JSON.stringify(user));

    // Show success and update UI
    setTimeout(() => {
        updateUserUI(user);
        closeAuthModal();
        showNotification('Welcome back! You have successfully signed in.', 'success');
    }, 500);
});

// Sign Up Form Submit
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const userType = document.getElementById('userType').value;

    if (!userType) {
        showNotification('Please select whether you are a Worker or Employer', 'error');
        return;
    }

    const formData = new FormData(signupForm);
    const name = signupForm.querySelector('input[type="text"]').value;
    const email = signupForm.querySelector('input[type="email"]').value;
    const phone = signupForm.querySelector('input[type="tel"]').value;
    const password = document.getElementById('signupPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;

    if (!agreeTerms) {
        showNotification('Please agree to the Terms & Conditions', 'error');
        return;
    }

    // Simulate registration
    console.log('Creating account...', { name, email, phone, password, userType });

    // Store user session
    const user = {
        name: name,
        email: email,
        phone: phone,
        type: userType,
        loggedIn: true,
        timestamp: new Date().toISOString()
    };

    localStorage.setItem('kaamsetu-user', JSON.stringify(user));

    // Show success message
    authForms.forEach(form => form.classList.remove('active'));
    authSuccess.classList.add('active');
});

// Success close button
successClose.addEventListener('click', () => {
    const user = JSON.parse(localStorage.getItem('kaamsetu-user'));
    updateUserUI(user);
    closeAuthModal();
    showNotification(`Welcome to KaamSetu, ${user.name}!`, 'success');
});

// Update UI when user is logged in
function updateUserUI(user) {
    // Update profile section
    const profileName = document.querySelector('.profile-name');
    const profileEmail = document.querySelector('.profile-email');

    if (profileName) profileName.textContent = user.name;
    if (profileEmail) profileEmail.textContent = user.email;

    // Hide sign in/get started buttons, show profile
    signInButtons.forEach(btn => btn.style.display = 'none');
    document.querySelector('.profile-dropdown').style.display = 'block';
}

// Check if user is already logged in
function checkUserSession() {
    const user = JSON.parse(localStorage.getItem('kaamsetu-user'));
    if (user && user.loggedIn) {
        updateUserUI(user);
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        z-index: 10001;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification animations to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize on page load
checkUserSession();


const themeBtn = document.getElementById('themeBtn');
const themeDropdown = document.getElementById('themeDropdown');
const themeOptions = document.querySelectorAll('.theme-option');
const themeIcon = document.getElementById('themeIcon');

// Load saved theme
const savedTheme = localStorage.getItem('kaamsetu-theme') || 'default';
applyTheme(savedTheme);

// Toggle theme dropdown
if (themeBtn) {
    themeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        themeDropdown.classList.toggle('active');
        profileMenu.classList.remove('active');
    });
}

// Theme selection
themeOptions.forEach(option => {
    option.addEventListener('click', () => {
        const theme = option.dataset.theme;
        applyTheme(theme);
        localStorage.setItem('kaamsetu-theme', theme);
        themeDropdown.classList.remove('active');
    });
});

function applyTheme(theme) {
    // Remove all theme classes
    document.body.classList.remove('dark-theme', 'construction-theme', 'healthcare-theme', 'delivery-theme', 'creative-theme');

    // Apply selected theme
    if (theme !== 'default') {
        document.body.classList.add(`${theme}-theme`);
    }

    // Update active state
    themeOptions.forEach(opt => {
        opt.classList.remove('active');
        if (opt.dataset.theme === theme) {
            opt.classList.add('active');
        }
    });

    // Update icon
    const icons = {
        'default': '💻',
        'construction': '🔨',
        'healthcare': '⚕️',
        'delivery': '🚚',
        'creative': '🎨',
        'dark': '🌙'
    };
    themeIcon.textContent = icons[theme] || '🎨';
}

// ===== Profile Dropdown =====
const profileBtn = document.getElementById('profileBtn');
const profileMenu = document.getElementById('profileMenu');

if (profileBtn) {
    profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        profileMenu.classList.toggle('active');
        themeDropdown.classList.remove('active');
    });
}

// Close dropdowns when clicking outside
document.addEventListener('click', () => {
    themeDropdown.classList.remove('active');
    profileMenu.classList.remove('active');
});

// ===== Smooth Scrolling =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== Active Navigation =====
const sections = document.querySelectorAll('section, article');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ===== Form Submission =====
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);

        if (!data.fullName || !data.email || !data.message) {
            alert('Please fill in all required fields');
            return;
        }

        alert('Thank you for your message! We will get back to you soon.');
        this.reset();
    });
}

// ===== Video Player =====
const videoContainer = document.querySelector('.video-container');
const video = document.querySelector('.demo-video');
const playButton = document.querySelector('.play-button');

if (playButton && video) {
    playButton.addEventListener('click', () => {
        video.play();
        document.querySelector('.video-overlay').style.display = 'none';
    });

    video.addEventListener('pause', () => {
        document.querySelector('.video-overlay').style.display = 'flex';
    });
}

// ===== Scroll Animations =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.problem-card, .feature-card, .timeline-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
});

// ===== Header Scroll Effect =====
const header = document.querySelector('.main-header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
    } else {
        header.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    }

    lastScroll = currentScroll;
});

console.log('KaamSetu - Platform Loaded Successfully!');
