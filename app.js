/**
 * CONTROLLER & UI ENGINE
 * Menghubungkan antarmuka HTML/CSS dengan Database.
 */
const app = {
  state: {
    selectedEra: 'era1',
    currentQuestionIndex: 0,
    eraScore: 0,
    streak: 0,
    answered: false
  },

  init() {
    Database.init();
    this.updateLandingStats();

    const activePlayer = Database.getActivePlayer();
    if (activePlayer) {
      document.getElementById('explorer-name').value = activePlayer.name;
      this.updateHUD(activePlayer);
    }

    this.selectEra('era1');
  },

  showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  },

  navigate(screenName) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`screen-${screenName}`);
    if (target) target.classList.add('active');

    if (screenName === 'welcome') {
      this.updateLandingStats();
    } else if (screenName === 'map') {
      this.refreshMapUI();
    } else if (screenName === 'leaderboard') {
      this.renderLeaderboard();
    }
  },

  updateLandingStats() {
    const totalQ = Database.getTotalQuestionsCount();
    const totalPlayers = Object.keys(Database.getAllPlayers()).length;
    document.getElementById('total-questions-stat').textContent = `📜 ${totalQ} Studi Kasus`;
    document.getElementById('total-explorers-stat').textContent = `🧭 ${totalPlayers} Penjelajah Terdaftar`;
  },

  updateHUD(player) {
    const hud = document.getElementById('user-hud');
    if (!player) {
      hud.classList.add('hidden');
      return;
    }
    hud.classList.remove('hidden');
    document.getElementById('hud-name').textContent = player.name;
    document.getElementById('hud-score').textContent = `${player.score} Poin`;
  },

  startExpedition() {
    const input = document.getElementById('explorer-name');
    const name = input.value.trim() || 'Penjelajah Nusantara';
    const player = Database.getOrCreatePlayer(name);

    this.updateHUD(player);
    this.showToast(`Selamat datang, ${player.name}!`);
    this.navigate('map');
  },

  selectEra(eraId) {
    this.state.selectedEra = eraId;

    // Update status pin aktif di peta
    document.querySelectorAll('.html-pin').forEach(pin => {
      pin.classList.toggle('active-pin', pin.dataset.era === eraId);
    });

    const era = DEFAULT_ERAS[eraId];
    const questions = Database.getQuestions()[eraId] || [];
    const player = Database.getActivePlayer();
    const isCompleted = player && player.completedEras.includes(eraId);

    const previewBox = document.getElementById('mission-preview-box');
    previewBox.innerHTML = `
      <div class="preview-card">
        <div class="preview-info">
          <span class="era-tag">${era.tag} • ${questions.length} SOAL ${isCompleted ? '• ✅ SELESAI' : ''}</span>
          <h3>${era.title}</h3>
          <p>${era.desc}</p>
        </div>
        <button class="btn-primary" onclick="app.startQuiz('${eraId}')">
          ${isCompleted ? 'Ulangi Misi ➔' : 'Mulai Misi ➔'}
        </button>
      </div>
    `;
  },

  refreshMapUI() {
    const player = Database.getActivePlayer();
    this.updateHUD(player);

    // Perbarui ikon centang hijau pada pin peta jika era sudah selesai
    Object.keys(DEFAULT_ERAS).forEach(eraId => {
      const statusEl = document.getElementById(`status-${eraId}`);
      if (statusEl) {
        const done = player && player.completedEras.includes(eraId);
        statusEl.textContent = done ? '✅' : '📍';
      }
    });

    this.selectEra(this.state.selectedEra);
    this.renderBadges(player);
  },

  renderBadges(player) {
    const container = document.getElementById('badges-container');
    const completed = player ? player.completedEras : [];

    container.innerHTML = Object.values(DEFAULT_ERAS).map(era => {
      const unlocked = completed.includes(era.id);
      return `
        <div class="badge-item ${unlocked ? 'unlocked' : ''}">
          <div class="badge-icon">${unlocked ? era.badgeIcon : '🔒'}</div>
          <div class="badge-meta">
            <strong>${era.badgeTitle}</strong>
            <span>${unlocked ? 'Terbuka' : 'Selesaikan ' + era.title}</span>
          </div>
        </div>
      `;
    }).join('');
  },

  startQuiz(eraId) {
    if (!Database.getActivePlayer()) {
      Database.getOrCreatePlayer('Penjelajah Tamu');
    }

    this.state.selectedEra = eraId;
    this.state.currentQuestionIndex = 0;
    this.state.eraScore = 0;
    this.state.streak = 0;
    this.state.answered = false;

    const era = DEFAULT_ERAS[eraId];
    document.getElementById('quiz-era-badge').textContent = era.title.toUpperCase();
    this.updateStreakUI();

    this.navigate('quiz');
    this.renderQuestion();
  },

  updateStreakUI() {
    document.getElementById('quiz-streak-badge').textContent = `🔥 Streak: ${this.state.streak}`;
  },

  renderQuestion() {
    const eraId = this.state.selectedEra;
    const questions = Database.getQuestions()[eraId] || [];
    const idx = this.state.currentQuestionIndex;
    const container = document.getElementById('quiz-container');

    if (idx >= questions.length) {
      this.renderQuizResult();
      return;
    }

    this.state.answered = false;
    const q = questions[idx];
    const letters = ['A', 'B', 'C', 'D'];

    container.innerHTML = `
      <div class="quiz-card">
        <div class="quiz-progress">Soal ${idx + 1} dari ${questions.length}</div>
        <div class="quiz-grid">
          <div class="artifact-box">
            <div class="artifact-icon">${q.icon}</div>
            <div class="artifact-caption">${q.artifact}</div>
          </div>
          <div class="question-area">
            <h3 class="question-text">${q.question}</h3>
            <div class="options-list" id="options-list">
              ${q.options.map((opt, i) => `
                <button class="opt-btn" data-index="${i}" onclick="app.submitAnswer(${i})">
                  <span class="opt-letter">${letters[i]}</span>
                  <span>${opt}</span>
                </button>
              `).join('')}
            </div>
            <div id="quiz-feedback"></div>
          </div>
        </div>
      </div>
    `;
  },

  submitAnswer(selectedIndex) {
    if (this.state.answered) return;
    this.state.answered = true;

    const eraId = this.state.selectedEra;
    const questions = Database.getQuestions()[eraId];
    const q = questions[this.state.currentQuestionIndex];
    const isCorrect = selectedIndex === q.answer;

    const buttons = document.querySelectorAll('#options-list .opt-btn');
    buttons.forEach((btn, i) => {
      btn.disabled = true;
      if (i === q.answer) btn.classList.add('correct');
      if (i === selectedIndex && !isCorrect) btn.classList.add('wrong');
    });

    let earned = 0;
    if (isCorrect) {
      this.state.streak += 1;
      earned = 100 + (this.state.streak > 1 ? (this.state.streak - 1) * 20 : 0);
      this.state.eraScore += earned;
      const updatedPlayer = Database.updatePlayerProgress(earned);
      this.updateHUD(updatedPlayer);
    } else {
      this.state.streak = 0;
    }
    this.updateStreakUI();

    const isLast = this.state.currentQuestionIndex === questions.length - 1;
    const feedbackEl = document.getElementById('quiz-feedback');
    feedbackEl.innerHTML = `
      <div class="feedback-panel ${isCorrect ? '' : 'wrong-feedback'}">
        <p>
          <strong>${isCorrect ? `✅ Tepat Sekali! (+${earned} Poin)` : '❌ Kurang Tepat!'}</strong><br>
          <strong>Tahukah Kamu?</strong> ${q.fact}
        </p>
        <button class="btn-primary" onclick="app.nextQuestion()">
          ${isLast ? 'Selesaikan Misi ➔' : 'Lanjut Soal Berikutnya ➔'}
        </button>
      </div>
    `;
  },

  nextQuestion() {
    this.state.currentQuestionIndex += 1;
    this.renderQuestion();
  },

  renderQuizResult() {
    const eraId = this.state.selectedEra;
    const era = DEFAULT_ERAS[eraId];
    const updatedPlayer = Database.updatePlayerProgress(0, eraId);
    this.updateHUD(updatedPlayer);

    const container = document.getElementById('quiz-container');
    container.innerHTML = `
      <div class="result-card">
        <div class="trophy-icon">${era.badgeIcon}</div>
        <h2>${era.title} Selesai!</h2>
        <p>
          Luar biasa, <strong>${updatedPlayer.name}</strong>! Anda meraih <strong>+${this.state.eraScore} Poin</strong> pada misi ini 
          dan membuka lencana <strong>${era.badgeTitle}</strong>. Progres telah tersimpan ke database.
        </p>
        <div class="result-actions">
          <button class="btn-outline" onclick="app.startQuiz('${eraId}')">↻ Ulangi Misi</button>
          <button class="btn-primary" onclick="app.navigate('map')">Lanjut ke Peta Nusantara ➔</button>
        </div>
      </div>
    `;
  },

  renderLeaderboard() {
    const query = (document.getElementById('search-player').value || '').toLowerCase();
    const players = Object.values(Database.getAllPlayers())
      .filter(p => p.name.toLowerCase().includes(query))
      .sort((a, b) => b.score - a.score);

    const tbody = document.getElementById('leaderboard-body');
    if (players.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Belum ada data penjelajah di database.</td></tr>`;
      return;
    }

    tbody.innerHTML = players.map((p, idx) => {
      const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
      return `
        <tr>
          <td><strong>${medal}</strong></td>
          <td><strong>${p.name}</strong></td>
          <td>${p.completedEras.length} / 4 Era</td>
          <td><strong>${p.score} Poin</strong></td>
          <td>${p.lastActive}</td>
        </tr>
      `;
    }).join('');
  },

  saveNewQuestion(event) {
    event.preventDefault();

    const eraId = document.getElementById('q-era').value;
    const newQ = {
      icon: document.getElementById('q-icon').value.trim() || '📜',
      artifact: document.getElementById('q-artifact').value.trim(),
      question: document.getElementById('q-text').value.trim(),
      options: [
        document.getElementById('q-opt-0').value.trim(),
        document.getElementById('q-opt-1').value.trim(),
        document.getElementById('q-opt-2').value.trim(),
        document.getElementById('q-opt-3').value.trim()
      ],
      answer: parseInt(document.getElementById('q-answer').value, 10),
      fact: document.getElementById('q-fact').value.trim()
    };

    Database.addQuestion(eraId, newQ);
    document.getElementById('add-question-form').reset();
    document.getElementById('q-icon').value = '🏺';

    this.showToast('Soal baru berhasil disimpan ke database!');
    this.navigate('map');
  },

  resetDatabase() {
    if (confirm('Yakin ingin menghapus seluruh data pemain dan mengembalikan bank soal ke awal?')) {
      Database.resetAll();
      this.updateHUD(null);
      document.getElementById('explorer-name').value = '';
      this.renderLeaderboard();
      this.showToast('Database berhasil di-reset.');
    }
  },

  openModal(id) {
    document.getElementById(id).classList.add('open');
  },

  closeModal(id) {
    document.getElementById(id).classList.remove('open');
  },

  closeModalOnBg(event, id) {
    if (event.target.id === id) {
      this.closeModal(id);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => app.init());