const cartStorageKey = 'puntofit-cart';
let cart = [];

function saveCart() {
    localStorage.setItem(cartStorageKey, JSON.stringify(cart));
}

function loadCart() {
    try {
        const saved = localStorage.getItem(cartStorageKey);
        cart = saved ? JSON.parse(saved) : [];
    } catch {
        cart = [];
    }
}

function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    if (!sidebar || !overlay) return;

    sidebar.classList.toggle('translate-x-full');
    overlay.classList.toggle('hidden');
}

async function addToCart(id) {
    let product;
    try {
        const products = await loadProducts();
        product = products.find(p => p.id === id);
    } catch {
        alert('No se pudo agregar el producto. Revisá tu conexión e intentá de nuevo.');
        return;
    }
    if (!product) return;

    const inCart = cart.find(item => item.id === id);

    if (inCart) {
        inCart.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartUI();

    const cartBtn = document.querySelector('.fa-shopping-cart');
    if (cartBtn) {
        cartBtn.classList.add('animate-bounce');
        setTimeout(() => cartBtn.classList.remove('animate-bounce'), 500);
    }
}

function updateCartUI() {
    const container = document.getElementById('cart-items');
    const countLabel = document.getElementById('cart-count');
    const totalLabel = document.getElementById('cart-total');

    if (!container || !countLabel || !totalLabel) return;

    countLabel.innerText = cart.reduce((acc, curr) => acc + curr.quantity, 0);

    if (cart.length === 0) {
        container.innerHTML = '<p class="text-gray-500 italic text-center py-10">Tu carrito está vacío.</p>';
        totalLabel.innerText = "$0.00";
        return;
    }

    let html = '';
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        html += `
            <div class="flex items-center space-x-4 bg-gray-50 p-3 rounded-xl">
                <img src="${item.img}" class="w-16 h-16 object-cover rounded-lg" alt="${item.name}">
                <div class="flex-1">
                    <h4 class="font-bold text-gray-800 truncate">${item.name}</h4>
                    <p class="text-puntofit-red font-black">$${(item.price * item.quantity).toFixed(2)}</p>
                    <div class="flex items-center space-x-3 mt-1">
                        <button onclick="changeQty(${index}, -1)" class="text-gray-500 hover:text-puntofit-red"><i class="fas fa-minus-circle"></i></button>
                        <span class="font-bold text-sm">${item.quantity}</span>
                        <button onclick="changeQty(${index}, 1)" class="text-gray-500 hover:text-puntofit-red"><i class="fas fa-plus-circle"></i></button>
                    </div>
                </div>
                <button onclick="removeItem(${index})" class="text-gray-300 hover:text-red-600 transition">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
    });

    container.innerHTML = html;
    totalLabel.innerText = `$${total.toFixed(2)}`;
}

function changeQty(index, delta) {
    cart[index].quantity += delta;
    if (cart[index].quantity < 1) removeItem(index);
    else {
        saveCart();
        updateCartUI();
    }
}

function removeItem(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
}

function checkout() {
    if (cart.length === 0) return;

    let message = "¡Hola PuntoFit Maracaibo! Quiero realizar el siguiente pedido:\n\n";
    cart.forEach(item => {
        message += `- ${item.quantity}x ${item.name} ($${item.price})\n`;
    });
    message += `\nTotal: ${document.getElementById('cart-total').innerText}`;
    message += `\n\n¿Tienen disponibilidad y delivery para hoy?`;

    const whatsappUrl = `https://wa.me/584121234567?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

function initCart() {
    loadCart();
    updateCartUI();
}
