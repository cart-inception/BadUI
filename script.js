// State management
let puzzleProgress = 0;
let firstnameClickCount = 0;
let phoneNumber = '';
let currentPhoneDigit = 0;

// Elements
const captchaScreen = document.getElementById('captcha-screen');
const loginScreen = document.getElementById('login-screen');
const submitBtn = document.getElementById('submit-btn');
const puzzleSlider = document.getElementById('puzzle-slider');
const puzzlePiece = document.getElementById('puzzle-piece');
const verifyBtn = document.getElementById('verify-btn');

const firstnameInput = document.getElementById('firstname');
const lastnameInput = document.getElementById('lastname');
const phoneInput = document.getElementById('phone');

const firstnameCheck = document.getElementById('firstname-check');
const lastnameCheck = document.getElementById('lastname-check');
const phoneCheck = document.getElementById('phone-check');

const permissionModal = document.getElementById('permission-modal');
const permissionText = document.getElementById('permission-text');
const permissionAllow = document.getElementById('permission-allow');
const permissionDeny = document.getElementById('permission-deny');

const calendarModal = document.getElementById('calendar-modal');
const calendarTitle = document.getElementById('calendar-title');
const calendarGrid = document.getElementById('calendar-grid');

const loginForm = document.getElementById('login-form');
const liquifiedMessage = document.getElementById('liquified-message');

// Puzzle CAPTCHA - only moves 5% per full slider swipe
let lastSliderValue = 0;
puzzleSlider.addEventListener('input', (e) => {
    const currentValue = parseInt(e.target.value);
    const delta = Math.abs(currentValue - lastSliderValue);

    // Only update if slider moved significantly
    if (delta > 10) {
        // Move puzzle piece only 5% of the slider movement
        puzzleProgress += delta * 0.05;
        puzzleProgress = Math.min(100, puzzleProgress);

        // Update puzzle piece position
        const maxMove = 300; // pixels to move from left to right
        const moveDistance = (puzzleProgress / 100) * maxMove;
        puzzlePiece.style.left = (20 + moveDistance) + 'px';

        lastSliderValue = currentValue;

        // Check if puzzle piece actually overlaps with slot (needs 80% to ensure overlap)
        if (puzzleProgress >= 80) {
            verifyBtn.disabled = false;
        }
    }
});

// Reset slider to confuse user
puzzleSlider.addEventListener('change', () => {
    setTimeout(() => {
        puzzleSlider.value = 50;
        lastSliderValue = 50;
    }, 100);
});

// Verify button
verifyBtn.addEventListener('click', () => {
    captchaScreen.classList.remove('active');
    loginScreen.classList.add('active');
});

// First name - trigger permissions on first 3 clicks
const permissionMessages = [
    'This site would like to access your location',
    'This site would like to access your microphone',
    'This site would like to access your photos'
];

firstnameInput.addEventListener('focus', () => {
    if (firstnameClickCount < 3) {
        firstnameInput.blur();
        showPermissionModal(permissionMessages[firstnameClickCount]);
        firstnameClickCount++;
    }
});

function showPermissionModal(message) {
    permissionText.textContent = message;
    permissionModal.classList.add('show');
}

permissionAllow.addEventListener('click', () => {
    permissionModal.classList.remove('show');
});

permissionDeny.addEventListener('click', () => {
    permissionModal.classList.remove('show');
});

// First name validation - minimum 7 characters
firstnameInput.addEventListener('input', () => {
    if (firstnameInput.value.length >= 7) {
        firstnameCheck.classList.add('visible');
        firstnameInput.style.borderColor = '#00ff00';
    } else {
        firstnameCheck.classList.remove('visible');
        firstnameInput.style.borderColor = '#000';
    }
    checkFormValidity();
});

// Show firstname error when user tries to move to lastname
lastnameInput.addEventListener('focus', () => {
    const firstnameError = document.getElementById('firstname-error');
    if (firstnameInput.value.length < 7) {
        firstnameError.classList.add('show');
    } else {
        firstnameError.classList.remove('show');
    }
});

// Last name validation - cannot contain G or g
lastnameInput.addEventListener('input', () => {
    const value = lastnameInput.value;
    if (value.length > 0 && !value.toLowerCase().includes('g')) {
        lastnameCheck.classList.add('visible');
        lastnameInput.style.borderColor = '#00ff00';
    } else {
        lastnameCheck.classList.remove('visible');
        lastnameInput.style.borderColor = '#000';
    }
    checkFormValidity();
});

// Phone number - calendar picker for each digit (30 days shown, only 1-9 usable)
phoneInput.addEventListener('click', () => {
    // Show lastname error when user tries to move to phone
    const lastnameError = document.getElementById('lastname-error');
    const value = lastnameInput.value;
    if (value.length === 0 || value.toLowerCase().includes('g')) {
        lastnameError.classList.add('show');
    } else {
        lastnameError.classList.remove('show');
    }

    if (currentPhoneDigit < 10) {
        showCalendarPicker();
    }
});

function showCalendarPicker() {
    calendarTitle.textContent = `Select Digit ${currentPhoneDigit + 1} of 10`;
    calendarGrid.innerHTML = '';

    // Create 30 days (even though only 1-9 are usable)
    for (let i = 1; i <= 30; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day';
        day.textContent = i;
        day.addEventListener('click', () => {
            if (i <= 9) {
                // Only days 1-9 can be used as phone digits
                phoneNumber += i.toString();
                currentPhoneDigit++;
                phoneInput.value = formatPhoneNumber(phoneNumber);
                calendarModal.classList.remove('show');

                if (currentPhoneDigit === 10) {
                    phoneCheck.classList.add('visible');
                    phoneInput.style.borderColor = '#00ff00';
                    checkFormValidity();
                }
            } else {
                // Days 10-30 do nothing but are clickable
                // Add a little shake animation to confuse
                day.style.animation = 'shake 0.3s';
                setTimeout(() => {
                    day.style.animation = '';
                }, 300);
            }
        });
        calendarGrid.appendChild(day);
    }

    calendarModal.classList.add('show');
}

function formatPhoneNumber(num) {
    if (num.length <= 3) return num;
    if (num.length <= 6) return `(${num.slice(0, 3)}) ${num.slice(3)}`;
    return `(${num.slice(0, 3)}) ${num.slice(3, 6)}-${num.slice(6)}`;
}

// Check if all fields are valid and enable/disable submit button
function checkFormValidity() {
    const firstnameValid = firstnameInput.value.length >= 7;
    const lastnameValid = lastnameInput.value.length > 0 && !lastnameInput.value.toLowerCase().includes('g');
    const phoneValid = currentPhoneDigit === 10;

    if (firstnameValid && lastnameValid && phoneValid) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
    } else {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.4';
    }
}

// Initialize submit button as disabled
submitBtn.disabled = true;
submitBtn.style.opacity = '0.4';

// Add shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Form submission - liquify everything
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Check if all fields are valid
    const firstnameValid = firstnameInput.value.length >= 7;
    const lastnameValid = lastnameInput.value.length > 0 && !lastnameInput.value.toLowerCase().includes('g');
    const phoneValid = currentPhoneDigit === 10;

    if (firstnameValid && lastnameValid && phoneValid) {
        // Liquify the login screen
        loginScreen.classList.add('liquify');

        // Show liquified message after delay
        setTimeout(() => {
            loginScreen.style.display = 'none';
            liquifiedMessage.classList.remove('hidden');
        }, 1000);
    }
});

// Prevent modal background scroll on mobile
permissionModal.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });

calendarModal.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });
