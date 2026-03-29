// めいすいくん総選挙 - ゲームロジック
// 年代計算、レベルシステム、ランクシステム、歴史イベント定義

// ========== 年代システム (1889-2100, 1票=10年) ==========
const VOTES_PER_CYCLE = 22;

function getEffectiveVotes() {
    return Math.max(0, totalVotes - cycleStartVotes);
}

function getCurrentYear() {
    const effective = getEffectiveVotes();
    if (effective >= 22) return END_YEAR;
    return START_YEAR + effective * YEARS_PER_VOTE;
}

function getWorldLine() {
    return (worldLineOffset || 0) + 1;
}

function isEndingTrigger() {
    return getEffectiveVotes() >= 22;
}

// ========== 歴史イベント定義 ==========
const historicalEvents = {
    // 実際の浦安の歴史
    1889: {text: '浦安村 誕生 — 堀江・猫実・当代島の3村が合併', emoji: '🏘️'},
    1899: {text: 'べか舟漁 最盛期 — 海苔とあさりで浦安は活気づく', emoji: '⛵'},
    1909: {text: '浦安町に昇格', emoji: '🏛️'},
    1919: {text: '大正6年の大津波の記憶… 高潮で浦安が水没した', emoji: '🌊'},
    1929: {text: '浦安橋の建設がはじまる — 東京への道がひらける', emoji: '🌉'},
    1939: {text: '戦時中… 浦安の漁師たちも戦地へ', emoji: '⚔️'},
    1949: {text: 'キティ台風 襲来！ 堤防14か所が決壊、町の7割が浸水…', emoji: '🌀'},
    1959: {text: '黒い水事件 — 工場排水で海が汚染された…', emoji: '🖤', special: 'blackWater'},
    1969: {text: '地下鉄東西線 開通！ 浦安が東京とつながった', emoji: '🚇'},
    1979: {text: '埋め立てで浦安の面積が4倍に！ 舞浜・日の出・明海が誕生', emoji: '🏗️'},
    1989: {text: 'JR京葉線 開通！ 新浦安駅・舞浜駅ができた', emoji: '🚃'},
    1999: {text: '浦安市の人口が15万人を突破！ 住みたい街ランキング上位に', emoji: '🏙️'},
    2009: {text: '東京ディズニーリゾート 来園者数3億人突破！', emoji: '🏰'},
    2019: {text: '浦安三社祭 4年に一度の大祭！ まいだ！まいだ！', emoji: '🏮'},
    // 未来の浦安
    2029: {text: '三番瀬 自然再生プロジェクト 開始！', emoji: '🦅'},
    2039: {text: '浦安スマートシティ計画 — 自動運転バスが走り出す', emoji: '🚌'},
    2049: {text: '葛西に橋が架かった！ 東京湾岸エリアが一体化', emoji: '🌉'},
    2059: {text: '浦安 海上ソーラー発電 稼働！ エネルギー自給率100%', emoji: '☀️'},
    2069: {text: '浦安↔新浦安 ロープウェイ開通！', emoji: '🚡'},
    2079: {text: '海底トンネルで千葉と神奈川が直結！', emoji: '🚇'},
    2089: {text: '海上都市計画 始動！ 東京湾に浮かぶ街', emoji: '🏙️'},
    2099: {text: '未来都市うらやす 完成間近！', emoji: '🌟'},
};

// ========== ランクシステム ==========
const rankLevels = [
    { min: 0, rank: 'F', title: '田舎の漁村', color: '#999', star: '☆', desc: 'のどかな浦安…投票で街を発展させよう！' },
    { min: 2, rank: 'E', title: 'ちいさな集落', color: '#88aacc', star: '⭐', desc: '少しずつ人が集まり始めた' },
    { min: 5, rank: 'D', title: 'のどかな町', color: '#66bb6a', star: '⭐⭐', desc: '町に活気が出てきた！' },
    { min: 9, rank: 'C', title: '発展する港町', color: '#42a5f5', star: '⭐⭐⭐', desc: '商業と観光が盛り上がってきた！' },
    { min: 14, rank: 'B', title: 'にぎわう観光都市', color: '#ffa726', star: '⭐⭐⭐⭐', desc: '浦安は観光名所に！' },
    { min: 18, rank: 'A', title: '輝く海辺の楽園', color: '#ef5350', star: '⭐⭐⭐⭐⭐', desc: '自然と商業が調和する理想の街！' },
    { min: 22, rank: 'S', title: '伝説のめいすいくんワールド', color: '#e040fb', star: '🌟🌟🌟🌟🌟', desc: '全てが揃った究極の浦安！' },
];

function getOverallRank() {
    const total = getEffectiveVotes();
    let result = rankLevels[0];
    for (let i = rankLevels.length - 1; i >= 0; i--) {
        if (total >= rankLevels[i].min) {
            result = rankLevels[i];
            break;
        }
    }
    let nextRank = null;
    const idx = rankLevels.indexOf(result);
    if (idx < rankLevels.length - 1) {
        nextRank = rankLevels[idx + 1];
    }
    return { current: result, next: nextRank, total: total };
}

// ========== レベルシステム ==========
const levelThresholds = [
    { min: 0, max: 4, title: "はらっぱ", emoji: "🌾" },
    { min: 5, max: 9, title: "ちいさなむら", emoji: "🏘️" },
    { min: 10, max: 14, title: "にぎやかなまち", emoji: "🏙️" },
    { min: 15, max: 19, title: "すてきなみやこ", emoji: "👑" },
    { min: 20, max: 22, title: "ゆめのまち", emoji: "✨" },
];

function getCurrentLevel() {
    const effective = getEffectiveVotes();
    for (let i = levelThresholds.length - 1; i >= 0; i--) {
        if (effective >= levelThresholds[i].min) {
            return levelThresholds[i];
        }
    }
    return levelThresholds[0];
}

// 指定した総投票数時点でのレベルを返す（外部投票検知でoldLevel計算に使用）
function getLevelAtTotal(total) {
    const effective = Math.max(0, total - (cycleStartVotes || 0));
    for (let i = levelThresholds.length - 1; i >= 0; i--) {
        if (effective >= levelThresholds[i].min) return levelThresholds[i];
    }
    return levelThresholds[0];
}

// エリア別レベル（キャラ投票数ベース）
function getAreaLevel(key) {
    const v = votes[key] || 0;
    if (v >= 10) return 4;
    if (v >= 6) return 3;
    if (v >= 3) return 2;
    if (v >= 1) return 1;
    return 0;
}
