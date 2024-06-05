document.getElementById("newLandmarksForm").addEventListener("submit", function(event) {
    event.preventDefault(); 
    let formIsValid = true;

    const nameInput = document.getElementById("name");
    const nameError = document.getElementById("name-error");
    const typeSelect = document.getElementById("type");
    const typeError = document.getElementById("type-error");
    const descriptionInput = document.getElementById("description");
    const descriptionError = document.getElementById("description-error");
    const descriptionFullInput = document.getElementById("descriptionFull");
    const descriptionFullError = document.getElementById("descriptionFull-error");
    const photoInput = document.getElementById("photo");
    const photoError = document.getElementById("photo-error");

    if (!nameInput.value.trim()) {
        showError(nameInput, nameError);
        formIsValid = false;
    } else {
        hideError(nameInput, nameError);
    }

    if (!descriptionInput.value.trim()) {
        showError(descriptionInput, descriptionError);
        formIsValid = false;
    } else {
        hideError(descriptionInput, descriptionError);
    }

    if (!descriptionFullInput.value.trim()) {
        showError(descriptionFullInput, descriptionFullError);
        formIsValid = false;
    } else {
        hideError(descriptionFullInput, descriptionFullError);
    }

    if (!typeSelect.value) {
        showError(typeSelect, typeError);
        formIsValid = false;
    } else {
        hideError(typeSelect, typeError);
    }

    if (selectedFiles.length === 0) {
        showError(photoInput, photoError);
        formIsValid = false;
    } else {
        hideError(photoInput, photoError);
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

document.querySelectorAll(".input-field, #type").forEach(function(input) {
    input.addEventListener("input", function() {
        this.classList.remove("invalid", "animate__animated", "animate__shakeX");
        const errorDiv = document.getElementById(this.id + "-error");
        if (errorDiv) {
            errorDiv.style.display = "none";
        }
    });
});



let selectedFiles = [];

document.getElementById('photo').addEventListener('change', function() {
    selectedFiles = Array.from(this.files);
    updateFileList();
});

function updateFileList() {
    var fileListContainer = document.getElementById('file-list');
    fileListContainer.innerHTML = '';

    selectedFiles.forEach((file, index) => {
        var fileItem = document.createElement('div');
        var fileName = file.name.split('\\').pop().split('/').pop();
        fileItem.innerText = fileName;

        fileListContainer.appendChild(fileItem);
    });
}