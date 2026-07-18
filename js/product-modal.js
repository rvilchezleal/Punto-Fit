function getImagePath(src) {
    if (/^(https?:)?\/\//.test(src)) return src;
    const prefix = window.location.pathname.includes('/pages/') || window.location.pathname.includes('\\pages\\') ? '../' : '';
    return `${prefix}${src}`;
}

function openProductModal(id) {
    const product = loadProducts().find(p => p.id === id);
    const modal = document.getElementById('product-modal');
    if (!product || !modal) return;

    const categoryLabel = categoryInfo[product.category]?.title || product.category;

    document.getElementById('product-modal-img').src = getImagePath(product.img);
    document.getElementById('product-modal-img').alt = product.name;
    document.getElementById('product-modal-brand').textContent = product.brand;
    document.getElementById('product-modal-name').textContent = product.name;
    document.getElementById('product-modal-category').textContent = categoryLabel;
    document.getElementById('product-modal-price').textContent = `$${product.price.toFixed(2)}`;
    document.getElementById('product-modal-description').textContent = product.description;
    document.getElementById('product-modal-usage').textContent = product.usage;

    const benefitsList = document.getElementById('product-modal-benefits');
    benefitsList.innerHTML = product.benefits.map(b => `<li>${b}</li>`).join('');

    const addBtn = document.getElementById('product-modal-add');
    addBtn.onclick = () => {
        addToCart(product.id);
        closeProductModal();
    };

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    if (!modal) return;

    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

function getProductCardHTML(p, { bestseller = false } = {}) {
    const categoryLabel = categoryInfo[p.category]?.title || p.category;
    const badge = bestseller
        ? '<span class="absolute top-3 left-3 bg-puntofit-red text-white text-[10px] font-bold uppercase px-2 py-1 rounded-full tracking-wider">Más vendido</span>'
        : '';

    const hoverOverlay = `<div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                <button type="button" onclick="openProductModal(${p.id})" class="bg-white text-puntofit-red font-bold py-2 px-4 rounded-full text-sm transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98]">
                    <i class="fas fa-info-circle mr-1"></i>Info
                </button>
                <button type="button" onclick="addToCart(${p.id})" class="bg-puntofit-red text-white font-bold py-2 px-4 rounded-full text-sm transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98]">
                    <i class="fas fa-cart-plus mr-1"></i>Añadir
                </button>
           </div>`;

    const imageBlock = `<div class="relative group h-64 bg-gray-100 flex items-center justify-center">
                <img src="${getImagePath(p.img)}" alt="${p.name}" class="w-full h-full object-cover cursor-pointer" onclick="openProductModal(${p.id})">
                ${hoverOverlay}
                ${badge}
           </div>`;

    const mobileActions = `<div class="flex justify-between items-center">
                <span class="font-display text-2xl font-black text-puntofit-red">$${p.price.toFixed(2)}</span>
                <div class="flex gap-2 md:hidden">
                    <button type="button" onclick="openProductModal(${p.id})" class="border border-puntofit-red text-puntofit-red p-2 rounded-xl active:scale-[0.96] transition-transform">
                        <i class="fas fa-info-circle"></i>
                    </button>
                    <button type="button" onclick="addToCart(${p.id})" class="bg-puntofit-red text-white p-2 rounded-xl active:scale-[0.96] transition-transform">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
           </div>`;

    const priceRow = `${mobileActions}`;

    return `
        <div class="product-card reveal-on-scroll bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            ${imageBlock}
            <div class="p-6">
                <span class="text-[10px] uppercase font-bold text-gray-400 tracking-widest">${p.brand}${bestseller ? ` · ${categoryLabel}` : ''}</span>
                <h3 class="font-display text-lg font-bold text-gray-800 mb-2 truncate cursor-pointer hover:text-puntofit-red transition-colors" onclick="openProductModal(${p.id})">${p.name}</h3>
                ${priceRow}
            </div>
        </div>
    `;
}
