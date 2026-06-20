let sj, chart, _charts = [];

async function loadSj() {
    try {
        sj = await (await fetch('shu/sj.json')).json();
    } catch (e) {
        document.querySelector('.dashboard-grid').innerHTML = '<div class="chart-card full-width" style="text-align:center;padding:3rem"><p>数据加载失败，请刷新页面重试</p></div>';
    }
}

function chartOpts(extra) {
    return {
        animationDuration: 800, animationEasing: 'cubicOut',
        ...extra
    };
}

function showTu() {
    const sp = echarts.init(document.getElementById('speciesChart'));
    sp.setOption(chartOpts({
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', left: 'left' },
        series: [{ name: '宠物品种分布', type: 'pie', radius: ['38%','58%'], center: ['55%','50%'], data: sj.species_distribution,
            itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
            emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)' } },
            label: { animation: true }, animationDelay: 200
        }]
    }));
    _charts.push(sp);

    const br = echarts.init(document.getElementById('breedChart'));
    br.setOption(chartOpts({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'value' },
        yAxis: { type: 'category', data: sj.breed_distribution.map(i => i.name) },
        series: [{ name: '数量', type: 'bar', data: sj.breed_distribution.map(i => i.value),
            itemStyle: { borderRadius: [0, 4, 4, 0], color: new echarts.graphic.LinearGradient(0,0,1,0, [{offset:0,color:'#4a90d9'},{offset:1,color:'#1565c0'}]) },
            animationDelay: idx => idx * 100
        }]
    }));
    _charts.push(br);

    const ck = sj.checkin_stats;
    const ci = echarts.init(document.getElementById('checkinChart'));
    ci.setOption(chartOpts({
        tooltip: { trigger: 'axis' },
        legend: { data: ['喂养打卡','洗护打卡','运动打卡','玩耍打卡'] },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', boundaryGap: false, data: ck.labels },
        yAxis: { type: 'value' },
        series: [
            { name: '喂养打卡', type: 'line', data: ck.feeding, smooth: true, areaStyle: { opacity: 0.15 }, symbol: 'circle', animationDelay: 200 },
            { name: '洗护打卡', type: 'line', data: ck.grooming, smooth: true, areaStyle: { opacity: 0.15 }, symbol: 'circle', animationDelay: 300 },
            { name: '运动打卡', type: 'line', data: ck.exercise, smooth: true, areaStyle: { opacity: 0.15 }, symbol: 'circle', animationDelay: 400 },
            { name: '玩耍打卡', type: 'line', data: ck.play, smooth: true, areaStyle: { opacity: 0.15 }, symbol: 'diamond', animationDelay: 500 }
        ]
    }));
    _charts.push(ci);

    const g = document.getElementById('healthGrid');
    if (g) g.innerHTML = sj.health_indicators.map((item, i) =>
        `<div class="health-item" style="animation:slideInLeft 0.4s ease ${0.1 + i * 0.1}s both">
            <div class="health-value" data-count="${item.value}">0${item.unit||'%'}</div>
            <div class="health-label">${item.name}</div>
            <div class="health-bar"><div class="health-bar-fill" style="width:${Math.min(item.value,100)}%"></div></div>
        </div>`
    ).join('');
    document.querySelectorAll('.health-value[data-count]').forEach(el => {
        const target = parseInt(el.dataset.count);
        const val = el;
        setTimeout(() => {
            const start = performance.now();
            const dur = 800;
            const step = (now) => {
                const pct = Math.min((now - start) / dur, 1);
                const eased = 1 - Math.pow(1 - pct, 3);
                val.textContent = Math.round(target * eased) + '%';
                if (pct < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        }, 300);
    });

    chart = echarts.init(document.getElementById('growthChart'));
    _charts.push(chart);
    showCz('all');
}

function showCz(lx) {
    const qs = sj.growth_trends;
    const ty = lx === 'all' ? Object.keys(qs) : [lx];
    const lb = [...new Set(ty.flatMap(t => qs[t].labels))];
    chart.setOption(chartOpts({
        tooltip: { trigger: 'axis' },
        legend: { data: ty },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', boundaryGap: false, data: lb },
        yAxis: { type: 'value' },
        series: ty.map(type => ({
            name: type, type: 'line', smooth: true,
            symbol: 'circle', animationDelay: 100,
            data: lb.map(l => { const i = qs[type].labels.indexOf(l); return i !== -1 ? qs[type].weight[i] : null; })
        }))
    }), true);
}

window.addEventListener('resize', () => _charts.forEach(c => c && c.resize()));

document.addEventListener('DOMContentLoaded', async () => {
    const ls = document.getElementById('__appLoading');
    if (!ls) {
        const d = document.createElement('div');
        d.id = '__appLoading'; d.className = 'app-loading';
        d.innerHTML = '<div class="app-loading-wrap"><div class="loading-dots"><span class="loading-dot"></span><span class="loading-dot"></span><span class="loading-dot"></span></div><div class="app-loading-title">数据加载中...</div></div>';
        document.body.appendChild(d);
    }
    await loadSj();
    if (sj) showTu();
    document.getElementById('petTypeFilter').onchange = e => showCz(e.target.value);
    const el = document.getElementById('__appLoading');
    if (el) { el.classList.add('hide'); setTimeout(() => el.remove(), 500); }
});
