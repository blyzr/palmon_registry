// =====================================================
// CONFIG
// =====================================================
const WORKER_URL = 'https://divine-waterfall-a278.blayzereid.workers.dev';
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzs1wvqbQuuVF0jnL25zNrAjOmYbeHUnoL-bI7UcN1AoP0w77Np3m7rN7aNJvVPxcpH/exec';

// =====================================================
// I18N — UI STRINGS
// =====================================================
const STRINGS = {
  en: {
    combat:'Combat', workers:'Workers', roleCombat:'⚔️ Combat', roleWorker:'⛏️ Worker',
    modalTitle:'Add Palmon', username:'Username',
    usernamePlaceholder:'Your username (required)',
    uploadTitle:'Upload screenshots',
    uploadHint:'Tap or drag – multiple files supported – AI will read name and traits automatically',
    cancel:'Cancel', submitAll:'Submit All',
    reading:'Reading...', scanning:'Scanning with AI...',
    scanned:'Scanned – review below', scanFailed:'Scan failed', fillManually:'fill in manually',
    labelName:'Name', labelRole:'Role', labelTraits:'Traits',
    autoOverride:'auto · override:', noneOption:'— none —', namePlaceholder:'Palmon name',
  },
  tr: {
    combat:'Savaş', workers:'İşçiler', roleCombat:'⚔️ Savaş', roleWorker:'⛏️ İşçi',
    modalTitle:'Palmon Ekle', username:'Kullanıcı Adı',
    usernamePlaceholder:'Kullanıcı adınız (zorunlu)',
    uploadTitle:'Ekran görüntüsü yükle',
    uploadHint:'Dokunun veya sürükleyin – AI adı ve özellikleri otomatik okur',
    cancel:'İptal', submitAll:'Tümünü Gönder',
    reading:'Okunuyor...', scanning:'AI ile taranıyor...',
    scanned:'Tarandı – aşağıyı inceleyin', scanFailed:'Tarama başarısız', fillManually:'manuel doldurun',
    labelName:'Ad', labelRole:'Rol', labelTraits:'Özellikler',
    autoOverride:'otomatik · değiştir:', noneOption:'— yok —', namePlaceholder:'Palmon adı',
  },
  de: {
    combat:'Kampf', workers:'Arbeiter', roleCombat:'⚔️ Kampf', roleWorker:'⛏️ Arbeiter',
    modalTitle:'Palmon Hinzufügen', username:'Benutzername',
    usernamePlaceholder:'Dein Benutzername (erforderlich)',
    uploadTitle:'Screenshots hochladen',
    uploadHint:'Antippen oder ziehen – KI liest Name und Merkmale automatisch',
    cancel:'Abbrechen', submitAll:'Alle Einreichen',
    reading:'Wird gelesen...', scanning:'KI scannt...',
    scanned:'Gescannt – unten prüfen', scanFailed:'Scan fehlgeschlagen', fillManually:'manuell ausfüllen',
    labelName:'Name', labelRole:'Rolle', labelTraits:'Merkmale',
    autoOverride:'auto · überschreiben:', noneOption:'— keine —', namePlaceholder:'Palmon-Name',
  }
};
const COUNTRY_LANG = {
  TR:'tr', DE:'de', AT:'de', CH:'de', LI:'de',
  GB:'en', US:'en', AU:'en', CA:'en', NZ:'en', IE:'en'
};
let currentLang = localStorage.getItem('adhd-lang') || 'en';

function t(key) { return (STRINGS[currentLang] || STRINGS.en)[key] || STRINGS.en[key] || key; }

function applyStrings() {
  document.querySelectorAll('.lang-btn').forEach(b =>
    b.classList.toggle('active', b.id === 'lang-' + currentLang));
  document.querySelectorAll('[data-str]').forEach(el => {
    const val = t(el.dataset.str);
    if (val) el.textContent = val;
  });
  document.querySelectorAll('[data-placeholder]').forEach(el => {
    const val = t(el.dataset.placeholder);
    if (val) el.placeholder = val;
  });
}

function setLang(lang) {
  if (!STRINGS[lang]) return;
  currentLang = lang;
  localStorage.setItem('adhd-lang', lang);
  applyStrings();
  if (allPalmons.length) applyFilters();
  if (queue.length) renderQueue();
}

async function detectLanguage() {
  const stored = localStorage.getItem('adhd-lang');
  if (stored && STRINGS[stored]) { currentLang = stored; applyStrings(); return; }
  const bl = (navigator.language || '').slice(0,2).toLowerCase();
  if (STRINGS[bl]) currentLang = bl;
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
    const d = await res.json();
    const lang = COUNTRY_LANG[d.country_code || ''] || bl || 'en';
    if (STRINGS[lang]) currentLang = lang;
  } catch(_) {}
  applyStrings();
}

// =====================================================
// I18N — TRAIT NAMES
// tName() translates a stored EN trait name for display.
// Falls back to the EN name if no translation exists.
// =====================================================
const TRAIT_NAMES = {
  // All values verified against in-game screenshots (2026-05-08)
  tr: {
    // ── Combat: Attack ───────────────────────────────────────────────
    'Warlike':'Cengaver', 'Belligerent':'Kavgacı', 'Combative':'Hırçın', 'Hostile':'Saldırgan',
    // ── Combat: Crit Damage ──────────────────────────────────────────
    'Heartless':'İnsafsız', 'Ruthless':'Acımasız', 'Brutal':'Yabani', 'Mean':'Kaba',
    // ── Combat: Crit Rate ────────────────────────────────────────────
    'Blessed':'Kutsanmış', 'Fortunate':'Ballı', 'Favored':'Ayrıcalıklı', 'Lucky':'Şanslı',
    // ── Combat: Accuracy ─────────────────────────────────────────────
    'Deadeye':'Keskin İsabet', 'Sharpshooter':'İyi Nişancı', 'Crack Shot':'Çatlak Atış', 'Gunner':'Nişancı',
    // ── Combat: HP ───────────────────────────────────────────────────
    'Vigorous':'Dinç', 'Robust':'Yapılı', 'Energetic':'Enerjik', 'Durable':'Dayanıklı',
    // ── Combat: Defense ──────────────────────────────────────────────
    'Unshakeable':'Sarsılmaz', 'Steadfast':'Kararlı', 'Resolute':'Azimli', 'Rooted':'Sağlam',
    // ── Combat: Crit Defense ─────────────────────────────────────────
    'Diamond Skull':'Elmas Kafa', 'Steel Skull':'Çelik Kafa',
    'Iron Skull':'Demir Kafa', 'Stone Skull':'Taş Kafa',
    // ── Combat: Tenacity ─────────────────────────────────────────────
    'Iron Will':'Demir İrade', 'Unyielding':'Boyun Eğmez', 'Hardy':'Çetin', 'Stubborn':'İnatçı',
    // ── Combat: Evasion ──────────────────────────────────────────────
    'Shadow':'Gölge', 'Elusive':'Ele Avuca Sığmaz', 'Slippery':'Kaygan', 'Nimble':'Atik',
    // ── Combat: Stun Resist ──────────────────────────────────────────
    'Serene':'Sakin', 'Clear-Headed':'Aklı Başında', 'Steady':'Dengeli', 'Calm':'Soğukkanlı',
    // ── Combat: Negative ─────────────────────────────────────────────
    'Embattled':'Sıkışık', 'Faberge Jaw':'Kırılgan Çene', 'Softie':'Dayanıksız',
    'Spineless':'İradesiz', 'Jinxed':'Uğursuz', 'Fumbling':'Beceriksiz', 'Myopic':'Miyop',
    // ── Worker: Move Speed ───────────────────────────────────────────
    'Lightspeed':'Işık Hızı', 'Supersonic':'Süpersonik', 'Fleet-Footed':'Hızlı Ayak', 'Speedy':'Hızlı',
    // ── Worker: Charging ─────────────────────────────────────────────
    'Electric Frenzy':'Elektrik Delisi',
    'Lightning Affinity':'Yıldırım Yatkını', 'Light Affinity':'Yıldırım Yatkını',
    'E-Conductor':'Kondüktör', 'Battery Pack':'Pil Paketi',
    // ── Worker: Smelting ─────────────────────────────────────────────
    'Metal Maestro':'Metal Ustası', 'Forge Fanatic':'Ocak Fanatiği',
    'Bellow Fellow':'Körük İçcisi', 'Anvil Adept':'Örs Ustası',
    // ── Worker: Sawing ───────────────────────────────────────────────
    'Timber Tycoon':'Kereste Patronu', 'Wood Whiz':'Seri Oduncu',
    'Saw Savant':'Bıçkı Alimi', 'Workshopper':'Atölyeci',
    // ── Worker: Negative ─────────────────────────────────────────────
    'Energy Saver':'Enerji Tasarrufu Modu', 'Sluggard':'Uykucu',
    'Soot Allergy':'İş Alerjisi', 'Sawdust Allergy':'Talaş Alerjisi',
    // ── Worker: Job Efficiency ───────────────────────────────────────
    'Workaholic':'İş Tutkunu', 'Industrious':'Çalışkan', 'Diligent':'Gayretli', 'Efficient':'Verimli',
    // ── Worker: Other ────────────────────────────────────────────────
    'Generous':'Cömert',
    // ── Worker: tiered ───────────────────────────────────────────────
    'Alchemist (S)':'Simyacı (S)', 'Alchemist (A)':'Simyacı (A)', 'Alchemist (B)':'Simyacı (B)',
    'Dreamium Hunter (S)':'Özüt Avcısı (S)', 'Dreamium Hunter (A)':'Özüt Avcısı (A)', 'Dreamium Hunter (B)':'Özüt Avcısı (B)',
    'Caffinated (S)':'Kafein Patlaması (S)', 'Caffinated (A)':'Kafein Patlaması (A)', 'Caffinated (B)':'Kafein Patlaması (B)',
    'Light Eater (S)':'Hafif İştahlı (S)', 'Light Eater (A)':'Hafif İştahlı (A)', 'Light Eater (B)':'Hafif İştahlı (B)',
    'Temperate (S)':'Ilımlı (S)', 'Temperate (A)':'Ilımlı (A)', 'Temperate (B)':'Ilımlı (B)',
    'Sweet Dreams (S)':'Tatlı Rüyalar (S)', 'Sweet Dreams (A)':'Tatlı Rüyalar (A)', 'Sweet Dreams (B)':'Tatlı Rüyalar (B)',
    'Comfy (S)':'Rahat (S)', 'Comfy (A)':'Rahat (A)', 'Comfy (B)':'Rahat (B)',
    'Prodigy (S)':'Deha (S)', 'Prodigy (A)':'Deha (A)', 'Prodigy (B)':'Deha (B)',
    'Coach (S)':'Koç (S)', 'Coach (A)':'Koç (A)', 'Coach (B)':'Koç (B)',
    'Healing Touch (S)':'Şifalı Dokunuş (S)', 'Healing Touch (A)':'Şifalı Dokunuş (A)', 'Healing Touch (B)':'Şifalı Dokunuş (B)',
    'Engineer (S)':'Turbo İnşaatçı (S)', 'Engineer (A)':'Turbo İnşaatçı (A)', 'Engineer (B)':'Turbo İnşaatçı (B)',
    'Turbo Builder':'Turbo İnşaatçı',
  },
  de: {
    // ── Combat: Attack ───────────────────────────────────────────────
    'Warlike':'Kriegerseele', 'Belligerent':'Angriffslustig', 'Combative':'Kämpferisch', 'Hostile':'Feindselig',
    // ── Combat: Crit Damage ──────────────────────────────────────────
    'Heartless':'Herzlos', 'Ruthless':'Skrupellos', 'Brutal':'Brutal', 'Mean':'Gemein',
    // ── Combat: Crit Rate ────────────────────────────────────────────
    'Blessed':'Gesegnet', 'Fortunate':'Glückspilz', 'Favored':'Fortuna-Freund', 'Lucky':'Chancen-Champ',
    // ── Combat: Accuracy ─────────────────────────────────────────────
    'Deadeye':'Meisterschütze', 'Sharpshooter':'Scharfschütze', 'Crack Shot':'Schießtalent', 'Gunner':'Waffenkenner',
    // ── Combat: HP ───────────────────────────────────────────────────
    'Vigorous':'Überlebenskämpfer', 'Robust':'Robust', 'Energetic':'Vital', 'Durable':'Zäh',
    // ── Combat: Defense ──────────────────────────────────────────────
    'Unshakeable':'Unerschütterlich', 'Steadfast':'Standhaft', 'Resolute':'Resolut', 'Rooted':'Aufrecht',
    // ── Combat: Crit Defense ─────────────────────────────────────────
    'Diamond Skull':'Diamantschädel', 'Steel Skull':'Stahlschädel',
    'Iron Skull':'Eisenschädel', 'Stone Skull':'Steinschädel',
    // ── Combat: Tenacity ─────────────────────────────────────────────
    'Iron Will':'Eiserner Wille', 'Unyielding':'Unbeugsam', 'Hardy':'Kühn', 'Stubborn':'Hartnäckig',
    // ── Combat: Evasion ──────────────────────────────────────────────
    'Shadow':'Schatten', 'Elusive':'Aalglatt', 'Slippery':'Schlüpfrig', 'Nimble':'Flink',
    // ── Combat: Stun Resist ──────────────────────────────────────────
    'Serene':'Gelassen', 'Clear-Headed':'Nüchtern', 'Steady':'Gefasst', 'Calm':'Ruhig',
    // ── Combat: Negative ─────────────────────────────────────────────
    'Embattled':'Anfällig', 'Faberge Jaw':'Fabergé-Kiefer', 'Softie':'Weichherzig',
    'Spineless':'Rückgratlos', 'Jinxed':'Verflucht', 'Fumbling':'Tollpatsch', 'Myopic':'Halbblind',
    // ── Worker: Move Speed ───────────────────────────────────────────
    'Lightspeed':'Lichtgeschwindigkeit', 'Supersonic':'Schallgeschwindigkeit', 'Fleet-Footed':'Raschfüßig', 'Speedy':'Schnell',
    // ── Worker: Charging ─────────────────────────────────────────────
    'Electric Frenzy':'Elektro-Ekstase',
    'Lightning Affinity':'Blitz-Affinität', 'Light Affinity':'Blitz-Affinität',
    'E-Conductor':'E-Leiter', 'Battery Pack':'Akkupack',
    // ── Worker: Smelting ─────────────────────────────────────────────
    'Metal Maestro':'Metallmeister', 'Forge Fanatic':'Tiegel-Tüftler',
    'Bellow Fellow':'Balgen-Bläser', 'Anvil Adept':'Amboss-Adept',
    // ── Worker: Sawing ───────────────────────────────────────────────
    'Timber Tycoon':'Holzmagnat', 'Wood Whiz':'Balken-Baron',
    'Saw Savant':'Super-Säger', 'Workshopper':'Workshopper',
    // ── Worker: Negative ─────────────────────────────────────────────
    'Energy Saver':'Stromsparer', 'Sluggard':'Lahme Ente',
    'Soot Allergy':'Ruß-Repuls', 'Sawdust Allergy':'Arber-Allergiker',
    // ── Worker: Job Efficiency ───────────────────────────────────────
    'Workaholic':'Arbeitstier', 'Industrious':'Fleißig', 'Diligent':'Eifrig', 'Efficient':'Effizient',
    // ── Worker: Other ────────────────────────────────────────────────
    'Generous':'Großzügig',
    // ── Worker: tiered ───────────────────────────────────────────────
    'Alchemist (S)':'Alchemist (S)', 'Alchemist (A)':'Alchemist (A)', 'Alchemist (B)':'Alchemist (B)',
    'Dreamium Hunter (S)':'Traumium-Jäger (S)', 'Dreamium Hunter (A)':'Traumium-Jäger (A)', 'Dreamium Hunter (B)':'Traumium-Jäger (B)',
    'Caffinated (S)':'Kaffeiniert (S)', 'Caffinated (A)':'Kaffeiniert (A)', 'Caffinated (B)':'Kaffeiniert (B)',
    'Light Eater (S)':'Leichte Kost (S)', 'Light Eater (A)':'Leichte Kost (A)', 'Light Eater (B)':'Leichte Kost (B)',
    'Temperate (S)':'Gemäßigt (S)', 'Temperate (A)':'Gemäßigt (A)', 'Temperate (B)':'Gemäßigt (B)',
    'Sweet Dreams (S)':'Süße Träume (S)', 'Sweet Dreams (A)':'Süße Träume (A)', 'Sweet Dreams (B)':'Süße Träume (B)',
    'Comfy (S)':'Gemütlich (S)', 'Comfy (A)':'Gemütlich (A)', 'Comfy (B)':'Gemütlich (B)',
    'Prodigy (S)':'Wunderkind (S)', 'Prodigy (A)':'Wunderkind (A)', 'Prodigy (B)':'Wunderkind (B)',
    'Coach (S)':'Coach (S)', 'Coach (A)':'Coach (A)', 'Coach (B)':'Coach (B)',
    'Healing Touch (S)':'Heilende Berührung (S)', 'Healing Touch (A)':'Heilende Berührung (A)', 'Healing Touch (B)':'Heilende Berührung (B)',
    'Engineer (S)':'Turbo-Bauer (S)', 'Engineer (A)':'Turbo-Bauer (A)', 'Engineer (B)':'Turbo-Bauer (B)',
    'Turbo Builder':'Turbo-Bauer',
  }
};

function tName(name) {
  return (TRAIT_NAMES[currentLang] || {})[name] || name;
}

// =====================================================
// TRAIT DATA
// =====================================================
const TRAITS = {
  combat: {
    label: 'Combat', icon: '⚔️',
    groups: {
      'Attack':       [['Warlike','S+','+10%'],['Belligerent','S','+7%'],['Combative','A','+4%'],['Hostile','B','+2%']],
      'Crit Damage':  [['Heartless','S+','+15%'],['Ruthless','S','+8%'],['Brutal','A','+4%'],['Mean','B','+3%']],
      'Crit Rate':    [['Blessed','S+','+8%'],['Fortunate','S','+5%'],['Favored','A','+2.5%'],['Lucky','B','+1.5%']],
      'Accuracy':     [['Deadeye','S+','+8%'],['Sharpshooter','S','+5%'],['Crack Shot','A','+2.5%'],['Gunner','B','+1.5%']],
      'HP':           [['Vigorous','S+','+10%'],['Robust','S','+7%'],['Energetic','A','+4%'],['Durable','B','+2%']],
      'Defense':      [['Unshakeable','S+','+10%'],['Steadfast','S','+7%'],['Resolute','A','+4%'],['Rooted','B','+2%']],
      'Crit Defense': [['Diamond Skull','S+','+15%'],['Steel Skull','S','+8%'],['Iron Skull','A','+4%'],['Stone Skull','B','+3%']],
      'Tenacity':     [['Iron Will','S+','+8%'],['Unyielding','S','+5%'],['Hardy','A','+2.5%'],['Stubborn','B','+1.5%']],
      'Evasion':      [['Shadow','S+','+8%'],['Elusive','S','+5%'],['Slippery','A','+2.5%'],['Nimble','B','+1.5%']],
      'Stun Resist':  [['Serene','S+','+12%'],['Clear-Headed','S','+7%'],['Steady','A','+5%'],['Calm','B','+2%']],
    }
  },
  worker: {
    label: 'Worker', icon: '⛏️',
    groups: {
      'Job Efficiency':   [['Workaholic','S+','+25%'],['Industrious','S','+8%'],['Diligent','A','+4%'],['Efficient','B','+2%']],
      'Move Speed':       [['Lightspeed','S+','+15%'],['Supersonic','S','+10%'],['Fleet-Footed','A','+5%'],['Speedy','B','+3%']],
      'Charging':         [['Electric Frenzy','S+','+30%'],['Light Affinity','S','+10%'],['Battery Pack','A','+5%'],['E-Conductor','B','+3%']],
      'Smelting':         [['Metal Maestro','S+','+30%'],['Forge Fanatic','S','+30%'],['Bellow Fellow','A','+10%'],['Anvil Adept','B','+5%']],
      'Sawing':           [['Timber Tycoon','S+','+30%'],['Wood Whiz','S','+30%'],['Saw Savant','A','+10%'],['Workshopper','B','+5%']],
      'Magicking':        [['Alchemist (S)','S','+8%'],['Alchemist (A)','A','+5%'],['Alchemist (B)','B','+2%']],
      'Dreamium':         [['Dreamium Hunter (S)','S','+8%'],['Dreamium Hunter (A)','A','+5%'],['Dreamium Hunter (B)','B','+2%']],
      'Energy Depletion': [['Caffinated (S)','S','-50%'],['Caffinated (A)','A','-25%'],['Caffinated (B)','B','-10%']],
      'Hunger Depletion': [['Light Eater (S)','S','-50%'],['Light Eater (A)','A','-25%'],['Light Eater (B)','B','-10%']],
      'Food Consumption': [['Temperate (S)','S','-50%'],['Temperate (A)','A','-25%'],['Temperate (B)','B','-10%']],
      'Bed EXP':          [['Sweet Dreams (S)','S','+15%'],['Sweet Dreams (A)','A','+10%'],['Sweet Dreams (B)','B','+5%']],
      'Bed EXP/s':        [['Comfy (S)','S','+3 exp'],['Comfy (A)','A','+2 exp'],['Comfy (B)','B','+1 exp']],
      'Construction':     [['Engineer (S)','S','-900s'],['Engineer (A)','A','-300s'],['Engineer (B)','B','-120s']],
      'Research':         [['Prodigy (S)','S','-900s'],['Prodigy (A)','A','-300s'],['Prodigy (B)','B','-120s']],
      'Training':         [['Coach (S)','S','+8%'],['Coach (A)','A','+4%'],['Coach (B)','B','+2%']],
      'Healing':          [['Healing Touch (S)','S','+8%'],['Healing Touch (A)','A','+4%'],['Healing Touch (B)','B','+2%']],
      'Other':            [['Generous','S','+50%']],
    }
  }
};

// flat lookup maps
const ALL_TRAIT_NAMES = [];
const TRAIT_TIER_MAP  = {};
const WORKER_TRAIT_SET = new Set();
Object.entries(TRAITS).forEach(([roleKey, cat]) =>
  Object.values(cat.groups).forEach(arr =>
    arr.forEach(([name, tier]) => {
      if (!ALL_TRAIT_NAMES.includes(name)) ALL_TRAIT_NAMES.push(name);
      TRAIT_TIER_MAP[name] = tier;
      if (roleKey === 'worker') WORKER_TRAIT_SET.add(name);
    })
  )
);

// stat + bonus for tooltips
const TRAIT_DESC = {};
Object.values(TRAITS).forEach(cat =>
  Object.entries(cat.groups).forEach(([stat, arr]) =>
    arr.forEach(([name,, effect]) => { if (effect) TRAIT_DESC[name] = [stat, effect]; })
  )
);

// Infer role – majority wins, ties go to Combat
function inferRole(traits) {
  const workerCount = traits.filter(t => t && WORKER_TRAIT_SET.has(t)).length;
  const combatCount = traits.filter(t => t && !WORKER_TRAIT_SET.has(t)).length;
  return workerCount > combatCount ? 'Worker' : 'Combat';
}

// =====================================================
// STATE
// =====================================================
let allPalmons    = [];
let roleFilter    = '';
let traitFilter   = '';
let refRoleFilter = '';
let queue         = [];

// =====================================================
// TABS
// =====================================================
function switchTab(tab) {
  document.querySelectorAll('.tab').forEach((el, i) =>
    el.classList.toggle('active', ['registry','ref'][i] === tab));
  document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
  document.getElementById('page-' + tab).classList.add('active');
}

// =====================================================
// INIT
// =====================================================
window.addEventListener('DOMContentLoaded', () => {
  detectLanguage();
  buildRefGrid();
  loadRegistry();
});

// =====================================================
// REGISTRY – LOAD
// =====================================================
async function loadRegistry() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '<div class="loading">Loading registry...</div>';
  try {
    const res  = await fetch(SCRIPT_URL);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    allPalmons = data.palmons || [];
    document.getElementById('total').textContent = allPalmons.length;
    buildTraitDropdown();
    applyFilters();
  } catch (e) {
    grid.innerHTML = `<div class="empty"><div class="e-icon">⚠️</div><h3>Couldn't load registry</h3><p>${e.message}</p></div>`;
  }
}

// =====================================================
// FILTERS + SORT
// =====================================================
const TIER_SCORE = { 'S+': 4, 'S': 3, 'A': 2, 'B': 1 };

function palmonSortScore(p) {
  return (p.traits || []).reduce((sum, tr) => sum + (TIER_SCORE[TRAIT_TIER_MAP[tr]] || 0), 0);
}

function toggleRoleFilter(role) {
  roleFilter  = roleFilter === role ? '' : role;
  traitFilter = '';
  const btnC = document.getElementById('btn-combat');
  const btnW = document.getElementById('btn-worker');
  if (btnC) btnC.className = 'role-btn' + (roleFilter === 'combat' ? ' active-combat' : '');
  if (btnW) btnW.className = 'role-btn' + (roleFilter === 'worker' ? ' active-worker' : '');
  buildTraitDropdown();
  setTraitFilter('');
  applyFilters();
}

function buildTraitDropdown() {
  const panel = document.getElementById('trait-dd-panel');
  if (!panel) return;
  const relevant = roleFilter
    ? allPalmons.filter(p => (p.role || '').toLowerCase() === roleFilter)
    : allPalmons;
  const counts = {};
  relevant.forEach(p => (p.traits || []).forEach(tr => { if (tr) counts[tr] = (counts[tr] || 0) + 1; }));
  if (!Object.keys(counts).length) {
    panel.innerHTML = '<div style="padding:12px;color:var(--text3);font-size:12px;text-align:center">No traits found</div>';
    return;
  }
  const tierOrder  = ['S+','S','A','B'];
  const groups     = {}; tierOrder.forEach(t => groups[t] = []);
  Object.keys(counts).forEach(name => {
    const tier = TRAIT_TIER_MAP[name] || 'B';
    (groups[tier] || groups['B']).push(name);
  });
  tierOrder.forEach(t => groups[t].sort());
  const tierColors = {
    'S+': 'background:rgba(255,200,50,.18);color:#ffe04a;border:1px solid rgba(255,215,50,.4)',
    'S':  'background:rgba(255,209,102,.15);color:#ffd166;border:1px solid rgba(255,209,102,.28)',
    'A':  'background:rgba(176,106,255,.15);color:#c084fc;border:1px solid rgba(176,106,255,.28)',
    'B':  'background:rgba(125,216,255,.1);color:#7dd8ff;border:1px solid rgba(125,216,255,.22)',
  };
  const icons = { 'S+':'🟠 S+', 'S':'⭐ S', 'A':'🟣 A', 'B':'🔵 B' };
  const rows = [`<div class="dd-option ${!traitFilter ? 'selected' : ''}" onclick="setTraitFilter('')">
    <span style="font-size:12px;color:var(--text2)">— All traits —</span></div>`];
  tierOrder.forEach(tier => {
    if (!groups[tier].length) return;
    rows.push(`<div class="dd-group-label">${icons[tier]} Tier</div>`);
    groups[tier].forEach(name => rows.push(
      `<div class="dd-option ${traitFilter === name ? 'selected' : ''}" onclick="setTraitFilter(${JSON.stringify(name)})">
        <span class="dd-tier" style="${tierColors[tier]}">${tier}</span>
        <span>${tName(name)}</span><span class="dd-count">${counts[name]}</span>
      </div>`
    ));
  });
  panel.innerHTML = rows.join('');
}

function toggleTraitDropdown(e) {
  e.stopPropagation();
  const panel  = document.getElementById('trait-dd-panel');
  const btn    = document.getElementById('trait-dd-btn');
  const isOpen = panel.classList.contains('open');
  if (!isOpen) buildTraitDropdown();
  panel.classList.toggle('open', !isOpen);
  btn.classList.toggle('open', !isOpen);
}

document.addEventListener('click', () => {
  document.getElementById('trait-dd-panel')?.classList.remove('open');
  document.getElementById('trait-dd-btn')?.classList.remove('open');
});

function setTraitFilter(name) {
  traitFilter = name;
  const label = document.getElementById('trait-dd-label');
  const btn   = document.getElementById('trait-dd-btn');
  if (label) label.textContent = name ? tName(name) : 'All traits';
  if (btn)   btn.classList.toggle('active', !!name);
  document.getElementById('trait-dd-panel')?.classList.remove('open');
  document.getElementById('trait-dd-btn')?.classList.remove('open');
  applyFilters();
}

function applyFilters() {
  let list = allPalmons;
  if (roleFilter)  list = list.filter(p => (p.role || '').toLowerCase() === roleFilter);
  if (traitFilter) list = list.filter(p => (p.traits || []).includes(traitFilter));
  list = [...list].sort((a, b) => palmonSortScore(b) - palmonSortScore(a));
  renderGrid(list);
}

function renderGrid(list) {
  const grid = document.getElementById('grid');
  if (!list.length) {
    grid.innerHTML = allPalmons.length === 0
      ? `<div class="empty"><div class="e-icon">🥚</div><h3>Registry is empty</h3><p>Add the first Palmon!</p></div>`
      : `<div class="empty"><div class="e-icon">🔍</div><h3>No matches</h3><p>Try different filters</p></div>`;
    return;
  }

  grid.innerHTML = list.map(p => {
    const roleCls   = (p.role || '').toLowerCase() === 'combat' ? 'combat' : 'worker';
    const roleLabel = (p.role || '').toLowerCase() === 'combat' ? t('roleCombat') : t('roleWorker');
    const traitTags = (p.traits || []).map(tr => {
      let tier = TRAIT_TIER_MAP[tr];
      if (!tier) {
        const m = tr.match(/\(([SABsab][+]?)\)\s*$/);
        tier = m ? m[1].toUpperCase() : 'x';
      }
      const cls      = tier === 'S+' ? 'sp' : tier === 'S' ? 's' : tier === 'A' ? 'a' : tier === 'B' ? 'b' : 'x';
      const baseName = tr.replace(/\s*\([SABsab][+]?\)\s*$/, '').trim();
      const desc     = TRAIT_DESC[tr] || TRAIT_DESC[baseName];
      const tip      = desc
        ? `<div class="trait-tip"><div class="tip-name">${tName(tr)}</div><div class="tip-stat">${desc[0]}: <span class="tip-val">${desc[1]}</span></div></div>`
        : `<div class="trait-tip"><div class="tip-name">${tName(tr)}</div></div>`;
      return `<span class="t-wrap"><span class="t t-${cls}">${tName(tr)}</span>${tip}</span>`;
    }).join('');
    return `
      <div class="palmon-card">
        <div class="card-top">
          <div class="card-name">${p.name || '—'}</div>
          ${p.role ? `<span class="role-badge ${roleCls}">${roleLabel}</span>` : ''}
        </div>
        ${p.owner ? `<div class="card-owner">${p.owner}</div>` : ''}
        <div class="traits">${traitTags || '<span style="font-size:11px;color:var(--text3)">No traits recorded</span>'}</div>
      </div>`;
  }).join('');
}

// =====================================================
// TRAIT REFERENCE
// =====================================================
function setRefFilter(role) {
  refRoleFilter = role;
  document.getElementById('ref-pill-all').className    = 'pill' + (role === ''       ? ' on-trait'  : '');
  document.getElementById('ref-pill-combat').className = 'pill' + (role === 'combat' ? ' on-combat' : '');
  document.getElementById('ref-pill-worker').className = 'pill' + (role === 'worker' ? ' on-worker' : '');
  buildRefGrid();
}

function buildRefGrid() {
  const container = document.getElementById('ref-grid');
  const tierOrder = { 'S+':0, 'S':1, 'A':2, 'B':3 };
  const tierCls   = t => t === 'S+' ? 'sp' : t === 'S' ? 's' : t === 'A' ? 'a' : t === 'B' ? 'b' : 'x';
  const tierLabel = { 'S+':'S+ — Ultra Rare', 'S':'S', 'A':'A', 'B':'B' };

  const all = [];
  Object.entries(TRAITS).forEach(([roleKey, cat]) => {
    if (refRoleFilter && roleKey !== refRoleFilter) return;
    Object.entries(cat.groups).forEach(([stat, arr]) =>
      arr.forEach(([name, tier, effect]) =>
        all.push({ name, tier, effect: effect || '', stat, icon: cat.icon })
      )
    );
  });
  all.sort((a, b) => (tierOrder[a.tier] ?? 9) - (tierOrder[b.tier] ?? 9));

  let lastTier = null;
  const rows = all.map(entry => {
    let header = '';
    if (entry.tier !== lastTier) {
      lastTier = entry.tier;
      header = `<div style="padding:10px 8px 4px;font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:var(--text3);border-top:1px solid var(--border);margin-top:4px">${tierLabel[entry.tier]}</div>`;
    }
    return `${header}
      <div class="ref-row">
        <span class="t t-${tierCls(entry.tier)}" style="min-width:28px;text-align:center;flex-shrink:0">${entry.tier}</span>
        <span style="flex:1;font-size:12px;padding:0 8px">${entry.name}</span>
        <span style="font-size:10px;color:var(--text3);flex-shrink:0">${entry.stat}</span>
        <span style="font-size:11px;font-weight:800;color:var(--green);flex-shrink:0;min-width:54px;text-align:right;padding-left:8px">${entry.effect}</span>
        <span style="font-size:12px;flex-shrink:0;padding-left:8px">${entry.icon}</span>
      </div>`;
  }).join('');

  container.innerHTML = `<div class="ref-card" style="grid-column:1/-1"><div class="ref-rows" style="padding:0 8px 8px">${rows}</div></div>`;
}

// =====================================================
// MODAL
// =====================================================
function openModal() {
  queue = [];
  renderQueue();
  document.getElementById('modal').classList.add('open');
  document.getElementById('submit-msg').textContent = '';
  document.getElementById('submit-btn').disabled = true;
  document.getElementById('batch-owner').value = '';
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
  queue = [];
}

// =====================================================
// FILE HANDLING + AI SCAN via Worker
// =====================================================
function handleDrop(e) {
  e.preventDefault();
  document.getElementById('drop-zone').classList.remove('drag-over');
  handleFiles(e.dataTransfer.files);
}

function handleFiles(files) {
  Array.from(files).forEach(file => {
    const id   = Date.now() + Math.random();
    const item = { id, file, dataUrl: null, status: 'reading', name: '', role: 'Combat', traits: ['','','',''] };
    queue.push(item);
    const reader = new FileReader();
    reader.onload = e => {
      item.dataUrl = e.target.result;
      item.status  = 'scanning';
      renderQueue();
      scanOne(item);
    };
    reader.readAsDataURL(file);
  });
  renderQueue();
}

async function scanOne(item) {
  const base64 = item.dataUrl.split(',')[1];
  const mime   = item.dataUrl.split(';')[0].split(':')[1];
  try {
    const res  = await fetch(WORKER_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'scan', base64, mime, traitNames: ALL_TRAIT_NAMES })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    const palmons = Array.isArray(data.palmons) && data.palmons.length
      ? data.palmons
      : [{ name: data.name || '', traits: data.traits || [] }];

    const normalize = p => {
      const matched = (p.traits || [])
        .map(t => ALL_TRAIT_NAMES.find(n => n.toLowerCase() === String(t).toLowerCase()) || t)
        .slice(0, 4);
      const traits = [...matched, '', '', '', ''].slice(0, 4);
      return { name: p.name || '', traits, role: inferRole(traits) };
    };

    if (palmons.length <= 1) {
      const n = normalize(palmons[0] || { name: '', traits: [] });
      item.name   = n.name;
      item.traits = n.traits;
      item.role   = n.role;
      item.status = 'done';
    } else {
      const idx = queue.indexOf(item);
      const expanded = palmons.map((p, i) => {
        const n = normalize(p);
        return {
          id:      `${item.id}-${i}`,
          file:    item.file,
          dataUrl: item.dataUrl,
          status:  'done',
          name:    n.name,
          role:    n.role,
          traits:  n.traits,
        };
      });
      if (idx >= 0) queue.splice(idx, 1, ...expanded);
    }
  } catch (e) {
    item.status = 'error';
    item.error  = e.message;
  }
  renderQueue();
  checkSubmitReady();
}

// =====================================================
// RENDER QUEUE
// =====================================================
function renderQueue() {
  const container = document.getElementById('queue');
  if (!queue.length) { container.innerHTML = ''; return; }

  container.innerHTML = queue.map(item => {
    const statusHtml = {
      reading:  `<span class="spinner"></span> ${t('reading')}`,
      scanning: `<span class="spinner"></span> ${t('scanning')}`,
      done:     `<span style="color:var(--green)">✓</span> ${t('scanned')}`,
      error:    `<span style="color:var(--red)">✕</span> ${t('scanFailed')}: ${item.error || 'unknown'} – ${t('fillManually')}`,
    }[item.status] || '';

    const isEditable    = item.status === 'done' || item.status === 'error';
    const traitSelects  = [0,1,2,3].map(i => `
      <select class="trait-sel" ${!isEditable ? 'disabled' : ''} onchange="updateField('${item.id}','trait${i}',this.value)">
        ${['', ...ALL_TRAIT_NAMES].map(n =>
          `<option value="${n}" ${(item.traits[i] || '') === n ? 'selected' : ''}>${n ? tName(n) : t('noneOption')}</option>`
        ).join('')}
      </select>`).join('');

    return `
      <div class="queue-item ${item.status}" id="qi-${item.id}">
        <img class="qi-thumb" src="${item.dataUrl}" alt="">
        <div class="qi-body">
          <div class="qi-status ${item.status}">${statusHtml}</div>
          ${isEditable ? `
          <div class="qi-fields">
            <div class="qi-row">
              <span class="qi-label">${t('labelName')}</span>
              <input class="qi-input" value="${item.name}" placeholder="${t('namePlaceholder')}"
                onchange="updateField('${item.id}','name',this.value)">
            </div>
            <div class="qi-row">
              <span class="qi-label">${t('labelRole')}</span>
              <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap">
                <span class="role-badge ${item.role === 'Worker' ? 'worker' : 'combat'}" style="font-size:11px;padding:3px 10px">
                  ${item.role === 'Worker' ? t('roleWorker') : t('roleCombat')}
                </span>
                <span style="font-size:10px;color:var(--text3)">${t('autoOverride')}</span>
                <select class="qi-select" style="width:auto;font-size:11px;padding:3px 7px" onchange="updateField('${item.id}','role',this.value)">
                  <option value="Combat" ${item.role === 'Combat' ? 'selected' : ''}>${t('roleCombat')}</option>
                  <option value="Worker" ${item.role === 'Worker' ? 'selected' : ''}>${t('roleWorker')}</option>
                </select>
              </div>
            </div>
            <div class="qi-row" style="align-items:flex-start">
              <span class="qi-label" style="margin-top:6px">${t('labelTraits')}</span>
              <div class="trait-grid" style="flex:1">${traitSelects}</div>
            </div>
          </div>` : ''}
        </div>
        ${isEditable ? `<button class="qi-remove" onclick="removeItem('${item.id}')">✕</button>` : ''}
      </div>`;
  }).join('');
}

function updateField(id, field, value) {
  const item = queue.find(q => String(q.id) === String(id));
  if (!item) return;
  if (field.startsWith('trait')) {
    const i = parseInt(field.replace('trait',''));
    item.traits[i] = value;
    if (!item.roleOverridden) { item.role = inferRole(item.traits); renderQueue(); }
  } else {
    if (field === 'role') item.roleOverridden = true;
    item[field] = value;
  }
}

function removeItem(id) {
  queue = queue.filter(q => String(q.id) !== String(id));
  renderQueue();
  checkSubmitReady();
}

function checkSubmitReady() {
  const owner = (document.getElementById('batch-owner')?.value || '').trim();
  const ready = queue.length > 0 && !!owner &&
    queue.every(q => q.status === 'done' || q.status === 'error');
  document.getElementById('submit-btn').disabled = !ready;
}

// =====================================================
// SUBMIT ALL
// =====================================================
async function submitAll() {
  const btn  = document.getElementById('submit-btn');
  btn.disabled = true;
  setSubmitMsg('Submitting...', '');

  const owner = document.getElementById('batch-owner').value.trim();
  let ok = 0, fail = 0;

  for (const item of queue) {
    try {
      const res  = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
          name:   item.name,
          owner,
          role:   item.role,
          trait1: item.traits[0] || '',
          trait2: item.traits[1] || '',
          trait3: item.traits[2] || '',
          trait4: item.traits[3] || '',
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      ok++;
    } catch (e) {
      fail++;
    }
  }

  if (fail === 0) {
    setSubmitMsg(`✓ ${ok} Palmon added!`, 'ok');
    setTimeout(() => { closeModal(); loadRegistry(); }, 1200);
  } else {
    setSubmitMsg(`${ok} added, ${fail} failed. Check console.`, 'err');
    btn.disabled = false;
  }
}

function setSubmitMsg(msg, type) {
  const el = document.getElementById('submit-msg');
  el.textContent = msg;
  el.className   = 'submit-msg' + (type ? ' ' + type : '');
}
