/* ===== 首页基础模块 ===== */
let chong, tu, _lunboIdx = 0, _lunboTimer = null;

function initLunbo() {
    if (!tu || tu.length === 0) return;
    const items = [...tu, ...tu, ...tu];
    document.getElementById('carouselTrack').innerHTML = items.map((item, i) => `
        <div class="carousel-slide" data-idx="${i}" onclick="location.href='wiki.html?pet=${item.pet_id}'">
            <div class="carousel-slide-bg" style="background-image:url('${item.image}')"></div>
            <span class="carousel-tag">${item.title}</span>
        </div>
    `).join('');

    const total = tu.length;
    _lunboIdx = total;

    const indicator = document.getElementById('carouselIndicator');
    indicator.innerHTML = tu.map((_, i) =>
        `<span class="c-indicator-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`
    ).join('');

    const up = (instant) => {
        const track = document.getElementById('carouselTrack');
        track.style.transition = instant ? 'none' : 'transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)';
        track.style.transform = `translateX(-${_lunboIdx * (100 / 3)}%)`;

        const idx = ((_lunboIdx % total) + total) % total;
        document.querySelectorAll('.c-indicator-dot').forEach((dot, i) => dot.classList.toggle('active', i === idx));

        if (_lunboIdx >= total * 2) {
            setTimeout(() => { _lunboIdx = _lunboIdx % total + total; up(true); }, 500);
        } else if (_lunboIdx < total) {
            setTimeout(() => { _lunboIdx = _lunboIdx % total + total; up(true); }, 500);
        }
    };

    if (_lunboTimer) clearInterval(_lunboTimer);
    _lunboTimer = setInterval(() => { _lunboIdx++; up(); }, 4000);

    document.getElementById('prevBtn').onclick = () => { _lunboIdx--; up(); clearInterval(_lunboTimer); _lunboTimer = setInterval(() => { _lunboIdx++; up(); }, 4000); };
    document.getElementById('nextBtn').onclick = () => { _lunboIdx++; up(); clearInterval(_lunboTimer); _lunboTimer = setInterval(() => { _lunboIdx++; up(); }, 4000); };
    indicator.onclick = e => {
        const dot = e.target.closest('.c-indicator-dot');
        if (!dot) return;
        const target = +dot.dataset.index;
        const diff = target - (_lunboIdx % total);
        _lunboIdx += diff;
        up();
        clearInterval(_lunboTimer);
        _lunboTimer = setInterval(() => { _lunboIdx++; up(); }, 4000);
    };

    up(true);
}

function showKapian(cat) {
    const grid = document.getElementById('petsGrid');
    const filtered = cat && cat !== 'all' ? chong.filter(p => p.category === cat) : chong;
    grid.innerHTML = filtered.map((p, i) => {
        const fn = p.avatar || 'mr.svg';
        return `<div class="pet-card" data-pet-id="${p.id}" data-anim="fade-up" style="animation-delay:${i * 0.08}s">
            <div class="pet-avatar" style="background-image:url('tp/chong/${fn}')"></div>
            <div class="pet-info"><h3 class="pet-name">${p.name}</h3>
            <p class="pet-desc">${p.description}</p></div>
        </div>`;
    }).join('');
    PetAnim.observe('.pet-card', { stagger: 0.08 });

    grid.onclick = e => {
        const card = e.target.closest('.pet-card');
        if (card) {
            const rect = card.getBoundingClientRect();
            PetAnim.runEffect('ripple', card, { x: e.clientX - rect.left, y: e.clientY - rect.top });
            setTimeout(() => { location.href = `wiki.html?pet=${card.dataset.petId}`; }, 200);
        }
    };
}

document.addEventListener('DOMContentLoaded', async () => {
    PetLoader.show();
    try {
        [chong, tu] = await Promise.all([loadChong(), loadTu()]);
        initLunbo();
        showKapian();
    } catch (e) {
        document.getElementById('carouselTrack').innerHTML = '<div class="carousel-slide" style="justify-content:center;align-items:center"><p>数据加载失败，请刷新页面重试</p></div>';
    }

    const filterEl = document.getElementById('breedFilter');
    if (filterEl) {
        filterEl.onclick = e => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;
            filterEl.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            showKapian(btn.dataset.cat);
        };
    }
    PetAnim.initLazyImages();
    PetLoader.hide();
});