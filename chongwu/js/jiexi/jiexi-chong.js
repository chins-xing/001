/* ===== 宠物品种数据解析 ===== */
async function loadChong() {
    const data = await PetAssets.loadSource('json', { url: 'shu/chong.json' });
    return data.pets;
}