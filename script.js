// page router
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    const links = document.querySelectorAll('.nav-link');

    pages.forEach(page => page.classList.remove('active'));
    links.forEach(link => link.classList.remove('active'));

    const selectedPage = document.getElementById(pageId + '-page');
    if (selectedPage) {
        selectedPage.classList.add('active');
    }

    if (pageId === 'home') document.getElementById('link-home').classList.add('active');
    if (pageId === 'find-jobs') document.getElementById('link-find').classList.add('active');
    if (pageId === 'post-job') document.getElementById('link-post').classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// authentication modals
function openAuth() {
    document.getElementById('authModal').classList.add('active');
    document.body.style.overflow = 'hidden'; 
}

function closeAuth() {
    document.getElementById('authModal').classList.remove('active');
    document.body.style.overflow = 'auto'; 
}

function switchAuth(mode) {
    const signupFields = document.getElementById('signup-fields');
    const submitBtn = document.getElementById('auth-submit');
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');

    if (mode === 'signup') {
        signupFields.style.display = 'block';
        submitBtn.innerText = 'Create Account';
        tabSignup.classList.add('active');
        tabLogin.classList.remove('active');
    } else {
        signupFields.style.display = 'none';
        submitBtn.innerText = 'Sign In';
        tabLogin.classList.add('active');
        tabSignup.classList.remove('active');
    }
}

function handleAuth(event) {
    event.preventDefault();
    const email = document.getElementById('auth-email').value;
    const submitBtn = document.getElementById('auth-submit');

    const originalText = submitBtn.innerText;
    submitBtn.innerText = 'Processing...';
    submitBtn.disabled = true;

    setTimeout(() => {
        alert(`Welcome back, ${email}! You have successfully signed in.`);
        closeAuth();

        document.getElementById('authButtons').innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <span style="font-weight: 600; font-size: 0.9rem;">${email.split('@')[0]}</span>
                <div style="width: 40px; height: 40px; background: var(--primary-light); color: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; border: 2px solid var(--white); box-shadow: var(--shadow-sm);">
                    ${email[0].toUpperCase()}
                </div>
            </div>
        `;
    }, 1500);
}

window.onclick = function (event) {
    const modal = document.getElementById('authModal');
    if (event.target == modal) {
        closeAuth();
    }
}