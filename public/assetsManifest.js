// assetsManifest.js - Central Asset Registry & Fallback Shaders for Shantipur Heritage Engine
window.SHANTIPUR_ASSETS = {
  version: "1.0.0",
  uploaded_photos: [
    {
      id: "agameswari_photo",
      title: "Maa Agameswari (400+ Years)",
      category: "kalipuja_shrines",
      src: "uploads/Maa agameswari 1.png",
      aspectRatio: "16:9",
      tags: ["Agameswari", "Tantra", "Krishnananda Agambagish", "Goddess Kali"]
    },
    {
      id: "kali_idol_monumental",
      title: "Mahishkhagi / Monumental Kali Idol",
      category: "kalipuja_shrines",
      src: "uploads/kali_idol_16x9_4k.png",
      aspectRatio: "16:9",
      tags: ["Mahishkhagi", "Vedic Marriage Ritual", "Krishnachandra", "Grand Idol"]
    },
    {
      id: "night_fiery_ritual",
      title: "Fiery Mahanisha Amavasya Ritual & Dhunuchi",
      category: "hero_frames",
      src: "uploads/Fiery Nighttime Kali Puja Ritual.png",
      aspectRatio: "16:9",
      tags: ["Dhunuchi", "Mahanisha", "Tantric Fire", "Amavasya Aarti"]
    },
    {
      id: "bamakali_blue_alcove",
      title: "Maa Bamakali / Fierce Goddess Shrine",
      category: "kalipuja_shrines",
      src: "uploads/Ornate Fierce Goddess Shrine in Blue Alcove.png",
      aspectRatio: "16:9",
      tags: ["Bamakali", "Dancing Immersion", "Left Foot Forward", "Blue Sanctum"]
    },
    {
      id: "poteswari_blue_statue",
      title: "Poteswari Mata / Divine Blue Transcendence",
      category: "kalipuja_shrines",
      src: "uploads/blue_kali_16x9_4k (1).png",
      aspectRatio: "16:9",
      tags: ["Poteswari", "Pata Scroll Transition", "Barajiakur", "Vibrant Azure"]
    },
    {
      id: "style_ref_directory",
      title: "Modern Heritage Discovery Design Reference",
      category: "local_crafts",
      src: "uploads/style_reference.jpg",
      aspectRatio: "1:1",
      tags: ["Directory Style Reference", "Glassmorphic Cards", "Pill Search"]
    }
  ],

  // Fallback high-art procedural SVG shaders (prevents broken image icons if an external path fails)
  fallbacks: {
    hero: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><defs><radialGradient id="g" cx="50%" cy="50%" r="70%"><stop offset="0%" stop-color="%23d92626" stop-opacity="0.8"/><stop offset="50%" stop-color="%23d4af37" stop-opacity="0.3"/><stop offset="100%" stop-color="%2307060b" stop-opacity="0.95"/></radialGradient></defs><rect width="800" height="450" fill="%2307060b"/><circle cx="400" cy="225" r="300" fill="url(%23g)"/><text x="50%" y="48%" font-family="Cinzel, serif" font-size="34" font-weight="bold" fill="%23f6f2e6" text-anchor="middle">SHANTIPUR HERITAGE</text><text x="50%" y="60%" font-family="sans-serif" font-size="16" letter-spacing="4" fill="%23d4af37" text-anchor="middle">500 YEARS OF SACRED CRAFT</text></svg>`,
    vaishnava: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="800" height="450" fill="%231a0e05"/><circle cx="400" cy="225" r="220" fill="%23e88d2a" opacity="0.3"/><path d="M400,100 L440,200 L550,210 L470,280 L490,390 L400,330 L310,390 L330,280 L250,210 L360,200 Z" fill="none" stroke="%23d4af37" stroke-width="3"/><text x="50%" y="78%" font-family="sans-serif" font-size="18" font-weight="bold" fill="%23f6f2e6" text-anchor="middle">BORO GOSWAMI BARI & RASH</text></svg>`,
    tant: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><defs><pattern id="weave" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M0,10 L20,10 M10,0 L10,20" stroke="%23d4af37" stroke-width="1" opacity="0.4"/></pattern></defs><rect width="800" height="450" fill="%230f0f14"/><rect width="800" height="450" fill="url(%23weave)"/><text x="50%" y="50%" font-family="sans-serif" font-size="22" font-weight="bold" fill="%23f6f2e6" text-anchor="middle">GI-TAGGED SHANTIPURI TANT</text><text x="50%" y="62%" font-family="sans-serif" font-size="14" fill="%23e88d2a" text-anchor="middle">100x100 ULTRAFINE WEAVE SINCE 1409 CE</text></svg>`
  },

  // Smart slot assignment helper with localStorage persistence
  getSlotPhoto(slotKey, defaultSrc) {
    const saved = localStorage.getItem('shantipur_slot_' + slotKey);
    if (saved) return saved;
    return defaultSrc;
  },

  setSlotPhoto(slotKey, newSrc) {
    localStorage.setItem('shantipur_slot_' + slotKey, newSrc);
    window.dispatchEvent(new CustomEvent('shantipur_slot_updated', { detail: { slotKey, newSrc } }));
  }
};
