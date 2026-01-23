// Sample Job Data
let allJobs = [
    { id: 1, title: "Senior Tile Mason", cat: "Construction", price: 1100, loc: "Okhla Phase III, Delhi" },
    { id: 2, title: "Delivery Executive", cat: "Logistics", price: 850, loc: "Gurgaon Sector 44" },
    { id: 3, title: "Home Painter", cat: "Housekeeping", price: 950, loc: "Vasant Vihar, Delhi" },
    { id: 4, title: "Logo Designer", cat: "Graphic Design", price: 2000, loc: "Remote" },
    { id: 5, title: "Data Entry Operator", cat: "Data Entry", price: 600, loc: "Noida Sector 62" },
    { id: 6, title: "Electrician", cat: "Electrical", price: 1200, loc: "Hauz Khas, Delhi" }
];

let currentUser = null;

// page router
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    const links = document.querySelectorAll('.nav-link');

    pages.forEach(page => page.classList.remove('active'));
    links.forEach(link => link.classList.remove('active'));

    const selectedPage = document.getElementById(pageId + '-page');
    if (selectedPage) {
        // Auth check for profile
        if (pageId === 'profile' && !currentUser) {
            alert("Please sign in to view your profile.");
            openAuth();
            showPage('home');
            return;
        }
        selectedPage.classList.add('active');
    }

    // Nav active states
    const linkMap = {
        'home': 'link-home',
        'find-jobs': 'link-find',
        'post-job': 'link-post'
    };

    if (linkMap[pageId]) {
        document.getElementById(linkMap[pageId])?.classList.add('active');
    }

    if (pageId === 'find-jobs') renderJobs(allJobs);
    if (pageId === 'profile') updateAuthUI();

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Job Rendering
function renderJobs(jobs) {
    const jobList = document.querySelector('.job-list');
    if (!jobList) return;

    jobList.innerHTML = '';
    if (jobs.length === 0) {
        jobList.innerHTML = '<div class="glass-card" style="text-align:center; grid-column: 1/-1;">No jobs found matching your search.</div>';
        return;
    }

    jobs.forEach(job => {
        const card = document.createElement('div');
        card.className = 'job-card';
        card.innerHTML = `
            <div class="card-meta">
                <span class="tag">${getEmoji(job.cat)} ${job.cat}</span>
                <span class="price">₹${job.price}/Day</span>
            </div>
            <h3>${job.title}</h3>
            <p>📍 ${job.loc}</p>
            <div class="card-footer">
                <button class="btn btn-primary btn-full" onclick="applyJob('${job.title}')">Apply Now</button>
            </div>
        `;
        jobList.appendChild(card);
    });
}

function getEmoji(cat) {
    const emojis = {
        "Construction": "🏗️",
        "Logistics": "🚚",
        "Housekeeping": "🧹",
        "Graphic Design": "🎨",
        "Data Entry": "⌨️",
        "Electrical": "⚡",
        "Retail": "🛍️",
        "Hospitality": "🏨",
        "Plumbing": "🚰",
        "Gardening": "🌿",
        "Writing": "✍️",
        "Virtual Assistant": "🤖",
        "Video Editing": "🎬",
        "Web Developer": "💻",
        "SEO": "🔍",
        "Social Media": "📱",
        "Tutor": "🎓",
        "Car Wash": "🚿",
        "AC Repair": "❄️",
        "Security": "🛡️",
        "Tailoring": "✂️"
    };
    return emojis[cat] || "💼";
}

function filterJobs() {
    const query = document.getElementById('job-search-input').value.toLowerCase();
    const filtered = allJobs.filter(job =>
        job.cat.toLowerCase().includes(query) ||
        job.title.toLowerCase().includes(query) ||
        job.loc.toLowerCase().includes(query)
    );
    renderJobs(filtered);
}

function applyJob(title) {
    if (!currentUser) {
        alert("Please sign in to apply for this job.");
        openAuth();
        return;
    }
    // Simulation: Increment user stats when applying/doing jobs
    currentUser.jobsDone++;
    currentUser.earnings += 500; // Mock earnings
    currentUser.rating = 4.9;
    alert(`Success! Your application for "${title}" has been sent.`);
    updateAuthUI();
}

// Location Detection
async function detectLocation() {
    const locInput = document.getElementById('post-location');
    const detectBtn = document.querySelector('button[onclick="detectLocation()"]');

    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
    }

    detectBtn.innerText = "Detecting...";
    detectBtn.disabled = true;

    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
            // Using a free reverse geocoding API (OpenStreetMap Nominatim)
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            const address = data.address.suburb || data.address.city || data.display_name;
            locInput.value = address;
            detectBtn.innerText = "📍 Detect";
            detectBtn.disabled = false;
        } catch (error) {
            locInput.value = `${latitude}, ${longitude}`;
            detectBtn.innerText = "📍 Detect";
            detectBtn.disabled = false;
        }
    }, () => {
        alert("Unable to retrieve your location. Please type it manually.");
        detectBtn.innerText = "📍 Detect";
        detectBtn.disabled = false;
    });
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
    clearErrors();
}

function handleAuth(event) {
    event.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const isSignup = document.getElementById('tab-signup').classList.contains('active');
    const name = document.getElementById('auth-name').value;

    let valid = true;
    clearErrors();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('auth-email', 'Please enter a valid email address');
        valid = false;
    }

    if (isSignup) {
        if (password.length < 8) {
            showError('auth-password', 'Password must be at least 8 characters');
            valid = false;
        } else if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
            showError('auth-password', 'Password must contain uppercase and numbers');
            valid = false;
        }
    }

    if (!valid) return;

    const submitBtn = document.getElementById('auth-submit');
    submitBtn.innerText = 'Processing...';
    submitBtn.disabled = true;

    setTimeout(() => {
        currentUser = {
            email,
            name: isSignup ? name : email.split('@')[0],
            jobsDone: 12, // Initial mock data
            rating: 4.8,
            earnings: 15400,
            myGigs: []
        };
        updateAuthUI();
        closeAuth();
        submitBtn.innerText = isSignup ? 'Create Account' : 'Sign In';
        submitBtn.disabled = false;
    }, 1200);
}

function updateAuthUI() {
    const authButtons = document.getElementById('authButtons');
    if (currentUser) {
        const initial = currentUser.name[0].toUpperCase();
        authButtons.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <span style="font-weight: 600; font-size: 0.9rem; cursor:pointer;" onclick="showPage('profile')">${currentUser.name}</span>
                <div class="user-avatar" onclick="showPage('profile')" style="width: 40px; height: 40px; background: var(--primary-light); color: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; border: 2px solid var(--white); box-shadow: var(--shadow-sm); cursor:pointer;">
                    ${initial}
                </div>
                <button class="btn btn-ghost btn-sm" onclick="handleLogout()" style="padding: 5px 10px;">Logout</button>
            </div>
        `;

        // Update profile
        const profName = document.getElementById('profile-name');
        if (profName) {
            profName.innerText = currentUser.name;
            document.getElementById('profile-email').innerText = currentUser.email;
            document.getElementById('profile-initials').innerText = initial;
            document.getElementById('stats-jobs').innerText = currentUser.jobsDone;
            document.getElementById('stats-rating').innerText = currentUser.rating + "/5";
            document.getElementById('stats-earnings').innerText = "₹" + currentUser.earnings.toLocaleString();

            // Render My Posted Gigs
            const list = document.getElementById('my-gigs-list');
            if (currentUser.myGigs.length > 0) {
                list.innerHTML = currentUser.myGigs.map(g => `
                    <div style="padding:10px; background:var(--bg-main); border-radius:8px; border-left:4px solid var(--primary);">
                        <div style="font-weight:700; font-size:0.9rem;">${g.title}</div>
                        <div style="font-size:0.8rem; color:var(--slate);">${g.loc} • ₹${g.price}</div>
                    </div>
                `).join('');
            }
        }
    } else {
        authButtons.innerHTML = `
            <button class="btn btn-ghost" onclick="openAuth()">Sign In</button>
            <button class="btn btn-primary btn-sm" onclick="openAuth()">Join Now</button>
        `;
    }
}

function handleLogout() {
    currentUser = null;
    updateAuthUI();
    showPage('home');
    alert("Logged out successfully.");
}

// Form Validation Helpers
function showError(inputId, msg) {
    const input = document.getElementById(inputId);
    const errSpan = document.getElementById('err-' + inputId);
    if (input && errSpan) {
        input.parentElement.classList.add('error');
        errSpan.innerText = msg;
    }
}

function clearErrors() {
    document.querySelectorAll('.error-msg').forEach(el => el.innerText = '');
    document.querySelectorAll('.input-group').forEach(el => el.classList.remove('error'));
}

// Post Job Form Handling
document.getElementById('jobForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    clearErrors();

    if (!currentUser) {
        alert("Please sign in to post a job.");
        openAuth();
        return;
    }

    const employer = document.getElementById('post-employer').value;
    const title = document.getElementById('post-title').value;
    const wage = parseInt(document.getElementById('post-wage').value);
    const phone = document.getElementById('post-phone').value;
    const category = document.getElementById('post-category').value;
    const location = document.getElementById('post-location').value;

    let isValid = true;

    if (employer.length <= 1) {
        showError('post-employer', 'Company name must be more than one letter');
        isValid = false;
    }

    if (phone.length !== 10 || isNaN(phone)) {
        showError('post-phone', 'Contact Phone must be exactly 10 digits');
        isValid = false;
    }

    if (wage <= 0) {
        showError('post-wage', 'Daily Wage must be a positive number in Rupees');
        isValid = false;
    }

    if (!location) {
        showError('post-location', 'Please provide a location');
        isValid = false;
    }

    if (isValid) {
        const newJob = {
            id: allJobs.length + 1,
            title: title,
            cat: category,
            price: wage,
            loc: location
        };
        allJobs.unshift(newJob);
        currentUser.myGigs.push(newJob);
        alert("Listing published successfully! It is now live in 'Find Jobs'.");
        this.reset();
        showPage('find-jobs');
    }
});

window.onclick = function (event) {
    const modal = document.getElementById('authModal');
    if (event.target == modal) {
        closeAuth();
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    showPage('home');
});