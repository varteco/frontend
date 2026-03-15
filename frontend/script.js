const API_BASE = 'https://backend-51wx.onrender.com/api';
let cart = [];
let currentUser = null;
let authToken = localStorage.getItem('customerToken');
let orderTotal = 0;
let paymentMethod = 'credit_card';

document.addEventListener('DOMContentLoaded', function() {
    // Load cart from localStorage
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    checkAuth();
    loadCart();
});

function checkAuth() {
    if (authToken) {
        try {
            const storedUser = localStorage.getItem('customerUser');
            if (storedUser) {
                currentUser = JSON.parse(storedUser);
                // Pre-fill shipping info if user is logged in
                const nameInput = document.getElementById('shippingName');
                const emailInput = document.getElementById('shippingEmail');
                const phoneInput = document.getElementById('shippingPhone');
                if (nameInput && currentUser.name) nameInput.value = currentUser.name;
                if (emailInput && currentUser.email) emailInput.value = currentUser.email;
                if (phoneInput && currentUser.phone) phoneInput.value = currentUser.phone;
            }
        } catch (e) {
            console.error('Auth error:', e);
        }
    }
}

function loadCart() {
    const container = document.getElementById('cart-items-container');
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    const grandTotalEl = document.getElementById('grand-total');
    const proceedBtn = document.querySelector('#step-cart .btn-primary');
    
    console.log('Cart items:', cart);
    
    if (!cart || cart.length === 0) {
        if (container) {
            container.innerHTML = '<p class="empty-cart">Your cart is empty. <a href="shop.html">Continue shopping</a></p>';
        }
        if (subtotalEl) subtotalEl.textContent = '$0.00';
        if (totalEl) totalEl.textContent = '$0.00';
        if (grandTotalEl) grandTotalEl.textContent = '$0.00';
        if (proceedBtn) proceedBtn.disabled = true;
        orderTotal = 0;
        return;
    }

    let subtotal = 0;
    let cartHtml = '';
    
    cart.forEach(item => {
        const itemTotal = (item.price || 0) * (item.qty || 1);
        subtotal += itemTotal;
        cartHtml += `
            <div class="cart-item-row">
                <div class="cart-item-details">
                    <span class="item-name">${item.name || 'Product'}</span>
                    <span class="item-qty">Qty: ${item.qty || 1} x $${(item.price || 0).toFixed(2)}</span>
                </div>
                <span class="item-price">$${itemTotal.toFixed(2)}</span>
            </div>
        `;
    });

    if (container) {
        container.innerHTML = cartHtml;
    }

    orderTotal = subtotal;
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (grandTotalEl) grandTotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (proceedBtn) proceedBtn.disabled = false;
}

function goToAuth() {
    if (!cart || cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    nextStep('step-auth');
}

function nextStep(stepId) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.getElementById(stepId).classList.add('active');
}

function showLogin() {
    const authModal = document.getElementById('auth-modal');
    if (authModal) {
        authModal.classList.add('show');
    }
}

function closeAuthModal() {
    const authModal = document.getElementById('auth-modal');
    if (authModal) {
        authModal.classList.remove('show');
    }
}

// Login form handler
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorEl = document.getElementById('login-error');
        
        try {
            const response = await fetch(`${API_BASE}/auth/customer-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                authToken = data.token;
                currentUser = data.user;
                localStorage.setItem('customerToken', authToken);
                localStorage.setItem('customerUser', JSON.stringify(currentUser));
                closeAuthModal();
                // Pre-fill shipping info
                document.getElementById('shippingName').value = currentUser.name || '';
                document.getElementById('shippingEmail').value = currentUser.email || '';
                document.getElementById('shippingPhone').value = currentUser.phone || '';
                nextStep('step-shipping');
            } else {
                if (errorEl) errorEl.textContent = data.message || 'Login failed';
            }
        } catch (error) {
            if (errorEl) errorEl.textContent = 'Connection error. Please try again.';
        }
    });
}

function showRegister() {
    closeAuthModal();
    const registerModal = document.getElementById('register-modal');
    if (registerModal) {
        registerModal.classList.add('show');
    }
}

function closeRegisterModal() {
    const registerModal = document.getElementById('register-modal');
    if (registerModal) {
        registerModal.classList.remove('show');
    }
}

// Register form handler
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const phone = document.getElementById('register-phone').value;
        const password = document.getElementById('register-password').value;
        const errorEl = document.getElementById('register-error');
        
        try {
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                authToken = data.token;
                currentUser = data.user;
                localStorage.setItem('customerToken', authToken);
                localStorage.setItem('customerUser', JSON.stringify(currentUser));
                closeRegisterModal();
                // Pre-fill shipping info
                document.getElementById('shippingName').value = currentUser.name || '';
                document.getElementById('shippingEmail').value = currentUser.email || '';
                document.getElementById('shippingPhone').value = currentUser.phone || '';
                nextStep('step-shipping');
            } else {
                if (errorEl) errorEl.textContent = data.message || 'Registration failed';
            }
        } catch (error) {
            if (errorEl) errorEl.textContent = 'Connection error. Please try again.';
        }
    });
}

function fastPay(method) {
    paymentMethod = method;
    const summaryContent = document.getElementById('summary-content');
    const shippingName = document.getElementById('shippingName').value || 'Guest';
    const shippingEmail = document.getElementById('shippingEmail').value || 'Not provided';
    const shippingAddress = document.getElementById('shippingAddress').value || 'Not provided';
    
    summaryContent.innerHTML = `
        <p><strong>Shipping to:</strong> ${shippingName}</p>
        <p><strong>Email:</strong> ${shippingEmail}</p>
        <p><strong>Address:</strong> ${shippingAddress}</p>
        <p><strong>Payment Method:</strong> ${method}</p>
        <p><strong>Shipping:</strong> Free</p>
    `;
    document.getElementById('grand-total').textContent = `$${orderTotal.toFixed(2)}`;
    nextStep('step-summary');
}

function processCardPayment() {
    const name = document.getElementById('cardName').value;
    const numberInput = document.getElementById('cardNumber').value;
    
    if (!name || numberInput.length < 4) {
        alert("Please fill in your card details!");
        return;
    }

    paymentMethod = 'credit_card';
    const lastFour = numberInput.replace(/\s/g, '').slice(-4);
    const summaryContent = document.getElementById('summary-content');
    const shippingName = document.getElementById('shippingName').value || 'Guest';
    const shippingEmail = document.getElementById('shippingEmail').value || 'Not provided';
    const shippingAddress = document.getElementById('shippingAddress').value || 'Not provided';
    
    summaryContent.innerHTML = `
        <p><strong>Shipping to:</strong> ${shippingName}</p>
        <p><strong>Email:</strong> ${shippingEmail}</p>
        <p><strong>Address:</strong> ${shippingAddress}</p>
        <p><strong>Payment Method:</strong> Card ending in **** ${lastFour}</p>
        <p><strong>Cardholder:</strong> ${name}</p>
        <p><strong>Shipping:</strong> Free</p>
    `;
    document.getElementById('grand-total').textContent = `$${orderTotal.toFixed(2)}`;
    nextStep('step-summary');
}

async function finishOrder() {
    if (!cart || cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const shippingName = document.getElementById('shippingName').value;
    const shippingEmail = document.getElementById('shippingEmail').value;
    const shippingPhone = document.getElementById('shippingPhone').value;
    const shippingAddress = document.getElementById('shippingAddress').value;
    const shippingCity = document.getElementById('shippingCity').value;
    const shippingState = document.getElementById('shippingState').value;
    const shippingZip = document.getElementById('shippingZip').value;

    if (!shippingName || !shippingEmail || !shippingAddress) {
        alert('Please fill in shipping information!');
        return;
    }

    const orderData = {
        customer: {
            name: shippingName,
            email: shippingEmail,
            phone: shippingPhone,
            address: `${shippingAddress}, ${shippingCity}, ${shippingState} ${shippingZip}`
        },
        items: cart.map(item => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.qty
        })),
        paymentMethod: paymentMethod,
        total: orderTotal
    };

    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        const response = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            alert('Order placed successfully!');
            // Clear cart
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            window.location.href = 'shop.html';
        } else {
            const error = await response.json();
            alert(error.message || 'Error placing order');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error placing order. Please try again.');
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('show');
    }
};
