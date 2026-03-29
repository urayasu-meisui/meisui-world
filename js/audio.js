// めいすいくん総選挙 - オーディオシステム
// 効果音（Web Audio API）+ BGM（年代別自動切替）

let audioContext = null;
let soundEnabled = true;
let masterVolume = 0.8;          // 0.0〜1.0（マスター音量）
const _BGM_MAX = 0.3;            // BGMの素の最大音量

// BGM実際の目標音量
function _bgmVol() { return _BGM_MAX * masterVolume; }

function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(soundType) {
    if (!soundEnabled) return;

    initAudioContext();
    if (!audioContext) return;
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(audioContext.destination);

    const mv = masterVolume;  // キャプチャ

    switch(soundType) {
        case 'vote':
            // 明るい上昇チャイム (C-E-G)
            osc.frequency.setValueAtTime(262, now);
            osc.frequency.setValueAtTime(330, now + 0.1);
            osc.frequency.setValueAtTime(392, now + 0.2);
            gain.gain.setValueAtTime(0.3 * mv, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
            break;
        case 'correct':
            // 正解チャイム
            osc.frequency.setValueAtTime(523, now);
            gain.gain.setValueAtTime(0.2 * mv, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
            break;
        case 'wrong':
            // 不正解ブザー
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.setValueAtTime(150, now + 0.1);
            gain.gain.setValueAtTime(0.15 * mv, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
            break;
        case 'unlock':
            // 建物アンロックファンファーレ
            osc.frequency.setValueAtTime(330, now);
            osc.frequency.setValueAtTime(440, now + 0.1);
            osc.frequency.setValueAtTime(523, now + 0.2);
            gain.gain.setValueAtTime(0.3 * mv, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
            break;
        case 'levelup':
            // レベルアップスケール
            const notes = [262, 294, 330, 349, 392, 440, 494, 523];
            for (let i = 0; i < notes.length; i++) {
                osc.frequency.setValueAtTime(notes[i], now + i * 0.08);
            }
            gain.gain.setValueAtTime(0.2 * mv, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
            osc.start(now);
            osc.stop(now + 0.7);
            break;
        case 'event':
            // イベント通知ベル
            osc.frequency.setValueAtTime(587, now);
            osc.frequency.setValueAtTime(659, now + 0.05);
            gain.gain.setValueAtTime(0.25 * mv, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
            break;
    }
}


// ============================================
// BGM System — 年代別BGM自動切替
// ============================================
const bgmTracks = {
    village: new Audio('sounds/bgm_village.mp3'),  // 1889-1959
    growth: new Audio('sounds/bgm_growth.mp3'),    // 1969-1989
    modern: new Audio('sounds/bgm_modern.mp3'),    // 1999-2069
    future: new Audio('sounds/bgm_future.mp3'),    // 2079-2100
    ending: new Audio('sounds/bgm_ending.mp3'),    // エンディング
};
// 全トラックをループ設定・音量調整
Object.values(bgmTracks).forEach(audio => {
    audio.loop = true;
    audio.volume = _bgmVol();
});

let currentBgmKey = null;
let bgmEnabled = true;

function getBgmKeyForYear(year) {
    if (year <= 1959) return 'village';
    if (year <= 1989) return 'growth';
    if (year <= 2050) return 'modern';
    return 'future';  // 2051年以降
}

// フェード用interval管理（連続呼び出しでintervalが重ならないよう追跡）
let _bgmFadeOutInterval = null;
let _bgmFadeInInterval = null;

function updateBgm() {
    if (!bgmEnabled || !soundEnabled) {
        // BGMまたはサウンドが無効 → 全停止（フェードintervalも止める）
        clearInterval(_bgmFadeOutInterval);
        clearInterval(_bgmFadeInInterval);
        _bgmFadeOutInterval = null;
        _bgmFadeInInterval = null;
        Object.values(bgmTracks).forEach(a => { a.pause(); });
        currentBgmKey = null;
        return;
    }
    // getCurrentYearはgame-logic.jsで定義（読み込み順で保証）
    const year = (typeof getCurrentYear === 'function') ? getCurrentYear() : START_YEAR;
    const newKey = getBgmKeyForYear(year);
    if (newKey === currentBgmKey) return;

    // 以前のフェードintervalを必ずクリア（連続呼び出しでの重複防止）
    clearInterval(_bgmFadeOutInterval);
    clearInterval(_bgmFadeInInterval);
    _bgmFadeOutInterval = null;
    _bgmFadeInInterval = null;

    // 現在の曲をフェードアウト
    if (currentBgmKey && bgmTracks[currentBgmKey]) {
        const oldTrack = bgmTracks[currentBgmKey];
        _bgmFadeOutInterval = setInterval(() => {
            if (oldTrack.volume > 0.05) {
                oldTrack.volume = Math.max(0, oldTrack.volume - 0.05);
            } else {
                oldTrack.pause();
                oldTrack.volume = _bgmVol();   // 次回再生用にリセット
                oldTrack.currentTime = 0;
                clearInterval(_bgmFadeOutInterval);
                _bgmFadeOutInterval = null;
            }
        }, 100);
    }

    // 新しい曲をフェードイン
    currentBgmKey = newKey;
    const newTrack = bgmTracks[newKey];
    newTrack.volume = 0;
    newTrack.play().then(() => {
        const target = _bgmVol();
        _bgmFadeInInterval = setInterval(() => {
            if (newTrack.volume < target * 0.9) {
                newTrack.volume = Math.min(target, newTrack.volume + 0.05);
            } else {
                newTrack.volume = target;
                clearInterval(_bgmFadeInInterval);
                _bgmFadeInInterval = null;
            }
        }, 100);
    }).catch(() => {
        // 自動再生ブロック → ユーザー操作時に再試行
        bgmPendingPlay = true;
    });
}

// 自動再生ブロック対策: ユーザー操作で再試行
let bgmPendingPlay = false;
// 成功後は自分自身を解除してメモリを節約
function bgmRetry() {
    if (bgmPendingPlay && currentBgmKey) {
        bgmPendingPlay = false;
        const track = bgmTracks[currentBgmKey];
        track.volume = 0;
        track.play().then(() => {
            // 再生成功 → このリスナーは不要になるので削除
            document.removeEventListener('click', bgmRetry);
            const target = _bgmVol();
            const fadeIn = setInterval(() => {
                if (track.volume < target * 0.9) {
                    track.volume = Math.min(target, track.volume + 0.05);
                } else {
                    track.volume = target;
                    clearInterval(fadeIn);
                }
            }, 100);
        }).catch(() => {
            // 再生失敗 → 次のクリックで再試行するためフラグを戻す
            bgmPendingPlay = true;
        });
    }
}
document.addEventListener('click', bgmRetry);

// ============================================
// エンディングBGM専用制御
// 通常のupdateBgm()とは独立して動作する
// ============================================
function playEndingBgm() {
    if (!soundEnabled) return;
    // 通常BGMを全停止
    Object.entries(bgmTracks).forEach(([key, audio]) => {
        if (key !== 'ending') { audio.pause(); audio.currentTime = 0; }
    });
    currentBgmKey = 'ending';
    const track = bgmTracks.ending;
    track.loop = true;
    track.volume = 0;
    track.play().then(() => {
        const target = _bgmVol();
        const fadeIn = setInterval(() => {
            if (track.volume < target * 0.95) {
                track.volume = Math.min(target, track.volume + 0.03);
            } else {
                track.volume = target;
                clearInterval(fadeIn);
            }
        }, 100);
    }).catch(() => {});
}

function stopEndingBgm() {
    const track = bgmTracks.ending;
    const fadeOut = setInterval(() => {
        if (track.volume > 0.03) {
            track.volume = Math.max(0, track.volume - 0.03);
        } else {
            track.pause();
            track.currentTime = 0;
            track.volume = _bgmVol();
            clearInterval(fadeOut);
            // エンディング終了後は通常BGMに戻す
            currentBgmKey = null;
            updateBgm();
        }
    }, 100);
}

// ============================================
// マスター音量設定（設定画面スライダーから呼ばれる）
// ============================================
function setMasterVolume(v) {
    masterVolume = Math.max(0, Math.min(1, parseFloat(v)));
    // 再生中のBGMに即時反映
    if (currentBgmKey && bgmTracks[currentBgmKey]) {
        bgmTracks[currentBgmKey].volume = _bgmVol();
    }
    // UI同期
    const slider = document.getElementById('volumeSlider');
    if (slider) slider.value = Math.round(masterVolume * 100);
    const label = document.getElementById('volumeLabel');
    if (label) label.textContent = Math.round(masterVolume * 100) + '%';
}

// サウンドトグル（BGMも連動）
function toggleSound() {
    soundEnabled = !soundEnabled;
    // 設定画面トグル同期
    const cb = document.getElementById('settingsSoundToggle');
    if (cb) cb.checked = soundEnabled;
    updateBgm();
}
