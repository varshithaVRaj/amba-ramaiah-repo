document.addEventListener('DOMContentLoaded', () => {
    const formImage = document.getElementById('formImage');
    const zoomControls = document.createElement('div');
    zoomControls.className = 'zoom-controls';

    // Create zoom and move buttons
    const buttons = [
        { text: '+', action: () => zoomImage('in') },
        { text: '-', action: () => zoomImage('out') },
        { text: '↑', action: () => moveImage(0, 10) },
        { text: '↓', action: () => moveImage(0, -10) },
        { text: '←', action: () => moveImage(10, 0) },
        { text: '→', action: () => moveImage(-10, 0) }
    ];

    buttons.forEach(({ text }) => {
        const button = document.createElement('button');
        button.innerText = text;
        zoomControls.appendChild(button);

        button.addEventListener('click', () => {
            if (text === '+') zoomImage('in');
            else if (text === '-') zoomImage('out');
            else moveImage(...getDirection(text));
        });
    });

    const imageContainer = document.querySelector('.image-container');
    imageContainer.appendChild(zoomControls);

    let scale = 1;
    let translateX = 0;
    let translateY = 0;

    function zoomImage(direction) {
        scale = direction === 'in' ? scale + 0.1 : Math.max(1, scale - 0.1);
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

    const imageButtons = {
        prev: document.getElementById('prevImage'),
        next: document.getElementById('nextImage'),
    };

    const formInputs = {
        pinCode: document.getElementById('pin-code'),
        age: document.getElementById('age'),
        yearOfBirth: document.getElementById('year-of-birth'),
        state: document.getElementById('state'),
        district: document.getElementById('district'),
        taluk: document.getElementById('taluk'),
        name: document.getElementById('name'),
        address: document.getElementById('address'),
        phoneNumber: document.getElementById('phone-number'),
        insurancePolicy: document.getElementById('insurance-policy'),
        refreshButton: document.getElementById('refreshForm'),
    };

    const form = document.getElementById('form');

    const popupMessage = document.createElement('div');
    popupMessage.className = 'popup';
    document.body.appendChild(popupMessage);

    const popupText = document.createElement('p');
    popupMessage.appendChild(popupText);

    // Fetch image filenames dynamically
    fetch('/images')
        .then(response => response.json())
        .then(images => {
            if (images.length > 0) {
                const imageFilenames = images;
                let currentIndex = 0;

                function updateImage() {
                    formImage.src = imageFilenames[currentIndex];
                }

                imageButtons.prev.addEventListener('click', () => {
                    if (currentIndex > 0) {
                        currentIndex--;
                        updateImage();
                    }
                });

                imageButtons.next.addEventListener('click', () => {
                    if (currentIndex < imageFilenames.length - 1) {
                        currentIndex++;
                        updateImage();
                    }
                });

                updateImage(); // Initial image load

                // Handle form submission
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const formData = new FormData(form);
                    const jsonData = Object.fromEntries(formData.entries());

                    fetch('/submit', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(jsonData)
                    })
                    .then(response => response.json())
                    .then(data => {
                        showPopup(data.message, "green");
                        form.reset();
                        resetFormInputs();

                        // Move to the next image after submission
                        if (currentIndex < imageFilenames.length - 1) {
                            currentIndex++;
                            updateImage();
                        }
                    })
                    .catch(error => {
                        console.error('Error submitting form:', error);
                        showPopup("Error submitting form.", "red");
                    });
                });
            } else {
                console.error('No images found in the directory.');
            }
        })
        .catch(err => console.error('Error fetching image list:', err));

    // Auto-populate location details based on pin code
    formInputs.pinCode.addEventListener('input', () => {
        const pinCode = formInputs.pinCode.value;
        if (pinCode.length === 6) {
            fetch(`/pincode/${pinCode}`)
                .then(response => response.json())
                .then(data => {
                    formInputs.state.value = data.state || '';
                    formInputs.district.value = data.district || '';
                    formInputs.taluk.value = data.taluk || '';
                })
                .catch(err => {
                    console.error('Error fetching location details:', err);
                    resetFormInputs();
                });
        } else {
            resetFormInputs();
        }
    });

    // Calculate Year of Birth based on Age
    formInputs.age.addEventListener('input', () => {
        const age = parseInt(formInputs.age.value, 10);
        formInputs.yearOfBirth.value = !isNaN(age) ? new Date().getFullYear() - age : '';
    });

    // Enforce uppercase for Name and Address fields
    [formInputs.name, formInputs.address].forEach(input => {
        input.addEventListener('input', (event) => {
            event.target.value = event.target.value.toUpperCase();
        });
    });

    // Enforce phone number format
    formInputs.phoneNumber.addEventListener('input', (event) => {
        let value = event.target.value;

        if (value === '') return;

        const rawDigits = value.replace(/[^\d+]/g, '');
        if (!rawDigits.startsWith('+91')) {
            value = rawDigits.length >= 10 ? '+91' + rawDigits.slice(-11) : '+91' + rawDigits;
        } else {
            if (rawDigits.length > 12) {
                value = rawDigits.slice(0, 13);
            }
        }

        event.target.value = value;
    });

    // Zoom functionality on double-click
    formImage.addEventListener('dblclick', () => {
        scale = scale === 1 ? 2.5 : 1; // Toggle zoom level
        updateTransform();
        formImage.style.transition = 'transform 0.3s ease';
    });

    // Dragging functionality
    let isDragging = false;
    let startX, startY;

    imageContainer.addEventListener('mousedown', (e) => {
        if (e.button === 0) { // Left mouse button
            isDragging = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            document.body.style.cursor = 'grabbing'; // Change cursor to grabbing
        }
    });

    imageContainer.addEventListener('mousemove', (e) => {
        if (isDragging) {
            e.preventDefault();
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            updateTransform();
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false; // Stop dragging when mouse button is released
        document.body.style.cursor = 'default'; // Change cursor back to default
    });

    // Change cursor style when entering the image container
    imageContainer.addEventListener('mouseenter', () => {
        if (!isDragging) {
            document.body.style.cursor = 'grab'; // Change to grab cursor
        }
    });

    imageContainer.addEventListener('mouseleave', () => {
        document.body.style.cursor = 'default'; // Change back to default cursor
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowUp':
                moveImage(0, 10);
                break;
            case 'ArrowDown':
                moveImage(0, -10);
                break;
            case 'ArrowLeft':
                moveImage(10, 0);
                break;
            case 'ArrowRight':
                moveImage(-10, 0);
                break;
        }
    });

    // Reset form functionality
    formInputs.refreshButton.addEventListener('click', () => {
        form.reset();
        resetFormInputs();
        scale = 1; 
        translateX = 0; 
        translateY = 0; 
        updateTransform();
        fetch('/images')
            .then(response => response.json())
            .then(images => {
                if (images.length > 0) {
                    const imageFilenames = images;
                    currentIndex = 0;
                    updateImage();
                }
            });
    });

    function resetFormInputs() {
        formInputs.state.value = '';
        formInputs.district.value = '';
        formInputs.taluk.value = '';
        formInputs.yearOfBirth.value = '';
    }

    function showPopup(message, color) {
        popupText.textContent = message;
        popupMessage.style.display = 'block';
        popupMessage.style.backgroundColor = color;
        popupMessage.style.color = "white";

        setTimeout(() => {
            popupMessage.style.display = 'none';
        }, 3000); // Hide after 3 seconds
    }

    function getDirection(text) {
        switch (text) {
            case '↑': return [0, 10];
            case '↓': return [0, -10];
            case '←': return [10, 0];
            case '→': return [-10, 0];
            default: return [0, 0];
        }
    }
});
