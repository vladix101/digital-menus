/**
 * Svaki lokal ima svoj poddomen: basta21.digitalnimeniji.com.
 * U repozitorijumu je i dalje mapa po lokalu (public/basta21/), pa ovaj Worker
 * prevodi poddomen u putanju pre nego što preda zahtev statičkim fajlovima.
 *
 *   basta21.digitalnimeniji.com/        -> public/basta21/index.html
 *   digitalnimeniji.com/                -> public/index.html
 *   bilo koji host /assets/css/menu.css -> public/assets/css/menu.css
 *
 * Nepostojeći poddomen završi na 404 stranici, jer tu mapu nema u fajlovima.
 * Dodavanje lokala je zato samo nova mapa — ovde se ništa ne menja.
 */

/** Fajlovi koje svaki host servira iz korena, isto kao glavni domen. */
const SHARED_FILES = new Set(['/robots.txt', '/sitemap.xml', '/favicon.ico', '/site.webmanifest']);

/** Poddomen lokala, ili null kada zahtev ide na glavni domen. */
function venueLabel(hostname, apexHost) {
  const host = hostname.replace(/\.$/, '').toLowerCase();
  if (!apexHost || !host.endsWith(`.${apexHost}`)) return null;

  const label = host.slice(0, -(apexHost.length + 1));
  // Samo prvi nivo; "www" je glavni sajt, ne lokal.
  if (!label || label === 'www' || label.includes('.')) return null;
  return label;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const label = venueLabel(url.hostname, env.APEX_HOST);

    // Zajednički fajlovi (CSS, JS, slike) i fajlovi za pretraživače stoje na
    // istom mestu za sve lokale.
    if (!label || url.pathname.startsWith('/assets/') || SHARED_FILES.has(url.pathname)) {
      return env.ASSETS.fetch(request);
    }

    url.pathname = `/${label}${url.pathname}`;
    return env.ASSETS.fetch(new Request(url, request));
  },
};

export { venueLabel };
