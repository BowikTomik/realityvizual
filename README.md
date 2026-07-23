# RealityVizual

Jednostránkový web pro službu, která z fotek nemovitosti pořízených mobilem vyrobí hotové
marketingové video na web, realitní portály i sociální sítě — bez kameramana, obvykle do 48 hodin.

Statický web. Žádný build, žádné závislosti, žádný framework.

## Soubory

| Soubor | Co to je |
|---|---|
| `index.html` | Kompletní stránka včetně objednávkového kvízu |
| `styles.css` | Všechny styly (design tokeny, sekce, kvíz, responzivita) |
| `script.js` | Navigace, kalkulačka úspory, galerie ukázek, kvíz |
| `above-the-fold.html` | Samostatná verze jen s hlavičkou a hero sekcí (vše inline) |

## Spuštění lokálně

Jakýkoli statický server. Například:

```bash
python -m http.server 5500
```

Pak otevři <http://localhost:5500>.

## Nasazení na Netlify

1. Netlify → **Add new site → Import an existing project** → propoj tenhle repozitář.
2. Build command nech **prázdný**, publish directory nastav na `.` (kořen).
3. Deploy.

### Objednávky (Netlify Forms)

Objednávkový kvíz odesílá přes Netlify Forms — formulář `objednavka`. Netlify si ho najde
sám při deployi (parsuje statické HTML, formulář je přímo v `index.html`).

Po prvním deployi **zapni notifikace**, jinak objednávky jen tiše leží v dashboardu:

> Site configuration → Forms → Form notifications → Add notification → Email notification

Odpovědi z kvízu (typ nemovitosti, formát, stav fotek, objem) se odesílají jako skrytá pole,
takže je v každé objednávce vidět.

Pokud POST selže, kvíz zobrazí chybu s odkazem na předvyplněný e-mail — objednávka se neztratí.

## Design

- **Paleta:** warm ivory `#F5F2EA`, forest green `#294536`, pískově zlatý accent `#B68A57`
- **Fonty:** Fraunces (nadpisy) + Sora (text a UI), načítané z Google Fonts
- Responzivní od 375 px, viditelné focus stavy, respektuje `prefers-reduced-motion`

## Zbývá dodělat

- [ ] Nahradit ukázková videa v sekci „Ukázky" — teď jsou to stylizované placeholdery
- [ ] Nahradit placeholder e-mail `ahoj@realityvizual.cz` skutečnou adresou
      (v `index.html` v patičce a v `script.js` v konstantě `OBJEDNAVKY_EMAIL`)
- [ ] Po deployi zapnout na Netlify notifikace formuláře
