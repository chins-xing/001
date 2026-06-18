let chong, cur;

async function load() {
    chong = (await (await fetch('shu/chong.json')).json()).pets;
}

function showList() {
    const list = document.getElementById('petList');
    list.innerHTML = chong.map(p => `<li data-pet-id="${p.id}">${p.name}</li>`).join('');
    list.onclick = e => {
        if (e.target.tagName !== 'LI') return;
        const p = chong.find(c => c.id === e.target.dataset.petId);
        if (!p) return;
        cur = p;
        showDetail();
        list.querySelectorAll('li').forEach(li => li.classList.remove('active'));
        e.target.classList.add('active');
    };
}

async function showDetail() {
    const p = cur;
    const [fr, gr] = await Promise.all([
        fetch('shu/' + p.feeding_guide), fetch('shu/' + p.grooming_guide)
    ]);
    const wei = await fr.json(), xi = await gr.json();

    document.getElementById('wikiDetail').innerHTML = `
        <h2>${p.name}</h2>
        <p>${p.description}</p>
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
        <div class="traits">${d.forbidden_foods.map(f => `<span class="trait-tag" style="background:#ff6b6b">${f}</span>`).join('')}</div>`;
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
    await load();
    showList();
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
});