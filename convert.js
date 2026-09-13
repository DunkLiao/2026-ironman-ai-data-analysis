import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.join(__dirname, "source");
const HTML_DIR = path.join(__dirname, "html");

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function parseAnkiFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split(/\r?\n/);
  const items = [];
  let index = 1;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const parts = line.split("\t");
    if (parts.length >= 2) {
      const question = parts[0].trim();
      const answer = parts.slice(1).join("\t").trim();
      if (question && answer) {
        items.push({
          id: index++,
          question,
          answer
        });
      }
    }
  }
  return items;
}

function generateHtmlPage(baseName, items) {
  const pageTitle = `${baseName} - 數據分析問答複習卡`;
  const itemsJson = JSON.stringify(items);

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(pageTitle)}</title>
  <!-- KaTeX for LaTeX rendering -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"></script>
  <style>
    :root {
      --bg-color: #f8fafc;
      --card-bg: #ffffff;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --primary: #3b82f6;
      --primary-hover: #2563eb;
      --primary-light: #eff6ff;
      --border-color: #e2e8f0;
      --success: #10b981;
      --success-light: #ecfdf5;
      --accent: #f59e0b;
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.05);
      --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.05);
      --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.05);
      --radius: 12px;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --bg-color: #0f172a;
        --card-bg: #1e293b;
        --text-main: #f8fafc;
        --text-muted: #94a3b8;
        --primary: #60a5fa;
        --primary-hover: #3b82f6;
        --primary-light: #1e3a8a33;
        --border-color: #334155;
        --success: #34d399;
        --success-light: #064e3b33;
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans TC", sans-serif;
      background-color: var(--bg-color);
      color: var(--text-main);
      line-height: 1.6;
      padding-bottom: 60px;
    }

    /* Navigation / Header */
    header {
      background: var(--card-bg);
      border-bottom: 1px solid var(--border-color);
      position: sticky;
      top: 0;
      z-index: 50;
      box-shadow: var(--shadow-sm);
    }

    .header-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 14px 20px;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .nav-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 8px;
      background: var(--primary-light);
      color: var(--primary);
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.2s;
    }

    .back-btn:hover {
      background: var(--primary);
      color: #fff;
    }

    .page-title {
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .view-toggles {
      display: flex;
      background: var(--bg-color);
      padding: 3px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
    }

    .toggle-btn {
      padding: 6px 14px;
      border: none;
      background: transparent;
      color: var(--text-muted);
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .toggle-btn.active {
      background: var(--card-bg);
      color: var(--primary);
      box-shadow: var(--shadow-sm);
    }

    /* Main Container */
    main {
      max-width: 900px;
      margin: 24px auto;
      padding: 0 20px;
    }

    /* Toolbar */
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 20px;
      align-items: center;
      justify-content: space-between;
    }

    .search-box {
      flex: 1;
      min-width: 240px;
      position: relative;
    }

    .search-box input {
      width: 100%;
      padding: 10px 14px 10px 38px;
      border-radius: 10px;
      border: 1px solid var(--border-color);
      background: var(--card-bg);
      color: var(--text-main);
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }

    .search-box input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-light);
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      font-size: 14px;
    }

    .action-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--card-bg);
      color: var(--text-main);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn:hover {
      background: var(--border-color);
    }

    .btn.active-filter {
      background: var(--primary-light);
      border-color: var(--primary);
      color: var(--primary);
    }

    /* Stats bar */
    .stats-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      font-size: 14px;
      color: var(--text-muted);
    }

    .progress-bar-container {
      flex: 1;
      height: 8px;
      background: var(--border-color);
      border-radius: 99px;
      margin: 0 16px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--success);
      width: 0%;
      transition: width 0.3s ease;
    }

    /* List View Cards */
    .qa-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .qa-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
      transition: box-shadow 0.2s, border-color 0.2s;
    }

    .qa-card:hover {
      box-shadow: var(--shadow-md);
      border-color: #cbd5e1;
    }

    .qa-card.mastered {
      border-left: 4px solid var(--success);
    }

    .qa-header {
      padding: 16px 20px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      cursor: pointer;
      user-select: none;
    }

    .qa-id {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 28px;
      height: 28px;
      background: var(--primary-light);
      color: var(--primary);
      border-radius: 6px;
      font-size: 13px;
      font-weight: 700;
      margin-top: 2px;
      flex-shrink: 0;
    }

    .qa-question {
      flex: 1;
      font-size: 15px;
      font-weight: 600;
      color: var(--text-main);
      padding-top: 2px;
    }

    .qa-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .master-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 18px;
      padding: 4px;
      border-radius: 6px;
      transition: transform 0.15s, color 0.15s;
    }

    .master-btn:hover {
      transform: scale(1.15);
    }

    .master-btn.is-mastered {
      color: var(--accent);
    }

    .expand-icon {
      color: var(--text-muted);
      font-size: 14px;
      transition: transform 0.2s ease;
    }

    .qa-card.open .expand-icon {
      transform: rotate(180deg);
    }

    .qa-answer {
      display: none;
      padding: 16px 20px 18px 60px;
      background: var(--bg-color);
      border-top: 1px dashed var(--border-color);
      font-size: 15px;
      color: var(--text-main);
      line-height: 1.7;
    }

    .qa-card.open .qa-answer {
      display: block;
      animation: fadeIn 0.2s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Flashcard Mode */
    .flashcard-container {
      display: none;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      padding: 10px 0;
    }

    .flashcard-wrapper {
      perspective: 1000px;
      width: 100%;
      max-width: 640px;
      min-height: 340px;
      cursor: pointer;
    }

    .flashcard-inner {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 340px;
      text-align: center;
      transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      transform-style: preserve-3d;
      border-radius: 16px;
      box-shadow: var(--shadow-lg);
    }

    .flashcard-wrapper.flipped .flashcard-inner {
      transform: rotateY(180deg);
    }

    .flashcard-face {
      position: absolute;
      width: 100%;
      height: 100%;
      min-height: 340px;
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 30px;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      box-sizing: border-box;
    }

    .flashcard-back {
      transform: rotateY(180deg);
      background: var(--card-bg);
      border: 2px solid var(--primary);
    }

    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      color: var(--text-muted);
    }

    .card-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 99px;
      font-weight: 600;
      font-size: 12px;
    }

    .badge-q {
      background: var(--primary-light);
      color: var(--primary);
    }

    .badge-a {
      background: var(--success-light);
      color: var(--success);
    }

    .card-body {
      margin: auto 0;
      padding: 20px 10px;
      font-size: 18px;
      font-weight: 600;
      line-height: 1.6;
    }

    .card-hint {
      font-size: 12px;
      color: var(--text-muted);
    }

    .flashcard-controls {
      display: flex;
      gap: 12px;
      align-items: center;
      justify-content: center;
      width: 100%;
      max-width: 640px;
    }

    .flashcard-controls .btn {
      padding: 10px 20px;
      font-size: 14px;
      font-weight: 600;
    }

    .btn-primary {
      background: var(--primary);
      color: #fff;
      border-color: var(--primary);
    }

    .btn-primary:hover {
      background: var(--primary-hover);
    }

    .shortcuts-hint {
      font-size: 12px;
      color: var(--text-muted);
      text-align: center;
      margin-top: 8px;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--text-muted);
      background: var(--card-bg);
      border-radius: var(--radius);
      border: 1px dashed var(--border-color);
    }
  </style>
</head>
<body>
  <header>
    <div class="header-container">
      <div class="nav-left">
        <a href="../index.html" class="back-btn" title="回目錄">← 目錄</a>
        <h1 class="page-title">${escapeHtml(baseName)} 問答卡</h1>
      </div>
      <div class="view-toggles">
        <button id="listViewBtn" class="toggle-btn active" onclick="switchMode('list')">📋 列表模式</button>
        <button id="cardViewBtn" class="toggle-btn" onclick="switchMode('card')">🎴 翻卡測驗</button>
      </div>
    </div>
  </header>

  <main>
    <div class="toolbar">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input type="text" id="searchInput" placeholder="搜尋問題或答案關鍵字..." oninput="handleSearch()">
      </div>
      <div class="action-buttons">
        <button class="btn" id="filterMasteredBtn" onclick="toggleFilterMastered()">⭐ 只看未掌握</button>
        <button class="btn" id="expandAllBtn" onclick="toggleExpandAll()">展開全部</button>
        <button class="btn" onclick="shuffleCards()">🔀 隨機洗牌</button>
        <button class="btn" onclick="resetOrder()">🔄 恢復順序</button>
      </div>
    </div>

    <div class="stats-bar">
      <span id="statsCount">總計 0 題</span>
      <div class="progress-bar-container">
        <div id="progressFill" class="progress-fill"></div>
      </div>
      <span id="statsMastered">掌握率 0%</span>
    </div>

    <!-- List View -->
    <div id="qaList" class="qa-list"></div>

    <!-- Flashcard Mode View -->
    <div id="flashcardContainer" class="flashcard-container">
      <div class="flashcard-wrapper" id="flashcardWrapper" onclick="flipCard()">
        <div class="flashcard-inner">
          <!-- Front Face -->
          <div class="flashcard-face flashcard-front">
            <div class="card-top">
              <span class="card-badge badge-q">問題</span>
              <span id="fcCardNumber">卡片 1 / 1</span>
              <button class="master-btn" id="fcMasterBtn" onclick="toggleCardMaster(event)" title="標記為已掌握">★</button>
            </div>
            <div class="card-body" id="fcQuestion">載入中...</div>
            <div class="card-hint">💡 點擊卡片或按空白鍵翻面看答案</div>
          </div>
          <!-- Back Face -->
          <div class="flashcard-face flashcard-back">
            <div class="card-top">
              <span class="card-badge badge-a">解答</span>
              <span id="fcCardNumberBack">卡片 1 / 1</span>
              <button class="master-btn" id="fcMasterBtnBack" onclick="toggleCardMaster(event)" title="標記為已掌握">★</button>
            </div>
            <div class="card-body" id="fcAnswer">載入中...</div>
            <div class="card-hint">💡 再次點擊卡片翻回正面</div>
          </div>
        </div>
      </div>

      <div class="flashcard-controls">
        <button class="btn" onclick="prevCard()">← 上一題</button>
        <button class="btn btn-primary" onclick="flipCard()">翻轉卡片</button>
        <button class="btn" onclick="nextCard()">下一題 →</button>
      </div>
      <div class="shortcuts-hint">鍵盤快速鍵：[←] 上一題 · [空白鍵] 翻面 · [→] 下一題 · [M] 標記掌握</div>
    </div>
  </main>

  <script>
    const STORAGE_KEY = "anki_mastered_" + "${baseName}";
    const RAW_DATA = ${itemsJson};
    let currentData = [...RAW_DATA];
    let masteredSet = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
    let currentMode = 'list';
    let filterOnlyUnmastered = false;
    let isAllExpanded = false;
    let cardIndex = 0;

    function saveMastered() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(masteredSet)));
      updateStats();
    }

    function updateStats() {
      const total = RAW_DATA.length;
      const masteredCount = RAW_DATA.filter(item => masteredSet.has(item.id)).length;
      const pct = total === 0 ? 0 : Math.round((masteredCount / total) * 100);

      document.getElementById('statsCount').textContent = \`顯示 \${currentData.length} / 共 \${total} 題\`;
      document.getElementById('statsMastered').textContent = \`已掌握 \${masteredCount} 題 (\${pct}%)\`;
      document.getElementById('progressFill').style.width = pct + '%';
    }

    function renderMath() {
      if (window.renderMathInElement) {
        renderMathInElement(document.body, {
          delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false}
          ],
          throwOnError: false
        });
      }
    }

    function renderList() {
      const container = document.getElementById('qaList');
      if (currentData.length === 0) {
        container.innerHTML = '<div class="empty-state">沒有符合條件的問答卡片</div>';
        return;
      }

      container.innerHTML = currentData.map(item => {
        const isMastered = masteredSet.has(item.id);
        return \`
          <div class="qa-card \${isMastered ? 'mastered' : ''} \${isAllExpanded ? 'open' : ''}" id="card-\${item.id}">
            <div class="qa-header" onclick="toggleItem(\${item.id})">
              <span class="qa-id">#\${item.id}</span>
              <span class="qa-question">\${escapeHtml(item.question)}</span>
              <div class="qa-actions">
                <button class="master-btn \${isMastered ? 'is-mastered' : ''}"
                        onclick="toggleMaster(event, \${item.id})"
                        title="\${isMastered ? '已掌握' : '標記掌握'}">★</button>
                <span class="expand-icon">▼</span>
              </div>
            </div>
            <div class="qa-answer">\${escapeHtml(item.answer)}</div>
          </div>
        \`;
      }).join('');

      renderMath();
    }

    function escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    function toggleItem(id) {
      const el = document.getElementById('card-' + id);
      if (el) {
        el.classList.toggle('open');
      }
    }

    function toggleMaster(event, id) {
      event.stopPropagation();
      if (masteredSet.has(id)) {
        masteredSet.delete(id);
      } else {
        masteredSet.add(id);
      }
      saveMastered();
      applyFilters();
    }

    function toggleExpandAll() {
      isAllExpanded = !isAllExpanded;
      document.getElementById('expandAllBtn').textContent = isAllExpanded ? "收合全部" : "展開全部";
      document.querySelectorAll('.qa-card').forEach(card => {
        if (isAllExpanded) {
          card.classList.add('open');
        } else {
          card.classList.remove('open');
        }
      });
    }

    function toggleFilterMastered() {
      filterOnlyUnmastered = !filterOnlyUnmastered;
      const btn = document.getElementById('filterMasteredBtn');
      btn.classList.toggle('active-filter', filterOnlyUnmastered);
      btn.textContent = filterOnlyUnmastered ? "✓ 僅顯示未掌握" : "⭐ 只看未掌握";
      applyFilters();
    }

    function handleSearch() {
      applyFilters();
    }

    function applyFilters() {
      const query = document.getElementById('searchInput').value.trim().toLowerCase();
      currentData = RAW_DATA.filter(item => {
        if (filterOnlyUnmastered && masteredSet.has(item.id)) {
          return false;
        }
        if (query) {
          const matchQ = item.question.toLowerCase().includes(query);
          const matchA = item.answer.toLowerCase().includes(query);
          return matchQ || matchA;
        }
        return true;
      });

      cardIndex = 0;
      if (currentMode === 'list') {
        renderList();
      } else {
        updateCardView();
      }
      updateStats();
    }

    function shuffleCards() {
      currentData.sort(() => Math.random() - 0.5);
      cardIndex = 0;
      if (currentMode === 'list') {
        renderList();
      } else {
        updateCardView();
      }
    }

    function resetOrder() {
      currentData.sort((a, b) => a.id - b.id);
      cardIndex = 0;
      if (currentMode === 'list') {
        renderList();
      } else {
        updateCardView();
      }
    }

    function switchMode(mode) {
      currentMode = mode;
      const listBtn = document.getElementById('listViewBtn');
      const cardBtn = document.getElementById('cardViewBtn');
      const qaList = document.getElementById('qaList');
      const flashcardContainer = document.getElementById('flashcardContainer');
      const expandAllBtn = document.getElementById('expandAllBtn');

      if (mode === 'list') {
        listBtn.classList.add('active');
        cardBtn.classList.remove('active');
        qaList.style.display = 'flex';
        flashcardContainer.style.display = 'none';
        expandAllBtn.style.display = 'inline-flex';
        renderList();
      } else {
        cardBtn.classList.add('active');
        listBtn.classList.remove('active');
        qaList.style.display = 'none';
        flashcardContainer.style.display = 'flex';
        expandAllBtn.style.display = 'none';
        updateCardView();
      }
    }

    /* Flashcard Functions */
    function flipCard() {
      const wrapper = document.getElementById('flashcardWrapper');
      wrapper.classList.toggle('flipped');
    }

    function updateCardView() {
      const wrapper = document.getElementById('flashcardWrapper');
      wrapper.classList.remove('flipped');

      if (currentData.length === 0) {
        document.getElementById('fcQuestion').textContent = '無卡片資料';
        document.getElementById('fcAnswer').textContent = '無卡片資料';
        document.getElementById('fcCardNumber').textContent = '0 / 0';
        document.getElementById('fcCardNumberBack').textContent = '0 / 0';
        return;
      }

      if (cardIndex < 0) cardIndex = 0;
      if (cardIndex >= currentData.length) cardIndex = currentData.length - 1;

      const item = currentData[cardIndex];
      const isMastered = masteredSet.has(item.id);

      document.getElementById('fcQuestion').textContent = item.question;
      document.getElementById('fcAnswer').textContent = item.answer;

      const cardNumText = \`卡片 \${cardIndex + 1} / \${currentData.length} (#\${item.id})\`;
      document.getElementById('fcCardNumber').textContent = cardNumText;
      document.getElementById('fcCardNumberBack').textContent = cardNumText;

      const btn1 = document.getElementById('fcMasterBtn');
      const btn2 = document.getElementById('fcMasterBtnBack');
      btn1.classList.toggle('is-mastered', isMastered);
      btn2.classList.toggle('is-mastered', isMastered);

      renderMath();
    }

    function prevCard() {
      if (currentData.length === 0) return;
      cardIndex = (cardIndex - 1 + currentData.length) % currentData.length;
      updateCardView();
    }

    function nextCard() {
      if (currentData.length === 0) return;
      cardIndex = (cardIndex + 1) % currentData.length;
      updateCardView();
    }

    function toggleCardMaster(event) {
      event.stopPropagation();
      if (currentData.length === 0) return;
      const item = currentData[cardIndex];
      toggleMaster(event, item.id);
      updateCardView();
    }

    /* Keyboard Shortcuts */
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (currentMode === 'card') {
        if (e.code === 'Space') {
          e.preventDefault();
          flipCard();
        } else if (e.code === 'ArrowLeft') {
          e.preventDefault();
          prevCard();
        } else if (e.code === 'ArrowRight') {
          e.preventDefault();
          nextCard();
        } else if (e.code === 'KeyM') {
          e.preventDefault();
          toggleCardMaster(e);
        }
      }
    });

    // Init
    window.addEventListener('DOMContentLoaded', () => {
      updateStats();
      renderList();
      setTimeout(renderMath, 200);
    });
  </script>
</body>
</html>`;
}

function generateIndexPage(manifest) {
  const cardsHtml = manifest.map(item => `
    <a href="html/${escapeHtml(item.fileName)}" class="index-card">
      <div class="index-card-header">
        <span class="day-badge">${escapeHtml(item.baseName)}</span>
        <span class="count-badge">${item.count} 題</span>
      </div>
      <h2 class="index-card-title">${escapeHtml(item.baseName)} 數據分析問答卡</h2>
      <p class="index-card-desc">包含 ${item.count} 個核心觀念問題與解答，支援列表速覽與抽考測驗。</p>
      <div class="index-card-footer">
        <span>進入複習 →</span>
      </div>
    </a>
  `).join('');

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Anki 數據分析問答總目錄</title>
  <style>
    :root {
      --bg-color: #f8fafc;
      --card-bg: #ffffff;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --primary: #3b82f6;
      --primary-hover: #2563eb;
      --primary-light: #eff6ff;
      --border-color: #e2e8f0;
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.05);
      --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.05);
      --radius: 12px;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --bg-color: #0f172a;
        --card-bg: #1e293b;
        --text-main: #f8fafc;
        --text-muted: #94a3b8;
        --primary: #60a5fa;
        --primary-hover: #3b82f6;
        --primary-light: #1e3a8a33;
        --border-color: #334155;
      }
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: var(--bg-color);
      color: var(--text-main);
      padding: 40px 20px;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
    }

    .header-section {
      text-align: center;
      margin-bottom: 40px;
    }

    .header-section h1 {
      font-size: 2rem;
      margin-bottom: 10px;
      font-weight: 800;
    }

    .header-section p {
      color: var(--text-muted);
      font-size: 1.1rem;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }

    .index-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 24px;
      text-decoration: none;
      color: inherit;
      box-shadow: var(--shadow-sm);
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .index-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
      border-color: var(--primary);
    }

    .index-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
    }

    .day-badge {
      font-size: 12px;
      font-weight: 700;
      background: var(--primary-light);
      color: var(--primary);
      padding: 4px 10px;
      border-radius: 6px;
    }

    .count-badge {
      font-size: 12px;
      color: var(--text-muted);
    }

    .index-card-title {
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .index-card-desc {
      font-size: 14px;
      color: var(--text-muted);
      line-height: 1.5;
      margin-bottom: 20px;
    }

    .index-card-footer {
      font-size: 14px;
      font-weight: 600;
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-section">
      <h1>📊 數據分析 Anki 學習問答卡</h1>
      <p>選擇學習單元以開始複習與自我測驗</p>
    </div>
    <div class="grid">
      ${cardsHtml}
    </div>
  </div>
</body>
</html>`;
}

function main() {
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`錯誤：找不到來源目錄 ${SOURCE_DIR}`);
    process.exit(1);
  }

  if (!fs.existsSync(HTML_DIR)) {
    fs.mkdirSync(HTML_DIR, { recursive: true });
    console.log(`已建立輸出目錄：${HTML_DIR}`);
  }

  const files = fs.readdirSync(SOURCE_DIR).filter(f => f.toLowerCase().endsWith(".txt") || f.toLowerCase().endsWith(".tsv"));

  if (files.length === 0) {
    console.warn(`警告：在 ${SOURCE_DIR} 下沒有找到任何 .txt 或 .tsv 檔案`);
    return;
  }

  console.log(`開始轉換：共找到 ${files.length} 個檔案...`);

  const manifest = [];

  for (const file of files) {
    const filePath = path.join(SOURCE_DIR, file);
    const parsedPath = path.parse(file);
    const baseName = parsedPath.name;
    const outputHtmlFileName = `${baseName}.html`;
    const outputPath = path.join(HTML_DIR, outputHtmlFileName);

    const items = parseAnkiFile(filePath);
    console.log(`- 處理 [${file}]：解析出 ${items.length} 筆問答`);

    const htmlContent = generateHtmlPage(baseName, items);
    fs.writeFileSync(outputPath, htmlContent, "utf-8");
    console.log(`  ✓ 已輸出至 html/${outputHtmlFileName}`);

    manifest.push({
      baseName,
      fileName: outputHtmlFileName,
      count: items.length
    });
  }

  // Generate index.html in root directory
  const indexPath = path.join(__dirname, "index.html");
  const indexContent = generateIndexPage(manifest);
  fs.writeFileSync(indexPath, indexContent, "utf-8");
  console.log(`✓ 已生成總目錄索引頁面：index.html`);

  // Remove old html/index.html if exists
  const oldIndexPath = path.join(HTML_DIR, "index.html");
  if (fs.existsSync(oldIndexPath)) {
    fs.unlinkSync(oldIndexPath);
  }

  console.log("\n全部轉換完成！");
}

main();
