/* ===== 数据大屏数据解析 ===== */
async function loadSj() {
    return await PetAssets.loadSource('json', { url: 'shu/sj.json' });
}