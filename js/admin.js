// js/admin.js — Panel Admin conectado a Supabase en tiempo real
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
    'https://elnxlsydfdndolrcdyri.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsbnhsc3lkZmRuZG9scmNkeXJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MjQ2OTMsImV4cCI6MjA5NzMwMDY5M30.wbNAcdOydljDpRGD9QP3KZ9RT7X3WPDTfkCfJTEZ2yc'
);

const ADMIN_EMAILS = ['admin@puntofit.com', 'rvilchezleal@gmail.com'];
const LOW_STOCK_THRESHOLD = 10;

let adminProducts = [];
let editingProductId = null;

// ── HELPERS ─────────────────────────────────────────────
function getImagePath(src) {
    if (!src) return 'https://placehold.co/64x64/e5e7eb/6b7280?text=PF';
    if (/^(https?:)?\/\//.test(src)) return src;
    return `../${src}`;
}

function getCategoryLabel(category) {
    return categoryInfo?.[category]?.title || category;
}

function formatCurrency(amount) {
    return `$${Number(amount || 0).toFixed(2)}`;
}

function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es-VE', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function showToast(msg, type = 'success') {
    const existing = document.getElementById('admin-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'admin-toast';
    const bg = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';
    toast.className = `fixed bottom-6 right-6 z-[9999] ${bg} text-white px-5 py-3 rounded-xl shadow-2xl
                       flex items-center gap-3 text-sm font-semibold transition-all animate-bounce-in`;
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    toast.innerHTML = `<i class="fas ${icon}"></i> ${msg}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

// ── SIDEBAR ─────────────────────────────────────────────
window.toggleAdminSidebar = function () {
    document.getElementById('admin-sidebar')?.classList.toggle('admin-sidebar--open');
    document.getElementById('admin-sidebar-overlay')?.classList.toggle('hidden');
};

window.closeAdminSidebar = function () {
    document.getElementById('admin-sidebar')?.classList.remove('admin-sidebar--open');
    document.getElementById('admin-sidebar-overlay')?.classList.add('hidden');
};

window.navigateAdmin = function (section) {
    document.querySelectorAll('.admin-section').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.admin-nav-link').forEach(el => el.classList.remove('admin-nav-link--active'));

    document.getElementById(`section-${section}`)?.classList.remove('hidden');
    document.querySelector(`.admin-nav-link[data-section="${section}"]`)?.classList.add('admin-nav-link--active');

    const titles = { resumen: 'Resumen', productos: 'Gestión de Productos', pedidos: 'Pedidos', clientes: 'Clientes' };
    const pageTitle = document.getElementById('admin-page-title');
    if (pageTitle) pageTitle.textContent = titles[section] || 'Panel Admin';

    window.closeAdminSidebar();
};

// ── STATS DESDE SUPABASE ─────────────────────────────────
async function loadStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Ventas del día
    const { data: ventasHoy } = await supabase
        .from('pedidos')
        .select('total')
        .eq('estado', 'completado')
        .gte('fecha', today.toISOString());

    const totalHoy = (ventasHoy || []).reduce((sum, p) => sum + Number(p.total), 0);

    // Pedidos pendientes
    const { count: pendingCount } = await supabase
        .from('pedidos')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'pendiente');

    // Bajo stock
    const lowStockCount = adminProducts.filter(p => p.stock <= LOW_STOCK_THRESHOLD).length;

    // Actualizar todos los elementos de stat
    const sales = formatCurrency(totalHoy);
    const pending = String(pendingCount || 0);
    const lowStock = String(lowStockCount);

    document.getElementById('stat-daily-sales') && (document.getElementById('stat-daily-sales').textContent = sales);
    document.getElementById('stat-pending-orders') && (document.getElementById('stat-pending-orders').textContent = pending);
    document.getElementById('stat-low-stock') && (document.getElementById('stat-low-stock').textContent = lowStock);
    document.getElementById('stat-daily-sales-compact') && (document.getElementById('stat-daily-sales-compact').textContent = sales);
    document.querySelector('[data-stat="pending"]') && (document.querySelector('[data-stat="pending"]').textContent = pending);
    document.querySelector('[data-stat="lowstock"]') && (document.querySelector('[data-stat="lowstock"]').textContent = lowStock);

    await renderSalesChart();
}

// ── REGRESIÓN LINEAL Y CHART.JS ─────────────────────────
let salesChartInstance = null;

function calculateLinearRegression(dataPairs) {
    const n = dataPairs.length;
    if (n === 0) return { m: 0, b: 0 };
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    dataPairs.forEach(([x, y]) => {
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumXX += x * x;
    });

    const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX) || 0;
    const b = (sumY - m * sumX) / n || 0;
    return { m, b };
}

async function renderSalesChart() {
    const canvas = document.getElementById('salesChart');
    if (!canvas) return;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: pedidos } = await supabase
        .from('pedidos')
        .select('fecha, total')
        .eq('estado', 'completado')
        .gte('fecha', thirtyDaysAgo.toISOString())
        .order('fecha', { ascending: true });

    if (!pedidos || pedidos.length === 0) return;

    const dailyMap = {};
    pedidos.forEach(p => {
        const dateStr = new Date(p.fecha).toLocaleDateString('es-VE', { month: 'short', day: 'numeric' });
        dailyMap[dateStr] = (dailyMap[dateStr] || 0) + Number(p.total);
    });

    const labels = Object.keys(dailyMap);
    const dataPoints = Object.values(dailyMap);

    const regressionData = dataPoints.map((y, x) => [x, y]);
    const { m, b } = calculateLinearRegression(regressionData);
    const trendline = labels.map((_, x) => m * x + b);

    if (salesChartInstance) salesChartInstance.destroy();

    salesChartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Ventas Reales ($)',
                    data: dataPoints,
                    backgroundColor: 'rgba(0, 48, 135, 0.7)',
                    borderRadius: 4
                },
                {
                    label: 'Tendencia (Regresión)',
                    data: trendline,
                    type: 'line',
                    borderColor: '#FFB700',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// ── CARGA DE PRODUCTOS DESDE SUPABASE ────────────────────
async function loadProductsFromSupabase() {
    const { data, error } = await supabase.from('productos').select('*').order('id');
    if (error) {
        console.error("Error al cargar productos de Supabase:", error);
        return [];
    }
    // Mapear al formato local temporalmente para no romper la tabla
    return data.map(p => ({
        id: p.id,
        name: p.nombre,
        brand: p.marca || '',
        price: Number(p.precio),
        stock: p.inventario,
        category: p.categoria,
        description: p.descripcion || '',
        img: p.imagen_url || '',
        usage: ''
    }));
}

// ── PRODUCTOS ────────────────────────────────────────────
function getStockBadgeClass(stock) {
    if (stock <= 5) return 'admin-badge admin-badge--danger';
    if (stock <= LOW_STOCK_THRESHOLD) return 'admin-badge admin-badge--warning';
    return 'admin-badge admin-badge--success';
}

function renderProductsTable() {
    const tbody = document.getElementById('admin-products-table');
    if (!tbody) return;

    if (!adminProducts.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="admin-table-empty">No hay productos registrados.</td></tr>`;
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
        list.innerHTML = '<p class="admin-empty-note">Todos los productos tienen stock saludable. ✅</p>';
        return;
    }

    list.innerHTML = lowStock.map(p => `
        <div class="admin-low-stock-item">
            <span>${p.name}</span>
            <span class="${getStockBadgeClass(p.stock)}">${p.stock} uds.</span>
        </div>
    `).join('');
}

// ── PEDIDOS DESDE SUPABASE ───────────────────────────────
async function renderOrdersTable() {
    const tbody = document.getElementById('admin-orders-table');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="5" class="admin-table-empty"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando pedidos...</td></tr>`;

    const { data: orders, error } = await supabase
        .from('pedidos')
        .select('*, usuarios(nombre, email)')
        .order('fecha', { ascending: false })
        .limit(50);

    if (error) {
        tbody.innerHTML = `<tr><td colspan="5" class="admin-table-empty text-red-500">Error al cargar pedidos.</td></tr>`;
        return;
    }

    if (!orders || !orders.length) {
        tbody.innerHTML = `<tr><td colspan="5" class="admin-table-empty">No hay pedidos registrados aún.</td></tr>`;
        return;
    }

    tbody.innerHTML = orders.map(order => {
        const statusClass = order.estado === 'pendiente' ? 'admin-badge--warning' : 'admin-badge--success';
        const statusLabel = order.estado === 'pendiente' ? 'Pendiente' : 'Completado';
        const items = Array.isArray(order.items) ? order.items : [];
        const resumen = items.length ? items.map(i => `${i.quantity}x ${i.name}`).join(', ') : '—';

        return `
        <tr>
            <td class="font-semibold text-xs text-gray-400">${order.id?.toString().slice(0,8) || '—'}</td>
            <td>
                <p class="font-semibold">${order.usuarios?.nombre || order.usuarios?.email || '—'}</p>
                <p class="text-xs text-gray-400">${order.usuarios?.email || ''}</p>
            </td>
            <td class="text-xs text-gray-500 max-w-[200px] truncate" title="${resumen}">${resumen}</td>
            <td class="font-bold text-puntofit-red">${formatCurrency(order.total)}</td>
            <td>
                <div class="flex items-center gap-2">
                    <span class="admin-badge ${statusClass}">${statusLabel}</span>
                    <span class="text-xs text-gray-400">${formatDate(order.fecha)}</span>
                </div>
            </td>
        </tr>`;
    }).join('');
}

// ── CLIENTES DESDE SUPABASE ──────────────────────────────
async function renderClientsTable() {
    const tbody = document.getElementById('admin-clients-table');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="4" class="admin-table-empty"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando clientes...</td></tr>`;

    // Obtener todos los pedidos para agrupar por cliente
    const { data: pedidos, error } = await supabase
        .from('pedidos')
        .select('id_usuario, total, usuarios(nombre, email)')
        .order('fecha', { ascending: false });

    if (error) {
        console.error("Error al cargar clientes:", error);
        tbody.innerHTML = `<tr><td colspan="4" class="admin-table-empty text-red-500">Error al cargar clientes.</td></tr>`;
        return;
    }

    if (!pedidos || !pedidos.length) {
        tbody.innerHTML = `<tr><td colspan="4" class="admin-table-empty">No hay clientes registrados aún.</td></tr>`;
        return;
    }

    // Agrupar por id_usuario
    const clientMap = {};
    pedidos.forEach(p => {
        const key = p.id_usuario;
        if (!key) return; // Saltar si no hay usuario

        if (!clientMap[key]) {
            clientMap[key] = {
                nombre: p.usuarios?.nombre || p.usuarios?.email || 'Anónimo',
                email: p.usuarios?.email || '—',
                pedidos: 0,
                total: 0
            };
        }
        clientMap[key].pedidos++;
        clientMap[key].total += Number(p.total || 0);
    });

    const clients = Object.values(clientMap).sort((a, b) => b.total - a.total);

    tbody.innerHTML = clients.map(client => `
        <tr>
            <td>
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-puntofit-red text-white flex items-center justify-center text-xs font-black">
                        ${client.nombre.charAt(0).toUpperCase()}
                    </div>
                    <span class="font-semibold">${client.nombre}</span>
                </div>
            </td>
            <td class="text-gray-500">${client.email}</td>
            <td>
                <span class="admin-badge admin-badge--success">${client.pedidos} pedido${client.pedidos !== 1 ? 's' : ''}</span>
            </td>
            <td class="font-bold text-puntofit-red">${formatCurrency(client.total)}</td>
        </tr>
    `).join('');
}

// ── FORMULARIO DE PRODUCTO ───────────────────────────────
window.openProductForm = function (productId = null) {
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
        document.getElementById('product-img-url').value = product.img || '';
        document.getElementById('product-usage').value = product.usage || '';
    } else {
        title.textContent = 'Agregar Nuevo Producto';
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
};

window.closeProductForm = function () {
    document.getElementById('admin-product-modal')?.classList.add('hidden');
    document.body.style.overflow = '';
    editingProductId = null;
};

window.deleteProduct = async function (productId) {
    const product = adminProducts.find(p => p.id === productId);
    if (!product) return;

    if (!confirm(`¿Eliminar "${product.name}" del catálogo?`)) return;

    const { error } = await supabase.from('productos').delete().eq('id', productId);
    if (error) {
        showToast(`Error al eliminar: ${error.message}`, 'error');
        return;
    }

    showToast(`"${product.name}" eliminado del catálogo.`, 'success');
    refreshAdmin();
};

window.handleProductSubmit = async function (event) {
    event.preventDefault();

    const submitBtn = event.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    }

    const fileInput = document.getElementById('product-img-file');
    let publicUrl = document.getElementById('product-img-url').value;

    if (fileInput && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, file, { cacheControl: '3600', upsert: false });

        if (uploadError) {
            showToast(`Error al subir imagen: ${uploadError.message}`, 'error');
            if (submitBtn) { submitBtn.disabled = false; submitBtn.innerText = 'Guardar producto'; }
            return;
        }

        const { data: { publicUrl: url } } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);
        publicUrl = url;
    }

    const payload = {
        nombre: document.getElementById('product-name').value.trim(),
        marca: document.getElementById('product-brand').value.trim(),
        precio: parseFloat(document.getElementById('product-price').value),
        inventario: parseInt(document.getElementById('product-stock').value, 10),
        categoria: document.getElementById('product-category').value,
        descripcion: document.getElementById('product-description').value.trim(),
        imagen_url: publicUrl
    };

    if (editingProductId) {
        const { error } = await supabase.from('productos').update(payload).eq('id', editingProductId);
        if (error) {
            showToast(`Error al actualizar: ${error.message}`, 'error');
        } else {
            showToast(`"${payload.nombre}" actualizado correctamente.`, 'success');
        }
    } else {
        const { error } = await supabase.from('productos').insert([payload]);
        if (error) {
            showToast(`Error al insertar: ${error.message}`, 'error');
        } else {
            showToast(`"${payload.nombre}" añadido al catálogo.`, 'success');
        }
    }

    if (submitBtn) { submitBtn.disabled = false; submitBtn.innerText = 'Guardar producto'; }
    window.closeProductForm();
    refreshAdmin();
};

// ── REFRESCAR TODO ───────────────────────────────────────
async function refreshAdmin() {
    adminProducts = await loadProductsFromSupabase();
    await loadStats();
    renderProductsTable();
    renderLowStockList();
    await renderOrdersTable();
    await renderClientsTable();
}

// ── SUSCRIPCIÓN EN TIEMPO REAL ───────────────────────────
function suscribirCambiosEnTiempoReal() {
    // Escuchar nuevos pedidos en tiempo real
    supabase
        .channel('pedidos-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, async (payload) => {
            if (payload.eventType === 'INSERT') {
                const p = payload.new;
                showToast(`🛒 Nuevo pedido registrado — ${formatCurrency(p.total)}`, 'info');
            }
            await refreshAdmin();
        })
        .subscribe();
}

// ── LOGOUT ───────────────────────────────────────────────
window.logoutAdmin = async function () {
    await supabase.auth.signOut();
    window.location.href = '../index.html';
};

// ── INIT ─────────────────────────────────────────────────
async function initAdmin() {
    // Verificar sesión y rol de admin
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = '../pages/login.html';
        return;
    }

    const user = session.user;
    const isAdminEmail = ADMIN_EMAILS.includes(user.email);

    if (!isAdminEmail) {
        const { data: perfil } = await supabase
            .from('usuarios')
            .select('rol')
            .eq('id', user.id)
            .single();

        if (perfil?.rol !== 'admin') {
            alert('No tienes permiso para acceder al panel de administrador.');
            window.location.href = '../index.html';
            return;
        }
    }

    // Cargar productos de Supabase
    adminProducts = await loadProductsFromSupabase();

    // Refrescar todo (incluyendo Supabase)
    await refreshAdmin();

    // Navegar a resumen por defecto
    window.navigateAdmin('resumen');

    // Activar actualizaciones en tiempo real
    suscribirCambiosEnTiempoReal();

    // Auto-refresh cada 30 segundos como respaldo
    setInterval(async () => {
        await loadStats();
        await renderOrdersTable();
        await renderClientsTable();
    }, 30000);
}

document.addEventListener('DOMContentLoaded', initAdmin);
