/* ===== 轮播图数据解析 ===== */
async function loadTu() {
    const data = await PetAssets.loadSource('json', { url: 'shu/tu.json' });
    return data.gallery;
}