// めいすいくん総選挙 - イベントシステム
// イベントキュー、投票効果、年代イベント、埋め立て進化、ランダムイベント、レベルアップ

// ============================================
// イベントキュー（投票後のイベントを順番に表示）
// ============================================
const eventQueue = [];
let eventQueuePlaying = false;

function queueEvent(showFn) {
    eventQueue.push(showFn);
}

function playEventQueue() {
    if (eventQueuePlaying || eventQueue.length === 0) return;
    eventQueuePlaying = true;
    playNextEvent();
}

function playNextEvent() {
    if (eventQueue.length === 0) {
        eventQueuePlaying = false;
        // キュー完了 → 投票ボタン再有効化
        window.voteInProgress = false;
        const voteBtn = document.getElementById('voteBtn');
        if (voteBtn) {
            voteBtn.style.opacity = '1';
            voteBtn.style.pointerEvents = 'auto';
        }
        return;
    }
    const showFn = eventQueue.shift();
    showFn();
}

function onEventDone() {
    // イベント間の小さな間隔
    setTimeout(() => playNextEvent(), 500);
}

// ============================================
// 投票効果フィードバック表示
// ============================================
function showVoteEffect(charType) {
    const effect = charEffects[charType];
    const meta = charMetadata[charType];
    if (!effect || !meta) { onEventDone(); return; }

    // 現在のキャラ投票数（decorationOffset考慮）
    const charVotes = Math.max(0, (votes[charType] || 0) - (decorationOffset[charType] || 0));

    // 現在レベルと次レベルを算出
    let currentLevel = 0;
    for (let i = effect.thresholds.length - 1; i >= 0; i--) {
        if (charVotes >= effect.thresholds[i]) { currentLevel = i; break; }
    }
    const currentLevelName = effect.levels[currentLevel];
    const nextLevel = currentLevel < effect.levels.length - 1 ? currentLevel + 1 : null;
    const nextLevelName = nextLevel ? effect.levels[nextLevel] : null;
    const nextThreshold = nextLevel ? effect.thresholds[nextLevel] : null;

    // 進捗バー
    const prevThreshold = effect.thresholds[currentLevel];
    const range = nextThreshold ? nextThreshold - prevThreshold : 1;
    const progress = nextThreshold ? Math.min(1, (charVotes - prevThreshold) / range) : 1;
    const barFilled = Math.round(progress * 10);
    const barEmpty = 10 - barFilled;
    const progressBar = '━'.repeat(barFilled) + '░'.repeat(barEmpty);

    // 次レベルまでのメッセージ
    const remaining = nextThreshold ? nextThreshold - charVotes : 0;
    const nextMsg = nextLevelName ? `あと${remaining}票で「${nextLevelName}」！` : '🎉 最高レベル達成！';

    const content = document.createElement('div');
    content.innerHTML = `
        <div style="font-size:48px;margin-bottom:8px;">${effect.icon}</div>
        <div style="font-size:22px;font-weight:bold;margin-bottom:8px;">${effect.desc}</div>
        <div style="font-size:16px;color:#ccc;margin-bottom:4px;">いま：${currentLevelName}</div>
        <div style="font-size:20px;letter-spacing:2px;margin:8px 0;color:${meta.color};">${progressBar}</div>
        <div style="font-size:14px;color:#aaa;">${nextMsg}</div>
    `;

    playSound('event');
    pm.show('toast', content, { duration: 3000, onDone: onEventDone });
}

// ============================================
// 年代イベント表示
// ============================================
function showEraEvent(year) {
    const event = historicalEvents[year];
    if (!event) return;

    const hasBlackWater = event.special === 'blackWater';
    const yearColor = hasBlackWater ? '#888' : '#ffd700';

    // 画面揺れ + ミニフラッシュ（歴史イベントの重み）
    document.body.style.animation = 'screenShake 0.4s ease';
    setTimeout(() => { document.body.style.animation = ''; }, 400);

    const miniFlash = document.createElement('div');
    miniFlash.style.cssText = `
        position:fixed;top:0;left:0;width:100%;height:100%;z-index:450;
        pointer-events:none;background:rgba(255,255,255,0.5);
        animation:quickFlash 0.3s ease forwards;
    `;
    document.body.appendChild(miniFlash);
    setTimeout(() => miniFlash.remove(), 300);

    playSound('event');

    const content = document.createElement('div');
    content.innerHTML = `
        <div style="font-size:56px;margin-bottom:8px;">${event.emoji}</div>
        <div style="font-size:16px;color:${yearColor};margin-bottom:4px;">${year}年</div>
        <div style="font-size:24px;font-weight:bold;">${event.text}</div>
    `;

    // 黒水イベント時は特殊エフェクトも同時発動
    if (hasBlackWater) {
        showBlackWaterEffect();
    }

    const displayTime = hasBlackWater ? 7000 : 3000;
    pm.show('card', content, {
        duration: displayTime,
        onDone: onEventDone,
        cssClass: hasBlackWater ? 'popup-card-dark' : ''
    });
}

// 黒水エフェクト
function showBlackWaterEffect() {
    const blackSea = document.createElement('div');
    blackSea.style.cssText = `
        position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;
        pointer-events:none;opacity:0;
        background:linear-gradient(to top, rgba(10,5,0,0.85) 0%, rgba(20,10,5,0.6) 40%, transparent 70%);
        transition:opacity 1.5s ease;
    `;
    document.body.appendChild(blackSea);

    requestAnimationFrame(() => { blackSea.style.opacity = '1'; });

    const particleInterval = setInterval(() => {
        const drop = document.createElement('div');
        const x = Math.random() * 100;
        drop.style.cssText = `
            position:fixed;left:${x}%;bottom:0;width:6px;height:6px;
            background:rgba(20,10,5,0.8);border-radius:50%;z-index:301;
            pointer-events:none;animation:blackDrop 2s ease-in forwards;
        `;
        document.body.appendChild(drop);
        setTimeout(() => drop.remove(), 2000);
    }, 100);

    setTimeout(() => {
        clearInterval(particleInterval);
        blackSea.style.opacity = '0';
        setTimeout(() => blackSea.remove(), 1500);
    }, 6000);
}

// ============================================
// 埋め立て進化エフェクト（ポケモン進化風）
// ============================================
const reclamationStages = {
    1969: { name: '中町エリア', areas: '東野・富岡・今川・海楽・美浜・入船' },
    1979: { name: '舞浜・新町エリア', areas: '舞浜・日の出・明海・港・千鳥' },
    1989: { name: '全域', areas: '高洲 — 浦安の埋め立て完了！' },
};
let lastReclamationStage = 0;

function getReclamationStage(year) {
    if (year >= 1989) return 1989;
    if (year >= 1979) return 1979;
    if (year >= 1969) return 1969;
    return 0;
}

function checkReclamationEvolution(newYear) {
    const newStage = getReclamationStage(newYear);
    if (newStage > lastReclamationStage && newStage !== 0) {
        const stageInfo = reclamationStages[newStage];
        if (stageInfo) {
            queueEvent(() => showReclamationEvolution(stageInfo));
        }
    }
    lastReclamationStage = newStage;
}

// 埋め立て光エフェクト用（canvas描画ループで参照）
let reclamationGlowTimer = 0;

function showReclamationEvolution(stageInfo) {
    // 1. 白フラッシュ
    const flash = document.createElement('div');
    flash.style.cssText = `
        position:fixed;top:0;left:0;width:100%;height:100%;z-index:450;
        pointer-events:none;background:white;
        animation:evolutionFlash 2s ease forwards;
    `;
    document.body.appendChild(flash);

    // 2. 波紋リング
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const ring = document.createElement('div');
            ring.style.cssText = `
                position:fixed;top:50%;left:50%;width:200px;height:200px;
                border:8px solid rgba(100,200,255,0.8);border-radius:50%;
                z-index:451;pointer-events:none;
                animation:evolutionRing 1.5s ease-out forwards;
            `;
            document.body.appendChild(ring);
            setTimeout(() => ring.remove(), 1500);
        }, i * 400);
    }

    // 3. 「ぐんぐん！」テキスト
    const growText = document.createElement('div');
    growText.style.cssText = `
        position:fixed;top:50%;left:50%;z-index:452;pointer-events:none;
        font-size:64px;font-weight:900;color:white;
        text-shadow:0 0 20px rgba(100,200,255,1), 0 0 40px rgba(100,200,255,0.5);
        font-family:sans-serif;
        animation:evolutionGrow 1.5s ease forwards;
    `;
    growText.textContent = '🌳 ぐんぐん！';
    document.body.appendChild(growText);

    // 4. 2秒後: ポップ表示
    setTimeout(() => {
        flash.remove();
        growText.remove();

        const popup = document.createElement('div');
        popup.style.cssText = `
            position:fixed;top:40%;left:50%;z-index:453;pointer-events:none;
            background:linear-gradient(135deg, #1a237e, #0d47a1);
            color:white;padding:30px 50px;border-radius:20px;
            text-align:center;font-family:sans-serif;
            border:4px solid #64b5f6;
            box-shadow:0 10px 40px rgba(0,100,255,0.5);
            animation:evolutionPopText 0.6s ease forwards;
        `;
        popup.innerHTML = `
            <div style="font-size:48px;margin-bottom:10px;">🏗️</div>
            <div style="font-size:28px;font-weight:bold;margin-bottom:8px;">埋め立てで「${stageInfo.name}」ができた！</div>
            <div style="font-size:16px;color:#90caf9;">${stageInfo.areas}</div>
        `;
        document.body.appendChild(popup);

        // 5. 3.5秒後: ポップ消去 → 光エフェクト
        setTimeout(() => {
            popup.style.transition = 'opacity 0.8s, transform 0.8s';
            popup.style.opacity = '0';
            popup.style.transform = 'translateX(-50%) translateY(-30px)';
            setTimeout(() => popup.remove(), 800);

            showNewLandGlow();
            setTimeout(() => onEventDone(), 2500);
        }, 3500);
    }, 2000);
}

function showNewLandGlow() {
    reclamationGlowTimer = 2000;

    const glow = document.createElement('div');
    glow.style.cssText = `
        position:fixed;top:0;left:300px;right:0;bottom:0;z-index:300;
        pointer-events:none;opacity:0;
        background:radial-gradient(ellipse at center, rgba(255,215,0,0.4) 0%, rgba(255,215,0,0.1) 50%, transparent 80%);
    `;
    document.body.appendChild(glow);

    requestAnimationFrame(() => {
        glow.style.transition = 'opacity 0.5s';
        glow.style.opacity = '1';
    });

    // キラキラパーティクル
    for (let i = 0; i < 25; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            const x = 300 + Math.random() * (window.innerWidth - 300);
            const y = Math.random() * window.innerHeight;
            sparkle.style.cssText = `
                position:fixed;left:${x}px;top:${y}px;z-index:301;
                pointer-events:none;font-size:${16 + Math.random() * 20}px;
                color:gold;text-shadow:0 0 10px gold;
                animation:cutinSparkle 1.2s ease-in-out forwards;
            `;
            sparkle.textContent = ['✦', '✧', '⭐', '💎'][Math.floor(Math.random() * 4)];
            document.body.appendChild(sparkle);
            setTimeout(() => sparkle.remove(), 1200);
        }, i * 80);
    }

    setTimeout(() => {
        glow.style.transition = 'opacity 1s';
        glow.style.opacity = '0';
        setTimeout(() => glow.remove(), 1000);
    }, 1500);
}

// ============================================
// ランダムイベントシステム
// ============================================
let lastEventVotes = 0;

const goodEvents = [
    { name: "おまつりだ！", trigger: "random", effect: "happiness+10", probability: 0.12, emoji: "🎉" },
    { name: "あたらしいお店がオープン", trigger: "random", effect: "tax_revenue+5%", probability: 0.10, emoji: "🏪" },
    { name: "三番瀬にめずらしい鳥が来た", trigger: "votes>8", effect: "population+2", probability: 0.08, emoji: "🦅" },
    { name: "うらやすシティマラソン開催", trigger: "random", effect: "happiness+8", probability: 0.08, emoji: "🏃" },
    { name: "モルック大会 開催！", trigger: "random", effect: "happiness+15", probability: 0.10, emoji: "🪵" },
    { name: "イチョウ並木が色づいた！", trigger: "char_meisui>3", effect: "happiness+5", probability: 0.15, emoji: "🍂" },
    { name: "花畑にチョウチョが来た！", trigger: "char_tsutsuji>3", effect: "happiness+5", probability: 0.15, emoji: "🦋" },
    { name: "ビーチでイルカが見れた！", trigger: "char_meisui_chan>3", effect: "happiness+8", probability: 0.12, emoji: "🐬" },
    { name: "海がとてもきれいになった！", trigger: "char_bekabune>3", effect: "happiness+8", probability: 0.12, emoji: "🌊" },
    { name: "屋形船まつり 大盛況！", trigger: "char_asari>3", effect: "happiness+10", probability: 0.12, emoji: "🏮" },
    { name: "魚市場に大行列！", trigger: "char_ryoushi>3", effect: "happiness+10", probability: 0.12, emoji: "🐟" },
];

const challengeEvents = [
    { name: "たいふうが きた！", trigger: "random", effect: "infrastructure_decay+10", mitigation: "fire_station", probability: 0.08, emoji: "🌀" },
    { name: "えきまえが こんざつ！", trigger: "votes>8", effect: "happiness-5", mitigation: "station", probability: 0.07, emoji: "🚉" },
    { name: "こうれいかが すすんだ", trigger: "votes>12", effect: "service_demand+15%", mitigation: "hospital", probability: 0.06, emoji: "👴" },
    { name: "じしん！えきじょうかに ちゅうい", trigger: "random", effect: "infrastructure_decay+15", mitigation: "fire_station", probability: 0.04, emoji: "💥", urayasu_special: true },
    { name: "ゴミがふえてきた…", trigger: "votes>6", effect: "happiness-3", probability: 0.06, emoji: "🗑️" },
    { name: "さかなが へってきた…", trigger: "char_ryoushi>5", effect: "happiness-5", probability: 0.08, emoji: "😢" },
];

function checkEventTrigger() {
    const votesSince = totalVotes - lastEventVotes;
    if (votesSince >= 5) {
        lastEventVotes = totalVotes;
        triggerRandomEvent();
    }
}

function triggerRandomEvent() {
    const good = goodEvents.filter(e => canTriggerEvent(e));
    const bad = challengeEvents.filter(e => canTriggerEvent(e));

    const allEvents = [...good, ...bad];
    if (allEvents.length === 0) return;

    const event = allEvents[Math.floor(Math.random() * allEvents.length)];
    queueEvent(() => showEventPopup(event));
}

function canTriggerEvent(event) {
    const prob = event.probability || 0.1;
    if (event.trigger === 'random') return Math.random() < prob;
    if (event.trigger.includes('votes>')) {
        const threshold = parseInt(event.trigger.split('>')[1]);
        return getEffectiveVotes() > threshold && Math.random() < prob;
    }
    if (event.trigger.startsWith('char_')) {
        const match = event.trigger.match(/char_(\w+)>(\d+)/);
        if (match) {
            const charType = match[1];
            const threshold = parseInt(match[2]);
            const charVotes = Math.max(0, (votes[charType] || 0) - (decorationOffset[charType] || 0));
            return charVotes > threshold && Math.random() < prob;
        }
    }
    if (event.trigger.includes('population>')) {
        return Math.random() < prob;
    }
    return Math.random() < prob;
}

function showEventPopup(event) {
    playSound('event');

    const eventText = event.name.includes('た！') || event.name.includes('開催') || event.name.includes('…')
        ? event.name
        : event.name + '！';
    const emojiIcon = event.emoji || '📢';

    const content = document.createElement('div');
    content.innerHTML = `
        <div style="font-size:48px;margin-bottom:8px;">${emojiIcon}</div>
        <div style="font-size:24px;font-weight:bold;color:#f57f17;">${eventText}</div>
    `;

    pm.show('card', content, { duration: 4000, onDone: onEventDone });
}

// ============================================
// レベルアップアニメーション（全画面マイルストーン演出）
// ============================================
function showLevelUpAnimation(newLevel) {
    // 白フラッシュ
    const flash = document.createElement('div');
    flash.style.cssText = `
        position:fixed;top:0;left:0;width:100%;height:100%;z-index:9600;
        pointer-events:none;background:white;
        animation:evolutionFlash 1.5s ease forwards;
    `;
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 1500);

    playSound('levelup');

    // 全画面コンテンツ
    const content = document.createElement('div');
    content.style.cssText = 'text-align:center;';
    content.innerHTML = `
        <div style="font-size:100px;margin-bottom:16px;">${newLevel.emoji}</div>
        <div style="font-size:20px;color:#ffd700;margin-bottom:8px;">🎉 浦安が…</div>
        <div style="font-size:56px;font-weight:900;color:#fff;
            text-shadow:0 0 30px rgba(255,215,0,0.8),0 0 60px rgba(255,215,0,0.4);
            margin-bottom:16px;">
            ${newLevel.title}
        </div>
        <div style="font-size:28px;color:#ffd700;">になった！</div>
    `;

    pm.show('effect', content, { duration: 4000, onDone: onEventDone });
}
