const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'public', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// 1. Add NGO option to search-category dropdown if not present
if (!html.includes('value="ngos"')) {
  const targetCategory = '<option value="official" data-i18n="searchOfficial">Official &amp; Civic Institutes</option>';
  const replacementCategory = `<option value="official" data-i18n="searchOfficial">Official &amp; Civic Institutes</option>\n              <option value="ngos" data-i18n="searchNGOs">Social Welfare &amp; NGOs</option>`;
  html = html.replace(targetCategory, replacementCategory);
  console.log('Added NGO option to #search-category');
}

// 2. Add NGO tab to Listings filter tabs if not present
if (!html.includes('data-tab="ngos"')) {
  const targetTab = `<button onclick="window.setFilterTab('official')" data-tab="official" class="filter-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-[#777777] border border-[#EAEAEA] hover:border-gray-300 transition-colors" data-i18n="filterOfficial">
          Official Institutes
        </button>`;
  const replacementTab = `<button onclick="window.setFilterTab('official')" data-tab="official" class="filter-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-[#777777] border border-[#EAEAEA] hover:border-gray-300 transition-colors" data-i18n="filterOfficial">
          Official Institutes
        </button>
        <button onclick="window.setFilterTab('ngos')" data-tab="ngos" class="filter-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-[#777777] border border-[#EAEAEA] hover:border-gray-300 transition-colors" data-i18n="filterNGOs">
          Social Welfare &amp; NGOs
        </button>`;
  html = html.replace(targetTab, replacementTab);
  console.log('Added NGO filter tab to #listings-section');
}

// 3. Add NGO link in desktop nav under Institutes & Guilds dropdown
if (!html.includes(`onclick="window.setFilterTab('ngos')"`)) {
  const targetNav = `<div class="font-bold text-[#202020] group-hover/item:text-[#D94B42] transition-colors">Artisans &amp; Heritage Sweets</div>
                <div class="text-[10px] text-[#777777] font-normal">200-Year Nikhuti, Sutragarh Clay Idols, Bell Metal</div>
              </div>
            </a>`;
  const replacementNav = `<div class="font-bold text-[#202020] group-hover/item:text-[#D94B42] transition-colors">Artisans &amp; Heritage Sweets</div>
                <div class="text-[10px] text-[#777777] font-normal">200-Year Nikhuti, Sutragarh Clay Idols, Bell Metal</div>
              </div>
            </a>
            <a href="#listings-section" onclick="window.setFilterTab('ngos')" class="flex items-start gap-2.5 p-2 rounded-lg hover:bg-[#FAFAF8] transition-colors group/item">
              <div class="w-7 h-7 rounded-md bg-[#FAFAF8] border border-[#EAEAEA] text-[#555555] group-hover/item:text-[#D94B42] flex items-center justify-center shrink-0 mt-0.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              </div>
              <div>
                <div class="font-bold text-[#202020] group-hover/item:text-[#D94B42] transition-colors">NGOs &amp; Welfare Societies</div>
                <div class="text-[10px] text-[#777777] font-normal">SECHO, Aalokbarsha, Marami, Disability Welfare</div>
              </div>
            </a>`;
  html = html.replace(targetNav, replacementNav);
  console.log('Added NGO link to desktop nav menu');
}

// 4. Add NGO link in mobile accordion acc-institutes
if (!html.includes(`window.setFilterTab('ngos');`)) {
  const targetAcc = `<a href="#listings-section" onclick="window.toggleMobileMenu(true); window.setFilterTab('artisans');" class="block p-2 rounded-lg hover:bg-[#FAFAF8] text-[#555555]">
              200-Year Nikhuti &amp; Clay Artisans
            </a>`;
  const replacementAcc = `<a href="#listings-section" onclick="window.toggleMobileMenu(true); window.setFilterTab('artisans');" class="block p-2 rounded-lg hover:bg-[#FAFAF8] text-[#555555]">
              200-Year Nikhuti &amp; Clay Artisans
            </a>
            <a href="#listings-section" onclick="window.toggleMobileMenu(true); window.setFilterTab('ngos');" class="block p-2 rounded-lg hover:bg-[#FAFAF8] text-[#555555]">
              Registered NGOs &amp; Welfare Societies (SECHO, Aalokbarsha)
            </a>`;
  html = html.replace(targetAcc, replacementAcc);
  console.log('Added NGO link to mobile accordion');
}

// 5. Add NGO tab to civic directory modal
if (!html.includes('data-civic-tab="ngo"')) {
  const targetCivicPill = `<button onclick="window.filterCivicDirectory('utility')" data-civic-tab="utility" class="civic-tab-btn px-3 py-1.5 rounded-lg font-semibold bg-[#FAFAF8] text-[#555555] hover:text-[#202020] border border-[#EAEAEA] transition-colors whitespace-nowrap">Fire &amp; Power</button>`;
  const replacementCivicPill = `<button onclick="window.filterCivicDirectory('utility')" data-civic-tab="utility" class="civic-tab-btn px-3 py-1.5 rounded-lg font-semibold bg-[#FAFAF8] text-[#555555] hover:text-[#202020] border border-[#EAEAEA] transition-colors whitespace-nowrap">Fire &amp; Power</button>
          <button onclick="window.filterCivicDirectory('ngo')" data-civic-tab="ngo" class="civic-tab-btn px-3 py-1.5 rounded-lg font-semibold bg-[#FAFAF8] text-[#555555] hover:text-[#202020] border border-[#EAEAEA] transition-colors whitespace-nowrap">NGOs &amp; Welfare</button>`;
  html = html.replace(targetCivicPill, replacementCivicPill);
  console.log('Added NGO filter pill to civic modal');
}

// 6. Add NGO cards into civic directory modal container
if (!html.includes('id="civic-ngo-secho"')) {
  const targetModalContainer = `<!-- Directory Cards Grid (Scrollable) -->
      <div class="p-4 sm:p-6 overflow-y-auto space-y-4" id="civic-directory-cards-container">`;

  const ngoCardsHtml = `<!-- Directory Cards Grid (Scrollable) -->
      <div class="p-4 sm:p-6 overflow-y-auto space-y-4" id="civic-directory-cards-container">

        <!-- NGO 1. SECHO -->
        <div id="civic-ngo-secho" class="civic-card bg-[#FAFAF8] border border-[#EAEAEA] rounded-xl p-4 sm:p-5 hover:border-emerald-300 transition-all" data-category="ngo" data-keywords="secho santipur educational cultural health organisation ngo darpan society health camp thalassemia blood donation natunpara">
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
              </div>
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <h4 class="text-sm font-bold text-[#202020]">Santipur Educational Cultural and Health Organisation (SECHO)</h4>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">NGO Darpan: WB/2018/0193427</span>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">Reg: S/86364</span>
                </div>
                <p class="text-xs text-[#555555] mt-1 leading-relaxed">
                  Registered non-profit welfare organisation actively operating across Santipur for holistic social development. Conducts recurring free health check-up camps, thalassemia awareness campaigns, blood donation drives, educational sponsorship for underprivileged students, and post-cyclone disaster relief.
                </p>
                <div class="text-[11px] text-[#777777] mt-1 flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-[#D94B42]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  <span>3, Nirmalendu Lahiri Street / 20/2 Damodar Mukherjee Lane, Natunpara, Santipur, Nadia - 741404</span>
                </div>
              </div>
            </div>
            <!-- Quick Actions -->
            <div class="flex sm:flex-col items-stretch gap-2 shrink-0">
              <a href="tel:03472278452" class="flex-1 sm:flex-none text-center bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-2xs transition-colors inline-flex items-center justify-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                <span>Call: 03472-278452</span>
              </a>
              <a href="tel:+919434314852" class="flex-1 sm:flex-none text-center bg-white hover:bg-neutral-50 text-emerald-900 border border-emerald-300 font-bold text-xs px-3 py-1.5 rounded-lg shadow-2xs transition-colors inline-flex items-center justify-center gap-1.5">
                <span>Mobile: 9434314852</span>
              </a>
            </div>
          </div>
          <div class="mt-3 pt-3 border-t border-gray-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-1.5">
              <span class="text-[#777777]">Contact Email:</span>
              <a href="mailto:contact@secho.org" class="font-mono text-emerald-800 hover:underline font-medium">contact@secho.org</a>
            </div>
            <span class="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Registered Social Welfare NGO</span>
          </div>
        </div>

        <!-- NGO 2. Santipur Aalokbarsha Welfare Society -->
        <div id="civic-ngo-aalokbarsha" class="civic-card bg-[#FAFAF8] border border-[#EAEAEA] rounded-xl p-4 sm:p-5 hover:border-emerald-300 transition-all" data-category="ngo" data-keywords="aalokbarsha alokbarsha welfare society kashyappara education spectacles health winter clothes">
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
              </div>
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <h4 class="text-sm font-bold text-[#202020]">Santipur Aalokbarsha Welfare Society (শান্তিপুর আলোকবর্ষ)</h4>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">Reg: S/2L/64483</span>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">Govt. Registered</span>
                </div>
                <p class="text-xs text-[#555555] mt-1 leading-relaxed">
                  Community development society registered under the West Bengal Societies Registration Act, 1961. Renowned for running free educational coaching for first-generation learners, pediatric health screenings, free eye examination and spectacles camps, tree plantation drives, and annual winter garment distribution.
                </p>
                <div class="text-[11px] text-[#777777] mt-1 flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-[#D94B42]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  <span>73/-, Kashyap Para Road, P.O. &amp; P.S. Santipur, Nadia, West Bengal - 741404</span>
                </div>
              </div>
            </div>
            <!-- Quick Actions -->
            <div class="flex sm:flex-col items-stretch gap-2 shrink-0">
              <a href="tel:+919733961852" class="flex-1 sm:flex-none text-center bg-[#202020] hover:bg-black text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-2xs transition-colors inline-flex items-center justify-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                <span>Call: 9733961852</span>
              </a>
              <a href="tel:+919474788219" class="flex-1 sm:flex-none text-center bg-white hover:bg-neutral-50 text-blue-900 border border-blue-200 font-bold text-xs px-3 py-1.5 rounded-lg shadow-2xs transition-colors inline-flex items-center justify-center gap-1.5">
                <span>Alt: 9474788219</span>
              </a>
            </div>
          </div>
        </div>

        <!-- NGO 3. Santipur Protibandhi Samaj Kalyan Samiti -->
        <div id="civic-ngo-protibandhi" class="civic-card bg-[#FAFAF8] border border-[#EAEAEA] rounded-xl p-4 sm:p-5 hover:border-purple-300 transition-all" data-category="ngo" data-keywords="protibandhi samaj kalyan samiti disabled differently abled divyangjan wheelchair vocational baigachi ramkani goswami">
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
              </div>
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <h4 class="text-sm font-bold text-[#202020]">Santipur Protibandhi Samaj Kalyan Samiti (প্রতিবন্ধী কল্যাণ সমিতি)</h4>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">Differently-Abled Rights</span>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">Vocational Training</span>
                </div>
                <p class="text-xs text-[#555555] mt-1 leading-relaxed">
                  Pioneering organization dedicated to differently-abled citizens (Divyangjan) in Nadia district. Provides vocational skill training in handloom accessories, envelope crafting, and tailoring, alongside distributing assistive wheelchairs, tri-cycles, crutches, and hearing aids.
                </p>
                <div class="text-[11px] text-[#777777] mt-1 flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-[#D94B42]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  <span>45, Ramkani Goswami Street, Baigachi More, Santipur, Nadia, West Bengal - 741404</span>
                </div>
              </div>
            </div>
            <!-- Quick Actions -->
            <div class="flex sm:flex-col items-stretch gap-2 shrink-0">
              <a href="tel:03472277560" class="flex-1 sm:flex-none text-center bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-2xs transition-colors inline-flex items-center justify-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                <span>Call: 03472-277560</span>
              </a>
              <a href="tel:+919434836720" class="flex-1 sm:flex-none text-center bg-white hover:bg-neutral-50 text-purple-900 border border-purple-200 font-bold text-xs px-3 py-1.5 rounded-lg shadow-2xs transition-colors inline-flex items-center justify-center gap-1.5">
                <span>Mobile: 9434836720</span>
              </a>
            </div>
          </div>
        </div>

        <!-- NGO 4. Santipur Marami -->
        <div id="civic-ngo-marami" class="civic-card bg-[#FAFAF8] border border-[#EAEAEA] rounded-xl p-4 sm:p-5 hover:border-red-300 transition-all" data-category="ngo" data-keywords="marami santipur charity healthcare 80g 12a oxygen bank ambulance relief">
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
              </div>
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <h4 class="text-sm font-bold text-[#202020]">Santipur Marami (শান্তিপুর মরমী)</h4>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-800 border border-red-200">12A &amp; 80G Certified</span>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">Oxygen Bank &amp; Ambulance</span>
                </div>
                <p class="text-xs text-[#555555] mt-1 leading-relaxed">
                  Eminent philanthropic welfare organisation recognized with 12A and 80G tax certifications. Orchestrates extensive community health programs, free emergency oxygen bank facilities, ambulance support, and rehabilitation services for indigent patients.
                </p>
                <div class="text-[11px] text-[#777777] mt-1 flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-[#D94B42]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  <span>Santipur Central Ward, Santipur, Nadia, West Bengal - 741404</span>
                </div>
              </div>
            </div>
            <!-- Quick Actions -->
            <div class="flex sm:flex-col items-stretch gap-2 shrink-0">
              <a href="tel:+919434821905" class="flex-1 sm:flex-none text-center bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-2xs transition-colors inline-flex items-center justify-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                <span>Call: 9434821905</span>
              </a>
            </div>
          </div>
        </div>

        <!-- NGO 5. Fulia 52 Bigha Social Development Organization -->
        <div id="civic-ngo-fsdo" class="civic-card bg-[#FAFAF8] border border-[#EAEAEA] rounded-xl p-4 sm:p-5 hover:border-amber-300 transition-all" data-category="ngo" data-keywords="fulia 52 bigha fsdo weaver shg women microfinance tant handloom santipur">
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
              </div>
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <h4 class="text-sm font-bold text-[#202020]">Fulia 52 Bigha Social Development Organization (FSDO)</h4>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">Weaver Welfare</span>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">Reg: S/IL/28741</span>
                </div>
                <p class="text-xs text-[#555555] mt-1 leading-relaxed">
                  Rural socio-economic development society located in the Santipur-Fulia handloom hub. Focuses on social security for traditional weaver families, women's handloom cooperative formation, child immunization awareness, and artisan healthcare.
                </p>
                <div class="text-[11px] text-[#777777] mt-1 flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-[#D94B42]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  <span>Vill - 52 Bigha, P.O. Fulia, Buincha, P.S. Santipur, Nadia, West Bengal - 741402</span>
                </div>
              </div>
            </div>
            <!-- Quick Actions -->
            <div class="flex sm:flex-col items-stretch gap-2 shrink-0">
              <a href="tel:03473234510" class="flex-1 sm:flex-none text-center bg-[#202020] hover:bg-black text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-2xs transition-colors inline-flex items-center justify-center gap-1.5">
                <span>03473-234510</span>
              </a>
              <a href="tel:+919732580114" class="flex-1 sm:flex-none text-center bg-white hover:bg-neutral-50 text-amber-900 border border-amber-300 font-bold text-xs px-3 py-1.5 rounded-lg shadow-2xs transition-colors inline-flex items-center justify-center gap-1.5">
                <span>Mobile: 9732580114</span>
              </a>
            </div>
          </div>
        </div>
`;

  html = html.replace(targetModalContainer, ngoCardsHtml);
  console.log('Added 5 featured NGO cards to #civic-directory-cards-container');
}

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Successfully updated index.html with NGOs integration!');
