const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", function(event) {
        event.preventDefault(); 
        let formIsValid = true;

        const passwordInput = document.getElementById("password");
        const passwordError = document.getElementById("password-error");
        const emailInput = document.getElementById("email");
        const emailError = document.getElementById("email-error");

        if (!passwordInput.value.trim()) {
            showError(passwordInput, passwordError);
            formIsValid = false;
        } else {
            hideError(passwordInput, passwordError);
        }

        if (!emailInput.value.trim()) {
            showError(emailInput, emailError);
            formIsValid = false;
        } else {
            hideError(emailInput, emailError);
        }

        if (formIsValid) {
            this.submit();
        }
    });
}

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
