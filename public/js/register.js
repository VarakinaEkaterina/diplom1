document.getElementById("dataForm").addEventListener("submit", function(event) {
    event.preventDefault(); 
    let formIsValid = true;

    const passwordInput = document.getElementById("password");
    const passwordError = document.getElementById("password-error");
    const emailInput = document.getElementById("email");
    const emailError = document.getElementById("email-error");
    const nameInput = document.getElementById("name");
    const nameError = document.getElementById("name-error");
    const confirm_passwordInput = document.getElementById("confirm_password");
    const confirm_passwordError = document.getElementById("confirm_password-error");
    const ageInput = document.getElementById("age");
    const ageError = document.getElementById("age-error");
    const agreeInput = document.getElementById("agree");
    const agreeError = document.getElementById("agree-error");

    if (!nameInput.value.trim()) {
        showError(nameInput, nameError);
        formIsValid = false;
    } else {
        hideError(nameInput, nameError);
    }

    if (!emailInput.value.trim() || !validateEmail(emailInput.value)) {
        showError(emailInput, emailError);
        formIsValid = false;
    } else {
        hideError(emailInput, emailError);
    }

    if (!passwordInput.value.trim() || passwordInput.value.length < 6) {
        showError(passwordInput, passwordError);
        formIsValid = false;
    } else {
        hideError(passwordInput, passwordError);
    }

    if (passwordInput.value.trim() !== confirm_passwordInput.value.trim()) {
        showError(confirm_passwordInput, confirm_passwordError);
        formIsValid = false;
    } else {
        hideError(confirm_passwordInput, confirm_passwordError);
    }

    if (!ageInput.value.trim() || ageInput.value < 14) {
        showError(ageInput, ageError);
        formIsValid = false;
    } else {
        hideError(ageInput, ageError);
    }

    if (!agreeInput.checked) {
        showError(agreeInput, agreeError);
        formIsValid = false;
    } else {
        hideError(agreeInput, agreeError);
    }

    if (formIsValid) {
        this.submit();
    }
});

function showError(inputElement, errorElement) {
    inputElement.classList.add("invalid", "animate__animated", "animate__shakeX");
    errorElement.style.display = "block";
}

function hideError(inputElement, errorElement) {
    inputElement.classList.remove("invalid", "animate__animated", "animate__shakeX");
    errorElement.style.display = "none";
}

document.querySelectorAll(".input-field").forEach(function(input) {
    input.addEventListener("input", function() {
        this.classList.remove("invalid", "animate__animated", "animate__shakeX");
        const errorDiv = document.getElementById(this.id + "-error");
        if (errorDiv) {
            errorDiv.style.display = "none";
        }
    });
});

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
