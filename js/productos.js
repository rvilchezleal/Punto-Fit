function renderProducts(filter = 'all') {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    grid.innerHTML = '';

    const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);

    filtered.forEach(p => {
        grid.innerHTML += getProductCardHTML(p);
    });
}

function filterProducts(category, btn) {
    document.querySelectorAll('.category-btn').forEach(b => {
        b.classList.remove('bg-puntofit-red', 'text-white');
        b.classList.add('text-puntofit-red');
    });

    const activeBtn = btn || event?.target;
    if (activeBtn) {
        activeBtn.classList.add('bg-puntofit-red', 'text-white');
        activeBtn.classList.remove('text-puntofit-red');
    }

    renderProducts(category);
}

function updateHeaderOnScroll() {
    const header = document.getElementById('main-header');
    if (!header) return;

    header.classList.toggle('scrolled', window.scrollY > 10);
}

window.onload = () => {
    initCart();
    updateHeaderOnScroll();
    window.addEventListener('scroll', updateHeaderOnScroll);
    renderProducts();
};
