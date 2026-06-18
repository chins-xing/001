let sj, chart;

async function loadSj() {
    sj = await (await fetch('shu/sj.json')).json();
}

function showTu() {
    echarts.init(document.getElementById('speciesChart')).setOption({
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', left: 'left' },
        series: [{ name: '宠物品种分布', type: 'pie', radius: ['38%','58%'], center: ['55%','50%'], data: sj.species_distribution }]
    });

    echarts.init(document.getElementById('breedChart')).setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'value' },
        yAxis: { type: 'category', data: sj.breed_distribution.map(i => i.name) },
        series: [{ name: '数量', type: 'bar', data: sj.breed_distribution.map(i => i.value) }]
    });

    const ck = sj.checkin_stats;
    echarts.init(document.getElementById('checkinChart')).setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['喂养打卡','洗护打卡','运动打卡'] },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', boundaryGap: false, data: ck.labels },
        yAxis: { type: 'value' },
        series: [
            { name: '喂养打卡', type: 'line', data: ck.feeding },
            { name: '洗护打卡', type: 'line', data: ck.grooming },
            { name: '运动打卡', type: 'line', data: ck.exercise }
        ]
    });

    const g = document.getElementById('healthGrid');
    if (g) g.innerHTML = sj.health_indicators.map(item =>
        `<div class="health-item"><div class="health-value">${item.value}${item.unit||'%'}</div>
        <div class="health-label">${item.name}</div>
        <div class="health-bar"><div class="health-bar-fill" style="width:${Math.min(item.value,100)}%"></div></div></div>`
    ).join('');

    chart = echarts.init(document.getElementById('growthChart'));
    showCz('all');
}

function showCz(lx) {
    const qs = sj.growth_trends;
    const ty = lx === 'all' ? Object.keys(qs) : [lx];
    const lb = [...new Set(ty.flatMap(t => qs[t].labels))];
    chart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ty },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', boundaryGap: false, data: lb },
        yAxis: { type: 'value' },
        series: ty.map(type => ({
            name: type, type: 'line',
            data: lb.map(l => { const i = qs[type].labels.indexOf(l); return i !== -1 ? qs[type].weight[i] : null; })
        }))
    }, true);
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadSj();
    showTu();
    document.getElementById('petTypeFilter').onchange = e => showCz(e.target.value);
});