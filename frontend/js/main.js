const API_BASE = 'https://backend-51wx.onrender.com/api';
let currentUser = null;
let authToken = localStorage.getItem('customerToken');
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function showToast(message) {
  let toast = document.getElementById('toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = 'toast';
    toast.innerHTML = `
      <div class="toast-icon"><i class="fas fa-check"></i></div>
      <div class="toast-message"></div>
    `;
    document.body.appendChild(toast);
  }
  toast.querySelector('.toast-message').textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

document.addEventListener('DOMContentLoaded', function () {
  checkAuth();
  loadProducts();
  updateCartCount();
  
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('add-to-cart')) {
      const btn = e.target;
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      const price = parseFloat(btn.dataset.price);
      const image = btn.dataset.image;
      addToCart(id, name, price, image);
    }
  });
});

function checkAuth() {
  if (authToken) {
    try {
      const storedUser = localStorage.getItem('customerUser');
      if (storedUser) {
        currentUser = JSON.parse(storedUser);
        showLoggedInState();
      }
    } catch (e) {
      console.error('Auth error:', e);
    }
  }
}

function showLoggedInState() {
  const userIcon = document.getElementById('user-icon');
  const userMenu = document.getElementById('user-menu');
  if (userIcon) userIcon.style.display = 'none';
  if (userMenu) userMenu.style.display = 'inline-block';
  
  const userIconTop = document.getElementById('user-icon-top');
  const userMenuTop = document.getElementById('user-menu-top');
  const userNameTop = document.getElementById('user-name-top');
  if (userIconTop) userIconTop.style.display = 'none';
  if (userMenuTop) {
    userMenuTop.style.display = 'inline-block';
    if (userNameTop) userNameTop.textContent = currentUser.name || currentUser.email;
  }
}

function showLoggedOutState() {
  const userIcon = document.getElementById('user-icon');
  const userMenu = document.getElementById('user-menu');
  if (userIcon) userIcon.style.display = 'inline-block';
  if (userMenu) userMenu.style.display = 'none';
  
  const userIconTop = document.getElementById('user-icon-top');
  const userMenuTop = document.getElementById('user-menu-top');
  if (userIconTop) userIconTop.style.display = 'flex';
  if (userMenuTop) userMenuTop.style.display = 'none';
}

// ==================== AUTH ====================
function openAuthModal() {
  const authModal = document.getElementById('auth-modal');
  if (!authModal) return;
  authModal.classList.add('show');
  showLogin();
}

function showLogin() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loginTab = document.getElementById('loginTab');
  const registerTab = document.getElementById('registerTab');

  const styles = getComputedStyle(document.documentElement);
  const primary = styles.getPropertyValue('--primary').trim();
  const black = styles.getPropertyValue('--black').trim();

  if (loginForm) loginForm.classList.remove('hidden');
  if (registerForm) registerForm.classList.add('hidden');
  
  if (loginTab) {
    loginTab.classList.remove('inactive');
    loginTab.style.backgroundColor = primary;
    loginTab.style.color = black;
  }
  if (registerTab) {
    registerTab.classList.add('inactive');
    registerTab.style.backgroundColor = black;
    registerTab.style.color = primary;
  }
}

function showRegister() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loginTab = document.getElementById('loginTab');
  const registerTab = document.getElementById('registerTab');

  const styles = getComputedStyle(document.documentElement);
  const primary = styles.getPropertyValue('--primary').trim();
  const black = styles.getPropertyValue('--black').trim();

  if (registerForm) registerForm.classList.remove('hidden');
  if (loginForm) loginForm.classList.add('hidden');

  if (registerTab) {
    registerTab.classList.remove('inactive');
    registerTab.style.backgroundColor = primary;
    registerTab.style.color = black;
  }
  if (loginTab) {
    loginTab.classList.add('inactive');
    loginTab.style.backgroundColor = black;
    loginTab.style.color = primary;
  }
}

function closeAuthModal() {
  const authModal = document.getElementById('auth-modal');
  if (!authModal) return;
  authModal.classList.remove('show');
}

function handleLogin() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  if (!email || !password) {
    alert('Please fill in all fields');
    return;
  }

  fetch(`${API_BASE}/auth/customer-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.token) {
      authToken = data.token;
      currentUser = data.user;
      localStorage.setItem('customerToken', authToken);
      localStorage.setItem('customerUser', JSON.stringify(currentUser));
      closeAuthModal();
      showLoggedInState();
    } else {
      alert(data.message || 'Login failed');
    }
  })
  .catch(err => {
    alert('Connection error. Please try again.');
  });
}

function handleSignup() {
  const email = document.getElementById('signup-email').value;
  const name = document.getElementById('signup-name').value;
  const phone = document.getElementById('signup-phone').value;
  const password = document.getElementById('signup-password').value;
  
  if (!email || !name || !phone || !password) {
    alert('Please fill in all fields');
    return;
  }

  fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name, phone, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.token) {
      authToken = data.token;
      currentUser = data.user;
      localStorage.setItem('customerToken', authToken);
      localStorage.setItem('customerUser', JSON.stringify(currentUser));
      closeAuthModal();
      showLoggedInState();
      alert('Account created successfully!');
    } else {
      alert(data.message || 'Registration failed');
    }
  })
  .catch(err => {
    alert('Connection error. Please try again.');
  });
}

function showForgotPassword() {
  closeAuthModal();
  const modal = document.getElementById('forgot-password-modal');
  if (modal) modal.classList.add('show');
}

function closeForgotPassword() {
  const modal = document.getElementById('forgot-password-modal');
  if (modal) modal.classList.remove('show');
  const successEl = document.getElementById('forgot-success');
  if (successEl) successEl.style.display = 'none';
}

function handleForgotPassword() {
  const email = document.getElementById('forgot-email').value;
  
  if (!email) {
    alert('Please enter your email');
    return;
  }

  fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      document.getElementById('forgot-success').style.display = 'block';
    } else {
      alert(data.message || 'Failed to send reset link');
    }
  })
  .catch(err => {
    alert('Connection error. Please try again.');
  });
}

function logout() {
  localStorage.removeItem('customerToken');
  localStorage.removeItem('customerUser');
  authToken = null;
  currentUser = null;
  showLoggedOutState();
}

function viewOrders() {
  if (!currentUser) {
    openAuthModal();
    return;
  }
  window.location.href = 'admin.html#orders';
}

// ==================== PRODUCTS ====================
async function loadProducts() {
  try {
    const response = await fetch(`${API_BASE}/products`);
    const products = await response.json();
    displayProducts(products);
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

function displayProducts(products) {
  const container = document.getElementById('products-container');
  if (!container) return;

  container.innerHTML = '';

  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    let stockStatus, stockClass;
    if (product.stock > 5) {
      stockStatus = `${product.stock} ${t('inStock')}`;
      stockClass = 'in-stock';
    } else if (product.stock > 0) {
      stockStatus = `${product.stock} ${t('lowStock')}`;
      stockClass = 'low-stock';
    } else {
      stockStatus = t('outOfStock');
      stockClass = 'out-of-stock';
    }
    const imgUrl = product.images && product.images[0] ? product.images[0] : 'images/1.jpg';
    card.innerHTML = `
      <img src="${imgUrl}" alt="${product.name}" class="product-img">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.description || 'Premium fashion item'}</p>
        <div class="price">$${product.price.toFixed(2)}</div>
        <p class="stock-info ${stockClass}">${stockStatus}</p>
        <button class="btn add-to-cart" data-id="${product._id}" data-name="${product.name}" data-price="${product.price}" data-image="${imgUrl}">
          ${t('addToCart')}
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

// ==================== CART ====================
function openCart() {
  document.getElementById('cart-modal').classList.add('show');
  displayCart();
}

function closeCart() {
  document.getElementById('cart-modal').classList.remove('show');
}

function addToCart(id, name, price, image) {
  const existingItem = cart.find(item => item.id === id);
  if (existingItem) {
    existingItem.qty++;
  } else {
    cart.push({ id, name, price, image: image || 'images/1.jpg', qty: 1 });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  showToast('Item Added To Cart Successfully');
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartCountEl = document.getElementById('cart-count');
  const mobileCartCountEl = document.getElementById('mobile-cart-count');
  if (cartCountEl) cartCountEl.textContent = count;
  if (mobileCartCountEl) mobileCartCountEl.textContent = count;
}

function displayCart() {
  const container = document.getElementById('cart-items');
  if (!container) return;
  
  if (cart.length === 0) {
    container.innerHTML = '<p>Your cart is empty</p>';
    document.getElementById('cart-total').textContent = '0.00';
    return;
  }
  
  let total = 0;
  container.innerHTML = cart.map(item => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;
    return `
      <div class="cart-item">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p>$${item.price.toFixed(2)}</p>
          <div class="cart-item-qty">
            <button onclick="changeQty('${item.id}', -1)">-</button>
            <span>${item.qty}</span>
            <button onclick="changeQty('${item.id}', 1)">+</button>
          </div>
        </div>
        <div class="cart-item-price">$${itemTotal.toFixed(2)}</div>
        <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">&times;</button>
      </div>
    `;
  }).join('');
  
  document.getElementById('cart-total').textContent = total.toFixed(2);
}

function changeQty(id, delta) {
  const item = cart.find(item => item.id === id);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) {
      removeFromCart(id);
    } else {
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartCount();
      displayCart();
    }
  }
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  displayCart();
}

function checkout() {
  if (cart.length === 0) {
    alert('Your cart is empty');
    return;
  }
  closeCart();
  alert('Payment feature coming soon! Please contact us to complete your order.');
}

function viewCartProducts() {
  window.location.href = 'cart.html';
}

function goToCheckout() {
  const authToken = localStorage.getItem('customerToken');
  if (!authToken) {
    window.location.href = 'cart-login.html';
  } else {
    checkout();
  }
}

window.onclick = function(event) {
  if (event.target.classList.contains('modal')) {
    event.target.classList.remove('show');
  }
};

// Search functionality
function performSearch() {
  const searchInput = document.getElementById('search-input');
  if (searchInput && searchInput.value.trim()) {
    window.location.href = `shop.html?search=${encodeURIComponent(searchInput.value.trim())}`;
  } else {
    window.location.href = 'shop.html';
  }
}

// Allow search on Enter key
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
  }
});

// Newsletter subscription
function subscribeNewsletter(e) {
  e.preventDefault();
  const email = e.target.querySelector('input[type="email"]').value;
  if (email) {
    alert('Thank you for subscribing!');
    e.target.reset();
  }
}

// Mobile menu toggle
function toggleMobileMenu() {
  const mobileNav = document.getElementById('mobileNav');
  if (mobileNav) {
    mobileNav.classList.toggle('active');
  }
}
