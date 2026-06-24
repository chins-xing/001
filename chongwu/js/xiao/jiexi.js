/* ===== JSON解析框架 ===== */
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

/* ===== 数据源注册 ===== */
PetAssets.regSource('json', ({ url }) => fetch(url).then(r => r.json()));