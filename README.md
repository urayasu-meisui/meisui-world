# ご当地めいすいくん総選挙 - マルチデバイス投票システム

Firebase Realtime Database を使用したリアルタイム選挙投票システムです。複数のiPadから同時に投票でき、55インチモニターにリアルタイムで結果が表示されます。

## ファイル構成

### 1. `vote.html` (iPad投票画面)
3台のiPadで表示する投票インターフェース。

**特徴:**
- 6つのキャラクターカード（2x3グリッド）
- タッチフレンドリーな大型ボタン（最小80px高さ）
- リアルタイム投票数更新
- 投票後の感謝メッセージ表示（2秒間）
- 接続状態インジケーター
- レスポンシブデザイン（ポートレート/ランドスケープ対応）
- リセット機能（確認ダイアログ付き）

**キャラクター:**
| 名前 | キー | 絵文字 | 色 |
|---|---|---|---|
| イチョウめいすいくん | meisui | 🌳 | #ffd700 |
| ツツジめいちゃん | tsutsuji | 🌺 | #e040fb |
| ビーナスめいちゃん | meisui_chan | 🏖️ | #ff6b6b |
| 浦安の海めいすいくん | bekabune | 🐬 | #42a5f5 |
| 屋形船めいすいくん | asari | 🏮 | #ff8a65 |
| 漁師めいすいくん | ryoushi | 🐟 | #66bb6a |

**ファイルサイズ:** 12KB

### 2. `display.html` (55インチモニター表示画面)
選挙結果をリアルタイムで表示する大画面用インターフェース。

**特徴:**
- フルスクリーン対応（1920x1080）
- アニメーション付きワールドマップ
  - 浮遊するキャラクターアイコン
  - 桜のパーティクルエフェクト
  - 昼夜サイクルアニメーション
  - 雲のフローティング
- リアルタイム順位表（👑🥈🥉メダル付き）
- 投票率バーチャート
- 総投票数表示
- 町ランク計算（F～S）
  - 計算式：(投票数 × 17) / 171,322 × 100%
- 投票時のフラッシュアニメーション
- フルスクリーンボタン
- 接続状態インジケーター

**ファイルサイズ:** 20KB

### 3. `index.html` (ランディングページ)
両画面へのリンクを提供するウェルカムページ。

**機能:**
- vote.htmlへのリンク（iPad用）
- display.htmlへのリンク（モニター用）
- システム説明
- 機能紹介

**ファイルサイズ:** 4KB

## Firebase設定

### プロジェクト情報
- **プロジェクトID:** meisui-world
- **データベースURL:** https://meisui-world-default-rtdb.firebaseio.com

### APIキー
```
AIzaSyCitq3ZmZ2lbF_mPSermXvbEE77X0jJW2o
```

### 認証ドメイン
```
meisui-world.firebaseapp.com
```

## データベース構造

```json
{
  "votes": {
    "meisui": 0,
    "tsutsuji": 0,
    "meisui_chan": 0,
    "bekabune": 0,
    "asari": 0,
    "ryoushi": 0
  }
}
```

## Firebase機能

### 投票処理（トランザクション）
```javascript
const voteRef = database.ref(`votes/${characterKey}`);
voteRef.transaction(current => {
  return (current || 0) + 1;
});
```

### リアルタイムリスナー
```javascript
database.ref('votes').on('value', snapshot => {
  const data = snapshot.val() || {};
  // UI更新処理
});
```

### 接続状態監視
```javascript
database.ref('.info/connected').on('value', snapshot => {
  isOnline = snapshot.val();
});
```

## GitHub Pages デプロイ手順

### 1. リポジトリへのプッシュ

```bash
cd github-deploy/
git branch -M main
git push -u origin main
```

### 2. GitHub Pages設定
1. GitHub上でリポジトリを開く
2. Settings → Pages
3. Build and deployment セクション
4. Source: Deploy from a branch
5. Branch: main, folder: / (root)
6. Save をクリック

### 3. アクセス

デプロイ後、以下のURLでアクセス可能になります：
- **ランディングページ:** https://kkendoh-ctrl.github.io/meisui-world/
- **投票画面:** https://kkendoh-ctrl.github.io/meisui-world/vote.html
- **表示画面:** https://kkendoh-ctrl.github.io/meisui-world/display.html

## 使用方法

### iPad (vote.html)
1. 各デバイスで vote.html を開く
2. キャラクターの「投票する」ボタンをタップ
3. 「投票ありがとう！」メッセージが表示される
4. 自動的に投票画面に戻る
5. 投票数がリアルタイムで更新される

### モニター (display.html)
1. display.html を開く
2. 「フルスクリーン」ボタンでフルスクリーン表示
3. リアルタイムで以下が更新される：
   - キャラクター順位
   - 投票数とグラフ
   - 町ランク

## 技術仕様

### 使用技術
- HTML5
- CSS3（グラデーション、アニメーション、レスポンシブデザイン）
- JavaScript（バニラ、フレームワークなし）
- Firebase Realtime Database（compat SDK）

### ブラウザ互換性
- Chrome/Chromium 最新版
- Safari 最新版
- Edge 最新版

### パフォーマンス
- ファイルサイズ：36KB合計（圧縮前）
- 外部依存：Firebase CDN のみ
- ローディング時間：即座（キャッシュ有効時）

## リセット機能

vote.html の右下にある「0票に戻す」ボタンで全投票数をリセット可能です。
確認ダイアログが表示されます。

## セキュリティに関する注意

このシステムは以下を前提としています：
- **Firebase Realtime Database は認証なしの読み取り/書き込みを許可**
- 本番環境では適切なセキュリティルールを設定してください

Firebase コンソールのセキュリティルールの例：
```json
{
  "rules": {
    "votes": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

## トラブルシューティング

### 投票がうまくいかない
- ブラウザのコンソール（F12）でエラーを確認
- Firebase の接続状態（赤点）を確認
- ネットワーク接続を確認

### データが更新されない
- ブラウザをリロード
- ネットワーク遅延の可能性（数秒待機）
- Firebase コンソールでデータベース内容を確認

### 表示画面が反応しない
- ブラウザをリロード
- ブラウザのコンソールでエラーを確認
- JavaScript が有効になっているか確認

## カスタマイズ

### キャラクターの追加/変更
`vote.html` と `display.html` の `characters` 配列を編集：

```javascript
const characters = [
  { key: 'character_id', name: '表示名', icon: '絵文字', color: '#色コード' },
  // ...
];
```

### 色の変更
CSS の色コード、または HTML 内の `--color-*` 変数を編集

### テキストの変更
各 HTML ファイル内のテキストを直接編集

## ライセンス

© 2026 浦安市（Urayasu City）

## サポート

問題が発生した場合は、GitHub Issues を作成してください。

---

**最終更新日：2026年3月18日**
