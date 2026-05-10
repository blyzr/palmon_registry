export default {
  async fetch(request, env) {

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    try {
      const { base64, mime, traitNames } = await request.json();

      const traitLookup = `
Turkish→English trait names:
Kavgacı→Belligerent, Cengaver→Warlike, Hırçın→Combative, Saldırgan→Hostile,
İnsafsız→Heartless, Acımasız→Ruthless, Yabani→Brutal, Kaba→Mean,
Kutsanmış→Blessed, Ballı→Fortunate, Ayrıcalıklı→Favored, Şanslı→Lucky,
Keskin İsabet→Deadeye, İyi Nişancı→Sharpshooter, Çatlak Atış→Crack Shot, Nişancı→Gunner,
Dinç→Vigorous, Yapılı→Robust, Enerjik→Energetic, Dayanıklı→Durable,
Sarsılmaz→Unshakeable, Kararlı→Steadfast, Azimli→Resolute, Sağlam→Rooted,
Elmas Kafa→Diamond Skull, Çelik Kafa→Steel Skull, Demir Kafa→Iron Skull, Taş Kafa→Stone Skull,
Demir İrade→Iron Will, Boyun Eğmez→Unyielding, Çetin→Hardy, İnatçı→Stubborn,
Ele Avuca Sığmaz→Elusive, Kaygan→Slippery, Atik→Nimble,
Aklı Başında→Clear-Headed, Dengeli→Steady, Soğukkanlı→Calm,
Sıkışık→Embattled, Kırılgan Çene→Faberge Jaw, Dayanıksız→Softie,
İradesiz→Spineless, Uğursuz→Jinxed, Beceriksiz→Fumbling, Miyop→Myopic,
Süpersonik→Supersonic, Hızlı Ayak→Fleet-Footed, Işık Hızı→Lightspeed,
Elektrik Delisi→Electric Frenzy, Yıldırım Yatkını→Lightning Affinity,
Kondüktör→E-Conductor, Pil Paketi→Battery Pack,
Ocak Fanatiği→Forge Fanatic, Körük İçcisi→Bellow Fellow, Örs Ustası→Anvil Adept,
Seri Oduncu→Wood Whiz, Bıçkı Alimi→Saw Savant, Atölyeci→Workshopper,
Enerji Tasarrufu Modu→Energy Saver, Uykucu→Sluggard,
İş Alerjisi→Soot Allergy, Talaş Alerjisi→Sawdust Allergy,
Ilımlı→Temperate, Kafein Patlaması→Caffeinated, Hafif İştahlı→Light Eater,
Tatlı Rüyalar→Sweet Dreams, Rahat→Comfy,
Simyacı→Alchemist, Özüt Avcısı→Dreamium Hunter,
Şifalı Dokunuş→Healing Touch, Koç→Coach, Deha→Prodigy,
Turbo İnşaatçı→Turbo Builder, Cömert→Generous

German→English trait names:
Kriegerseele→Warlike, Angriffslustig→Belligerent, Kämpferisch→Combative, Feindselig→Hostile,
Herzlos→Heartless, Skrupellos→Ruthless, Brutal→Brutal, Gemein→Mean,
Gesegnet→Blessed, Glückspilz→Fortunate, Fortuna-Freund→Favored, Chancen-Champ→Lucky,
Meisterschütze→Deadeye, Scharfschütze→Sharpshooter, Schießtalent→Crack Shot, Waffenkenner→Gunner,
Überlebenskämpfer→Vigorous, Robust→Robust, Vital→Energetic, Zäh→Durable,
Unerschütterlich→Unshakeable, Standhaft→Steadfast, Resolut→Resolute, Aufrecht→Rooted,
Diamantschädel→Diamond Skull, Stahlschädel→Steel Skull, Eisenschädel→Iron Skull, Steinschädel→Stone Skull,
Eiserner Wille→Iron Will, Unbeugsam→Unyielding, Kühn→Hardy, Hartnäckig→Stubborn,
Aalglatt→Elusive, Schlüpfrig→Slippery, Flink→Nimble,
Nüchtern→Clear-Headed, Gefasst→Steady, Ruhig→Calm,
Anfällig→Embattled, Fabergé-Kiefer→Faberge Jaw, Weichherzig→Softie,
Rückgratlos→Spineless, Verflucht→Jinxed, Tollpatsch→Fumbling, Halbblind→Myopic,
Schallgeschwindigkeit→Supersonic, Raschfüßig→Fleet-Footed, Lichtgeschwindigkeit→Lightspeed,
Elektro-Ekstase→Electric Frenzy, Blitz-Affinität→Lightning Affinity,
E-Leiter→E-Conductor, Akkupack→Battery Pack,
Tiegel-Tüftler→Forge Fanatic, Balgen-Bläser→Bellow Fellow, Amboss-Adept→Anvil Adept,
Balken-Baron→Wood Whiz, Super-Säger→Saw Savant, Workshopper→Workshopper,
Stromsparer→Energy Saver, Lahme Ente→Sluggard,
Ruß-Repuls→Soot Allergy, Arber-Allergiker→Sawdust Allergy,
Gemäßigt→Temperate, Kaffeiniert→Caffeinated, Leichte Kost→Light Eater,
Süße Träume→Sweet Dreams, Gemütlich→Comfy,
Alchemist→Alchemist, Traumium-Jäger→Dreamium Hunter,
Heilende Berührung→Healing Touch, Coach→Coach, Wunderkind→Prodigy,
Turbo-Bauer→Turbo Builder, Großzügig→Generous`;

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5',
          max_tokens: 2000,
          system: `You extract data from Palmon Survival game screenshots. The screenshot may be in any language.

HOW TO IDENTIFY THE SCREENSHOT TYPE:
- DETAIL view: full-screen view of ONE Palmon. The creature's proper name appears prominently at the top (e.g. "Flufftail", "Ironback"). Trait badges are in the upper-left area. → Return 1 entry.
- LIST view: a scrollable roster/deposit/drop screen. It has a SCREEN TITLE at the very top (e.g. "Palmon Bırak", "Drop Palmon", "Einsetzen", "Deposit") — this is NOT a Palmon name. Below the title are multiple rows, each with a small Palmon thumbnail on the left and 1–4 coloured trait pills to its right. No individual Palmon names appear on these rows. → Return one entry PER ROW.

Return ONLY valid JSON, no markdown, in this exact shape:
{"palmons":[{"name":"string","traits":["trait1","trait2","trait3","trait4"]}, ...]}

Rules:
- DETAIL view → 1 entry: name = the creature's proper name from the top of the screen.
- LIST view → N entries (one per row, top-to-bottom): name = "" for every entry (no names visible on rows). NEVER use the screen title as a name.
- traits: read only the coloured pill badges next to each row's thumbnail. Map each to the closest English trait from this list: ${traitNames.join(', ')}
- Use the translation tables below — these are exact in-game mappings.
- Ignore everything else: screen titles, level numbers, gold counters, filter buttons (SR/SSR/UR), checkboxes, footer buttons.
- Return up to 4 traits per entry. If a row has no readable traits, return [].

${traitLookup}`,
          messages: [{ role: 'user', content: [
            { type: 'image', source: { type: 'base64', media_type: mime, data: base64 } },
            { type: 'text', text: 'Look at this screenshot. If it is a LIST/roster view (screen title at top, multiple rows each with a small thumbnail + trait pills), return one JSON entry per row with name="" and the traits from that row\'s pills. If it is a DETAIL view (one large Palmon filling the screen with its name at the top), return one entry with the creature name and its traits. Use the translation tables to map non-English traits to English. Return {"palmons":[...]} only.' }
          ]}]
        })
      });

      const data = await res.json();
      if (data.error) return respond({ error: data.error.message });

      const raw = (data.content || []).find(b => b.type === 'text')?.text || '';
      const start = raw.indexOf('{');
      const end   = raw.lastIndexOf('}');
      if (start === -1) return respond({ error: 'No JSON in response', raw });

      let parsed;
      try {
        parsed = JSON.parse(raw.substring(start, end + 1));
      } catch (e) {
        return respond({ error: 'Parse failed', raw });
      }

      const palmons = Array.isArray(parsed.palmons)
        ? parsed.palmons
        : (parsed.name !== undefined || parsed.traits !== undefined)
          ? [{ name: parsed.name || '', traits: Array.isArray(parsed.traits) ? parsed.traits : [] }]
          : [];

      const normalized = palmons.map(p => ({
        name: typeof p?.name === 'string' ? p.name : '',
        traits: Array.isArray(p?.traits) ? p.traits.filter(t => typeof t === 'string').slice(0, 4) : []
      }));

      const first = normalized[0] || { name: '', traits: [] };
      return respond({ name: first.name, traits: first.traits, palmons: normalized });

    } catch (e) {
      return respond({ error: e.message });
    }
  }
};

const corsHeaders = () => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
});

const respond = (obj) => new Response(JSON.stringify(obj), { headers: corsHeaders() });
