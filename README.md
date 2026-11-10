# Santipur Local Directory (শান্তিপুর লোকাল ডিরেক্টরি)
> **Official Handloom, Heritage & Verified Business Portal**  
> **Nadia, West Bengal | Postal Index Number (PIN): 741404**  
> Maintained & Powered by **ZWEBNEX** (Website Designed by Bipra Das)

---

## 🏛️ Project Overview
**Santipur Local Directory** is an enterprise-grade, culturally authentic, and SEO-optimized municipal and heritage portal dedicated to the 500-year-old historic city of **Shantipur (Santipur)** in Nadia, West Bengal. 

Rooted in centuries of living Vaishnava and Shakta traditions, GI-tagged Shantipuri Tant handloom weaving, ancient terracotta architecture, and vibrant community carnivals, this digital portal serves as the single source of truth for tourists, pilgrims, local citizens, master weavers, and verified commercial enterprises.

---

## 📂 Source Code Albums & Architecture

The codebase is organized into cleanly segmented albums:

```text
├── Cultural images/          # High-resolution original photographic assets
├── data/                     # Local datasets, backup schemas & records
├── docs/                     # Architectural, audit & verification reports
│   ├── IMAGE_ASSIGNMENT_AUDIT.md
│   ├── SANTIPUR_IMAGE_RESEARCH_REPORT.md
│   ├── SECURITY_PERMISSION_MATRIX.md
│   ├── SHANTIPUR_HERITAGE_IMAGE_VERIFICATION_REPORT.md
│   ├── SHANTIPUR_ROUTE_MAP_IMPLEMENTATION_REPORT.md
│   ├── SUPABASE_CONNECTION_VERIFICATION.md
│   ├── SUPABASE_SECURITY_AUDIT.md
│   └── SUPABASE_SETUP.md
├── public/                   # Production Web Application & Static Assets
│   ├── index.html            # Main Portal (Search, Routes, Directory, Civic Hub)
│   ├── raas-utsav.html       # Dedicated Raas Utsav & Bama Kali Cultural Page
│   ├── raas-utsav/           # Clean URL directory index (/raas-utsav/)
│   ├── app.js                # Core interactive client logic & search engine
│   ├── shantipurData.js      # Bilingual (EN / বাংলা) editorial content store
│   ├── routesExplorer.js     # Interactive GIS Route radar & waypoint engine
│   ├── listingImageRegistry.js # Certified image assignment registry
│   ├── assetsManifest.js     # Asset and media manifest
│   ├── supabaseClient.js     # Safe anonymous public client
│   ├── robots.txt            # Search engine crawler instructions
│   ├── sitemap.xml           # Full XML sitemap with priority weighting
│   └── images/               # Media albums
│       ├── santipur/
│       │   ├── rash-utsav/            # Raas Mancha, Vigrahas, Bama Kali Dance
│       │   ├── vaishnava-heritage/    # Baro Goswami, Radha Raman Jiu, Shyamchand
│       │   ├── maa-kali/              # Agameswari, Mahishkhagi, Siddheswari
│       │   ├── temples/               # Terracotta & historic shrines
│       │   ├── handloom/              # Master weavers, Tant haats & looms
│       │   ├── institutions/          # College, High School, Municipality
│       │   ├── historical-landmarks/  # Topkhana, STB Railway, Public Library
│       │   └── city-photography/     # Emblems, city roads, markets
│       └── branding/                  # Official ZWEBNEX brand badges
├── scripts/                  # Developer CLI utilities, test suites & builders
│   ├── audit_full_website.js
│   ├── audit_images.js
│   ├── build_manifest.js
│   ├── convert_to_webp.js
│   ├── test_index_integrity.js
│   ├── test_navbar_system.js
│   ├── test_routes_system.js
│   ├── test_security.js
│   └── verify_all_text_contrast.js
├── supabase/                 # Database migrations & SQL editor configurations
│   ├── migrations/           # Versioned RLS migrations
│   └── RUN_THIS_IN_SUPABASE_SQL_EDITOR.sql # Complete zero-mock SQL script
├── server.js                 # Production Node.js server with clean URL routing
├── vercel.json               # Vercel deployment & caching headers config
└── README.md                 # Project documentation
```

---

## 🌟 Key Features

1. **Instant Real-Time Search & Live Filtering:**
   - Multi-field search across heritage listings, handloom centers, and civic hubs.
   - Live dropdown matching with instant clear button.

2. **GIS Heritage Routes & Interactive Map Radar:**
   - 4 Curated Pilgrimage & Artisan Routes:
     - *Route 1: Sacred Shakta & Vaishnava Heritage Trail*
     - *Route 2: Handloom Weavers & Historic Haat Circuit*
     - *Route 3: Rash Utsav & Goswami Bari Darshan*
     - *Route 4: Civic, Colonial & Educational Heritage*
   - Interactive waypoint radar with route distance, walking times, and direct Google Maps navigation.

3. **Dedicated Santipur Raas Utsav & Bama Kali Portal (`/raas-utsav`):**
   - High-definition image figures with schema markup.
   - Detailed history: Advaita Acharya roots, Baro Goswami vigrahas, Bhanga Raas carnival, Rai Raja howdah tradition.
   - Bama Kali shoulder dance documentation with privacy-enhanced YouTube embeds (`youtube-nocookie.com`).

4. **Civic & Emergency Directory Modal:**
   - Santipur Police Station (`03472-278030`, IC Desk, Women Helpdesk).
   - Santipur State General Hospital (`03472-278244`, 131 beds, casualty, 102/108 ambulance).
   - Shantipur Municipality (`03472-278029`, est. 1853).
   - Fire & Emergency Services Station (`101`, `03472-278033`).
   - WBSEDCL Electricity Customer Care (`19121`).
   - National Emergency (`112`), Childline (`1098`), Cyber Crime (`1930`).

5. **Strict Anti-Spam Free Business Portal:**
   - Free merchant registration with mandatory physical address and municipal ward verification.
   - Zero mock data policy.

6. **Search Engine Optimization (SEO) & Sitelinks Architecture:**
   - JSON-LD structured data (`WebSite`, `TouristInformationCenter`, `SiteNavigationElement`, `Event`, `VideoObject`).
   - OpenGraph and Twitter cards.
   - Geotagged metadata for Nadia, West Bengal (`PIN - 741404`).

---

## 🚀 Running Locally

```bash
# Clone the repository
git clone https://github.com/Zwebnex/SHANTIPUR-LOCAL-DIRECTORY.git
cd SHANTIPUR-LOCAL-DIRECTORY

# Install dependencies
npm install

# Start development server
node server.js
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔒 Security Policy
- Sensitive backend credentials, `.env*` files, service keys, and database passwords are **strictly excluded** from version control.
- Client-side connections use anonymous publishable keys governed by PostgreSQL Row Level Security (RLS) policies.

---

## 📜 Credits & Licensing
- **Technology & Design Partner:** ZWEBNEX
- **Founders:** Shankha Subhra Sadhukhan & Bipra Das
- **Lead Developer & Designer:** Bipra Das
- **Copyright:** © 2026 Santipur Local Directory Platform. All rights reserved.
