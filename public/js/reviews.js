document.getElementById("reviewsAttractionForm").addEventListener("submit", function(event) {
    event.preventDefault(); 
    let formIsValid = true;

    const attractionSelect = document.getElementById("attraction");
    const attractionError = document.getElementById("attraction-error");
    const messageTextArea = document.getElementById("message");
    const messageError = document.getElementById("message-error");
    const ratingRadios = document.querySelectorAll('input[name="reviewsAttractionForm[rating]"]');
    const ratingError = document.getElementById("rating-error");

    let ratingSelected = false;
    ratingRadios.forEach(radio => {
        if (radio.checked) {
            ratingSelected = true;
        }
    });

    if (!attractionSelect.value) {
        showError(attractionSelect, attractionError);
        formIsValid = false;
    } else {
        hideError(attractionSelect, attractionError);
    }

    if (!ratingSelected) {
        showError(ratingRadios[0], ratingError);
        formIsValid = false;
    } else {
        hideError(ratingRadios[0], ratingError);
    }

    if (!messageTextArea.value.trim()) {
        showError(messageTextArea, messageError);
        formIsValid = false;
    } else {
        hideError(messageTextArea, messageError);
    }

    if (formIsValid) {
        const formData = new FormData();

        formData.append('reviewsAttractionForm[attraction]', attractionSelect.value);
        formData.append('reviewsAttractionForm[message]', messageTextArea.value);
        ratingRadios.forEach(radio => {
            if (radio.checked) {
                formData.append('reviewsAttractionForm[rating]', radio.value);
            }
        });

        selectedFiles.forEach(file => {
            formData.append('photos', file);
        });

        fetch(this.action, {
            method: 'POST',
            body: formData
        }).then(response => {
            if (response.ok) {
                window.location.href = '/profile';
            } else {
                alert('Ошибка при отправке формы. Попробуйте еще раз.');
            }
        }).catch(error => {
            console.error('Ошибка:', error);
            alert('Ошибка при отправке формы. Попробуйте еще раз.');
        });
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

document.querySelectorAll(".input-field, #attraction").forEach(function(input) {
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
    const newFiles = Array.from(this.files);
    if (selectedFiles.length + newFiles.length > 5) {
        document.getElementById('photo-error').style.display = 'block';
        return;
    } else {
        document.getElementById('photo-error').style.display = 'none';
    }
    selectedFiles = selectedFiles.concat(newFiles);
    updateFileList();
});

function updateFileList() {
    var fileListContainer = document.getElementById('file-list');
    fileListContainer.innerHTML = '';

    selectedFiles.forEach((file, index) => {
        var fileItem = document.createElement('div');
        fileItem.innerText = file.name;

        var deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
        deleteButton.onclick = function() {
            selectedFiles.splice(index, 1);
            updateFileList(); 
        };

        fileItem.appendChild(deleteButton);
        fileListContainer.appendChild(fileItem);
    });
}
