// DOM Elements
const orderNowBtn = document.getElementById('orderNowBtn');
const orderNavBtn = document.getElementById('orderNavBtn');
const footerOrderBtn = document.getElementById('footerOrderBtn');
const orderModal = document.getElementById('orderModal');
const closeModalBtns = document.querySelectorAll('.close-modal');
const orderForm = document.getElementById('orderForm');
const successMessage = document.getElementById('successMessage');
const closeSuccessBtn = document.getElementById('closeSuccess');
const errorMessage = document.getElementById('errorMessage');
const closeErrorBtn = document.getElementById('closeError');
const adminToggle = document.getElementById('adminToggle');
const adminPanel = document.querySelector('.admin-content');
const viewOrdersBtn = document.getElementById('viewOrdersBtn');
const whatsappBtn = document.getElementById('whatsappBtn');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const submitOrderBtn = document.getElementById('submitOrderBtn');
const btnText = submitOrderBtn.querySelector('.btn-text');
const btnSpinner = submitOrderBtn.querySelector('.btn-spinner');
const loadingOverlay = document.getElementById('loadingOverlay');

// Color Options
const colorOptions = document.querySelectorAll('.color-option');
const selectedColorInput = document.getElementById('color');

// Image Thumbnails
const thumbnails = document.querySelectorAll('.thumbnail');
const mainProductImage = document.getElementById('mainProductImage');

// Phone number validation regex
const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;

// ====================
// GOOGLE SHEETS CONFIG
// ====================
// REPLACE WITH YOUR GOOGLE APPS SCRIPT DEPLOYMENT URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwBaJJ_1uxeBdRHGW7qSNkPZvQgF0oARpqj9F7vMuMMau7ynkNSKK9lLyrTZnbRMR80/exec';

// Toggle Mobile Menu
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Color Selection
colorOptions.forEach(option => {
    option.addEventListener('click', () => {
        // Remove active class from all options
        colorOptions.forEach(opt => opt.classList.remove('active'));
        
        // Add active class to clicked option
        option.classList.add('active');
        
        // Update color in order form
        const selectedColor = option.getAttribute('data-color');
        selectedColorInput.value = selectedColor;
        
        // Update product image based on color
        updateProductImage(selectedColor);
    });
});

// Update product image based on color
function updateProductImage(color) {
    // In a real implementation, you would have different images for each color
    // For now, we'll just update a data attribute
    mainProductImage.setAttribute('data-color', color);
}

// Thumbnail Image Selection
thumbnails.forEach(thumbnail => {
    thumbnail.addEventListener('click', () => {
        // Remove active class from all thumbnails
        thumbnails.forEach(thumb => thumb.classList.remove('active'));
        
        // Add active class to clicked thumbnail
        thumbnail.classList.add('active');
        
        // Update main image
        const newImageSrc = thumbnail.getAttribute('data-image');
        mainProductImage.src = newImageSrc;
    });
});

// Open Order Modal
function openOrderModal() {
    orderModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

orderNowBtn.addEventListener('click', openOrderModal);
orderNavBtn.addEventListener('click', openOrderModal);
footerOrderBtn.addEventListener('click', openOrderModal);

// Close Order Modal
closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        orderModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        resetForm();
    });
});

// Close modal when clicking outside
orderModal.addEventListener('click', (e) => {
    if (e.target === orderModal) {
        orderModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        resetForm();
    }
});

// Close success message
closeSuccessBtn.addEventListener('click', () => {
    successMessage.classList.remove('active');
    document.body.style.overflow = 'auto';
});

// Close error message
closeErrorBtn.addEventListener('click', () => {
    errorMessage.classList.remove('active');
    document.body.style.overflow = 'auto';
});

// Toggle Admin Panel
adminToggle.addEventListener('click', () => {
    adminPanel.classList.toggle('active');
});

// Close admin panel when clicking outside
document.addEventListener('click', (e) => {
    if (!adminToggle.contains(e.target) && !adminPanel.contains(e.target)) {
        adminPanel.classList.remove('active');
    }
});

// View Orders in Google Sheets
viewOrdersBtn.addEventListener('click', () => {
    // Open Google Sheets URL (you need to replace this with your actual sheet URL)
    const sheetsUrl = 'https://docs.google.com/spreadsheets/d/1a2b3c.../edit';
    window.open(sheetsUrl, '_blank');
    adminPanel.classList.remove('active');
});

// Form Validation and Submission
orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form values
    const fullName = document.getElementById('fullName').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const address = document.getElementById('address').value.trim();
    const productCode = document.getElementById('productCode').value;
    const color = document.getElementById('color').value;
    const quantity = document.getElementById('quantity').value;
    
    // Reset error messages
    document.getElementById('nameError').textContent = '';
    document.getElementById('phoneError').textContent = '';
    document.getElementById('addressError').textContent = '';
    
    // Validation flags
    let isValid = true;
    
    // Validate name
    if (fullName === '') {
        document.getElementById('nameError').textContent = 'Full name is required';
        isValid = false;
    }
    
    // Validate phone number
    if (phoneNumber === '') {
        document.getElementById('phoneError').textContent = 'Phone number is required';
        isValid = false;
    } else if (!phoneRegex.test(phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
        document.getElementById('phoneError').textContent = 'Please enter a valid phone number';
        isValid = false;
    }
    
    // Validate address
    if (address === '') {
        document.getElementById('addressError').textContent = 'Address is required';
        isValid = false;
    }
    
    // If form is valid, submit to Google Sheets
    if (isValid) {
        // Show loading state
        btnText.style.display = 'none';
        btnSpinner.style.display = 'inline-flex';
        submitOrderBtn.disabled = true;
        
        // Create order object
        const orderData = {
            name: fullName,
            phone: phoneNumber,
            address: address,
            productCode: productCode,
            color: color,
            quantity: quantity || 1,
            timestamp: new Date().toISOString()
        };
        
        try {
            // Submit to Google Sheets
            const response = await submitToGoogleSheets(orderData);
            
            if (response.result === 'success') {
                // Show success message with order ID
                const orderId = generateOrderId();
                document.getElementById('orderIdDisplay').textContent = `Order ID: ${orderId}`;
                
                // Close modal
                orderModal.classList.remove('active');
                
                // Show success message
                successMessage.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                // Reset form
                resetForm();
            } else {
                showError('Failed to save order. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting order:', error);
            showError('Network error. Please check your connection and try again.');
        } finally {
            // Reset button state
            btnText.style.display = 'inline';
            btnSpinner.style.display = 'none';
            submitOrderBtn.disabled = false;
        }
    }
});

// Submit data to Google Sheets
async function submitToGoogleSheets(orderData) {
    // Show loading overlay
    loadingOverlay.classList.add('active');

    console.log('Sending order data:', orderData);
    console.log('To URL:', GOOGLE_SCRIPT_URL);

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Use no-cors for Google Apps Script
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });

        // With no-cors mode, we can't read the response
        // But if we get here without an error, assume success
        console.log('Request completed successfully - assuming data was saved');
        return { result: 'success' };

    } catch (error) {
        console.error('Submission error:', error);
        console.error('Error details:', error.message);
        throw new Error('Failed to submit order. Please check your Google Apps Script deployment.');
    } finally {
        // Hide loading overlay
        loadingOverlay.classList.remove('active');
    }
}

// Alternative method using Google Forms (more reliable)
async function submitViaGoogleForms(orderData) {
    // This method uses Google Forms as a backend
    // You need to create a Google Form and get its pre-filled URL
    
    const formData = new FormData();
    formData.append('entry.123456789', orderData.name); // Replace with your field IDs
    formData.append('entry.234567890', orderData.phone);
    formData.append('entry.345678901', orderData.address);
    formData.append('entry.456789012', orderData.productCode);
    formData.append('entry.567890123', orderData.color);
    formData.append('entry.678901234', orderData.quantity);
    formData.append('entry.789012345', orderData.timestamp);
    
    const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLS.../formResponse';
    
    try {
        await fetch(formUrl, {
            method: 'POST',
            mode: 'no-cors',
            body: formData
        });
        return { result: 'success' };
    } catch (error) {
        throw error;
    }
}

// Generate a simple order ID
function generateOrderId() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `Q86-${timestamp}${random}`;
}

// Show error message
function showError(message) {
    document.getElementById('errorDetail').textContent = message;
    errorMessage.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Reset form
function resetForm() {
    orderForm.reset();
    document.getElementById('productCode').value = 'Q86-TWS-RETRO';
    document.getElementById('quantity').value = 1;
    
    // Reset error messages
    document.getElementById('nameError').textContent = '';
    document.getElementById('phoneError').textContent = '';
    document.getElementById('addressError').textContent = '';
    
    // Reset button state
    btnText.style.display = 'inline';
    btnSpinner.style.display = 'none';
    submitOrderBtn.disabled = false;
}

// WhatsApp Button
whatsappBtn.addEventListener('click', () => {
    const phoneNumber = '15551234567'; // Replace with actual WhatsApp number
    const message = 'Hello! I\'m interested in the Q86 Retro Wireless In-Ear Headset. Can you tell me more?';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Initialize form with default color
selectedColorInput.value = 'Black';
updateProductImage('Black');