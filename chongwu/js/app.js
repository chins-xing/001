/* ===== 素材管理接口 ===== */
window.PetAssets = {
    _formats: {},
    _sources: {},
    _effects: {},
    _formatPriority: ['svg', 'png', 'webp', 'jpg', 'gif'],

    regFormat(name, check, loader) {
        this._formats[name] = { check, loader };
    },
    regSource(type, handler) {
        this._sources[type] = handler;
    },
    regEffect(name, fn) {
        this._effects[name] = fn;
    },

    detectFormat(url) {
        const ext = url.split('.').pop().split('?')[0].toLowerCase();
        return this._formatPriority.find(f => f === ext) || 'svg';
    },
    loadImage(url) {
        const fmt = this.detectFormat(url);
        const handler = this._formats[fmt];
        if (handler) return handler.loader(url);
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed: ${url}`));
            img.src = url;
        });
    },
    loadSource(type, params) {
        const handler = this._sources[type];
        if (!handler) throw new Error(`Unknown source type: ${type}`);
        return handler(params);
    },

    getImageUrl(key, basePath = 'tp/chong/', fallback = 'mr.svg') {
        const ext = this._formatPriority.find(f => this._formats[f]) || 'svg';
        return `${basePath}${key}.${ext}`;
    },
    resolveImage(key, map, fallback = 'mr.svg') {
        const fn = map[key] || fallback;
        const base = (key.startsWith('gallery') || key.startsWith('g')) ? 'tp/lunbo/' : 'tp/chong/';
        return base + fn;
    }
};

/* ===== 内置格式支持 ===== */
['svg', 'png', 'webp', 'jpg', 'jpeg', 'gif'].forEach(fmt => {
    PetAssets.regFormat(fmt, u => u.endsWith('.' + fmt), url => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed: ${url}`));
            img.src = url;
        });
    });
});

/* ===== 动画系统 ===== */
window.PetAnim = {
    initStarry(container) {
        const bg = document.createElement('div');
        bg.className = 'starry-bg';
        bg.innerHTML = '<div class="star-layer star-s"></div><div class="star-layer star-m"></div><div class="star-layer star-l"></div>';
        (container || document.body).appendChild(bg);
        return bg;
    },
    initLazyImages() { return PetLazy.observe(); },
    _observers: [],
    _defaults: { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },

    observe(selector, opts) {
        const cfg = { ...this._defaults, ...opts };
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('anim-done');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: cfg.threshold, rootMargin: cfg.rootMargin });

        document.querySelectorAll(selector).forEach((el, i) => {
            if (!el.dataset.anim) el.dataset.anim = 'fade-up';
            el.style.animationDelay = `${(cfg.stagger || 0.08) * i}s`;
            io.observe(el);
        });
        this._observers.push(io);
    },

    fadeIn(el, delay = 0) {
        el.style.opacity = '0';
        el.style.transition = `opacity 0.6s ease ${delay}s`;
        requestAnimationFrame(() => { el.style.opacity = '1'; });
    },

    slideIn(el, dir = 'up', delay = 0) {
        const map = { up: 'translateY(30px)', down: 'translateY(-30px)', left: 'translateX(-30px)', right: 'translateX(30px)' };
        el.style.opacity = '0';
        el.style.transform = map[dir] || map.up;
        el.style.transition = `all 0.5s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}s`;
        requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'translate(0,0)'; });
    },

    countUp(el, target, duration = 800, suffix = '') {
        const start = performance.now();
        const step = (now) => {
            const pct = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - pct, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (pct < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    },

    stagger(els, animFn, baseDelay = 0.06) {
        els.forEach((el, i) => animFn(el, i * baseDelay));
    },

    cleanup() {
        this._observers.forEach(io => io.disconnect());
        this._observers = [];
    }
};

/* ===== 加载屏幕 ===== */
window.PetLoader = {
    show(parent) {
        const el = document.createElement('div');
        el.className = 'app-loading';
        el.id = '__appLoading';
        el.innerHTML = '<div class="app-loading-wrap"><div class="loading-dots"><span class="loading-dot"></span><span class="loading-dot"></span><span class="loading-dot"></span></div><div class="app-loading-title">正在加载...</div></div>';
        (parent || document.body).appendChild(el);
    },
    hide() {
        const el = document.getElementById('__appLoading');
        if (el) { el.classList.add('hide'); setTimeout(() => el.remove(), 500); }
    }
};

/* ===== 图片懒加载 ===== */
window.PetLazy = {
    observe(selector = 'img[data-src]') {
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.addEventListener('load', () => img.classList.add('loaded'));
                    img.addEventListener('error', () => { img.classList.add('loaded'); });
                    delete img.dataset.src;
                }
                obs.unobserve(img);
            });
        }, { threshold: 0.01 });
        document.querySelectorAll(selector).forEach(img => obs.observe(img));
        return obs;
    }
};

/* ===== 注册内置特效 ===== */
PetAnim.runEffect = function (name, el, opts) {
    const builtIn = {
        pulse(el) { el.style.animation = 'pulse 2s ease-in-out infinite'; },
        float(el) { el.style.animation = 'float 3s ease-in-out infinite'; },
        shimmer(el) { el.classList.add('anim-shimmer'); },
        highlight(el) {
            el.style.transition = 'all 0.3s';
            el.style.transform = 'scale(1.05)';
            el.style.boxShadow = '0 0 20px rgba(21,101,192,0.3)';
            setTimeout(() => { el.style.transform = ''; el.style.boxShadow = ''; }, 600);
        },
        ripple(el) {
            const rippler = document.createElement('span');
            rippler.style.cssText = 'position:absolute;border-radius:50%;background:rgba(255,255,255,0.4);width:20px;height:20px;transform:scale(0);animation:ripple 0.6s ease-out;pointer-events:none;';
            const rect = el.getBoundingClientRect();
            rippler.style.left = `${(opts?.x || rect.width/2) - 10}px`;
            rippler.style.top = `${(opts?.y || rect.height/2) - 10}px`;
            el.style.position = 'relative'; el.style.overflow = 'hidden';
            el.appendChild(rippler);
            setTimeout(() => rippler.remove(), 700);
        }
    };
    const fn = builtIn[name];
    if (fn) return fn(el, opts);
    const custom = this._effects[name];
    if (custom) return custom(el, opts);
};

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

async function load() {
    try {
        const [r1, r2] = await Promise.all([
            PetAssets.loadSource('json', { url: 'shu/chong.json' }),
            PetAssets.loadSource('json', { url: 'shu/tu.json' })
        ]);
        chong = r1.pets;
        tu = r2.gallery;
    } catch (e) {
        document.getElementById('carouselTrack').innerHTML = '<div class="carousel-slide" style="justify-content:center;align-items:center"><p>数据加载失败，请刷新页面重试</p></div>';
    }
}

PetAssets.regSource('json', ({ url }) => fetch(url).then(r => r.json()));
PetAssets.regSource('jsonp', ({ url, cb }) => {
    return new Promise(resolve => {
        const s = document.createElement('script');
        s.src = `${url}?callback=${cb}`;
        window[cb] = resolve;
        document.head.appendChild(s);
    });
});

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
    await load();
    initLunbo();
    showKapian();

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
