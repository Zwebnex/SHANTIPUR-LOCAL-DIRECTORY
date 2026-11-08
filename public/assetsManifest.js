// assetsManifest.js - Central Asset Registry & Fallback Shaders for Shantipur Heritage Platform
window.SHANTIPUR_ASSETS = {
  version: "2.0.0",
  uploaded_photos: [
    {
      id: "hero_radha_raman",
      title: "Sri Sri Radha Raman Jiu Deities (Shantipur)",
      category: "hero_frames",
      src: "uploads/hero_radha_raman_jiu.jpg",
      aspectRatio: "16:9",
      tags: ["Radha Raman Jiu", "Vaishnava", "Candlelight", "Mukut", "Sanctuary"]
    },
    {
      id: "agameswari_photo",
      title: "Maa Agameswari (420 Years)",
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
      title: "Poteswari Mata / Divine Blue Iconography",
      category: "kalipuja_shrines",
      src: "uploads/blue_kali_16x9_4k (1).png",
      aspectRatio: "16:9",
      tags: ["Poteswari", "Pata Scroll Transition", "Barajiakur", "Vibrant Azure"]
    }
  ],

  // Fallback high-art procedural SVG shaders
  fallbacks: {
    hero: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="800" height="450" fill="%231a1820"/><circle cx="400" cy="225" r="260" fill="%23d94b42" opacity="0.15"/><text x="50%" y="50%" font-family="sans-serif" font-size="24" font-weight="600" fill="%23fafaf8" text-anchor="middle">SHANTIPUR HERITAGE</text></svg>`,
    temple: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="800" height="450" fill="%23221e1a"/><text x="50%" y="50%" font-family="sans-serif" font-size="22" font-weight="600" fill="%23b79550" text-anchor="middle">HISTORIC TEMPLE</text></svg>`,
    tant: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="800" height="450" fill="%231a1e22"/><text x="50%" y="50%" font-family="sans-serif" font-size="22" font-weight="600" fill="%23eaeaea" text-anchor="middle">SHANTIPURI TANT HANDLOOM</text></svg>`
  },

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
