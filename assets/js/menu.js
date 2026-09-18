/**
 * Iscrtava meni lokala iz JSON-a upisanog u samu stranicu
 * (<script type="application/json" id="menu-data">), pravi lepljivu traku
 * kategorija i označava kategoriju koja je trenutno na ekranu.
 *
 * Dodavanje novog lokala = nova mapa + kopija index.html + izmena JSON-a.
 */
(() => {
  const dataEl = document.getElementById('menu-data');
  const nav = document.querySelector('[data-catnav]');
  const body = document.querySelector('[data-menu-body]');
  if (!dataEl || !nav || !body) return;

  let menu;
  try {
    menu = JSON.parse(dataEl.textContent);
  } catch (err) {
    console.error('Neispravan JSON menija:', err);
    return;
  }

  const money = new Intl.NumberFormat('sr-RS');
  const isStarTag = (tag) => ['preporuka', 'novo', 'kuća preporučuje'].includes(tag.toLowerCase());

  /** "Topli napici" -> "topli-napici" (id za sidro u URL-u) */
  const slug = (text) =>
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[čć]/g, 'c').replace(/đ/g, 'dj').replace(/š/g, 's').replace(/ž/g, 'z')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };

  /**
   * Cena je broj (180), tekst ("gratis"), ili više varijanti:
   * [{ label: "0,5 l", value: 320 }]
   */
  const priceText = (price) => {
    if (Array.isArray(price)) return price.map((p) => `${p.label} · ${money.format(p.value)}`).join('  /  ');
    return typeof price === 'number' ? money.format(price) : String(price);
  };

  const renderItem = (item) => {
    const li = el('li', 'item');

    const head = el('div', 'item__head');
    head.append(
      el('span', 'item__name', item.name),
      el('span', 'item__dots'),
      el('span', 'item__price', priceText(item.price)),
    );
    li.append(head);

    if (item.desc) li.append(el('p', 'item__desc', item.desc));

    const tags = [...(item.size ? [item.size] : []), ...(item.tags || [])];
    if (tags.length) {
      const meta = el('div', 'item__meta');
      tags.forEach((tag) => meta.append(el('span', isStarTag(tag) ? 'badge badge--star' : 'badge', tag)));
      li.append(meta);
    }

    return li;
  };

  const sections = menu.sections.map((section) => {
    const id = slug(section.title);

    // Sidro je sama sekcija — na njoj stoji scroll-margin-top, pa naslov
    // ostaje vidljiv ispod lepljive trake.
    const wrapper = el('section', 'menu-section');
    wrapper.id = id;
    wrapper.setAttribute('aria-labelledby', `${id}-naslov`);

    const head = el('div', 'menu-section__head');
    const title = el('h2', 'menu-section__title', section.title);
    title.id = `${id}-naslov`;
    head.append(title);
    if (section.note) head.append(el('p', 'menu-section__note', section.note));

    const list = el('ul', 'items');
    section.items.forEach((item) => list.append(renderItem(item)));

    wrapper.append(head, list);

    const link = el('a', null, section.title);
    link.href = `#${id}`;
    const navItem = el('li');
    navItem.append(link);

    return { id, wrapper, link, navItem };
  });

  const navList = el('ul', 'catnav__list');
  sections.forEach((s) => navList.append(s.navItem));
  nav.append(navList);
  body.append(...sections.map((s) => s.wrapper));

  /* --- Označavanje aktivne kategorije tokom skrolovanja --------------- */

  const byId = new Map(sections.map((s) => [s.id, s]));
  let active = null;

  const setActive = (id) => {
    if (id === active) return;
    if (active) byId.get(active).link.removeAttribute('aria-current');
    active = id;

    const { link } = byId.get(id);
    link.setAttribute('aria-current', 'true');

    // Pomera se samo traka po horizontali. scrollIntoView bi umeo da pomeri
    // i celu stranicu i pokvari skok na sidro.
    navList.scrollTo({
      left: link.offsetLeft - (navList.clientWidth - link.offsetWidth) / 2,
      behavior: 'smooth',
    });
  };

  const visible = new Set();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.isIntersecting ? visible.add(entry.target.id) : visible.delete(entry.target.id);
      });
      const first = sections.find((s) => visible.has(s.id));
      if (first) setActive(first.id);
    },
    // rootMargin prima samo px i %, ne rem. Gornja vrednost ≈ visina trake.
    { rootMargin: '-72px 0px -55% 0px' },
  );

  sections.forEach((s) => observer.observe(s.wrapper));
  setActive(sections[0].id);

  /* --- Dugme za povratak na vrh --------------------------------------- */

  const toTop = document.querySelector('[data-to-top]');
  if (toTop) {
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    const onScroll = () => {
      toTop.dataset.visible = String(window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
