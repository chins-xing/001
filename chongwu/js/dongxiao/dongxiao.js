/* ===== 全局动效模块 ===== */
window.PetAnim = {
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

/* ===== 内置特效 ===== */
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

/* ===== 统一错误提示 ===== */
window.PetErr = {
    show(target, msg) {
        const el = typeof target === 'string' ? document.querySelector(target) : target;
        if (!el) return;
        el.innerHTML = `
            <div class="err-card">
                <div class="err-icon">&#9888;</div>
                <p class="err-msg">${msg || '数据加载失败，请刷新页面重试'}</p>
                <button class="err-btn" onclick="location.reload()">刷新页面</button>
            </div>
        `;
    }
};