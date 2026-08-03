# RealityVizual

Jednostránkový web pro službu, která z fotek nemovitosti pořízených mobilem vyrobí hotové
marketingové video na web, realitní portály i sociální sítě — bez kameramana, obvykle do 48 hodin.

Statický web. Žádný build, žádné závislosti, žádný framework.

## Struktura

Web žije ve složce verze. Nasazuje se vždy ta, která je uvedená v `netlify.toml`.

```
v2/                     ← aktuálně nasazovaná verze
  index.html            Kompletní stránka včetně objednávkového kvízu
  styles.css            Všechny styly (design tokeny světlý/tmavý režim, sekce, kvíz, responzivita)
  script.js             Přepínač motivu, kalkulačka úspory, galerie ukázek, kvíz, nekonečný pás log
  assets/               Vektorové logo (logo.svg), rastrové exporty (logo.png/.webp), favicon.svg
v1/                     První verze (ivory / forest green / zlatá) — ponechána jako reference
  index.html
  styles.css
  script.js
  above-the-fold.html   Samostatná verze jen s hlavičkou a hero sekcí (vše inline)
netlify.toml            Určuje, která složka se publikuje
README.md
```

Nová verze = nová složka `vN/` a přepsaný `publish` v `netlify.toml`. Starší verze
zůstávají v repu jako reference.

## Spuštění lokálně

Jakýkoli statický server, spuštěný nad složkou verze:

```bash
python -m http.server 5501 --directory v2
```

Pak otevři <http://localhost:5501>.

## Nasazení na Netlify

1. Netlify → **Add new site → Import an existing project** → propoj tenhle repozitář.
2. Build command nech **prázdný**. Publish directory si Netlify načte z `netlify.toml` (`v2`),
   takže do něj nemusíš sahat.
3. Deploy.

### Objednávky (Netlify Forms)

Objednávkový kvíz odesílá přes Netlify Forms — formulář `objednavka`. Netlify si ho najde
sám při deployi (parsuje statické HTML, formulář je přímo v `index.html`).

Po prvním deployi **zapni notifikace**, jinak objednávky jen tiše leží v dashboardu:

> Site configuration → Forms → Form notifications → Add notification → Email notification

Odpovědi z kvízu (typ nemovitosti, formát, stav fotek, objem) se odesílají jako skrytá pole,
takže je v každé objednávce vidět.

Pokud POST selže, kvíz zobrazí chybu s odkazem na předvyplněný e-mail — objednávka se neztratí.

## Design (v2)

Jedna paleta, nic dalšího se nemíchá — světlý i tmavý režim ze stejných tokenů
(`styles.css`, `:root` nahoře, tmavé hodnoty jako `--dk-*`):

- **Podklad (světlý):** off-white `#F5F7F3`, karty `#FFFFFF`, pás sekcí `#EEF1EA`, linky `#E1E5DB`
- **Podklad (tmavý):** `#0D0F0C`, karty `#171A15`, pás sekcí `#131610`, linky `#272C22`
- **Text:** uhlová `#121212` / krémová `#F2F5EE` v tmavém; vedlejší `#5E625C` / `#A6ADA0`
- **Akcent:** limetka `#91E600` — **jen jako plocha** (tlačítka, ikony, čísla kroků, CTA pás,
  zvýraznění v H1) a je stejná v obou režimech. Jako *text* se používá tmavší `--lime-ink`
  (`#467000` světlý / `#9BEE18` tmavý), aby prošel AA na daném podkladu.
- **Fonty:** Archivo (nadpisy — versálky, těžké řezy, těsný tracking) + Inter (text a UI),
  čísla v systémovém mono
- Responzivní od 375 px, viditelné focus stavy, respektuje `prefers-reduced-motion`
- Ověřený kontrast: nejnižší naměřený poměr je 4,7:1 ve světlém a 7,6:1 v tmavém režimu
  (AA vyžaduje 4,5:1)

### Přepínač motivu

Ikona slunce/měsíce v hlavičce (`#theme-toggle`). Bez kliknutí web sleduje systémové
nastavení (`prefers-color-scheme`); klik vynutí opačný režim a uloží volbu do
`localStorage` (`rv-theme`). Inline skript v `<head>` nastaví `data-theme` ještě před
prvním vykreslením, takže při načtení stránky nic nebliká.

## Zbývá dodělat

- [ ] Nahradit ukázková videa v sekci „Ukázky" — teď jsou to stylizované placeholdery
- [ ] Nahradit placeholder e-mail `ahoj@realityvizual.cz` skutečnou adresou
      (v `v2/index.html` v patičce a v `v2/script.js` v konstantě `OBJEDNAVKY_EMAIL`)
- [ ] Po deployi zapnout na Netlify notifikace formuláře
