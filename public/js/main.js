document.getElementById("mainForm").addEventListener("submit", function(event) {
    event.preventDefault(); 
    let formIsValid = true;

    const carouselTitle1 = document.getElementById("carouselTitle1");
    const carouselTitle2 = document.getElementById("carouselTitle2");
    const carouselTitle3 = document.getElementById("carouselTitle3");
    const carouselSubtitle1 = document.getElementById("carouselSubtitle1");
    const carouselSubtitle2 = document.getElementById("carouselSubtitle2");
    const carouselSubtitle3 = document.getElementById("carouselSubtitle3");
    const carouselTitle1Error = document.getElementById("carouselTitle1-error");
    const carouselTitle2Error = document.getElementById("carouselTitle2-error");
    const carouselTitle3Error = document.getElementById("carouselTitle3-error");
    const carouselSubtitle1Error = document.getElementById("carouselSubtitle1-error");
    const carouselSubtitle2Error = document.getElementById("carouselSubtitle2-error");
    const carouselSubtitle3Error = document.getElementById("carouselSubtitle3-error");

    if (!carouselTitle1.value) {
        showError(carouselTitle1, carouselTitle1Error);
        formIsValid = false;
    } else {
        hideError(carouselTitle1, carouselTitle1Error);
    }

    if (!carouselTitle2.value) {
        showError(carouselTitle2, carouselTitle2Error);
        formIsValid = false;
    } else {
        hideError(carouselTitle2, carouselTitle2Error);
    }

    if (!carouselTitle3.value) {
        showError(carouselTitle3, carouselTitle3Error);
        formIsValid = false;
    } else {
        hideError(carouselTitle3, carouselTitle3Error);
    }

    if (!carouselSubtitle1.value) {
        showError(carouselSubtitle1, carouselSubtitle1Error);
        formIsValid = false;
    } else {
        hideError(carouselSubtitle1, carouselSubtitle1Error);
    }

    if (!carouselSubtitle2.value) {
        showError(carouselSubtitle2, carouselSubtitle2Error);
        formIsValid = false;
    } else {
        hideError(carouselSubtitle2, carouselSubtitle2Error);
    }

    if (!carouselSubtitle3.value) {
        showError(carouselSubtitle3, carouselSubtitle3Error);
        formIsValid = false;
    } else {
        hideError(carouselSubtitle3, carouselSubtitle3Error);
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

document.querySelectorAll(".input-field, #attraction").forEach(function(input) {
    input.addEventListener("input", function() {
        this.classList.remove("invalid", "animate__animated", "animate__shakeX");
        const errorDiv = document.getElementById(this.id + "-error");
        if (errorDiv) {
            errorDiv.style.display = "none";
        }
    });
});



let selectedFiles1 = [];

document.getElementById('carouselPhoto1').addEventListener('change', function() {
    selectedFiles1 = Array.from(this.files);
    updateFileList1();
});

function updateFileList1() {
    var fileListContainer = document.getElementById('file-list1');
    fileListContainer.innerHTML = '';

    selectedFiles1.forEach((file, index) => {
        var fileItem = document.createElement('div');
        var fileName = file.name.split('\\').pop().split('/').pop();
        fileItem.innerText = fileName;

        fileListContainer.appendChild(fileItem);
    });
}

let selectedFiles2 = [];

document.getElementById('carouselPhoto2').addEventListener('change', function() {
    selectedFiles2 = Array.from(this.files);
    updateFileList2();
});

function updateFileList2() {
    var fileListContainer = document.getElementById('file-list2');
    fileListContainer.innerHTML = '';

    selectedFiles2.forEach((file, index) => {
        var fileItem = document.createElement('div');
        var fileName = file.name.split('\\').pop().split('/').pop();
        fileItem.innerText = fileName;

        fileListContainer.appendChild(fileItem);
    });
}

let selectedFiles3 = [];

document.getElementById('carouselPhoto3').addEventListener('change', function() {
    selectedFiles3 = Array.from(this.files);
    updateFileList3();
});

function updateFileList3() {
    var fileListContainer = document.getElementById('file-list3');
    fileListContainer.innerHTML = '';

    selectedFiles3.forEach((file, index) => {
        var fileItem = document.createElement('div');
        var fileName = file.name.split('\\').pop().split('/').pop();
        fileItem.innerText = fileName;

        fileListContainer.appendChild(fileItem);
    });
}