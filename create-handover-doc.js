const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
        ShadingType, PageNumber, PageBreak, LevelFormat } = require('docx');
const fs = require('fs');

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

function headerCell(text, width) {
    return new TableCell({
        borders, width: { size: width, type: WidthType.DXA },
        shading: { fill: "1565C0", type: ShadingType.CLEAR },
        margins: cellMargins,
        children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF", font: "Arial", size: 20 })] })]
    });
}
function cell(text, width) {
    return new TableCell({
        borders, width: { size: width, type: WidthType.DXA },
        margins: cellMargins,
        children: [new Paragraph({ children: [new TextRun({ text, font: "Arial", size: 20 })] })]
    });
}

function makeTable(headers, rows, widths) {
    const totalW = widths.reduce((a, b) => a + b, 0);
    return new Table({
        width: { size: totalW, type: WidthType.DXA },
        columnWidths: widths,
        rows: [
            new TableRow({ children: headers.map((h, i) => headerCell(h, widths[i])) }),
            ...rows.map(row => new TableRow({
                children: row.map((c, i) => cell(c, widths[i]))
            }))
        ]
    });
}

function h1(text) {
    return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 200 },
        children: [new TextRun({ text, bold: true, font: "Arial", size: 32, color: "1565C0" })] });
}
function h2(text) {
    return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 160 },
        children: [new TextRun({ text, bold: true, font: "Arial", size: 26, color: "1976D2" })] });
}
function p(text) {
    return new Paragraph({ spacing: { after: 120 },
        children: [new TextRun({ text, font: "Arial", size: 20 })] });
}
function pb(label, value) {
    return new Paragraph({ spacing: { after: 80 },
        children: [
            new TextRun({ text: label, bold: true, font: "Arial", size: 20 }),
            new TextRun({ text: value, font: "Arial", size: 20 })
        ] });
}

const doc = new Document({
    styles: {
        default: { document: { run: { font: "Arial", size: 20 } } },
    },
    numbering: {
        config: [{
            reference: "bullets",
            levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
                style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
        }]
    },
    sections: [{
        properties: {
            page: {
                size: { width: 11906, height: 16838 },
                margin: { top: 1200, right: 1200, bottom: 1200, left: 1200 }
            }
        },
        headers: {
            default: new Header({ children: [new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: "浦安ご当地めいすいくん人気投票選挙 引き継ぎ資料", font: "Arial", size: 16, color: "999999" })]
            })] })
        },
        footers: {
            default: new Footer({ children: [new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: "Page ", font: "Arial", size: 16, color: "999999" }),
                           new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: "999999" })]
            })] })
        },
        children: [
            // === タイトル ===
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 },
                children: [new TextRun({ text: "浦安ご当地めいすいくん人気投票選挙", font: "Arial", size: 44, bold: true, color: "1565C0" })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 },
                children: [new TextRun({ text: "システム引き継ぎ資料", font: "Arial", size: 36, bold: true, color: "333333" })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
                children: [new TextRun({ text: "浦安市明るい選挙推進協議会 / 浦安市選挙管理委員会", font: "Arial", size: 20, color: "666666" })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 },
                children: [new TextRun({ text: "作成日: 2026年3月31日 / BUILD_REV: 41", font: "Arial", size: 20, color: "999999" })] }),

            // === 1. 概要 ===
            h1("1. ゲーム概要"),
            p("「浦安ご当地めいすいくん人気投票選挙」は、浦安市のマスコットキャラクター「めいすいくん」たちに投票して、仮想の浦安の街を1889年から2100年まで発展させる選挙体験ゲームです。"),
            p("タブレット端末（iPad等）3台から投票し、55インチモニターでリアルタイムにマップが変化する仕組みです。"),
            pb("本番URL: ", "https://urayasu-meisui.github.io/meisui-world/world.html"),
            pb("投票画面URL: ", "https://urayasu-meisui.github.io/meisui-world/vote.html"),
            pb("裏設定ページ: ", "urayasu-history.html（ゲーム内から「裏設定を読む」ボタンで開く）"),
            pb("リポジトリ: ", "https://github.com/urayasu-meisui/meisui-world"),
            pb("ホスティング: ", "GitHub Pages（mainブランチ直接デプロイ）"),
            pb("データベース: ", "Firebase Realtime Database"),

            new PageBreak(),

            // === 2. システム構成 ===
            h1("2. システム構成"),
            h2("2.1 ファイル構成"),
            makeTable(
                ["ファイル", "サイズ", "役割"],
                [
                    ["world.html", "300KB+", "メイン大画面（マップ・投票速報・イベント・年代ポリゴン判定）"],
                    ["vote.html", "17KB", "タブレット投票インターフェース（iPad用）"],
                    ["display.html", "-", "55インチモニター表示用"],
                    ["index.html", "4KB", "ランディングページ"],
                    ["editor.html", "26KB", "マップ座標エディタ"],
                    ["polygon-editor.html", "NEW", "年代別陸地ポリゴンエディタ"],
                    ["urayasu-history.html", "NEW", "ゲーム用浦安市史（裏設定ページ）"],
                    ["js/config.js", "463KB", "キャラ設定・画像データ・eraLandPolygons（5年代）"],
                    ["js/game-logic.js", "7KB", "年代計算・ランク・歴史イベント（文化系に更新済み）"],
                    ["js/building-system.js", "15KB+", "建物解放・クロスキャラ連動イベント9件・温泉演出"],
                    ["js/event-system.js", "20KB", "イベント演出・埋め立て進化"],
                    ["js/firebase.js", "2KB", "Firebase初期化・グローバル変数"],
                    ["js/audio.js", "10KB", "BGM・効果音管理"],
                    ["js/popup-manager.js", "5KB", "ポップアップ表示管理"],
                    ["css/style.css", "39KB", "メインスタイルシート"],
                    ["fixed-positions.json", "-", "zone_land/zone_seaポリゴン・固定オブジェクト座標"],
                ],
                [3000, 1500, 5000]
            ),

            h2("2.2 技術スタック"),
            p("HTML/CSS/JavaScript（フレームワーク不使用）、Firebase Realtime Database、GitHub Pages、Canvas API（マップ描画）、Web Audio API（音声）"),

            h2("2.3 画面構成"),
            p("大画面（world.html）: 左にiPhone風の投票速報パネル、右にCanvas描画のマップ。下部にタイムラインバー。"),
            p("投票画面（vote.html）: 6キャラクターを3列2行のグリッドで表示。タップで投票。"),

            new PageBreak(),

            // === 3. キャラクター ===
            h1("3. キャラクター一覧（6体）"),
            makeTable(
                ["キャラクター名", "テーマカラー", "政策テーマ"],
                [
                    ["イチョウめいすいくん", "#ffd700（金）", "環境・緑化"],
                    ["ビーナスめいちゃん", "#ff6b6b（赤）", "観光・まちづくり"],
                    ["ツツジめいちゃん", "#e040fb（紫）", "子育て・教育"],
                    ["浦安の海めいすいくん", "#42a5f5（青）", "環境保全・三番瀬"],
                    ["屋形船めいすいくん", "#ff8a65（橙）", "文化・伝統継承"],
                    ["漁師めいすいくん", "#66bb6a（緑）", "産業振興・商業"],
                ],
                [3500, 2500, 3500]
            ),

            h2("3.1 キャラ別投票効果（マップ上の変化）"),
            makeTable(
                ["キャラクター", "効果", "レベル（5段階）"],
                [
                    ["イチョウめいすいくん", "イチョウの木が増える", "荒れ地 → 苗木 → 並木 → 黄金通り → 黄金の森"],
                    ["ツツジめいちゃん", "花畑が広がる", "草原 → 花壇 → 小道 → パラダイス → ピンクのじゅうたん"],
                    ["ビーナスめいちゃん", "ビーチが賑やかに", "じゃりの浜辺 → ビーチ → リゾート → 灯台 → マリーナ"],
                    ["浦安の海めいすいくん", "海の生き物が来る", "にごった海 → お魚 → イルカ → クジラ → サンゴ"],
                    ["屋形船めいすいくん", "おまつりが賑やかに", "しずかな水辺 → 屋形船 → 提灯 → まつり → 花火"],
                    ["漁師めいすいくん", "魚市場が大きくなる", "あき地 → 露店 → 魚市場 → 商店街 → 港のにぎわい"],
                ],
                [2500, 2500, 4500]
            ),

            new PageBreak(),

            // === 4. 投票・年代システム ===
            h1("4. 投票・年代進行システム"),
            h2("4.1 基本仕組み"),
            pb("3票で10年進む: ", "投票3票ごとに1ステップ（10年）進行。●○○ → ●●○ → ●●● → 次の年代へ"),
            pb("全21ステップ: ", "Step 0: 1889-1900年 → Step 1: 1901-1910年 → ... → Step 20: 2091-2100年"),
            pb("63票で1サイクル: ", "21ステップ × 3票 = 63票でエンディング到達"),
            pb("カットイン: ", "キャラ別に3票溜まるとカットイン演出が発生（四字熟語＋キャラ画像）"),

            h2("4.2 年代マッピング"),
            makeTable(
                ["ステップ", "年代", "歴史イベント"],
                [
                    ["0", "1889-1900", "浦安村 誕生（3村合併）"],
                    ["1", "1901-1910", "べか舟漁 最盛期"],
                    ["2", "1911-1920", "浦安町に昇格"],
                    ["3", "1921-1930", "山本周五郎が浦安に移住（青べか物語の舞台）"],
                    ["4", "1931-1940", "浦安橋 開通！べか舟が千艘"],
                    ["5", "1941-1950", "キティ台風 襲来"],
                    ["6", "1951-1960", "黒い水事件（特殊エフェクト: 海が黒くなる）"],
                    ["7", "1961-1970", "オリエンタルランド設立！夢の王国への第一歩"],
                    ["8", "1971-1980", "漁業権全面放棄…300年の歴史に幕。面積4倍に"],
                    ["9", "1981-1990", "浦安市誕生！図書館が貸出冊数日本一"],
                    ["10", "1991-2000", "浦安鉄筋家族 連載開始！人口15万人突破"],
                    ["11", "2001-2010", "ディズニーランド成人式！新成人4人の直談判で実現"],
                    ["12", "2011-2020", "東日本大震災 液状化の砂7.5万m3が噴出"],
                    ["13", "2021-2030", "最後の銭湯が閉店…三番瀬自然再生開始"],
                    ["14", "2031-2040", "スマートシティ計画 自動運転バス"],
                    ["15", "2041-2050", "堀江大橋 架橋"],
                    ["16", "2051-2060", "海上ソーラー発電"],
                    ["17", "2061-2070", "ロープウェイ開通"],
                    ["18", "2071-2080", "海底トンネル"],
                    ["19", "2081-2090", "海上都市計画"],
                    ["20", "2091-2100", "未来都市 完成間近"],
                ],
                [1200, 2000, 6300]
            ),

            new PageBreak(),

            // === 5. 建物システム ===
            h1("5. 建物・施設システム"),
            h2("5.1 共通建物（累計有効票数で解放）"),
            p("全キャラ合計の有効票数がしきい値に達すると自動的に建設通知が表示されます。"),
            makeTable(
                ["建物名", "必要票数", "カテゴリ"],
                [
                    ["おうち", "1票", "住居"], ["がっこう", "3票", "教育"], ["こうえん", "5票", "環境"],
                    ["としょかん", "7票", "文化"], ["びょういん", "9票", "医療"], ["えき", "11票", "交通"],
                    ["さんばんせかんさつかん", "12票", "自然"], ["しょうぼうしょ", "13票", "防災"],
                    ["こうみんかん", "15票", "交流"], ["はくぶつかん", "17票", "文化"],
                    ["しやくしょ", "19票", "行政"], ["ぶんかかいかん", "20票", "文化"],
                ],
                [3500, 2000, 4000]
            ),

            h2("5.2 キャラ別建物"),
            makeTable(
                ["キャラクター", "3票", "6票", "9票"],
                [
                    ["イチョウめいすいくん", "めいすいこうえん", "イチョウひろば", "もりのこうえん"],
                    ["ツツジめいちゃん", "おはなやさん", "おはなばたけ", "はなぞのガーデン"],
                    ["ビーナスめいちゃん", "うみのいえ（2票）", "ホテル（5票）", "すいぞくかん（8票）"],
                    ["浦安の海めいすいくん", "つりばし（2票）", "うみのセンター（5票）", "サンゴしょう（8票）"],
                    ["屋形船めいすいくん", "じんじゃ（2票）", "おまつりかいかん（5票）", "はなびスポット（8票）"],
                    ["漁師めいすいくん", "さかなや（2票）", "いちば（5票）", "みなと（8票）"],
                ],
                [2500, 2200, 2200, 2600]
            ),
            p("特別イベント: イチョウめいすいくんの公園3つが全て完成すると「モルック大会 開催！」イベントが発生します。"),
            p("追加建物: たまごフライやたい(10票)、ポケットシネマ(16票)、きょうどはくぶつかん(22票)、やきあさりやたい(asari4票)、べかぶねこうぼう(ryoushi4票)"),

            h2("5.3 クロスキャラ連動イベント（複数キャラへの投票で発動）"),
            makeTable(
                ["イベント", "条件", "演出"],
                [
                    ["♨️ 浦安ヘルスセンター開業", "meisui>=3 + bekabune>=3", "温泉吹き出し専用演出"],
                    ["🪵 浦安モルック協会設立", "meisui>=5 + asari>=3 + tsutsuji>=2", "トースト"],
                    ["🏅 千葉県モルック協会設立", "meisui>=7 + asari>=5 + ryoushi>=3", "トースト"],
                    ["🛶 べか舟レース開催", "ryoushi>=5 + bekabune>=5", "トースト"],
                    ["⛩️ 浦安三社祭 復活", "asari>=6 + meisui>=4 + tsutsuji>=3", "トースト"],
                    ["📚 図書館が日本一に", "全6キャラ各>=3", "トースト"],
                    ["🌍 モルック世界大会", "4キャラ以上各>=5", "トースト"],
                    ["🌴 姉妹都市オーランド", "meisui_chan>=7 + 4キャラ各>=4", "トースト"],
                    ["🥇 モルックが五輪競技に", "全6キャラ各>=5", "トースト"],
                ],
                [3000, 3500, 3000]
            ),

            new PageBreak(),

            // === 6. 街ランク ===
            h1("6. 街ランク・レベルシステム"),
            h2("6.1 街ランク（F〜S、7段階）"),
            makeTable(
                ["ランク", "必要票数", "タイトル", "説明"],
                [
                    ["F", "0票", "田舎の漁村", "のどかな浦安"],
                    ["E", "6票", "ちいさな集落", "少しずつ人が集まり始めた"],
                    ["D", "15票", "のどかな町", "町に活気が出てきた"],
                    ["C", "27票", "発展する港町", "商業と観光が盛り上がる"],
                    ["B", "39票", "にぎわう観光都市", "浦安は観光名所に"],
                    ["A", "52票", "輝く海辺の楽園", "自然と商業が調和"],
                    ["S", "63票", "伝説のめいすいくんワールド", "究極の浦安"],
                ],
                [1000, 1500, 2500, 4500]
            ),

            h2("6.2 レベル（5段階）"),
            makeTable(
                ["レベル名", "票数範囲"],
                [
                    ["はらっぱ", "0〜14票"],
                    ["ちいさなむら", "15〜29票"],
                    ["にぎやかなまち", "30〜44票"],
                    ["すてきなみやこ", "45〜56票"],
                    ["ゆめのまち", "57〜63票"],
                ],
                [4500, 5000]
            ),

            new PageBreak(),

            // === 7. エンディング ===
            h1("7. エンディング・世界線"),
            h2("7.1 エンディングの流れ"),
            p("1. 2100年到達 → 白フラッシュ＋花火＋タイトルカード「2100年 到達！」（4秒）"),
            p("2. マップツアー（5箇所を巡回、各5秒）"),
            p("3. 世界タイプ発表（最多得票キャラで決定）"),
            p("4. 投票ランキング（この世界線の票数で表示）"),
            p("5. 選挙メッセージ「本物の選挙もあなたの一票が浦安を変える！」"),
            p("6. 「次の世界線へ」ボタン表示"),

            h2("7.2 世界線の仕組み"),
            p("次の世界線ボタンを押すと1889年に戻り、新しいサイクルが始まります。"),
            p("世界線ごとのランク・票数は街ランクポップアップの「過去の世界線の記録」に保存されます（今日の分のみ表示）。"),
            p("Firebaseに stats/worldLineHistory として永続保存されます。"),

            new PageBreak(),

            // === 8. Firebase構造 ===
            h1("8. Firebaseデータ構造"),
            makeTable(
                ["パス", "型", "説明"],
                [
                    ["votes/{charType}", "number", "各キャラの累計投票数"],
                    ["worldLineOffset", "number", "世界線オフセット（0始まり）"],
                    ["stats/cycleStartVotes", "number", "現世界線開始時の累計票数"],
                    ["stats/cycleStartPerChar", "object", "キャラ別の世界線開始時票数"],
                    ["stats/decorationOffset", "object", "キャラ別の装飾オフセット"],
                    ["stats/builtBuildings", "array", "建設済み建物IDリスト"],
                    ["stats/worldLineHistory/{n}", "object", "世界線nの記録（ランク・票数等）"],
                    ["stats/dailyVotes", "object", "日別得票数（date, startTotal, count）"],
                    ["stats/lastVoteChar", "string", "最後に投票されたキャラ（リモート検知用）"],
                ],
                [3500, 1500, 4500]
            ),

            new PageBreak(),

            // === 9. 埋め立て・マップ ===
            h1("9. 埋め立て進化・マップ"),
            h2("9.1 埋め立て3段階"),
            makeTable(
                ["年代", "エリア名", "内容"],
                [
                    ["1961年〜", "中町エリア", "東野・富岡・今川・海楽・美浜・入船"],
                    ["1971年〜", "舞浜・新町エリア", "舞浜・日の出・明海・港・千鳥"],
                    ["1981年〜", "全域", "埋め立てで今と同じ大きさになった"],
                ],
                [2000, 2500, 5000]
            ),
            p("海オーバーレイ画像（sea_stage1b/2b/3b.png）が年代に応じて切り替わり、埋め立て前の海が徐々に陸地に変わる演出です。"),

            h2("9.2 年代別陸地ポリゴン（eraLandPolygons）"),
            p("各年代が独立エリアとして定義されています（包含関係ではない）。木・花・建物は現在年の陸地ポリゴン内にのみ表示されます。"),
            makeTable(
                ["年代", "エリア", "説明"],
                [
                    ["1889", "元町のみ", "堀江・猫実・当代島（ゲーム開始時の陸地）"],
                    ["1968", "東野・富岡・今川", "第1期埋め立て"],
                    ["1971", "海楽・美浜・入船", "第2期埋め立て"],
                    ["1975", "舞浜", "ディズニーの土地"],
                    ["1981", "高洲・日の出・明海・港・千鳥", "新町全域"],
                ],
                [1500, 3000, 5000]
            ),
            p("ポリゴン座標はpolygon-editor.htmlで編集可能。zone_land（fixed-positions.json）も同時に管理。"),

            h2("9.2 近隣自治体の植物"),
            p("江東区エリア（マップ左端）: サザンカ（区の花）・クロマツ（区の木）"),
            p("江戸川区エリア（マップ左寄り）: ツツジ（区の花）・クスノキ（区の木）"),

            new PageBreak(),

            // === 10. イベント ===
            h1("10. ランダムイベント"),
            h2("10.1 ポジティブイベント（11種）"),
            p("5票ごとに発動チェック。条件（累計票数/キャラ別票数）＋確率で発生。"),
            p("例: おまつりだ！（12%）、イチョウ並木が色づいた！（meisui>3票, 15%）、モルック大会 開催！（10%）"),

            h2("10.2 チャレンジイベント（6種）"),
            p("例: たいふうが きた！（8%）、じしん！（4%）、さかなが へってきた（ryoushi>5票, 8%）"),

            new PageBreak(),

            // === 11. 運用 ===
            h1("11. 運用ガイド"),
            h2("11.1 イベント当日の準備"),
            p("1. 大画面モニター: world.html をChromeで全画面表示（F11）"),
            p("2. タブレット端末（3台）: vote.html を開く"),
            p("3. 画面クリックで音楽開始（ブラウザの自動再生制限のため）"),

            h2("11.2 日別得票数リセット"),
            p("街ランク → 「日別リセット」ボタンで当日の得票数カウントをリセットできます。"),

            h2("11.3 全データリセット"),
            p("設定 → 「全データリセット」で投票数・世界線・建物すべてを初期化します（復元不可）。"),

            h2("11.4 デバッグ機能"),
            p("設定 → 「+10年進める」（3票追加）、「+50年進める」（15票追加）でテスト可能。"),

            h2("11.5 スマホ操作"),
            p("設定 → 「スマホをしまう」: 左パネルをスライドアウトしてマップ全体を表示"),
            p("設定 → 「電源を切る」: キャラがバイバイする演出の後、画面OFF。電源アイコンタップで復帰。"),

            h2("11.6 デプロイ"),
            p("git add → git commit → git push で GitHub Pages に自動デプロイされます（数分で反映）。"),
            pb("BUILD_REV: ", "world.html内のBUILD_REV定数を変更のたびにインクリメントしてください。現在: 41"),

            new PageBreak(),

            // === 12. 既知の課題 ===
            h1("12. 既知の課題（低優先度）"),
            p("Bug3: 薄い票分布（投票が均等すぎる場合の表示問題）"),
            p("Bug8: 同時投票時のoldLevel判定"),
            p("Bug9: 2099年エッジケース"),
            p("詳細は project_meisui_world.md を参照してください。"),

            new Paragraph({ spacing: { before: 600 }, alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: "以上", font: "Arial", size: 24, bold: true, color: "999999" })] }),
        ]
    }]
});

Packer.toBuffer(doc).then(buffer => {
    const outPath = 'C:\\Users\\monum\\Documents\\meisui-world\\めいすいくん総選挙_引き継ぎ資料.docx';
    fs.writeFileSync(outPath, buffer);
    console.log('Created: ' + outPath);
});
