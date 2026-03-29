// ポップアップ統一管理システム
// 4層分類: effect(全画面演出), toast(上部通知), card(中央情報), modal(操作要求)
// キュー制御 + タップで次へ + 自動連鎖ハイブリッド

class PopupManager {
    constructor() {
        // 各層のキューと現在表示中の要素
        this.queues = { effect: [], toast: [], card: [], modal: [] };
        this.active = { effect: null, toast: null, card: null, modal: null };
        this.timers = { effect: null, toast: null, card: null, modal: null };
        this._overlays = {}; // modal用の暗転背景
    }

    // ポップアップを表示（同じ層に表示中があればキューに追加）
    // type: 'effect' | 'toast' | 'card' | 'modal'
    // contentEl: DOM要素（中身のコンテンツ）
    // options: { duration, onDone, overlay, tapToDismiss, cssClass }
    // キュー上限: 1層あたり最大20件（投票が連続してもキューが無限に積まれないように）
    static MAX_QUEUE = 20;

    show(type, contentEl, options = {}) {
        if (this.active[type]) {
            if (this.queues[type].length >= PopupManager.MAX_QUEUE) {
                console.warn(`⚠️ PopupManager: ${type}キューが上限(${PopupManager.MAX_QUEUE})に達しました。古いエントリを破棄します。`);
                this.queues[type].shift(); // 最古のものを1件捨てる
            }
            this.queues[type].push({ contentEl, options });
            return;
        }
        this._render(type, contentEl, options);
    }

    _render(type, contentEl, options) {
        const {
            duration = 0,
            onDone = null,
            overlay = (type === 'modal'),
            tapToDismiss = (type !== 'modal' && type !== 'effect'),
            cssClass = '',
        } = options;

        // ラッパー作成
        const wrapper = document.createElement('div');
        wrapper.className = `popup popup-${type} ${cssClass}`.trim();
        wrapper.setAttribute('data-popup-type', type);

        // コンテンツを追加
        wrapper.appendChild(contentEl);

        // タップで次へヒント（modal/effect以外）
        if (tapToDismiss && duration > 0) {
            const hint = document.createElement('div');
            hint.className = 'popup-tap-hint';
            hint.textContent = 'タップで次へ';
            wrapper.appendChild(hint);
        }

        // 入場アニメーション
        wrapper.classList.add('popup-enter');

        // 暗転背景（modal用）
        if (overlay) {
            const bg = document.createElement('div');
            bg.className = 'popup-overlay';
            bg.setAttribute('data-popup-type', type);
            document.body.appendChild(bg);
            this._overlays[type] = bg;
        }

        document.body.appendChild(wrapper);
        this.active[type] = { el: wrapper, options, onDone };

        // タップで即消去（touchend + click 両対応、二重発火防止）
        if (tapToDismiss) {
            let dismissed = false;
            const onDismissTap = (e) => {
                if (dismissed) return;
                dismissed = true;
                e.preventDefault();
                this.dismiss(type);
            };
            wrapper.addEventListener('touchend', onDismissTap, { once: true, passive: false });
            wrapper.addEventListener('click', onDismissTap, { once: true });
        }

        // 自動消去タイマー
        if (duration > 0) {
            this.timers[type] = setTimeout(() => {
                this.dismiss(type);
            }, duration);
        }
    }

    // 退場アニメーション → 削除 → コールバック → キューの次へ
    dismiss(type) {
        const info = this.active[type];
        if (!info) return;

        // タイマークリア
        if (this.timers[type]) {
            clearTimeout(this.timers[type]);
            this.timers[type] = null;
        }

        const el = info.el;
        const onDone = info.onDone;

        // 退場アニメーション
        el.classList.remove('popup-enter');
        el.classList.add('popup-exit');

        // 暗転背景もフェードアウト
        if (this._overlays[type]) {
            this._overlays[type].classList.add('popup-overlay-exit');
        }

        setTimeout(() => {
            el.remove();
            // 暗転背景削除
            if (this._overlays[type]) {
                this._overlays[type].remove();
                delete this._overlays[type];
            }

            this.active[type] = null;

            // コールバック実行
            if (onDone) onDone();

            // キューの次を表示
            if (this.queues[type].length > 0) {
                const next = this.queues[type].shift();
                this._render(type, next.contentEl, next.options);
            }
        }, 300); // 退場アニメーション時間
    }

    // 特定層のキューをクリア
    clear(type) {
        this.queues[type] = [];
        if (this.active[type]) {
            this.dismiss(type);
        }
    }

    // modal層をプログラムから閉じる（クイズ回答時など）
    dismissModal() {
        this.dismiss('modal');
    }
}

// グローバルインスタンス
const pm = new PopupManager();
