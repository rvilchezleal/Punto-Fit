let currentHeroSlide = 0;

function goToHeroSlide(index) {
    const slides = document.querySelectorAll('.hero-carousel__slide');
    if (!slides.length) return;

    slides[currentHeroSlide].classList.remove('active');
    currentHeroSlide = (index + slides.length) % slides.length;
    slides[currentHeroSlide].classList.add('active');
}

function nextHeroSlide() {
    goToHeroSlide(currentHeroSlide + 1);
}

function initHeroCarousel() {
    const slides = document.querySelectorAll('.hero-carousel__slide');
    if (!slides.length) return;

    setInterval(nextHeroSlide, 4000);
}

function updateHeaderOnScroll() {
    const header = document.getElementById('main-header');
    if (!header) return;

    header.classList.toggle('scrolled', window.scrollY > 10);
}

function openCategoryModal(category) {
    const info = categoryInfo[category];
    const modal = document.getElementById('category-modal');
    if (!info || !modal) return;

    document.getElementById('modal-icon').className = `fas ${info.icon} text-3xl text-puntofit-red`;
    document.getElementById('modal-title').textContent = info.title;
    document.getElementById('modal-description').textContent = info.description;
    document.getElementById('modal-usage').textContent = info.usage;

    const benefitsList = document.getElementById('modal-benefits');
    benefitsList.innerHTML = info.benefits.map(b => `<li>${b}</li>`).join('');

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeCategoryModal() {
    const modal = document.getElementById('category-modal');
    if (!modal) return;

    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

function toggleFaq(button) {
    const item = button.closest('.faq-item');
    const answer = item.querySelector('.faq-answer');
    const icon = button.querySelector('.faq-icon');
    const isOpening = answer.classList.contains('hidden');

    document.querySelectorAll('.faq-item').forEach(other => {
        if (other === item) return;
        other.querySelector('.faq-answer').classList.add('hidden');
        other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        other.querySelector('.faq-icon')?.classList.remove('rotate-180');
        other.classList.remove('faq-item--open');
    });

    answer.classList.toggle('hidden');
    button.setAttribute('aria-expanded', isOpening ? 'true' : 'false');
    icon?.classList.toggle('rotate-180', isOpening);
    item.classList.toggle('faq-item--open', isOpening);
}

function renderBestsellers() {
    const grid = document.getElementById('bestsellers-grid');
    if (!grid) return;

    getBestsellers().forEach(p => {
        grid.innerHTML += getProductCardHTML(p, { bestseller: true });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initCart();
    updateHeaderOnScroll();
    window.addEventListener('scroll', updateHeaderOnScroll);
    initHeroCarousel();
    renderBestsellers();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeCategoryModal();
        closeProductModal();
    }
});
