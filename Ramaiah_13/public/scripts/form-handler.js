document.addEventListener('DOMContentLoaded', () => {
    const formImage = document.getElementById('formImage');
    const zoomControls = document.createElement('div');
    zoomControls.className = 'zoom-controls';

    const zoomInButton = document.createElement('button');
    zoomInButton.innerText = '+';
    zoomInButton.onclick = () => {
        zoomImage('in');
    };
    zoomControls.appendChild(zoomInButton);

    const zoomOutButton = document.createElement('button');
    zoomOutButton.innerText = '-';
    zoomOutButton.onclick = () => {
        zoomImage('out');
    };
    zoomControls.appendChild(zoomOutButton);

    const moveUpButton = document.createElement('button');
    moveUpButton.innerText = '↑';
    moveUpButton.onclick = () => {
        moveImage(0, -10);
    };
    zoomControls.appendChild(moveUpButton);

    const moveDownButton = document.createElement('button');
    moveDownButton.innerText = '↓';
    moveDownButton.onclick = () => {
        moveImage(0, 10);
    };
    zoomControls.appendChild(moveDownButton);

    const moveLeftButton = document.createElement('button');
    moveLeftButton.innerText = '←';
    moveLeftButton.onclick = () => {
        moveImage(-10, 0);
    };
    zoomControls.appendChild(moveLeftButton);

    const moveRightButton = document.createElement('button');
    moveRightButton.innerText = '→';
    moveRightButton.onclick = () => {
        moveImage(10, 0);
    };
    zoomControls.appendChild(moveRightButton);

    document.querySelector('.image-container').appendChild(zoomControls);

    let scale = 1;
    let translateX = 0;
    let translateY = 0;

    function zoomImage(direction) {
        if (direction === 'in') {
            scale += 0.1;
        } else if (direction === 'out') {
            scale = Math.max(1, scale - 0.1);
        }
        updateTransform();
    }

    function moveImage(dx, dy) {
        translateX += dx;
        translateY += dy;
        updateTransform();
    }

    function updateTransform() {
        formImage.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
    }

    // Existing image carousel and other functionalities
    const prevButton = document.getElementById('prevImage');
    const nextButton = document.getElementById('nextImage');
    const pinCodeInput = document.getElementById('pin-code');
    const ageInput = document.getElementById('age');
    const yearOfBirthInput = document.getElementById('year-of-birth');
    const stateInput = document.getElementById('state');
    const districtInput = document.getElementById('district');
    const talukInput = document.getElementById('taluk');
    const nameInput = document.getElementById('name');
    const addressInput = document.getElementById('address');
    const refreshButton = document.getElementById('refreshForm');

    // List of image filenames
    const imageFilenames = [
        '/images/image1.jpg',
        '/images/image2.jpg',
        '/images/image3.jpg',
        '/images/image4.jpg',
        '/images/image5.jpg',
        '/images/image6.jpg',
        '/images/image7.jpg',
        '/images/image8.jpg',
        '/images/image9.jpg',
        '/images/image10.jpg',
        '/images/image11.jpg',
        '/images/image12.jpg',
        '/images/image13.jpg'
    ];

    let currentIndex = 0;

    // Update the image source
    function updateImage() {
        formImage.src = imageFilenames[currentIndex];
    }

    // Event listener for the Previous button
    prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateImage();
        }
    });

    // Event listener for the Next button
    nextButton.addEventListener('click', () => {
        if (currentIndex < imageFilenames.length - 1) {
            currentIndex++;
            updateImage();
        }
    });

    // Initial image load
    updateImage();

    // Function to auto-populate state, district, and taluk based on pin code
    pinCodeInput.addEventListener('input', () => {
        const pinCode = pinCodeInput.value;
        if (pinCode.length === 6) {  // Assuming valid pin code has 6 digits
            fetch(`/pincode/${pinCode}`)
                .then(response => response.json())
                .then(data => {
                    if (data.state && data.district && data.taluk) {
                        stateInput.value = data.state;
                        districtInput.value = data.district;
                        talukInput.value = data.taluk;
                    } else {
                        stateInput.value = '';
                        districtInput.value = '';
                        talukInput.value = '';
                    }
                })
                .catch(err => {
                    console.error('Error fetching location details:', err);
                    stateInput.value = '';
                    districtInput.value = '';
                    talukInput.value = '';
                });
        } else {
            stateInput.value = '';
            districtInput.value = '';
            talukInput.value = '';
        }
    });

    // Calculate Year of Birth based on Age
    ageInput.addEventListener('input', () => {
        const age = parseInt(ageInput.value, 10);
        if (!isNaN(age)) {
            const currentYear = new Date().getFullYear();
            yearOfBirthInput.value = currentYear - age;
        } else {
            yearOfBirthInput.value = '';
        }
    });

    // Enforce uppercase for Name and Address fields
    function enforceUppercase(event) {
        const input = event.target;
        input.value = input.value.toUpperCase();
    }

    nameInput.addEventListener('input', enforceUppercase);
    addressInput.addEventListener('input', enforceUppercase);

    // Function to handle form reset
    refreshButton.addEventListener('click', () => {
        document.getElementById('form').reset();
        stateInput.value = '';
        districtInput.value = '';
        talukInput.value = '';
        yearOfBirthInput.value = '';
        currentIndex = 0;
        updateImage();
    });
});
