function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

document
    .getElementById("feedbackForm")
    .addEventListener("submit", function(event) {
        event.preventDefault(); 
        let formIsValid = true;

        const nameInput = document.getElementById("name");
        const emailInput = document.getElementById("email");
        const messageTextArea = document.getElementById("message");
        const nameError = document.getElementById("name-error");
        const emailError = document.getElementById("email-error");
        const messageError = document.getElementById("message-error");

        if (!nameInput.value.trim()) {
            nameInput.classList.add(
                "invalid",
                "animate__animated",
                "animate__shakeX"
            );
            nameError.style.display = "block";
            formIsValid = false;
        } else {
            nameInput.classList.remove(
                "invalid",
                "animate__animated",
                "animate__shakeX"
            );
            nameError.style.display = "none";
        }

        if (!validateEmail(emailInput.value.trim())) {
            emailInput.classList.add(
                "invalid",
                "animate__animated",
                "animate__shakeX"
            );
            emailError.style.display = "block";
            formIsValid = false;
        } else {
            emailInput.classList.remove(
                "invalid",
                "animate__animated",
                "animate__shakeX"
            );
            emailError.style.display = "none";
        }

        if (!messageTextArea.value.trim()) {
            messageTextArea.classList.add(
                "invalid",
                "animate__animated",
                "animate__shakeX"
            );
            messageError.style.display = "block";
            formIsValid = false;
        } else {
            messageTextArea.classList.remove(
                "invalid",
                "animate__animated",
                "animate__shakeX"
            );
            messageError.style.display = "none";
        }

        if (formIsValid) {
            this.submit(); 
        }
    });

document.querySelectorAll(".input-field").forEach(function(input) {
    input.addEventListener("input", function() {
        this.classList.remove(
            "invalid",
            "animate__animated",
            "animate__shakeX"
        );
        const errorDiv = document.getElementById(this.id + "-error");
        if (errorDiv) {
            errorDiv.style.display = "none";
        }
    });
});