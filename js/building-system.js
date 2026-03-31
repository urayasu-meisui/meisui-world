// めいすいくん総選挙 - 建物解放システム
// 建物リスト定義、アンロック判定、Firebase同期、通知表示

// ========== 建物リスト（累計票数で発動） ==========
const buildingsList = [
    // 序盤（1〜5票）
    { id: "house", name: "おうち", unlock_votes: 1, category: "住居", emoji: "🏠" },
    { id: "school", name: "がっこう", unlock_votes: 3, category: "教育", emoji: "🏫" },
    // 中盤（5〜12票）
    { id: "park", name: "こうえん", unlock_votes: 5, category: "環境", emoji: "🌳" },
    { id: "library", name: "としょかん", unlock_votes: 7, category: "文化", emoji: "📚" },
    { id: "hospital", name: "びょういん", unlock_votes: 9, category: "医療", emoji: "🏥" },
    { id: "station", name: "えき", unlock_votes: 11, category: "交通", emoji: "🚉" },
    // 後半（13〜20票）
    { id: "fire_station", name: "しょうぼうしょ", unlock_votes: 13, category: "防災", emoji: "🚒" },
    { id: "community_center", name: "こうみんかん", unlock_votes: 15, category: "交流", emoji: "🏛️" },
    { id: "museum", name: "はくぶつかん", unlock_votes: 17, category: "文化", emoji: "🏛️" },
    { id: "city_hall", name: "しやくしょ", unlock_votes: 19, category: "行政", emoji: "🏢" },
    // 終盤（20〜22票）
    { id: "cultural_hall", name: "ぶんかかいかん", unlock_votes: 20, category: "文化", emoji: "🎭" },
    { id: "sanbanze", name: "さんばんせかんさつかん", unlock_votes: 12, category: "自然", emoji: "🌊", special: true },
    // 浦安文化（累計票数ベース）
    { id: "tamagofry", name: "たまごフライやたい", unlock_votes: 10, category: "食文化", emoji: "🍳" },
    { id: "pocket_cinema", name: "ポケットシネマ", unlock_votes: 16, category: "文化", emoji: "🎬" },
    { id: "kyodo_museum", name: "きょうどはくぶつかん", unlock_votes: 22, category: "文化", emoji: "🏛️" },
];

// ========== キャラ別建物（各キャラへの投票数で発動） ==========
const charBuildingsList = [
    // イチョウめいすいくん → 公園（3つ揃うとモルック大会）
    { id: "meisui_park1", name: "めいすいこうえん", char: "meisui", unlock_votes: 3, emoji: "🌳" },
    { id: "meisui_park2", name: "イチョウひろば", char: "meisui", unlock_votes: 6, emoji: "🌿" },
    { id: "meisui_park3", name: "もりのこうえん", char: "meisui", unlock_votes: 9, emoji: "🏕️" },
    // ツツジめいちゃん → お花屋さん・お花畑
    { id: "flower_shop", name: "おはなやさん", char: "tsutsuji", unlock_votes: 3, emoji: "💐" },
    { id: "flower_field", name: "おはなばたけ", char: "tsutsuji", unlock_votes: 6, emoji: "🌸" },
    { id: "flower_garden", name: "はなぞのガーデン", char: "tsutsuji", unlock_votes: 9, emoji: "🌺" },
    // ビーナスめいちゃん → 観光・リゾート
    { id: "beach_house", name: "うみのいえ", char: "meisui_chan", unlock_votes: 2, emoji: "🏖️" },
    { id: "hotel", name: "ホテル", char: "meisui_chan", unlock_votes: 5, emoji: "🏨" },
    { id: "aquarium", name: "すいぞくかん", char: "meisui_chan", unlock_votes: 8, emoji: "🐠" },
    // 海めいすいくん → 海・環境
    { id: "fishing_pier", name: "つりばし", char: "bekabune", unlock_votes: 2, emoji: "🎣" },
    { id: "marine_center", name: "うみのセンター", char: "bekabune", unlock_votes: 5, emoji: "🐬" },
    { id: "coral_reef", name: "サンゴしょう", char: "bekabune", unlock_votes: 8, emoji: "🪸" },
    // 屋形船めいすいくん → 伝統・文化
    { id: "shrine", name: "じんじゃ", char: "asari", unlock_votes: 2, emoji: "⛩️" },
    { id: "festival_hall", name: "おまつりかいかん", char: "asari", unlock_votes: 5, emoji: "🏮" },
    { id: "fireworks_spot", name: "はなびスポット", char: "asari", unlock_votes: 8, emoji: "🎆" },
    // 屋形船めいすいくん → 焼きあさり屋台
    { id: "yakiasari", name: "やきあさりやたい", char: "asari", unlock_votes: 4, emoji: "🫘" },
    // 漁師めいすいくん → 商業・産業 + べか舟工房
    { id: "fish_shop", name: "さかなや", char: "ryoushi", unlock_votes: 2, emoji: "🐟" },
    { id: "bekabune_kobo", name: "べかぶねこうぼう", char: "ryoushi", unlock_votes: 4, emoji: "🛶" },
    { id: "market", name: "いちば", char: "ryoushi", unlock_votes: 5, emoji: "🏪" },
    { id: "port", name: "みなと", char: "ryoushi", unlock_votes: 8, emoji: "⚓" },
];

// ========== クロスキャラ連動イベント（複数キャラへの投票で発動） ==========
const crossCharEvents = [
    {
        id: 'onsen_sauna',
        emoji: '♨️',
        title: '浦安ヘルスセンター 日の出に開業！',
        flavor: '日の出の地下から温泉が湧いた！\n「浦安ヘルスセンター」ここに開業。\nフィンランド式サウナも完備。ととのったー！🧖',
        conditions: { meisui: 3, bekabune: 3 },
    },
    {
        id: 'molkky_urayasu',
        emoji: '🪵',
        title: '浦安モルック協会 設立！',
        flavor: '公園にスキットルの音が響く！\n浦安モルック協会が設立された。\nさぁ、投げるよ！',
        conditions: { meisui: 5, asari: 3, tsutsuji: 2 },
    },
    {
        id: 'molkky_chiba',
        emoji: '🏅',
        title: '千葉県モルック協会 設立！',
        flavor: '浦安から千葉県全域へ！\n千葉県モルック協会が設立。\nモルック旋風が吹き荒れる！🌀',
        conditions: { meisui: 7, asari: 5, ryoushi: 3 },
    },
    {
        id: 'molkky_world',
        emoji: '🌍',
        title: 'モルック世界大会 開催！',
        flavor: '浦安に世界中のモルッカーが集結！\nWORLD MÖLKKY CHAMPIONSHIP\nIN URAYASU！🏆',
        // 4キャラ以上が各5票以上
        conditions: { _minChars: 4, _minVotes: 5 },
    },
    {
        id: 'molkky_olympic',
        emoji: '🥇',
        title: 'モルックがオリンピック競技に！',
        flavor: '速報：モルックがオリンピック正式競技に決定！\n浦安が聖地に。\n全キャラの力が世界を動かした！🔥',
        // 全6キャラ各5票以上
        conditions: { _minChars: 6, _minVotes: 5 },
    },
    // ===== 浦安文化系クロスキャライベント =====
    {
        id: 'bekabune_race',
        emoji: '🛶',
        title: 'べか舟レース 開催！',
        flavor: '境川にべか舟が復活！\n漁師の魂が水面を駈ける。\nはええとこ漕がねと、干上がっちゃに！',
        conditions: { ryoushi: 5, bekabune: 5 },
    },
    {
        id: 'sanja_matsuri',
        emoji: '⛩️',
        title: '浦安三社祭 復活！',
        flavor: 'まえだー！まえだー！\n100基の神輿が街を揺らす。\n地すり・揉み・差し・放り！暴れすぎ注意！🏮',
        conditions: { asari: 6, meisui: 4, tsutsuji: 3 },
    },
    {
        id: 'library_nihonichi',
        emoji: '📚',
        title: '図書館が日本一に！',
        flavor: '市民1人あたり貸出冊数11.4冊！\n日本初の2桁突破！\nみんなの力で文化の街になった。',
        conditions: { _minChars: 6, _minVotes: 3 },
    },
    {
        id: 'orlando_sister',
        emoji: '🌴',
        title: '姉妹都市オーランド！',
        flavor: 'ディズニーが結んだ縁。\nフロリダから「友好の翼」が届いた！\n世界に2つだけのディズニーリゾート都市🏰',
        conditions: { meisui_chan: 7, _minChars: 4, _minVotes: 4 },
    },
];

// クロスキャラ条件の判定
function checkCrossCharCondition(conditions) {
    // 特殊条件: _minChars / _minVotes（N キャラ以上が各M票以上）
    if (conditions._minChars) {
        const minV = conditions._minVotes || 1;
        const minC = conditions._minChars;
        let count = 0;
        CHAR_TYPES.forEach(t => {
            const cv = Math.max(0, (votes[t] || 0) - (cycleStartPerChar[t] || 0));
            if (cv >= minV) count++;
        });
        if (count < minC) return false;
    }
    // 個別キャラ条件: { charType: minVotes, ... }（_で始まるキーはスキップ）
    return Object.entries(conditions).every(([key, minVotes]) => {
        if (key.startsWith('_')) return true; // 特殊キーはスキップ
        const cv = Math.max(0, (votes[key] || 0) - (cycleStartPerChar[key] || 0));
        return cv >= minVotes;
    });
}

// クロスキャライベント表示
function showCrossCharEvent(event) {
    // 温泉イベントは専用演出
    if (event.id === 'onsen_sauna') {
        showOnsenEvent(event);
        return;
    }
    playSound('event');
    const content = document.createElement('div');
    content.innerHTML = `
        <div style="font-size:36px;margin-bottom:6px;">${event.emoji}</div>
        <div style="font-size:24px;font-weight:900;color:#ffd700;text-shadow:0 0 15px rgba(255,215,0,0.8);">
            ${event.title}
        </div>
        <div style="font-size:15px;color:#fff;margin-top:10px;line-height:1.8;white-space:pre-line;">
            ${event.flavor}
        </div>
    `;
    pm.show('toast', content, { duration: 6000, onDone: onEventDone });
}

// 温泉吹き出し演出
function showOnsenEvent(event) {
    playSound('event');

    // CSSアニメーション追加（1回だけ）
    if (!document.getElementById('onsenStyle')) {
        const style = document.createElement('style');
        style.id = 'onsenStyle';
        style.textContent = `
            @keyframes onsenRise {
                0%   { transform: translateY(0) scale(1); opacity: 0.9; }
                60%  { opacity: 0.7; }
                100% { transform: translateY(-110vh) scale(1.5); opacity: 0; }
            }
            @keyframes onsenBurst {
                0%   { transform: scale(0) translateY(0); opacity: 0; }
                15%  { transform: scale(1.2) translateY(-30px); opacity: 1; }
                30%  { transform: scale(1) translateY(0); opacity: 1; }
                100% { transform: scale(1) translateY(0); opacity: 1; }
            }
            @keyframes onsenSteam {
                0%   { transform: translateY(0) scaleX(1); opacity: 0.5; }
                50%  { transform: translateY(-40px) scaleX(1.3); opacity: 0.3; }
                100% { transform: translateY(-80px) scaleX(1.6); opacity: 0; }
            }
        `;
        document.body.appendChild(style);
    }

    // 全画面オーバーレイ
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position:fixed;top:0;left:0;width:100%;height:100%;z-index:8500;
        pointer-events:none;overflow:hidden;
    `;

    // 温泉の水柱（画面下から吹き出す）
    for (let i = 0; i < 25; i++) {
        const drop = document.createElement('div');
        const x = 35 + Math.random() * 30; // 画面中央寄り
        const delay = Math.random() * 1.5;
        const dur = 2 + Math.random() * 1.5;
        const size = 20 + Math.random() * 30;
        drop.textContent = ['💧','♨️','💦','🫧'][Math.floor(Math.random() * 4)];
        drop.style.cssText = `
            position:absolute;bottom:-50px;left:${x}%;font-size:${size}px;
            animation:onsenRise ${dur}s ${delay}s ease-out both;
        `;
        overlay.appendChild(drop);
    }

    // 湯気（左右にゆらゆら）
    for (let i = 0; i < 8; i++) {
        const steam = document.createElement('div');
        const x = 30 + Math.random() * 40;
        const delay = 0.5 + Math.random() * 2;
        steam.textContent = '〜';
        steam.style.cssText = `
            position:absolute;bottom:30%;left:${x}%;font-size:${40 + Math.random() * 30}px;
            color:rgba(255,255,255,0.5);
            animation:onsenSteam ${2 + Math.random()}s ${delay}s ease-out both;
        `;
        overlay.appendChild(steam);
    }

    document.body.appendChild(overlay);

    // テキストカード（吹き出し後に表示）
    setTimeout(() => {
        const card = document.createElement('div');
        card.style.cssText = `
            position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0);
            z-index:8600;text-align:center;pointer-events:none;
            font-family:'BIZ UDGothic','Yu Gothic UI','Hiragino Sans','Meiryo',sans-serif;
            animation:onsenBurst 0.8s ease forwards;
        `;
        card.innerHTML = `
            <div style="background:rgba(0,0,0,0.75);border-radius:24px;padding:30px 40px;
                border:3px solid #ff9800;box-shadow:0 0 40px rgba(255,152,0,0.5);">
                <div style="font-size:64px;margin-bottom:10px;">♨️</div>
                <div style="font-size:32px;font-weight:900;color:#ff9800;
                    text-shadow:0 0 20px rgba(255,152,0,0.8);margin-bottom:16px;">
                    ${event.title}
                </div>
                <div style="font-size:18px;color:#fff;line-height:2.0;white-space:pre-line;">
                    ${event.flavor}
                </div>
            </div>
        `;
        document.body.appendChild(card);

        // 6秒後にフェードアウト
        setTimeout(() => {
            card.style.transition = 'opacity 0.8s';
            card.style.opacity = '0';
            overlay.style.transition = 'opacity 0.8s';
            overlay.style.opacity = '0';
            setTimeout(() => {
                card.remove();
                overlay.remove();
                onEventDone();
            }, 800);
        }, 5000);
    }, 1200);
}

// 建設済み建物リスト（localStorageから復元）
// try-catch: 保存データが破損していても確実に空配列で起動できるようにする
let builtBuildings = [];
try {
    builtBuildings = JSON.parse(localStorage.getItem('meisui_builtBuildings') || '[]');
    if (!Array.isArray(builtBuildings)) builtBuildings = [];
} catch (e) {
    console.warn('建物データの読み込み失敗（データリセット）:', e);
    builtBuildings = [];
    localStorage.removeItem('meisui_builtBuildings');
}

// Firebase同期: 建物アンロック状態を全端末で共有
firebaseDb.ref('stats/builtBuildings').on('value', snap => {
    const data = snap.val();
    if (data && Array.isArray(data)) {
        builtBuildings = data;
        localStorage.setItem('meisui_builtBuildings', JSON.stringify(builtBuildings));
    }
});

// 初回ロード時に建物状態を静かに同期（通知なし）
function silentBuildingSync() {
    const effective = getEffectiveVotes();
    let changed = false;
    buildingsList.forEach(b => {
        if (effective >= b.unlock_votes && !builtBuildings.includes(b.id)) {
            builtBuildings.push(b.id);
            changed = true;
        }
    });
    charBuildingsList.forEach(b => {
        const cv = Math.max(0, (votes[b.char] || 0) - (cycleStartPerChar[b.char] || 0));
        if (cv >= b.unlock_votes && !builtBuildings.includes(b.id)) {
            builtBuildings.push(b.id);
            changed = true;
        }
    });
    // クロスキャラ連動イベントの静音同期
    crossCharEvents.forEach(evt => {
        if (!builtBuildings.includes(evt.id) && checkCrossCharCondition(evt.conditions)) {
            builtBuildings.push(evt.id);
            changed = true;
        }
    });
    if (changed) {
        localStorage.setItem('meisui_builtBuildings', JSON.stringify(builtBuildings));
        saveBuildingsToFirebase();
    }
}

function saveBuildingsToFirebase() {
    firebaseDb.ref('stats/builtBuildings').set(builtBuildings).catch(err => {
        console.error('建物同期失敗:', err);
    });
}

function checkBuildingUnlock() {
    // エンディング中は建物通知をスキップ（ポップアップ重複防止）
    const suppressNotify = (typeof endingActive !== 'undefined' && endingActive);
    const effective = getEffectiveVotes();
    let newUnlock = false;

    // 累計票数ベースの建物
    buildingsList.forEach(building => {
        if (effective >= building.unlock_votes && !builtBuildings.includes(building.id)) {
            builtBuildings.push(building.id);
            newUnlock = true;
            if (!suppressNotify) queueEvent(() => showBuildingNotification(building));
        }
    });

    // キャラ別票数ベースの建物
    charBuildingsList.forEach(building => {
        const charVotes = Math.max(0, (votes[building.char] || 0) - (cycleStartPerChar[building.char] || 0));
        if (charVotes >= building.unlock_votes && !builtBuildings.includes(building.id)) {
            builtBuildings.push(building.id);
            newUnlock = true;
            if (!suppressNotify) {
                const meta = charMetadata[building.char];
                queueEvent(() => showBuildingNotification({
                    ...building,
                    charName: meta ? meta.name : '',
                    charColor: meta ? meta.color : '#ffd700'
                }));
            }
        }
    });

    // モルック大会開催（meisui公園3つ完成時）
    const meisuiParks = ['meisui_park1', 'meisui_park2', 'meisui_park3'];
    if (meisuiParks.every(id => builtBuildings.includes(id)) && !builtBuildings.includes('molkky_event')) {
        builtBuildings.push('molkky_event');
        newUnlock = true;
        if (!suppressNotify) queueEvent(() => showMolkkyEvent());
    }

    // クロスキャラ連動イベント（複数キャラの投票条件）
    crossCharEvents.forEach(evt => {
        if (!builtBuildings.includes(evt.id) && checkCrossCharCondition(evt.conditions)) {
            builtBuildings.push(evt.id);
            newUnlock = true;
            if (!suppressNotify) queueEvent(() => showCrossCharEvent(evt));
        }
    });

    if (newUnlock) {
        localStorage.setItem('meisui_builtBuildings', JSON.stringify(builtBuildings));
        saveBuildingsToFirebase();
    }
}

// モルック大会開催イベント
function showMolkkyEvent() {
    playSound('event');
    const content = document.createElement('div');
    content.innerHTML = `
        <div style="font-size:28px;font-weight:900;color:#ffd700;text-shadow:0 0 15px rgba(255,215,0,0.8);">
            🏆 モルック大会 開催！
        </div>
        <div style="font-size:16px;color:#fff;margin-top:8px;">
            3つの公園が完成して<br>モルック大会ができるようになった！
        </div>
    `;
    pm.show('toast', content, { duration: 5000, onDone: onEventDone });
}

function showBuildingNotification(building) {
    playSound('unlock');

    const emojiIcon = building.emoji || '🏗️';
    const charLine = building.charName
        ? `<div style="font-size:14px;color:#aaa;margin-top:4px;">${esc(building.charName)}の力で建設！</div>`
        : '';

    const content = document.createElement('div');
    content.innerHTML = `
        <div style="font-size:24px;font-weight:bold;color:#fff;">
            ${esc(emojiIcon)} ${esc(building.name)}が たった！
        </div>
        ${charLine}
    `;

    pm.show('toast', content, { duration: 3000, onDone: onEventDone });
}
