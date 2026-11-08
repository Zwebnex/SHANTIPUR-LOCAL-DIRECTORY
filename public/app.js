// app.js - Full Interactive Application Controller for Shantipur Heritage Engine
document.addEventListener('DOMContentLoaded', async () => {
  let appData = null;
  let currentVibe = 'shakta';
  let selectedShrinesForParikrama = new Set(['agameswari', 'mahishkhagi', 'bamakali']);

  // Fetch API or fallback
  try {
    const res = await fetch('api/heritage.json');
    if (res.ok) {
      appData = await res.json();
    }
  } catch (e) {
    console.warn('Using local fallback data payload', e);
  }

  // Audio lore synthesizer (temple bell & ambient drone)
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;
  function playTempleChime(freq = 528) {
    try {
      if (!audioCtx) audioCtx = new AudioContext();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, audioCtx.currentTime + 0.1);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.8, audioCtx.currentTime + 1.2);

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 2.6);
    } catch (err) {
      console.log('Audio init on user interaction', err);
    }
  }

  // Render Shrines Grid
  function renderShrines(filterCategory = 'all', searchTerm = '') {
    const container = document.getElementById('shrines-container');
    if (!container || !appData) return;

    const lang = window.SHANTIPUR_DATA.currentLang;
    const t = window.SHANTIPUR_DATA.translations[lang];

    let items = appData.shrines;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      items = items.filter(s =>
        s.name_en.toLowerCase().includes(q) ||
        s.name_bn.toLowerCase().includes(q) ||
        s.ward_location.toLowerCase().includes(q)
      );
    }

    container.innerHTML = items.map((shrine, idx) => {
      const title = lang === 'en' ? shrine.name_en : shrine.name_bn;
      const history = lang === 'en' ? shrine.history_en : shrine.history_bn;
      const imgSrc = window.SHANTIPUR_ASSETS.getSlotPhoto(`shrine_${shrine.id}`, shrine.image_url);
      const isSelected = selectedShrinesForParikrama.has(shrine.id);

      return `
        <div class="tilt-3d-card zero-g-floater relative bg-[#13101C]/80 border border-[#D4AF37]/30 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-[#D92626] group" data-shrine-id="${shrine.id}">
          <div class="zari-sheen absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 z-20"></div>

          <!-- Photo Container -->
          <div class="relative h-64 overflow-hidden bg-black/60">
            <img src="${imgSrc}" alt="${title}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108" onerror="this.src=window.SHANTIPUR_ASSETS.fallbacks.hero" />
            <div class="absolute inset-0 bg-gradient-to-t from-[#13101C] via-transparent to-black/30"></div>

            <!-- Age Badge -->
            <div class="absolute top-4 left-4 bg-[#D92626]/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg border border-red-400/30 flex items-center gap-1.5">
              <span>✦</span> ~${shrine.age_years} ${lang === 'en' ? 'Years' : 'বছর'}
            </div>

            <!-- Swap Photo Button -->
            <button onclick="window.openPhotoSwapper('shrine_${shrine.id}')" class="absolute top-4 right-4 bg-black/70 hover:bg-[#D4AF37] hover:text-black text-white text-xs px-2.5 py-1.5 rounded-full backdrop-blur-md transition-all duration-200 border border-white/20 flex items-center gap-1 shadow-md">
              ${t.swapPhoto}
            </button>
          </div>

          <!-- Content Body -->
          <div class="p-6">
            <div class="text-xs font-semibold text-[#D4AF37] mb-1 flex items-center gap-1.5">
              <span class="inline-block w-2 h-2 rounded-full bg-[#D4AF37]"></span>
              ${shrine.ward_location}
            </div>
            <h3 class="text-xl font-bold text-white mb-2 font-serif group-hover:text-[#D4AF37] transition-colors">
              ${title}
            </h3>
            <p class="text-gray-300 text-sm line-clamp-3 mb-5 leading-relaxed font-sans">
              ${history}
            </p>

            <!-- Card Actions -->
            <div class="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
              <button onclick="window.openDeepDiveModal('${shrine.id}')" class="flex-1 bg-gradient-to-r from-[#D92626] to-[#FA5C38] hover:from-[#FA5C38] hover:to-[#D92626] text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all duration-300 text-center tracking-wide flex items-center justify-center gap-1.5">
                <span>✦</span> ${t.deepDive}
              </button>

              <button onclick="window.toggleParikramaShrine('${shrine.id}')" class="px-3 py-2.5 rounded-xl border ${isSelected ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'border-white/20 text-white hover:border-[#D4AF37] hover:text-[#D4AF37]'} text-xs font-bold transition-all duration-200" title="Toggle Parikrama Checkpoint">
                ${isSelected ? '✓' : '+'}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Rebind tilt cards
    window.SHANTIPUR_PHYSICS.initTiltCards();
    window.SHANTIPUR_PHYSICS.initFloatingCards();
  }

  // Deep Dive Modal
  window.openDeepDiveModal = function(shrineId) {
    if (!appData) return;
    const s = appData.shrines.find(item => item.id === shrineId);
    if (!s) return;

    playTempleChime(440);

    const lang = window.SHANTIPUR_DATA.currentLang;
    const modal = document.getElementById('deep-dive-modal');
    const content = document.getElementById('deep-dive-content');

    const title = lang === 'en' ? s.name_en : s.name_bn;
    const history = lang === 'en' ? s.history_en : s.history_bn;
    const rituals = lang === 'en' ? s.rituals_en : s.rituals_bn;
    const imgSrc = window.SHANTIPUR_ASSETS.getSlotPhoto(`shrine_${s.id}`, s.image_url);

    content.innerHTML = `
      <div class="relative rounded-2xl overflow-hidden bg-[#0D0A14] border border-[#D4AF37]/50 shadow-2xl max-w-3xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
        <!-- Close Button -->
        <button onclick="window.closeDeepDiveModal()" class="absolute top-4 right-4 z-30 bg-black/70 hover:bg-[#D92626] text-white w-9 h-9 rounded-full flex items-center justify-center transition-all text-base border border-white/20 shadow-lg">
          ✕
        </button>

        <!-- Hero Header -->
        <div class="relative h-72 sm:h-80 overflow-hidden">
          <img src="${imgSrc}" class="w-full h-full object-cover" onerror="this.src=window.SHANTIPUR_ASSETS.fallbacks.hero" />
          <div class="absolute inset-0 bg-gradient-to-t from-[#0D0A14] via-[#0D0A14]/50 to-transparent"></div>
          <div class="absolute bottom-6 left-6 right-6">
            <span class="inline-block px-3 py-1 bg-[#D92626] text-white text-xs font-bold rounded-full mb-2 tracking-wide uppercase">
              ${s.ward_location} • ~${s.age_years} ${lang === 'en' ? 'Years of Sacred Living Lore' : 'বছরের ঐতিহ্য'}
            </span>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-white font-serif tracking-tight drop-shadow-md">
              ${title}
            </h2>
          </div>
        </div>

        <!-- Body Details -->
        <div class="p-6 sm:p-8 space-y-6">
          <!-- Audio Lore Player -->
          <div class="p-4 rounded-xl bg-[#1A1428] border border-[#D4AF37]/30 flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <button onclick="window.playLoreAudio('${s.id}')" class="w-12 h-12 rounded-full bg-gradient-to-r from-[#D92626] to-[#FA5C38] flex items-center justify-center text-white text-xl shadow-lg hover:scale-105 transition-transform">
                ▶
              </button>
              <div>
                <h4 class="text-white text-sm font-bold">${lang === 'en' ? 'Sacred Bell & Lore Chime' : 'পবিত্র ঘণ্টা ও স্তোত্রধ্বনি'}</h4>
                <p class="text-gray-400 text-xs">${lang === 'en' ? 'Listen to authentic 528Hz meditative bell resonance' : '৫২৮ হার্টজের প্রশান্তিময় ঘণ্টা ধ্বনি শুনুন'}</p>
              </div>
            </div>
            <a href="${s.location_pin}" target="_blank" rel="noopener noreferrer" class="px-4 py-2 bg-[#D4AF37]/20 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black text-xs font-bold rounded-lg border border-[#D4AF37] transition-all flex items-center gap-1.5 whitespace-nowrap">
              📍 ${lang === 'en' ? 'Google Maps' : 'গুগল ম্যাপস'}
            </a>
          </div>

          <!-- Historical Origin -->
          <div>
            <h3 class="text-lg font-bold text-[#D4AF37] font-serif mb-2 flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-[#D92626]"></span>
              ${lang === 'en' ? 'Historical Legacy & Lineage' : 'ঐতিহাসিক পটভূমি ও বংশপরম্পরা'}
            </h3>
            <p class="text-gray-200 leading-relaxed font-sans text-sm sm:text-base bg-white/5 p-4 rounded-xl border border-white/5">
              ${history}
            </p>
          </div>

          <!-- Ritual Highlights -->
          <div>
            <h3 class="text-lg font-bold text-[#FA5C38] font-serif mb-2 flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-[#FA5C38]"></span>
              ${lang === 'en' ? 'Special Ritual Highlights & Immersion Traditions' : 'বিশেষ পূজাবিধি ও বিসর্জনের আচার'}
            </h3>
            <p class="text-gray-200 leading-relaxed font-sans text-sm sm:text-base bg-white/5 p-4 rounded-xl border border-white/5">
              ${rituals}
            </p>
          </div>

          <!-- Footer Button -->
          <div class="pt-4 flex justify-end">
            <button onclick="window.closeDeepDiveModal()" class="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition-all">
              ${lang === 'en' ? 'Close Lore' : 'বন্ধ করুন'}
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  };

  window.closeDeepDiveModal = function() {
    const modal = document.getElementById('deep-dive-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  };

  window.playLoreAudio = function(id) {
    playTempleChime(id === 'agameswari' ? 528 : id === 'mahishkhagi' ? 432 : 594);
  };

  // Parikrama Selection & Calculator
  window.toggleParikramaShrine = function(id) {
    if (selectedShrinesForParikrama.has(id)) {
      selectedShrinesForParikrama.delete(id);
    } else {
      selectedShrinesForParikrama.add(id);
    }
    renderShrines();
    updateParikramaEstimates();
  };

  function updateParikramaEstimates() {
    const count = selectedShrinesForParikrama.size;
    const estTotoEl = document.getElementById('est-toto-time');
    const estWalkEl = document.getElementById('est-walk-time');
    const selectedListEl = document.getElementById('selected-shrine-list');
    const lang = window.SHANTIPUR_DATA.currentLang;

    // 15 mins per shrine + 8 min toto travel between wards, 20 min walking
    const totoMins = count * 15 + Math.max(0, (count - 1) * 8);
    const walkMins = count * 15 + Math.max(0, (count - 1) * 22);

    if (estTotoEl) estTotoEl.textContent = `${totoMins} ${lang === 'en' ? 'Mins (~' + (totoMins/60).toFixed(1) + ' hrs)' : 'মিনিট'}`;
    if (estWalkEl) estWalkEl.textContent = `${walkMins} ${lang === 'en' ? 'Mins (~' + (walkMins/60).toFixed(1) + ' hrs)' : 'মিনিট'}`;

    if (selectedListEl && appData) {
      const selected = appData.shrines.filter(s => selectedShrinesForParikrama.has(s.id));
      selectedListEl.innerHTML = selected.map((s, idx) => `
        <div class="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-white">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-[#D92626] text-white flex items-center justify-center font-bold">${idx + 1}</span>
            <span class="font-bold">${lang === 'en' ? s.name_en : s.name_bn}</span>
          </div>
          <span class="text-gray-400">${s.ward_location.split(',')[0]}</span>
        </div>
      `).join('');
    }
  }

  // Offline Parikrama Pass Downloader
  window.downloadParikramaPass = function() {
    if (!appData) return;
    const lang = window.SHANTIPUR_DATA.currentLang;
    const selected = appData.shrines.filter(s => selectedShrinesForParikrama.has(s.id));

    let passText = `=========================================\n`;
    passText += `  SHANTIPUR HERITAGE PARIKRAMA PASS\n`;
    passText += `  শান্তিপুর সুপ্রাচীন মহোৎসব পরিক্রমা পাস\n`;
    passText += `=========================================\n`;
    passText += `Pin: 741404 | Nadia, West Bengal\n`;
    passText += `Date Generated: ${new Date().toLocaleDateString()}\n`;
    passText += `Total Selected Shrines: ${selected.length}\n\n`;
    passText += `OPTIMIZED NIGHT ROUTE & TIMINGS:\n`;

    selected.forEach((s, idx) => {
      passText += `[Checkpoint ${idx + 1}] ${s.name_en} (~${s.age_years} Yrs)\n`;
      passText += `   Location: ${s.ward_location}\n`;
      passText += `   Ritual Note: ${s.rituals_en.slice(0, 100)}...\n\n`;
    });

    passText += `RITUAL HIGHLIGHT TIMESTAMPS:\n`;
    passText += `- Chakshu Daan: Midnight Amavasya (Agameswari Tala)\n`;
    passText += `- Dadhimangal & Paate Otha: Pre-dawn (Mahishkhagi Para)\n`;
    passText += `- Sandhikshan Mahapuja: Holy 48-minute confluence\n`;
    passText += `- Synchronized Dancing Immersion: Evening following day (Bamakali Tala)\n`;
    passText += `=========================================\n`;

    const blob = new Blob([passText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Shantipur_Parikrama_Pass_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Photo Swapper Modal
  let activeSwapperSlot = null;
  window.openPhotoSwapper = function(slotKey) {
    activeSwapperSlot = slotKey;
    const modal = document.getElementById('photo-swapper-modal');
    const container = document.getElementById('photo-swapper-grid');

    container.innerHTML = window.SHANTIPUR_ASSETS.uploaded_photos.map(p => `
      <div onclick="window.applyPhotoSwap('${p.src}')" class="cursor-pointer group relative rounded-xl overflow-hidden border-2 border-white/20 hover:border-[#D4AF37] transition-all">
        <img src="${p.src}" class="w-full h-36 object-cover group-hover:scale-105 transition-transform" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
        <div class="absolute bottom-2 left-2 right-2 text-white text-xs font-bold truncate">
          ${p.title}
        </div>
      </div>
    `).join('');

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  };

  window.closePhotoSwapper = function() {
    const modal = document.getElementById('photo-swapper-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  };

  window.applyPhotoSwap = function(src) {
    if (activeSwapperSlot) {
      window.SHANTIPUR_ASSETS.setSlotPhoto(activeSwapperSlot, src);
      renderShrines();
      window.closePhotoSwapper();
    }
  };

  // Vibe Mode Switcher
  window.setVibe = function(vibe) {
    currentVibe = vibe;
    const body = document.body;
    const heroBg = document.getElementById('hero-vibe-overlay');
    playTempleChime(vibe === 'shakta' ? 528 : vibe === 'vaishnava' ? 660 : 792);

    document.querySelectorAll('.vibe-tab').forEach(t => {
      t.classList.remove('active-vibe', 'bg-[#D92626]', 'bg-[#E88D2A]', 'bg-[#D4AF37]', 'text-white', 'text-black');
      t.classList.add('bg-white/10', 'text-gray-300');
    });

    const activeBtn = document.getElementById(`vibe-btn-${vibe}`);
    if (vibe === 'shakta') {
      body.style.setProperty('--current-accent', '#D92626');
      if (heroBg) heroBg.style.background = 'radial-gradient(ellipse at 50% 20%, rgba(217, 38, 38, 0.35) 0%, rgba(7, 6, 11, 0.95) 75%)';
      activeBtn?.classList.add('active-vibe', 'bg-[#D92626]', 'text-white');
    } else if (vibe === 'vaishnava') {
      body.style.setProperty('--current-accent', '#E88D2A');
      if (heroBg) heroBg.style.background = 'radial-gradient(ellipse at 50% 20%, rgba(232, 141, 42, 0.35) 0%, rgba(26, 14, 5, 0.95) 75%)';
      activeBtn?.classList.add('active-vibe', 'bg-[#E88D2A]', 'text-white');
    } else if (vibe === 'tant') {
      body.style.setProperty('--current-accent', '#D4AF37');
      if (heroBg) heroBg.style.background = 'radial-gradient(ellipse at 50% 20%, rgba(212, 175, 55, 0.35) 0%, rgba(15, 15, 20, 0.95) 75%)';
      activeBtn?.classList.add('active-vibe', 'bg-[#D4AF37]', 'text-black');
    }
  };

  // Bilingual Switcher
  window.toggleLanguage = function(lang) {
    window.SHANTIPUR_DATA.currentLang = lang;
    const t = window.SHANTIPUR_DATA.translations[lang];

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key]) el.textContent = t[key];
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (t[key]) el.setAttribute('placeholder', t[key]);
    });

    // Update language pill active state
    document.getElementById('lang-btn-en')?.classList.toggle('bg-white/20', lang === 'en');
    document.getElementById('lang-btn-bn')?.classList.toggle('bg-white/20', lang === 'bn');

    renderShrines();
    renderTemples();
    renderHandloom();
    renderHaats();
    renderSweets();
    updateParikramaEstimates();
  };

  // Render Temples & Syncretic Heritage
  function renderTemples() {
    const container = document.getElementById('temples-container');
    if (!container || !appData) return;
    const lang = window.SHANTIPUR_DATA.currentLang;

    container.innerHTML = appData.temples.map(t => {
      const title = lang === 'en' ? t.name_en : t.name_bn;
      const desc = lang === 'en' ? t.significance_en : t.significance_bn;
      const imgSrc = window.SHANTIPUR_ASSETS.getSlotPhoto(`temple_${t.id}`, t.image_url);

      return `
        <div class="tilt-3d-card bg-[#140F22]/90 border border-[#D4AF37]/30 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl group">
          <div class="relative h-56 overflow-hidden">
            <img src="${imgSrc}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.src=window.SHANTIPUR_ASSETS.fallbacks.vaishnava" />
            <div class="absolute inset-0 bg-gradient-to-t from-[#140F22] via-transparent to-black/40"></div>
            <div class="absolute top-4 left-4 bg-[#E88D2A]/90 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              ${t.founded_year}
            </div>
          </div>
          <div class="p-6">
            <span class="text-xs text-[#D4AF37] font-semibold">${t.tradition}</span>
            <h3 class="text-xl font-bold text-white mb-2 font-serif">${title}</h3>
            <p class="text-gray-300 text-sm leading-relaxed">${desc}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  // Render Handloom Weaving Clusters with Loupe Effect
  function renderHandloom() {
    const container = document.getElementById('handloom-container');
    if (!container || !appData) return;
    const lang = window.SHANTIPUR_DATA.currentLang;
    const t = window.SHANTIPUR_DATA.translations[lang];

    container.innerHTML = appData.handloom_clusters.map(c => {
      const title = lang === 'en' ? c.name_en : c.name_bn;
      const desc = lang === 'en' ? c.specialty_en : c.specialty_bn;
      const imgSrc = window.SHANTIPUR_ASSETS.getSlotPhoto(`handloom_${c.id}`, c.image_url);

      return `
        <div class="tilt-3d-card bg-[#111119] border border-[#D4AF37]/40 rounded-2xl p-6 shadow-xl backdrop-blur-xl relative overflow-hidden group">
          <div class="relative h-48 rounded-xl overflow-hidden mb-4 bg-black/40">
            <img src="${imgSrc}" class="w-full h-full object-cover loupe-image group-hover:scale-110 transition-transform duration-500" onerror="this.src=window.SHANTIPUR_ASSETS.fallbacks.tant" />
            <div class="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-[#D4AF37] text-xs font-mono font-bold px-2.5 py-1 rounded-lg border border-[#D4AF37]/30">
              ${c.yarn_count}
            </div>
          </div>
          <span class="text-xs text-[#E88D2A] font-bold uppercase tracking-wider">${c.cluster_area}</span>
          <h4 class="text-lg font-bold text-white mb-2 font-serif">${title}</h4>
          <p class="text-gray-300 text-xs mb-4 leading-relaxed">${desc}</p>
          <div class="pt-3 border-t border-white/10 flex items-center justify-between">
            <span class="text-xs text-gray-400 font-mono">${c.contact_phone}</span>
            <button onclick="window.bookWeaverModal('${c.name_en}')" class="bg-gradient-to-r from-[#D4AF37] to-[#E88D2A] text-black font-bold text-xs px-3 py-2 rounded-lg hover:brightness-110 transition-all flex items-center gap-1">
              <span>☎</span> ${t.bookWeaver}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Render Haat Radar
  function renderHaats() {
    const container = document.getElementById('haats-container');
    if (!container || !appData) return;
    const lang = window.SHANTIPUR_DATA.currentLang;

    container.innerHTML = appData.haats.map(h => {
      const title = lang === 'en' ? h.name_en : h.name_bn;
      const sched = lang === 'en' ? h.schedule_en : h.schedule_bn;
      const desc = lang === 'en' ? h.description_en : h.description_bn;

      return `
        <div class="p-6 rounded-2xl bg-gradient-to-br from-[#181528] to-[#0A0713] border border-[#D4AF37]/30 shadow-xl">
          <div class="flex items-center justify-between mb-3">
            <span class="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ${lang === 'en' ? 'Verified Haat Schedule' : 'যাচাইকৃত হাটের সময়'}
            </span>
            <span class="text-xs text-[#D4AF37]">${h.location}</span>
          </div>
          <h4 class="text-xl font-bold text-white mb-2 font-serif">${title}</h4>
          <p class="text-amber-300 font-mono text-xs mb-3 font-semibold">${sched}</p>
          <p class="text-gray-300 text-xs leading-relaxed">${desc}</p>
        </div>
      `;
    }).join('');
  }

  // Render Sweets & Guilds
  function renderSweets() {
    const container = document.getElementById('sweets-container');
    if (!container || !appData) return;
    const lang = window.SHANTIPUR_DATA.currentLang;

    container.innerHTML = appData.artisans_and_sweets.map(a => {
      const title = lang === 'en' ? a.title_en : a.title_bn;
      const desc = lang === 'en' ? a.description_en : a.description_bn;
      const imgSrc = window.SHANTIPUR_ASSETS.getSlotPhoto(`artisan_${a.id}`, a.image_url);

      return `
        <div class="tilt-3d-card bg-[#140F22]/90 border border-[#D4AF37]/30 rounded-2xl overflow-hidden p-6 shadow-xl backdrop-blur-xl">
          <div class="h-44 rounded-xl overflow-hidden mb-4 bg-black/40">
            <img src="${imgSrc}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500" onerror="this.src=window.SHANTIPUR_ASSETS.fallbacks.hero" />
          </div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-[#D92626] uppercase">${a.category}</span>
            <span class="text-xs text-[#D4AF37] font-mono">${a.origin_era}</span>
          </div>
          <h4 class="text-lg font-bold text-white mb-2 font-serif">${title}</h4>
          <p class="text-gray-300 text-xs leading-relaxed mb-3">${desc}</p>
          <div class="p-2.5 rounded-lg bg-black/40 border border-white/5 text-[11px] text-amber-200">
            <span class="font-bold text-white">${lang === 'en' ? 'Craft Notes: ' : 'উপাদান: '}</span>${a.ingredients_or_material}
          </div>
        </div>
      `;
    }).join('');
  }

  // Live Festival Countdowns (Kartik Amavasya & Bhanga Rash)
  function initCountdowns() {
    // Typical festival approximate targets
    const kaliTarget = new Date('2026-11-09T18:00:00+05:30').getTime();
    const rashTarget = new Date('2026-11-24T18:00:00+05:30').getTime();

    function update() {
      const now = Date.now();

      const diffKali = Math.max(0, kaliTarget - now);
      const kDays = Math.floor(diffKali / (1000 * 60 * 60 * 24));
      const kHours = Math.floor((diffKali / (1000 * 60 * 60)) % 24);
      const kMins = Math.floor((diffKali / 1000 / 60) % 60);
      const kSecs = Math.floor((diffKali / 1000) % 60);

      const dEl = document.getElementById('cd-kali-days');
      const hEl = document.getElementById('cd-kali-hours');
      const mEl = document.getElementById('cd-kali-mins');
      const sEl = document.getElementById('cd-kali-secs');
      if (dEl) dEl.textContent = String(kDays).padStart(2, '0');
      if (hEl) hEl.textContent = String(kHours).padStart(2, '0');
      if (mEl) mEl.textContent = String(kMins).padStart(2, '0');
      if (sEl) sEl.textContent = String(kSecs).padStart(2, '0');

      const diffRash = Math.max(0, rashTarget - now);
      const rDays = Math.floor(diffRash / (1000 * 60 * 60 * 24));
      const rHours = Math.floor((diffRash / (1000 * 60 * 60)) % 24);
      const rdEl = document.getElementById('cd-rash-days');
      const rhEl = document.getElementById('cd-rash-hours');
      if (rdEl) rdEl.textContent = String(rDays).padStart(2, '0');
      if (rhEl) rhEl.textContent = String(rHours).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
  }

  // Story Pass Generator (1080x1920 Instagram/WhatsApp Canvas Card)
  window.generateStoryCard = function() {
    const canvas = document.getElementById('story-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 1080;
    canvas.height = 1920;

    const nameInput = document.getElementById('story-name-input')?.value || 'Devotee / Heritage Explorer';
    const wishSelect = document.getElementById('story-wish-select')?.value || 'Subho Dipaboli & Shantipur Bhanga Rash!';
    const selectedPhotoSrc = document.getElementById('story-photo-select')?.value || 'uploads/kali_idol_16x9_4k.png';

    const bgImg = new Image();
    bgImg.crossOrigin = 'anonymous';
    bgImg.src = selectedPhotoSrc;

    bgImg.onload = () => {
      // Background Image scaled & cropped to 1080x1920
      ctx.drawImage(bgImg, 0, 0, 1080, 1920);

      // Deep atmospheric overlay
      const grad = ctx.createLinearGradient(0, 0, 0, 1920);
      grad.addColorStop(0, 'rgba(7, 6, 11, 0.8)');
      grad.addColorStop(0.3, 'rgba(7, 6, 11, 0.4)');
      grad.addColorStop(0.7, 'rgba(7, 6, 11, 0.7)');
      grad.addColorStop(1, 'rgba(7, 6, 11, 0.98)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1920);

      // Outer Golden Zari Border
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 12;
      ctx.strokeRect(40, 40, 1000, 1840);

      ctx.strokeStyle = 'rgba(217, 38, 38, 0.6)';
      ctx.lineWidth = 4;
      ctx.strokeRect(55, 55, 970, 1810);

      // Top Heritage Seals
      ctx.fillStyle = '#D92626';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✦ 500 YEARS OF SHAKTA & VAISHNAVA HERITAGE ✦', 540, 140);

      ctx.fillStyle = '#F6F2E6';
      ctx.font = 'bold 74px serif';
      ctx.fillText('SHANTIPUR', 540, 230);

      ctx.fillStyle = '#D4AF37';
      ctx.font = '36px serif';
      ctx.fillText('শান্তিপুর • নদিয়া (৭৪১৪০৪)', 540, 290);

      // Devotee Frame Center Glass Card
      ctx.fillStyle = 'rgba(19, 16, 28, 0.85)';
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(100, 1100, 880, 560, 30);
      ctx.fill();
      ctx.stroke();

      // Devotee Name
      ctx.fillStyle = '#D4AF37';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('OFFICIAL PARIKRAMA PASS & GREETINGS', 540, 1180);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 64px serif';
      ctx.fillText(nameInput, 540, 1280);

      // Blessings / Wish
      ctx.fillStyle = '#FA5C38';
      ctx.font = 'italic 36px serif';
      ctx.fillText(`"${wishSelect}"`, 540, 1370);

      // Highlights
      ctx.fillStyle = '#CCCCCC';
      ctx.font = '26px sans-serif';
      ctx.fillText('Agameswari • Mahishkhagi • Bamakali • Boro Goswami Bari • 1409 CE Tant', 540, 1470);

      // QR Code Simulation Placeholder Badge
      ctx.fillStyle = '#D92626';
      ctx.beginPath();
      ctx.roundRect(420, 1530, 240, 80, 20);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('VERIFIED 741404', 540, 1580);

      // Footer
      ctx.fillStyle = '#888888';
      ctx.font = '24px sans-serif';
      ctx.fillText('Generated via Shantipur Heritage Engine • Google Antigravity', 540, 1780);

      // Trigger automatic high-res PNG download
      const link = document.createElement('a');
      link.download = `Shantipur_Story_Pass_${nameInput.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  };

  // Weaver Wholesale Booking Modal
  window.bookWeaverModal = function(weaverName) {
    const text = encodeURIComponent(`Hello ${weaverName}, I saw your Shantipuri Tant handloom collection on Shantipur Heritage Platform. I would like to book a WhatsApp video wholesale catalog session.`);
    window.open(`https://wa.me/919832012345?text=${text}`, '_blank');
  };

  // Search Bar Filter Handlers
  const searchInput = document.getElementById('search-input');
  const searchCategory = document.getElementById('search-category');
  const searchBtn = document.getElementById('search-btn');

  function triggerSearch() {
    const term = searchInput?.value || '';
    const cat = searchCategory?.value || 'all';
    renderShrines(cat, term);
  }

  searchInput?.addEventListener('input', triggerSearch);
  searchCategory?.addEventListener('change', triggerSearch);
  searchBtn?.addEventListener('click', () => {
    triggerSearch();
    document.getElementById('shrines-section')?.scrollIntoView({ behavior: 'smooth' });
  });

  // Init Components
  window.SHANTIPUR_PHYSICS.init();
  renderShrines();
  renderTemples();
  renderHandloom();
  renderHaats();
  renderSweets();
  initCountdowns();
  updateParikramaEstimates();
});
