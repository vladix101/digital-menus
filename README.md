# Digitalni meniji

Digitalni meniji za kafiće i restorane na Cloudflare Workers.

- `digitalnimeniji.com` — glavni sajt, spisak lokala
- `<lokal>.digitalnimeniji.com` — meni jednog lokala, npr. `basta21.digitalnimeniji.com`

Stranice su čist HTML, CSS i jedan JS fajl — nema build koraka. Worker služi
samo da poddomen prevede u mapu lokala.

## Struktura

```
wrangler.jsonc             konfiguracija Workers projekta
src/index.js               prevodi <lokal>.domen u /<lokal>/ putanju
public/                    sve što se servira
  index.html               spisak lokala (glavni domen)
  404.html                 nepostojeća adresa ili nepostojeći lokal
  _headers                 keširanje i sigurnosna zaglavlja
  assets/
    css/site.css           naslovna i 404
    css/menu.css           struktura stranice menija, ista za sve lokale
    css/theme-<lokal>.css  boje, fontovi i detalji jednog lokala
    js/menu.js             iscrtava meni iz JSON-a, traka kategorija, dugme za vrh
    img/brand/favicon.svg  ikonica u tabu
    img/<lokal>/crest.svg  znak lokala u zaglavlju
  basta21/index.html       → basta21.digitalnimeniji.com
  trattoria-nona/index.html
  zrno/index.html
```

Svaka mapa lokala je jedna stranica: statično zaglavlje i podnožje (naziv,
adresa, radno vreme, telefon) plus meni upisan kao JSON u
`<script id="menu-data">`. `menu.js` iz tog JSON-a iscrtava sekcije, cene i
lepljivu traku sa kategorijama.

Izgled je odvojen od strukture: `menu.css` nosi raspored i ponašanje, a
`theme-<lokal>.css` boje, fontove i detalje. Trenutno su tri različita stila —
topla klasika (Bašta 21), svetla editorijalna (Trattoria Nona) i moderna
minimalna (Zrno).

## Kako radi rutiranje

Worker gleda ime hosta. Ako je oblika `<nešto>.digitalnimeniji.com`, dodaje
`/<nešto>` na početak putanje i prosleđuje statičkim fajlovima:

| Zahtev | Fajl |
| --- | --- |
| `basta21.digitalnimeniji.com/` | `public/basta21/index.html` |
| `digitalnimeniji.com/` | `public/index.html` |
| bilo koji host, `/assets/css/menu.css` | `public/assets/css/menu.css` |
| `nepostoji.digitalnimeniji.com/` | `public/404.html` (status 404) |

`/assets/` se nikad ne prefiksuje, pa svi lokali dele isti CSS, JS i slike.
Nepostojeći poddomen završi na 404 jer te mape nema — nema spiska lokala koji
bi trebalo održavati na dva mesta.

## Izmena cena i ponude

Otvorite `public/<lokal>/index.html` i menjajte samo JSON na dnu fajla.

```json
{
  "name": "Cappuccino",
  "desc": "Klasičan odnos kafe i mleka.",
  "size": "180 ml",
  "price": 280,
  "tags": ["preporuka"]
}
```

- `desc`, `size` i `tags` su opcioni.
- `price` može biti broj (`280`), tekst (`"gratis"`) ili više varijanti:
  `[{ "label": "0,3 l", "value": 260 }, { "label": "0,5 l", "value": 340 }]`
- Oznake `preporuka`, `novo` i `kuća preporučuje` dobijaju istaknut badž.

## Dodavanje novog lokala

1. Kopirajte mapu postojećeg lokala pod novim imenom, npr.
   `public/kod-mice/`. Ime mape je i poddomen: `kod-mice.digitalnimeniji.com`.
2. Izmenite zaglavlje, podnožje i JSON menija u `public/kod-mice/index.html`.
3. Napravite `public/assets/css/theme-kod-mice.css` (najlakše kopijom
   postojeće teme) i `public/assets/img/kod-mice/crest.svg` — znak u bojama te
   teme. Povežite oba u stranici, zajedno sa fontovima koje tema koristi.
4. Dodajte red u spisak u `public/index.html`.

U Cloudflare-u ne treba ništa da se menja — zvezdasta ruta već hvata svaki
poddomen.

## Prvo podešavanje u Cloudflare-u

Domen `digitalnimeniji.com` mora biti zona u istom nalogu. U **DNS** zone
napravite dva **proksirana** zapisa (narandžasti oblak) — sadržaj nije bitan
jer saobraćaj preuzima Worker:

| Tip | Ime | Sadržaj | Proxy |
| --- | --- | --- | --- |
| AAAA | `@` | `100::` | uključen |
| AAAA | `*` | `100::` | uključen |

Zvezdasti zapis je ono što omogućava da svaki novi lokal odmah radi.

## Deploy

Ručno:

```bash
npm install
npx wrangler deploy
```

Preko Git-a (Workers Builds) — Compute → Workers → izaberite ovaj projekat →
Settings → Builds → Connect repository:

| Podešavanje | Vrednost |
| --- | --- |
| Build command | *(prazno)* |
| Deploy command | `npx wrangler deploy` |

Svaki push na `main` objavljuje novu verziju.

## Lokalni pregled

```bash
npx wrangler dev
```

Na `localhost` nema poddomena, pa lokali rade preko putanje:
`http://localhost:8787/basta21/`.
