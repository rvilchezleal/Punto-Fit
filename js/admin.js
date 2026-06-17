const adminOrdersKey = 'puntofit-admin-orders';
const LOW_STOCK_THRESHOLD = 10;

let adminProducts = [];
let editingProductId = null;

function getImagePath(src) {
    if (/^(https?:)?\/\//.test(src)) return src;
    return `../${src}`;
}

function getCategoryLabel(category) {
    return categoryInfo[category]?.title || category;
}

function formatCurrency(amount) {
    return `$${Number(amount).toFixed(2)}`;
}

function getAdminOrders() {
    try {
        const stored = localStorage.getItem(adminOrdersKey);
        if (stored) return JSON.parse(stored);
    } catch {
        /* usar datos demo */
    }

    return [
        { id: 'PF-1042', customer: 'Carlos Méndez', total: 89.98, status: 'pendiente', date: new Date().toISOString() },
        { id: 'PF-1041', customer: 'María González', total: 45.99, status: 'pendiente', date: new Date().toISOString() },
        { id: 'PF-1040', customer: 'Luis Pérez', total: 124.50, status: 'completado', date: new Date().toISOString() }
    ];
}

function getTodaySales() {
    const orders = getAdminOrders();
    const today = new Date().toDateString();

    return orders
        .filter(o => o.status === 'completado' && new Date(o.date).toDateString() === today)
        .reduce((sum, o) => sum + o.total, 124.50);
}

function getPendingOrdersCount() {
    return getAdminOrders().filter(o => o.status === 'pendiente').length;
}

function getLowStockCount() {
    return adminProducts.filter(p => p.stock <= LOW_STOCK_THRESHOLD).length;
}

function toggleAdminSidebar() {
    const sidebar = document.getElementById('admin-sidebar');
    const overlay = document.getElementById('admin-sidebar-overlay');
    if (!sidebar || !overlay) return;

    sidebar.classList.toggle('admin-sidebar--open');
    overlay.classList.toggle('hidden');
}

function closeAdminSidebar() {
    const sidebar = document.getElementById('admin-sidebar');
    const overlay = document.getElementById('admin-sidebar-overlay');
    if (!sidebar || !overlay) return;

    sidebar.classList.remove('admin-sidebar--open');
    overlay.classList.add('hidden');
}

function navigateAdmin(section) {
    document.querySelectorAll('.admin-section').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.admin-nav-link').forEach(el => el.classList.remove('admin-nav-link--active'));

    const target = document.getElementById(`section-${section}`);
    const navLink = document.querySelector(`.admin-nav-link[data-section="${section}"]`);

    if (target) target.classList.remove('hidden');
    if (navLink) navLink.classList.add('admin-nav-link--active');

    const titles = {
        resumen: 'Resumen',
        productos: 'Gestión de Productos',
        pedidos: 'Pedidos',
        clientes: 'Clientes'
    };

    const pageTitle = document.getElementById('admin-page-title');
    if (pageTitle) pageTitle.textContent = titles[section] || 'Panel Admin';

    closeAdminSidebar();
}

function renderStats() {
    const salesEl = document.getElementById('stat-daily-sales');
    const pendingEl = document.getElementById('stat-pending-orders');
    const lowStockEl = document.getElementById('stat-low-stock');

    const sales = formatCurrency(getTodaySales());
    const pending = String(getPendingOrdersCount());
    const lowStock = String(getLowStockCount());

    if (salesEl) salesEl.textContent = sales;
    if (pendingEl) pendingEl.textContent = pending;
    if (lowStockEl) lowStockEl.textContent = lowStock;

    const salesCompact = document.getElementById('stat-daily-sales-compact');
    const pendingCompact = document.querySelector('[data-stat="pending"]');
    const lowStockCompact = document.querySelector('[data-stat="lowstock"]');

    if (salesCompact) salesCompact.textContent = sales;
    if (pendingCompact) pendingCompact.textContent = pending;
    if (lowStockCompact) lowStockCompact.textContent = lowStock;
}

function getStockBadgeClass(stock) {
    if (stock <= 5) return 'admin-badge admin-badge--danger';
    if (stock <= LOW_STOCK_THRESHOLD) return 'admin-badge admin-badge--warning';
    return 'admin-badge admin-badge--success';
}

function renderProductsTable() {
    const tbody = document.getElementById('admin-products-table');
    if (!tbody) return;

    if (!adminProducts.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="admin-table-empty">No hay productos registrados.</td>
            </tr>`;
        return;
    }

    tbody.innerHTML = adminProducts.map(product => `
        <tr>
            <td>
                <img src="${getImagePath(product.img)}" alt="${product.name}" class="admin-table-img"
                    onerror="this.src='https://placehold.co/64x64/e5e7eb/6b7280?text=PF'">
            </td>
            <td>
                <p class="admin-table-name">${product.name}</p>
                <p class="admin-table-meta">${product.brand || 'Sin marca'}</p>
            </td>
            <td><span class="admin-category-pill">${getCategoryLabel(product.category)}</span></td>
            <td class="admin-table-price">${formatCurrency(product.price)}</td>
            <td><span class="${getStockBadgeClass(product.stock)}">${product.stock} uds.</span></td>
            <td>
                <div class="admin-table-actions">
                    <button type="button" onclick="openProductForm(${product.id})" class="admin-action-btn admin-action-btn--edit" aria-label="Editar ${product.name}">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button type="button" onclick="deleteProduct(${product.id})" class="admin-action-btn admin-action-btn--delete" aria-label="Eliminar ${product.name}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderLowStockList() {
    const list = document.getElementById('admin-low-stock-list');
    if (!list) return;

    const lowStock = adminProducts
        .filter(p => p.stock <= LOW_STOCK_THRESHOLD)
        .sort((a, b) => a.stock - b.stock);

    if (!lowStock.length) {
        list.innerHTML = '<p class="admin-empty-note">Todos los productos tienen stock saludable.</p>';
        return;
    }

    list.innerHTML = lowStock.map(p => `
        <div class="admin-low-stock-item">
            <span>${p.name}</span>
            <span class="${getStockBadgeClass(p.stock)}">${p.stock} uds.</span>
        </div>
    `).join('');
}

function renderOrdersTable() {
    const tbody = document.getElementById('admin-orders-table');
    if (!tbody) return;

    const orders = getAdminOrders();

    tbody.innerHTML = orders.map(order => `
        <tr>
            <td class="font-semibold">${order.id}</td>
            <td>${order.customer}</td>
            <td>${formatCurrency(order.total)}</td>
            <td>
                <span class="admin-badge ${order.status === 'pendiente' ? 'admin-badge--warning' : 'admin-badge--success'}">
                    ${order.status === 'pendiente' ? 'Pendiente' : 'Completado'}
                </span>
            </td>
        </tr>
    `).join('');
}

function renderClientsTable() {
    const tbody = document.getElementById('admin-clients-table');
    if (!tbody) return;

    const clients = [
        { name: 'Carlos Méndez', email: 'carlos@email.com', orders: 5, total: 312.40 },
        { name: 'María González', email: 'maria@email.com', orders: 3, total: 189.50 },
        { name: 'Luis Pérez', email: 'luis@email.com', orders: 8, total: 540.00 },
        { name: 'Ana Rodríguez', email: 'ana@email.com', orders: 2, total: 74.99 }
    ];

    tbody.innerHTML = clients.map(client => `
        <tr>
            <td class="font-semibold">${client.name}</td>
            <td>${client.email}</td>
            <td>${client.orders}</td>
            <td>${formatCurrency(client.total)}</td>
        </tr>
    `).join('');
}

function openProductForm(productId = null) {
    editingProductId = productId;
    const modal = document.getElementById('admin-product-modal');
    const form = document.getElementById('admin-product-form');
    const title = document.getElementById('admin-modal-title');

    if (!modal || !form) return;

    form.reset();
    document.getElementById('product-id').value = '';

    if (productId) {
        const product = adminProducts.find(p => p.id === productId);
        if (!product) return;

        title.textContent = 'Editar Producto';
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-brand').value = product.brand || '';
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-stock').value = product.stock;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-img').value = product.img || '';
        document.getElementById('product-usage').value = product.usage || '';
    } else {
        title.textContent = 'Agregar Nuevo Producto';
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeProductForm() {
    const modal = document.getElementById('admin-product-modal');
    if (!modal) return;

    modal.classList.add('hidden');
    document.body.style.overflow = '';
    editingProductId = null;
}

function deleteProduct(productId) {
    const product = adminProducts.find(p => p.id === productId);
    if (!product) return;

    const confirmed = confirm(`¿Eliminar "${product.name}" del catálogo?`);
    if (!confirmed) return;

    adminProducts = adminProducts.filter(p => p.id !== productId);
    saveProducts(adminProducts);
    refreshAdmin();
}

function handleProductSubmit(event) {
    event.preventDefault();

    const formData = {
        name: document.getElementById('product-name').value.trim(),
        brand: document.getElementById('product-brand').value.trim(),
        price: parseFloat(document.getElementById('product-price').value),
        stock: parseInt(document.getElementById('product-stock').value, 10),
        category: document.getElementById('product-category').value,
        description: document.getElementById('product-description').value.trim(),
        img: document.getElementById('product-img').value.trim(),
        usage: document.getElementById('product-usage').value.trim(),
        benefits: []
    };

    if (editingProductId) {
        adminProducts = adminProducts.map(p =>
            p.id === editingProductId ? { ...p, ...formData, id: editingProductId } : p
        );
    } else {
        const nextId = adminProducts.length
            ? Math.max(...adminProducts.map(p => p.id)) + 1
            : 1;

        adminProducts.push({
            id: nextId,
            benefits: ['Consulta la etiqueta del producto para más detalles.'],
            ...formData
        });
    }

    saveProducts(adminProducts);
    closeProductForm();
    refreshAdmin();
}

function refreshAdmin() {
    adminProducts = loadProducts();
    renderStats();
    renderProductsTable();
    renderLowStockList();
    renderOrdersTable();
    renderClientsTable();
}

function initAdmin() {
    if (!requireAdminAuth()) return;

    adminProducts = loadProducts();
    refreshAdmin();
    navigateAdmin('productos');
}

document.addEventListener('DOMContentLoaded', initAdmin);
