# Digitalni meniji

Statički sajt sa digitalnim menijima za kafiće i restorane. Bez build koraka i
bez zavisnosti — Cloudflare Pages servira fajlove direktno iz repozitorijuma.

Naslovna strana (`/`) je interni spisak lokala i nije povezana ni sa jedne
stranice menija — gost koji skenira QR kôd ostaje u svom lokalu.

## Struktura

```
index.html                 spisak lokala (interno, noindex)
404.html                   stranica za nepostojeće adrese
_headers                   keširanje i sigurnosna zaglavlja (Cloudflare Pages)
assets/
  css/site.css             naslovna i 404
  css/menu.css             struktura stranice menija, ista za sve lokale
  css/theme-<lokal>.css    boje, fontovi i detalji jednog lokala
  js/menu.js               iscrtava meni iz JSON-a, traka kategorija, dugme za vrh
  img/brand/favicon.svg    ikonica u tabu
  img/<lokal>/crest.svg    znak lokala u zaglavlju
basta21/index.html         → /basta21
trattoria-nona/index.html  → /trattoria-nona
zrno/index.html            → /zrno
```

Svaka mapa lokala je jedna stranica: statično zaglavlje i podnožje (naziv,
adresa, radno vreme, telefon) plus meni upisan kao JSON u
`<script id="menu-data">`. `menu.js` iz tog JSON-a iscrtava sekcije, cene i
lepljivu traku sa kategorijama.

Izgled je odvojen od strukture: `menu.css` nosi raspored i ponašanje, a
`theme-<lokal>.css` boje, fontove i detalje. Trenutno su tri različita stila —
topla klasika (Bašta 21), svetla editorijalna (Trattoria Nona) i moderna
minimalna (Zrno).

## Izmena cena i ponude

Otvorite `index.html` lokala i menjajte samo JSON na dnu fajla. Posle commit-a
i push-a Cloudflare sam objavi novu verziju.

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
- Oznake `preporuka`, `novo` i `kuća preporučuje` dobijaju zlatni badž.

## Dodavanje novog lokala

1. Kopirajte mapu postojećeg lokala pod novim imenom, npr. `kod-mice/`.
   Ime mape je i adresa menija: `/kod-mice`.
2. U `kod-mice/index.html` izmenite zaglavlje, podnožje i JSON menija.
3. Napravite `assets/css/theme-kod-mice.css` (najlakše kopijom postojeće teme) i
   `assets/img/kod-mice/crest.svg` — znak u bojama te teme. Povežite oba u
   stranici, zajedno sa fontovima koje tema koristi.
4. Dodajte red u spisak u `index.html`.

## Lokalni pregled

Putanje su apsolutne (`/assets/...`), pa otvaranje fajla duplim klikom ne radi.
Pokrenite statički server iz korena projekta:

```bash
npx serve .
# pa otvorite ispisanu adresu
```

## Deploy na Cloudflare Pages

Create a project → Connect to Git → ovaj repozitorijum.

| Podešavanje | Vrednost |
| --- | --- |
| Framework preset | None |
| Build command | *(prazno)* |
| Build output directory | *(prazno — koren)* |

Svaki push na `main` objavljuje novu verziju.
