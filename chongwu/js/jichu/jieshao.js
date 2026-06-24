/* ===== 介绍页基础模块 ===== */
let sj;

function showGailan(d) {
    return `
        <div class="js-gailan">
            <h2>${d.name}</h2>
            <p class="js-subtitle">${d.subtitle}</p>
            <p class="js-desc">${d.description}</p>
            <div class="js-tech">
                ${d.tech_stack.map(t => `<span class="trait-tag">${t}</span>`).join('')}
            </div>

            <div class="js-section-card">
                <h3>技术亮点</h3>
                <div class="js-highlight-grid">
                    ${d.technical_highlights.map(h => `
                        <div class="js-highlight-card" data-anim="fade-up">
                            <h4>${h.title}</h4>
                            <p>${h.desc}</p>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="js-section-card">
                <h3>页面概览</h3>
                <div class="js-page-grid">
                    ${d.pages.map(p => `
                        <div class="js-highlight-card" data-anim="fade-up">
                            <h4>${p.name}</h4>
                            <p>${p.desc}</p>
                            <div class="js-page-tech">${p.tech}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <h3>核心特性</h3>
            <ul class="js-features">
                ${d.features.map(f => `<li>${f}</li>`).join('')}
            </ul>
        </div>`;
}

function showDiedai(list) {
    return list.map((v, i) => `
        <div class="js-iter" data-anim="fade-up" style="animation-delay:${i * 0.1}s">
            <div class="js-iter-head">
                <span class="js-iter-badge">${v.id}</span>
                <div>
                    <h3>${v.title}</h3>
                    <span class="js-iter-date">${v.date} · ${v.commit} · <span class="js-iter-focus">${v.focus}</span></span>
                </div>
            </div>
            <p class="js-iter-summary">${v.summary}</p>
            ${v.stats ? `<p class="js-iter-stats">${v.stats}</p>` : ''}
            <ul class="js-iter-changes">
                ${v.changes.map(c => `<li>${c}</li>`).join('')}
            </ul>
        </div>
    `).join('');
}

function showJiagou(d) {
    const s = d.structure;
    const dirs = [
        { key: 'js/jichu', label: '基础模块', data: s.js.jichu },
        { key: 'js/dongxiao', label: '全局动效模块', data: s.js.dongxiao },
        { key: 'js/jiexi', label: 'JSON 解析模块', data: s.js.jiexi },
        { key: 'js/beijing', label: '背景模块', data: s.js.beijing },
        { key: 'js/xiao', label: '小模块', data: s.js.xiao },
        { key: 'css/yang', label: '全局样式模块', data: s.css.yang },
        { key: 'css/beijing', label: '背景样式模块', data: s.css.beijing },
        { key: 'shu/', label: 'JSON 数据集', data: s.shu },
        { key: 'tp/', label: '图片资源', data: s.tp }
    ];
    return `
        <div class="js-jiagou">
            <div class="js-section-card">
                <h3>架构概述</h3>
                <p>${d.overview}</p>
            </div>

            <h3>分层架构</h3>
            <div class="js-layer-grid">
                ${d.layers.map((l, i) => `
                    <div class="js-layer-card" data-anim="fade-up" style="animation-delay:${i * 0.1}s">
                        <div class="js-layer-num">L${i + 1}</div>
                        <h4>${l.name}</h4>
                        <p>${l.desc}</p>
                        <div class="js-layer-items">
                            ${l.items.map(it => `<code>${it}</code>`).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>

            <h3>目录结构</h3>
            <div class="js-dir-grid">
                ${dirs.map(d => `
                    <div class="js-dir-card">
                        <div class="js-dir-path">${d.key}</div>
                        <div class="js-dir-label">${d.label}</div>
                        <div class="js-dir-files">${d.data.files.map(f => `<code>${f}</code>`).join(' ')}</div>
                    </div>
                `).join('')}
            </div>

            <div class="js-flow">
                <h3>数据流</h3>
                <div class="js-flow-bar">
                    <span>JSON 数据</span><span class="js-flow-arrow">&rarr;</span>
                    <span>jiexi 模块解析</span><span class="js-flow-arrow">&rarr;</span>
                    <span>jichu 基础模块渲染</span><span class="js-flow-arrow">&rarr;</span>
                    <span>DOM 展示</span>
                </div>
                <p class="js-flow-detail">${d.data_flow}</p>
            </div>

            <div class="js-section-card">
                <h3>模块依赖关系</h3>
                <pre class="js-dep-graph">${d.dependency_graph}</pre>
            </div>

            <h3>设计模式</h3>
            <ul class="js-features">
                ${d.design_patterns.map(p => `<li>${p}</li>`).join('')}
            </ul>
        </div>`;
}

function showDongxiao(d) {
    return Object.entries(d).map(([key, item]) => `
        <div class="js-anim-card" data-anim="fade-up">
            <h4>${item.desc}</h4>
            <div class="js-anim-meta">
                <span class="trait-tag">${item.tech}</span>
            </div>
            <p><strong>效果：</strong>${item.effect}</p>
            <p><strong>参数：</strong>${item.config}</p>
            ${item.implementation ? `<p><strong>实现：</strong>${item.implementation}</p>` : ''}
        </div>
    `).join('');
}

function showYangshi(d) {
    const c = d.color_palette;
    const u = d.ui_style;
    const l = d.layout;
    const t = d.typography;
    return `
        <div class="js-yangshi">
            <div class="js-section-card">
                <h3>设计理念</h3>
                <p>${d.design_philosophy}</p>
            </div>

            <h3>色彩体系</h3>
            <div class="js-color-grid">
                ${Object.entries(c).map(([k, v]) => `
                    <div class="js-color-swatch" style="background:${v.split(' ')[0]}">
                        <span>${k}</span><small>${v}</small>
                    </div>
                `).join('')}
            </div>

            <h3>CSS 变量体系</h3>
            <div class="js-var-table">
                ${d.css_variables.map(v => `
                    <div class="js-var-row">
                        <code class="js-var-name">${v.name}</code>
                        <span class="js-var-value" style="background:${v.value};${v.value.includes('255') || v.value.includes('1a1a') || v.value.includes('5f6') ? 'color:#fff' : ''}">${v.value}</span>
                        <span class="js-var-usage">${v.usage}</span>
                    </div>
                `).join('')}
            </div>

            <h3>UI 风格</h3>
            <div class="js-ui-cards">
                ${Object.entries(u).map(([k, v]) => `
                    <div class="js-dir-card">
                        <div class="js-dir-label">${k}</div>
                        <div class="js-dir-files">${v}</div>
                    </div>
                `).join('')}
            </div>

            <h3>组件样式规范</h3>
            <div class="js-comp-grid">
                ${d.component_styles.map(cs => `
                    <div class="js-comp-card" data-anim="fade-up">
                        <h4>${cs.component}</h4>
                        <p>${cs.style}</p>
                    </div>
                `).join('')}
            </div>

            <h3>布局系统</h3>
            <ul class="js-features">
                ${Object.entries(l).map(([k, v]) => `<li><strong>${k}：</strong>${v}</li>`).join('')}
            </ul>

            <h3>字体排版</h3>
            <ul class="js-features">
                ${Object.entries(t).map(([k, v]) => `<li><strong>${k}：</strong>${v}</li>`).join('')}
            </ul>
        </div>`;
}

function showTab(tab) {
    document.querySelectorAll('.js-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    document.querySelectorAll('.js-tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById('jsTab' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');
}

document.addEventListener('DOMContentLoaded', async () => {
    PetLoader.show();
    try {
        const data = await loadJieshao();
        sj = data;

        document.getElementById('jsGailan').innerHTML = showGailan(data.project);
        document.getElementById('jsTabDiedai').innerHTML = showDiedai(data.iterations);
        document.getElementById('jsTabJiagou').innerHTML = showJiagou(data.architecture);
        document.getElementById('jsTabDongxiao').innerHTML = showDongxiao(data.animation);
        document.getElementById('jsTabYangshi').innerHTML = showYangshi(data.style_system);
        PetAnim.observe('.js-iter, .js-anim-card, .js-dir-card, .js-highlight-card, .js-layer-card, .js-comp-card', { stagger: 0.08 });

        document.querySelector('.js-tab-nav').onclick = e => {
            const btn = e.target.closest('.js-tab-btn');
            if (!btn) return;
            showTab(btn.dataset.tab);
        };

        PetAnim.initLazyImages();
    } catch (e) {
        PetErr.show('#jsGailan', '数据加载失败，请刷新页面重试');
    }
    PetLoader.hide();
});