# Menika — digitalni meniji

Statički sajt sa digitalnim menijima za kafiće i restorane. Naslovna strana vodi
ka meniju svakog lokala, na primer `/basta21`.

Bez build koraka, bez zavisnosti — čist HTML, CSS i jedan JS fajl. Cloudflare
Pages servira fajlove direktno iz repozitorijuma.

## Struktura

```
index.html                 naslovna strana sa listom lokala
404.html                   stranica za nepostojeće adrese
_headers                   keširanje i sigurnosna zaglavlja (Cloudflare Pages)
assets/
  css/site.css             ceo dizajn (naslovna + meniji)
  js/menu.js               iscrtava meni iz JSON-a i pravi navigaciju kategorija
  img/                     logo, favicon, naslovne slike i znaci lokala (SVG)
basta21/index.html         meni lokala → /basta21
trattoria-nona/index.html  meni lokala → /trattoria-nona
zrno/index.html            meni lokala → /zrno
```

Svaka mapa lokala je jedna stranica: statično zaglavlje i podnožje (naziv,
adresa, radno vreme, telefon) plus meni upisan kao JSON u `<script id="menu-data">`.
`menu.js` iz tog JSON-a iscrtava sekcije, cene i lepljivu traku sa kategorijama.

## Izmena cena i ponude

Otvorite `index.html` lokala i menjajte samo JSON na dnu fajla. Posle commit-a
i push-a Cloudflare sam objavi novu verziju.

Oblik stavke:

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
2. U `kod-mice/index.html` izmenite naslov, zaglavlje, podnožje i JSON menija.
3. Dodajte naslovnu sliku i znak u `assets/img/` i povežite ih u toj stranici.
4. U `index.html` (naslovna) dodajte novu `<li class="venue-card">` karticu sa
   linkom ka `/kod-mice/`.

## Lokalni pregled

Putanje su apsolutne (`/assets/...`), pa otvaranje fajla duplim klikom ne radi.
Pokrenite bilo koji statički server iz korena projekta:

```bash
python -m http.server 8080
# pa otvorite http://localhost:8080
```

## Deploy na Cloudflare Pages

Cloudflare Pages → Create a project → Connect to Git → izaberite ovaj repozitorijum.

| Podešavanje | Vrednost |
| --- | --- |
| Framework preset | None |
| Build command | *(prazno)* |
| Build output directory | `/` |

Svaki push na `main` objavljuje novu verziju.
