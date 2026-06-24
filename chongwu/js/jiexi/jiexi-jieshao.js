/* ===== 介绍页数据解析 ===== */
async function loadJieshao() {
    return await PetAssets.loadSource('json', { url: 'shu/jieshao.json' });
}