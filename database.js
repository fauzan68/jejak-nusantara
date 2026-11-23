/**
 * DATABASE LAYER (LocalStorage Engine)
 * Menyimpan data penjelajah, skor, lencana, dan bank soal secara persisten.
 */
const DB_KEYS = {
  PLAYERS: 'jejak_nusantara_players_v1',
  QUESTIONS: 'jejak_nusantara_questions_v1',
  ACTIVE_PLAYER: 'jejak_nusantara_active_user_v1'
};

const DEFAULT_ERAS = {
  era1: {
    id: 'era1',
    tag: 'MISI 01 • ABAD KE-7 HINGGA KE-15',
    title: 'Era Kerajaan Hindu-Buddha & Islam',
    badgeTitle: 'Penjaga Warisan Sriwijaya & Majapahit',
    badgeIcon: '🏆',
    desc: 'Uji wawasan Anda tentang kejayaan Sriwijaya, Sumpah Palapa Majapahit, hingga penyebaran Wali Songo di Tanah Jawa.'
  },
  era2: {
    id: 'era2',
    tag: 'MISI 02 • TAHUN 1908 – 1942',
    title: 'Era Kebangkitan & Pergerakan Nasional',
    badgeTitle: 'Pelopor Sumpah Pemuda',
    badgeIcon: '🎖️',
    desc: 'Telusuri lahirnya Budi Utomo, ikrar Sumpah Pemuda 1928, dan perjuangan persatuan pemuda Indonesia.'
  },
  era3: {
    id: 'era3',
    tag: 'MISI 03 • AGUSTUS 1945',
    title: 'Detik-Detik Proklamasi Kemerdekaan',
    badgeTitle: 'Pahlawan Kemerdekaan',
    badgeIcon: '🇮🇩',
    desc: 'Pelajari peristiwa Rengasdengklok, perumusan naskah di rumah Laksamana Maeda, hingga pembacaan Proklamasi.'
  },
  era4: {
    id: 'era4',
    tag: 'MISI 04 • ABAD KE-7 HINGGA KE-16',
    title: 'Sejarah Masuknya Islam di Indonesia',
    badgeTitle: 'Penjelajah Syiar Nusantara',
    badgeIcon: '🕌',
    desc: 'Telusuri teori masuknya Islam (Gujarat, Mekkah, Persia), jalur perdagangan maritim, hingga dakwah kultural para Wali Songo.'
  }
};

const DEFAULT_QUESTIONS = {
  era1: [
    {
      icon: '🏛️',
      artifact: 'Artefak: Prasasti Kedukan Bukit (682 M)',
      question: 'Kerajaan maritim besar di Sumatera yang dikenal sebagai pusat pembelajaran agama Buddha di Asia Tenggara adalah...',
      options: ['Kerajaan Tarumanegara', 'Kerajaan Sriwijaya', 'Kerajaan Singasari', 'Kerajaan Kutai'],
      answer: 1,
      fact: 'Pendeta Tiongkok bernama I-Tsing mencatat bahwa ribuan biksu dari berbagai negeri singgah di Sriwijaya untuk mempelajari tata bahasa Sanskerta sebelum berangkat ke India.'
    },
    {
      icon: '🗡️',
      artifact: 'Artefak: Kitab Pararaton & Sumpah Palapa',
      question: 'Siapakah Mahapatih Kerajaan Majapahit yang mengucapkan Sumpah Palapa untuk menyatukan wilayah Nusantara?',
      options: ['Mahapatih Gajah Mada', 'Raden Wijaya', 'Mpu Tantular', 'Ken Arok'],
      answer: 0,
      fact: 'Gajah Mada mengucapkan Sumpah Palapa pada tahun 1336 M saat dilantik sebagai Patih Amangkubhumi oleh Ratu Tribhuwana Tunggadewi.'
    },
    {
      icon: '🕌',
      artifact: 'Artefak: Masjid Agung Demak (1479 M)',
      question: 'Kerajaan Islam pertama di Pulau Jawa yang didirikan oleh Raden Patah dengan dukungan para Wali Songo adalah...',
      options: ['Kesultanan Banten', 'Kesultanan Mataram', 'Kesultanan Demak', 'Kesultanan Cirebon'],
      answer: 2,
      fact: 'Masjid Agung Demak memiliki empat tiang utama bernama Saka Guru, salah satunya dibuat oleh Sunan Kalijaga dari serpihan kayu (saka tatal).'
    }
  ],
  era2: [
    {
      icon: '📜',
      artifact: 'Artefak: Gedung STOVIA Batavia (20 Mei 1908)',
      question: 'Organisasi modern pertama yang menjadi tonggak Hari Kebangkitan Nasional pada 20 Mei 1908 adalah...',
      options: ['Budi Utomo', 'Sarekat Islam', 'Indische Partij', 'Perhimpunan Indonesia'],
      answer: 0,
      fact: 'Budi Utomo digagas oleh dr. Wahidin Sudirohusodo dan didirikan oleh para mahasiswa kedokteran STOVIA yang diketuai oleh dr. Soetomo.'
    },
    {
      icon: '🎻',
      artifact: 'Artefak: Biola W.R. Supratman (28 Oktober 1928)',
      question: 'Pada Kongres Pemuda II tanggal 28 Oktober 1928, lagu "Indonesia Raya" pertama kali diperdengarkan menggunakan...',
      options: ['Paduan suara penuh', 'Gesekan biola solo W.R. Supratman', 'Siaran radio RRI', 'Iringan gamelan Jawa'],
      answer: 1,
      fact: 'W.R. Supratman memainkan lagu Indonesia Raya secara instrumental tanpa syair agar tidak memicu pembubaran rapat oleh polisi rahasia Belanda (PID).'
    },
    {
      icon: '📚',
      artifact: 'Artefak: Perguruan Taman Siswa (1922)',
      question: 'Tokoh Tiga Serangkai yang mendirikan Perguruan Taman Siswa serta mencetuskan semboyan "Tut Wuri Handayani" adalah...',
      options: ['Dr. Cipto Mangunkusumo', 'Douwes Dekker', 'Ki Hajar Dewantara', 'H.O.S. Tjokroaminoto'],
      answer: 2,
      fact: 'Nama asli Ki Hajar Dewantara adalah Raden Mas Soewardi Soerjaningrat. Ia menanggalkan gelar kebangsawanannya pada usia 40 tahun agar lebih dekat dengan rakyat.'
    }
  ],
  era3: [
    {
      icon: '🏡',
      artifact: 'Artefak: Rumah Djiaw Kie Siong (16 Agustus 1945)',
      question: 'Tujuan utama golongan muda membawa Soekarno dan Hatta ke Rengasdengklok pada 16 Agustus 1945 dini hari adalah...',
      options: [
        'Menjauhkan keduanya dari pengaruh Jepang agar segera memproklamasikan kemerdekaan',
        'Menunggu kedatangan pasukan Sekutu ke Karawang',
        'Melaksanakan sidang terakhir PPKI',
        'Menyusun Undang-Undang Dasar 1945'
      ],
      answer: 0,
      fact: 'Perbedaan pendapat antara golongan tua dan golongan muda akhirnya diselesaikan setelah Ahmad Soebardjo menjamin bahwa Proklamasi akan dibacakan selambat-lambatnya 17 Agustus 1945 pukul 12.00 siang.'
    },
    {
      icon: '⌨️',
      artifact: 'Artefak: Mesin Tik Konsulat Jerman (17 Agustus 1945 Dini Hari)',
      question: 'Siapakah tokoh yang mengetik naskah autentik Proklamasi Kemerdekaan Indonesia di rumah Laksamana Tadashi Maeda?',
      options: ['Sukarni', 'B.M. Diah', 'Sayuti Melik', 'Wikana'],
      answer: 2,
      fact: 'Mesin tik yang digunakan Sayuti Melik dipinjam dari kantor perwakilan Angkatan Laut Jerman di Jakarta karena rumah Laksamana Maeda hanya memiliki mesin tik berhuruf Kanji.'
    },
    {
      icon: '🇮🇩',
      artifact: 'Artefak: Bendera Pusaka Sang Saka Merah Putih',
      question: 'Di jalan manakah teks Proklamasi Kemerdekaan Indonesia dibacakan oleh Ir. Soekarno pada Jumat, 17 Agustus 1945 pukul 10.00 WIB?',
      options: ['Lapangan Ikada', 'Jl. Pegangsaan Timur No. 56, Jakarta', 'Jl. Imam Bonjol No. 1, Jakarta', 'Gedung Kramat Raya No. 106'],
      answer: 1,
      fact: 'Bendera Merah Putih yang dikibarkan oleh Latief Hendraningrat dan Suhud pada upacara tersebut dijahit tangan oleh Ibu Fatmawati dari dua helai kain katun Jepang.'
    }
  ],
  era4: [
    {
      icon: '🕌',
      artifact: 'Artefak: Bandar Perdagangan Samudera Pasai',
      question: 'Islam masuk ke wilayah Aceh pada abad ke...',
      options: ['Ke-7', 'Ke-8', 'Ke-20', 'Ke-5'],
      answer: 0,
      fact: 'Islam masuk ke wilayah Aceh pada abad ke-7 Masehi (abad ke-1 Hijriyah) langsung dari tanah Arab melalui jalur perdagangan maritim, menjadikannya wilayah pertama di Indonesia yang menerima ajaran Islam.'
    },
    {
      icon: '📜',
      artifact: 'Artefak: Naskah Berita Dinasti Tang & Buya Hamka',
      question: 'Teori yang menyatakan bahwa Islam masuk ke Indonesia langsung dari Arab/Mesir sejak abad ke-7 yang didukung kuat oleh Buya Hamka adalah...',
      options: ['Teori Gujarat (India)', 'Teori Persia', 'Teori Makkah (Arab)', 'Teori Tiongkok'],
      answer: 2,
      fact: 'Teori Makkah didasarkan pada catatan musafir Tiongkok abad ke-7 (tahun 674 M) yang menyebut adanya pemukiman pedagang Arab (Ta-Shih) di pesisir barat Barus, Sumatera Utara.'
    },
    {
      icon: '🎭',
      artifact: 'Artefak: Wayang Kulit & Gamelan Sekaten',
      question: 'Tokoh Wali Songo yang dikenal sangat piawai menyebarkan ajaran Islam melalui media kesenian wayang kulit dan gubahan tembang Jawa adalah...',
      options: ['Sunan Kalijaga (Raden Said)', 'Sunan Giri', 'Sunan Bonang', 'Sunan Gunung Jati'],
      answer: 0,
      fact: 'Sunan Kalijaga menggunakan tembang seperti Ilir-Ilir dan lakon wayang bernafaskan Islam, di mana para penonton yang ingin menyaksikan cukup bersyahadat (syahadatain/sekaten).'
    }
  ]
};

const Database = {
  init() {
    if (!localStorage.getItem(DB_KEYS.QUESTIONS)) {
      localStorage.setItem(DB_KEYS.QUESTIONS, JSON.stringify(DEFAULT_QUESTIONS));
    }
    if (!localStorage.getItem(DB_KEYS.PLAYERS)) {
      localStorage.setItem(DB_KEYS.PLAYERS, JSON.stringify({}));
    }
  },

  getQuestions() {
    return JSON.parse(localStorage.getItem(DB_KEYS.QUESTIONS)) || DEFAULT_QUESTIONS;
  },

  addQuestion(eraId, questionObj) {
    const all = this.getQuestions();
    if (!all[eraId]) all[eraId] = [];
    all[eraId].push(questionObj);
    localStorage.setItem(DB_KEYS.QUESTIONS, JSON.stringify(all));
  },

  getTotalQuestionsCount() {
    const all = this.getQuestions();
    return Object.values(all).reduce((sum, arr) => sum + arr.length, 0);
  },

  getAllPlayers() {
    return JSON.parse(localStorage.getItem(DB_KEYS.PLAYERS)) || {};
  },

  getOrCreatePlayer(name) {
    const cleanName = name.trim();
    const key = cleanName.toLowerCase();
    const players = this.getAllPlayers();

    if (!players[key]) {
      players[key] = {
        name: cleanName,
        score: 0,
        completedEras: [],
        lastActive: new Date().toLocaleDateString('id-ID', {
          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        })
      };
      localStorage.setItem(DB_KEYS.PLAYERS, JSON.stringify(players));
    }

    localStorage.setItem(DB_KEYS.ACTIVE_PLAYER, key);
    return players[key];
  },

  getActivePlayer() {
    const key = localStorage.getItem(DB_KEYS.ACTIVE_PLAYER);
    if (!key) return null;
    const players = this.getAllPlayers();
    return players[key] || null;
  },

  updatePlayerProgress(pointsEarned, completedEraId = null) {
    const key = localStorage.getItem(DB_KEYS.ACTIVE_PLAYER);
    if (!key) return null;

    const players = this.getAllPlayers();
    const player = players[key];
    if (!player) return null;

    player.score += pointsEarned;
    if (completedEraId && !player.completedEras.includes(completedEraId)) {
      player.completedEras.push(completedEraId);
    }
    player.lastActive = new Date().toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    players[key] = player;
    localStorage.setItem(DB_KEYS.PLAYERS, JSON.stringify(players));
    return player;
  },

  resetAll() {
    localStorage.removeItem(DB_KEYS.PLAYERS);
    localStorage.removeItem(DB_KEYS.QUESTIONS);
    localStorage.removeItem(DB_KEYS.ACTIVE_PLAYER);
    this.init();
  }
};