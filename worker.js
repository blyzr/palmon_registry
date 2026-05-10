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

Two screenshot types are supported:
1. DETAIL view — a single Palmon with its name shown at the top and trait badges in the upper-left.
2. LIST view — a roster/inventory screen with multiple rows. Each row shows a Palmon thumbnail and 1–4 trait pills. Names are usually NOT shown next to each row in this view.

Return ONLY valid JSON, no markdown, in this exact shape:
{"palmons":[{"name":"string","traits":["trait1","trait2","trait3","trait4"]}, ...]}

Rules:
- For a DETAIL view, return a single entry in the palmons array.
- For a LIST view, return one entry per visible row, in top-to-bottom order. If no name is visible for a row, set name to "".
- name: the Palmon name as written; if not visible, "".
- traits: map what you see to the closest English name from this list: ${traitNames.join(', ')}
- Use the translation tables below if the screenshot is not in English — these are exact mappings verified in-game.
- Trait badges are coloured pills; ignore all other text (resource counters, buttons, filters like SR/SSR/UR, headers).
- Return up to 4 traits per Palmon, only ones visible on screen. If no traits match for a row, use [].

${traitLookup}`,
          messages: [{ role: 'user', content: [
            { type: 'image', source: { type: 'base64', media_type: mime, data: base64 } },
            { type: 'text', text: 'Extract every Palmon visible in this screenshot. If it is a list/roster view, return one entry per row (top-to-bottom). If it is a single-Palmon detail view, return one entry. Read only the coloured trait pills. Use the translation tables in the system prompt to map them to English. Return JSON in the {"palmons":[...]} shape.' }
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
