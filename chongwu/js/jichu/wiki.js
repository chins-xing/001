/* ===== 百科页基础模块 ===== */
let chong, cur, _allChong = [];

async function load() {
    try {
        chong = await loadChong();
        _allChong = [...chong];
    } catch (e) {
        document.getElementById('petList').innerHTML = '<li style="color:var(--text-light)">数据加载失败</li>';
    }
}

function showList(cat) {
    const list = document.getElementById('petList');
    const filtered = cat && cat !== 'all' ? _allChong.filter(p => p.category === cat) : _allChong;
    list.innerHTML = filtered.map((p, i) =>
        `<li data-pet-id="${p.id}" data-category="${p.category}" style="opacity:0;transform:translateX(-16px);transition:all 0.35s ease ${i * 0.06}s"><img class="pet-list-avatar" src="tp/chong/${p.avatar}" alt="${p.name}">${p.name}</li>`
    ).join('');
    requestAnimationFrame(() => {
        list.querySelectorAll('li').forEach(li => { li.style.opacity = '1'; li.style.transform = 'translateX(0)'; });
    });
    list.onclick = e => {
        const li = e.target.closest('li');
        if (!li) return;
        const p = chong.find(c => c.id === li.dataset.petId);
        if (!p) return;
        cur = p;
        showDetail();
        list.querySelectorAll('li').forEach(l => l.classList.remove('active'));
        li.classList.add('active');
    };
}

async function showDetail() {
    const p = cur;
    document.title = `${p.name} - 宠物百科`;

    let wei, xi;
    try {
        const [fr, gr] = await Promise.all([
            fetch('shu/' + p.feeding_guide), fetch('shu/' + p.grooming_guide)
        ]);
        wei = await fr.json();
        xi = await gr.json();
    } catch (e) {
        document.getElementById('wikiDetail').innerHTML = '<div class="wiki-placeholder"><p>详情数据加载失败</p></div>';
        return;
    }

    document.getElementById('wikiDetail').style.opacity = '0';

    document.getElementById('wikiDetail').innerHTML = `
        <div class="wiki-detail-header">
            <div class="wiki-detail-avatar" style="background-image:url('tp/chong/${p.avatar}')"></div>
            <div><h2>${p.name}</h2>
            <p>${p.description}</p></div>
        </div>
        <div class="info-grid">
            ${['寿命','体重','原产地'].map((l,i) => `<div class="info-item">
                <div class="info-label">${l}</div>
                <div class="info-value">${[p.lifespan,p.weight,p.origin][i]}</div>
            </div>`).join('')}
        </div>
        <h3>性格特点</h3>
        <div class="traits">${p.traits.map(t => `<span class="trait-tag">${t}</span>`).join('')}</div>
        <div class="tab-nav">
            <button class="tab-btn active" data-tab="feeding">喂养知识</button>
            <button class="tab-btn" data-tab="grooming">洗护教程</button>
        </div>
        <div class="tab-content active" id="feedingTab">${showWei(wei)}</div>
        <div class="tab-content" id="groomingTab">${showXi(xi)}</div>
    `;
    initTab();
    requestAnimationFrame(() => {
        document.getElementById('wikiDetail').style.transition = 'opacity 0.4s ease';
        document.getElementById('wikiDetail').style.opacity = '1';
        document.querySelectorAll('.info-item, .step-item').forEach((el, i) => {
            el.style.opacity = '0';
            el.style.transform = 'translateX(-20px)';
            requestAnimationFrame(() => {
                el.style.transition = `all 0.4s ease ${i * 0.08}s`;
                el.style.opacity = '1';
                el.style.transform = 'translateX(0)';
            });
        });
    });
}

function showWei(d) {
    if (!d) return '<p>暂无喂养知识数据</p>';
    return `<h3>各阶段喂养指南</h3>
        ${d.feeding_knowledge.map((s,i) => `<div class="step-item">
            <div class="step-header"><div class="step-number">${i+1}</div></div>
            <p><strong>${s.stage}</strong></p>
            <p><strong>喂食频率：</strong>${s.frequency}</p>
            <p><strong>食物类型：</strong>${s.food_type}</p>
            <p><strong>喂食量：</strong>${s.amount}</p>
            <h4>注意事项：</h4><ul>${s.tips.map(t => `<li>${t}</li>`).join('')}</ul>
        </div>`).join('')}
        <h3>禁忌食物</h3>
        <div class="traits">${d.forbidden_foods.map(f => `<span class="trait-tag trait-tag--danger">${f}</span>`).join('')}</div>`;
}

function showXi(d) {
    if (!d) return '<p>暂无洗护教程数据</p>';
    const t = d.grooming_tutorial;
    return `<h3>${t.title}</h3>
        <p><strong>建议频率：</strong>${t.frequency}</p>
        <h3>所需工具</h3>
        <div class="traits">${t.tools_needed.map(tool => `<span class="trait-tag">${tool}</span>`).join('')}</div>
        <h3>洗护步骤</h3>
        <ul class="step-list">${t.steps.map(s => `<li class="step-item">
            <div class="step-header"><div class="step-number">${s.step}</div>
            <div class="step-title">${s.title}</div><div class="step-duration">${s.duration}</div></div>
            <p>${s.description}</p>
        </li>`).join('')}</ul>
        <h3>特别提示</h3><ul>${t.special_tips.map(tip => `<li>${tip}</li>`).join('')}</ul>`;
}

function initTab() {
    const nav = document.querySelector('.tab-nav');
    nav.onclick = e => {
        const btn = e.target.closest('.tab-btn');
        if (!btn) return;
        nav.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(btn.dataset.tab + 'Tab').classList.add('active');
    };
}

document.addEventListener('DOMContentLoaded', async () => {
    const ld = document.createElement('div'); ld.id = '__appLoading'; ld.className = 'app-loading';
    ld.innerHTML = '<div class="app-loading-wrap"><div class="loading-dots"><span class="loading-dot"></span><span class="loading-dot"></span><span class="loading-dot"></span></div><div class="app-loading-title">内容加载中...</div></div>';
    document.body.appendChild(ld);
    await load();
    showList();

    const filterEl = document.getElementById('wikiFilter');
    if (filterEl) {
        filterEl.onclick = e => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;
            filterEl.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            showList(btn.dataset.cat);
            document.getElementById('wikiDetail').innerHTML = '<div class="wiki-placeholder"><p>请从左侧选择一个宠物查看详情</p></div>';
            cur = null;
            history.replaceState(null, '', location.pathname);
        };
    }

    const id = new URLSearchParams(location.search).get('pet');
    if (id) {
        const p = chong.find(c => c.id === id);
        if (p) {
            cur = p;
            showDetail();
            const li = document.querySelector(`[data-pet-id="${id}"]`);
            if (li) li.classList.add('active');
        }
    }
    const el = document.getElementById('__appLoading');
    if (el) { el.classList.add('hide'); setTimeout(() => el.remove(), 500); }
});