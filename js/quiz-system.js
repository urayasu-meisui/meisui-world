// めいすいくん総選挙 - クイズシステム
// クイズ読み込み、出題、回答処理、フィードバック、解説表示

// クイズデータは quizzes.json から読み込み
let quizzes = [];
fetch('quizzes.json')
    .then(r => r.json())
    .then(data => { quizzes = data; console.log('📝 クイズ読み込み完了:', data.length, '問'); })
    .catch(err => {
        console.error('クイズ読み込み失敗:', err);
        // フォールバック: 最低限の1問
        quizzes = [{ q: "せんきょけんは なんさいから？", a: "18さい", choices: ["18さい", "20さい", "21さい"], explanation: "2016ねんに 20さいから 18さいに かわったよ", category: "せんきょのきほん" }];
    });

// 使用済みクイズの重複防止
let usedQuizIndices = [];

function getRandomQuiz() {
    // まだ読み込み中のときは null を返す（呼び出し側でチェック）
    if (quizzes.length === 0) return null;
    if (usedQuizIndices.length >= quizzes.length) {
        usedQuizIndices = [];
    }
    let idx;
    let attempts = 0;
    do {
        idx = Math.floor(Math.random() * quizzes.length);
        attempts++;
    } while (usedQuizIndices.includes(idx) && attempts < quizzes.length * 2);
    usedQuizIndices.push(idx);
    return quizzes[idx];
}

function showQuizModal(charType) {
    const quiz = getRandomQuiz();
    // クイズがまだ読み込まれていないかエラーの場合はスキップ
    if (!quiz) { onEventDone(); return; }
    // Fisher-Yates アルゴリズム（sort()方式は偏りが出るため置き換え）
    const shuffled = [...quiz.choices];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // クイズデータをグローバルに保存（回答処理用）
    window._currentQuizData = { explanation: quiz.explanation, answer: quiz.a, charType: charType };

    let buttonsHTML = '';
    shuffled.forEach((choice, idx) => {
        const isCorrect = choice === quiz.a;
        // & → &amp; を先に変換してから他のエスケープ（順序が重要）
        // " と ' も onclick 属性の破損防止のためエスケープ
        const escapedChoice = choice
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
        buttonsHTML += `<button style="
            width:100%;padding:16px;margin:8px 0;
            background:linear-gradient(135deg,#ffc9c9,#ffb3b3);
            border:2px solid #ff9999;border-radius:12px;
            font-size:18px;font-weight:bold;color:#333;
            cursor:pointer;min-height:60px;font-family:sans-serif;
            transition:all 0.2s;
        " data-correct="${isCorrect}" onclick="handleQuizAnswer(this, ${isCorrect})">${escapedChoice}</button>`;
    });

    // 問題文もエスケープ
    const safeQ = (quiz.q || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const content = document.createElement('div');
    content.id = 'quizModal';
    content.innerHTML = `
        <h2 style="color:#d32f2f;margin-bottom:20px;font-size:24px;text-align:center;">クイズ！</h2>
        <p style="font-size:20px;color:#333;margin-bottom:20px;text-align:center;line-height:1.6;">${safeQ}</p>
        <div style="display:flex;flex-direction:column;gap:8px;">
            ${buttonsHTML}
        </div>
    `;

    pm.show('modal', content, { tapToDismiss: false, overlay: true });
}

function handleQuizAnswer(button, isCorrect) {
    const quizData = window._currentQuizData || {};
    const explanation = quizData.explanation || '';
    const correctAnswer = quizData.answer || '';
    const quizEl = document.getElementById('quizModal');
    if (quizEl) {
        const buttons = quizEl.querySelectorAll('button');
        buttons.forEach(btn => btn.disabled = true);
    }

    if (isCorrect) {
        playSound('correct');
        button.style.background = 'linear-gradient(135deg, #90ee90, #70dd70)';
        button.style.borderColor = '#40dd40';
        showQuizFeedback('🎉 せいかい！', '#2d8659', true);
    } else {
        playSound('wrong');
        button.style.background = 'linear-gradient(135deg, #ff6b6b, #ff5555)';
        button.style.borderColor = '#ff3333';
        showQuizFeedback('😢 ざんねん！\nこたえは「' + (correctAnswer || '') + '」', '#d32f2f', false);
    }

    setTimeout(() => {
        pm.dismiss('modal');
        showExplanationCard(explanation);
    }, 3500);
}

function showQuizFeedback(text, color, isCorrect) {
    const bgColor = isCorrect ? '#e8f5e9' : '#fce4ec';
    const borderColor = isCorrect ? '#4caf50' : '#e53935';

    const content = document.createElement('div');
    content.style.cssText = `
        background:${bgColor};border:6px solid ${borderColor};
        border-radius:24px;padding:40px 60px;max-width:80%;
    `;

    const feedback = document.createElement('div');
    feedback.style.cssText = `
        font-size:48px;font-weight:900;color:${color};
        text-align:center;white-space:pre-wrap;line-height:1.5;
        text-shadow:2px 2px 4px rgba(0,0,0,0.15);
    `;
    feedback.textContent = text;
    content.appendChild(feedback);

    pm.show('card', content, { duration: 3000 });
}

function showExplanationCard(explanation) {
    const content = document.createElement('div');
    content.style.cssText = 'font-size:20px;line-height:1.8;';
    content.innerHTML = `<div style="font-size:28px;margin-bottom:8px;">💡</div>なるほど！<br>${explanation}`;

    pm.show('card', content, {
        duration: 6000,
        onDone: () => { playEventQueue(); }
    });
}
