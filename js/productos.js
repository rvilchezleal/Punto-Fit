async function renderProducts(filter = 'all') {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    const countEl = document.getElementById('product-count');
    grid.innerHTML = renderSkeletonCards(8);
    if (countEl) countEl.textContent = 'Cargando catálogo...';

    let productList;
    try {
        productList = await loadProducts();
    } catch {
        grid.innerHTML = renderCatalogErrorState('renderProducts', `'${filter}'`);
        if (countEl) countEl.textContent = '';
        return;
    }

    const filtered = filter === 'all' ? productList : productList.filter(p => p.category === filter);

    if (countEl) {
        countEl.textContent = filtered.length === 1
            ? '1 producto encontrado'
            : `${filtered.length} productos encontrados`;
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-16">
                <i class="fas fa-box-open text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-500 font-semibold">No encontramos productos en esta categoría todavía.</p>
                <p class="text-gray-400 text-sm mt-1">Probá con otro filtro o escribinos por WhatsApp para consultar disponibilidad.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(p => getProductCardHTML(p)).join('');
    initScrollReveal();
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

document.addEventListener('DOMContentLoaded', () => {
    initCart();
    updateHeaderOnScroll();
    window.addEventListener('scroll', updateHeaderOnScroll);
    renderProducts();
});
