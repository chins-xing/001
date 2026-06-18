let chong, tu, idx = 0;
const tp = {pet_001:'jm.svg',pet_002:'bo.svg',pet_003:'kj.svg',pet_004:'yd.svg',pet_005:'hsq.svg',pet_006:'bs.svg'};

async function load() {
    const [r1, r2] = await Promise.all([
        fetch('shu/chong.json'), fetch('shu/tu.json')
    ]);
    chong = (await r1.json()).pets;
    tu = (await r2.json()).gallery;
}

function initLunbo() {
    document.getElementById('carouselTrack').innerHTML = tu.map(item => `
        <div class="carousel-slide" style="background-image: url('${item.image}')">
            <div><h3>${item.title}</h3><p>${item.description}</p></div>
        </div>
    `).join('');
    document.getElementById('carouselDots').innerHTML = tu.map((_, i) =>
        `<span class="carousel-dot ${i===0?'active':''}" data-index="${i}"></span>`
    ).join('');

    const up = () => {
        document.getElementById('carouselTrack').style.transform = `translateX(-${idx * 100}%)`;
        document.querySelectorAll('.carousel-dot').forEach((dot, i) => dot.classList.toggle('active', i === idx));
    };
    setInterval(() => { idx = (idx + 1) % tu.length; up(); }, 3000);

    document.getElementById('prevBtn').onclick = () => { idx = (idx - 1 + tu.length) % tu.length; up(); };
    document.getElementById('nextBtn').onclick = () => { idx = (idx + 1) % tu.length; up(); };
    document.getElementById('carouselDots').onclick = e => {
        if (e.target.classList.contains('carousel-dot')) { idx = +e.target.dataset.index; up(); }
    };
}

function showKapian() {
    document.getElementById('petsGrid').innerHTML = chong.map(p => {
        const fn = tp[p.image_key] || 'mr.svg';
        return `<div class="pet-card" data-pet-id="${p.id}">
            <div class="pet-avatar" style="background-image:url('tp/chong/${fn}')"></div>
            <div class="pet-info"><h3 class="pet-name">${p.name}</h3>
            <p class="pet-desc">${p.description}</p></div>
        </div>`;
    }).join('');
    document.getElementById('petsGrid').onclick = e => {
        const card = e.target.closest('.pet-card');
        if (card) location.href = `wiki.html?pet=${card.dataset.petId}`;
    };
}

document.addEventListener('DOMContentLoaded', async () => {
    await load();
    initLunbo();
    showKapian();
});