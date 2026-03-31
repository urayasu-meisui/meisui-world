// めいすいくん総選挙 - ゲームロジック
// 年代計算、レベルシステム、ランクシステム、歴史イベント定義

// ========== 年代システム (1889-2100, 3票=1ステップ) ==========
// Step 0: 1889-1900, Step 1: 1901-1910, ..., Step 20: 2091-2100 → 全21ステップ
const VOTES_PER_ADVANCE = 3;   // 何票溜まったら次のステップへ
const TOTAL_STEPS = 21;        // 全21ステップ（0〜20）
const VOTES_PER_CYCLE = VOTES_PER_ADVANCE * TOTAL_STEPS;  // 63票で1サイクル

function getEffectiveVotes() {
    return Math.max(0, totalVotes - cycleStartVotes);
}

// ステップ数（0〜20+）
function getYearSteps() {
    return Math.floor(getEffectiveVotes() / VOTES_PER_ADVANCE);
}

// 現在の年代の開始年を返す
function getCurrentYear() {
    const steps = getYearSteps();
    if (steps >= TOTAL_STEPS) return END_YEAR;
    if (steps === 0) return 1889;
    return 1901 + (steps - 1) * 10;
}

// 現在の年代の終了年を返す
function getCurrentYearEnd() {
    const steps = getYearSteps();
    if (steps >= TOTAL_STEPS) return END_YEAR;
    if (steps === 0) return 1900;
    return 1910 + (steps - 1) * 10;
}

function getWorldLine() {
    return (worldLineOffset || 0) + 1;
}

function isEndingTrigger() {
    return getYearSteps() >= TOTAL_STEPS;
}

// 次のステップまであと何票か（0〜2）
function getAdvanceCounter() {
    return getEffectiveVotes() % VOTES_PER_ADVANCE;
}

// ========== 歴史イベント定義 ==========
const historicalEvents = {
    // Step 0: 1889-1900
    1889: {text: '浦安村 誕生 — 堀江・猫実・当代島の3村が合併', emoji: '🏘️'},
    // Step 1: 1901-1910
    1901: {text: 'べか舟漁 最盛期 — 海苔とあさりで浦安は活気づく', emoji: '⛵'},
    // Step 2: 1911-1920
    1911: {text: '浦安町に昇格', emoji: '🏛️'},
    // Step 2: 1921-1930
    1921: {text: '山本周五郎が浦安に移住 — のちに名作『青べか物語』の舞台に', emoji: '📖'},
    // Step 3: 1931-1940
    1931: {text: '浦安橋 開通！ 東京への道がひらけた。境川にはべか舟が千艘', emoji: '🌉'},
    // Step 4: 1941-1950
    1941: {text: 'キティ台風 襲来！ 堤防14か所が決壊、町の7割が浸水…', emoji: '🌀'},
    // Step 5: 1951-1960
    1951: {text: '黒い水事件 — 本州製紙の排水で海が真っ黒に。漁民800人が国会に陳情', emoji: '🖤', special: 'blackWater'},
    // Step 6: 1961-1970
    1961: {text: 'オリエンタルランド設立！ 夢の王国への第一歩がはじまる', emoji: '🏰'},
    // Step 7: 1971-1980
    1971: {text: '漁業権全面放棄… 300年続いた漁師町の歴史に幕。埋め立てで面積4倍に', emoji: '🏗️'},
    // Step 8: 1981-1990
    1981: {text: '浦安市 誕生！ 図書館が1人あたり貸出冊数11.4冊で日本一を達成', emoji: '📚'},
    // Step 9: 1991-2000
    1991: {text: '浦安鉄筋家族 連載開始！ 人口15万人突破、住みたい街ランキング上位に', emoji: '📺'},
    // Step 10: 2001-2010
    2001: {text: 'ディズニーランド成人式！ 新成人4人の直談判で実現。出席率55%→72%に', emoji: '🎓'},
    // Step 11: 2011-2020
    2011: {text: '東日本大震災 — 液状化の砂7.5万m³（プール150杯分）が噴出…', emoji: '💔'},
    // Step 12: 2021-2030
    2021: {text: '浦安最後の銭湯が閉店… 三番瀬の自然再生プロジェクト開始！', emoji: '♨️'},
    // Step 13: 2031-2040
    2031: {text: '浦安スマートシティ計画 — 自動運転バスが走り出す', emoji: '🚌'},
    // Step 14: 2041-2050
    2041: {text: '葛西に橋が架かった！ 東京湾岸エリアが一体化', emoji: '🌉'},
    // Step 15: 2051-2060
    2051: {text: '浦安 海上ソーラー発電 稼働！ エネルギー自給率100%', emoji: '☀️'},
    // Step 16: 2061-2070
    2061: {text: '浦安↔新浦安 ロープウェイ開通！', emoji: '🚡'},
    // Step 17: 2071-2080
    2071: {text: '海底トンネルで千葉と神奈川が直結！', emoji: '🚇'},
    // Step 18: 2081-2090
    2081: {text: '海上都市計画 始動！ 東京湾に浮かぶ街', emoji: '🏙️'},
    // Step 19: 2091-2100
    2091: {text: '未来都市うらやす 完成間近！', emoji: '🌟'},
};

// ========== ランクシステム ==========
const rankLevels = [
    { min: 0, rank: 'F', title: '田舎の漁村', color: '#999', star: '☆', desc: 'のどかな浦安…投票で街を発展させよう！' },
    { min: 6, rank: 'E', title: 'ちいさな集落', color: '#88aacc', star: '⭐', desc: '少しずつ人が集まり始めた' },
    { min: 15, rank: 'D', title: 'のどかな町', color: '#66bb6a', star: '⭐⭐', desc: '町に活気が出てきた！' },
    { min: 27, rank: 'C', title: '発展する港町', color: '#42a5f5', star: '⭐⭐⭐', desc: '商業と観光が盛り上がってきた！' },
    { min: 39, rank: 'B', title: 'にぎわう観光都市', color: '#ffa726', star: '⭐⭐⭐⭐', desc: '浦安は観光名所に！' },
    { min: 52, rank: 'A', title: '輝く海辺の楽園', color: '#ef5350', star: '⭐⭐⭐⭐⭐', desc: '自然と商業が調和する理想の街！' },
    { min: 63, rank: 'S', title: '伝説のめいすいくんワールド', color: '#e040fb', star: '🌟🌟🌟🌟🌟', desc: '全てが揃った究極の浦安！' },
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
    { min: 0, max: 14, title: "はらっぱ", emoji: "🌾" },
    { min: 15, max: 29, title: "ちいさなむら", emoji: "🏘️" },
    { min: 30, max: 44, title: "にぎやかなまち", emoji: "🏙️" },
    { min: 45, max: 59, title: "すてきなみやこ", emoji: "👑" },
    { min: 57, max: 63, title: "ゆめのまち", emoji: "✨" },
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
