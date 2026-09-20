/**
 * Otkrivanje sekcija pri skrolovanju.
 *
 * Skrivanje radi samo kada JavaScript radi (klasa "js" na <html>), pa bez
 * njega stranica ostaje potpuno čitljiva. Kada korisnik traži manje pokreta,
 * posmatranje se ni ne pokreće.
 */
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.remove('js');
    return;
  }

  // Telefon se jednom prolista kad uđe u vidno polje — pokazuje da je meni
  // dugačak i da traka sa kategorijama prati čitanje.
  const device = document.querySelector('.hero__device');
  if (device) {
    const demo = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        device.classList.add('is-demo');
        demo.disconnect();
      },
      { threshold: 0.4 },
    );
    demo.observe(device);
  }

  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  // Deca grupe ulaze jedno za drugim, da red bude čitljiv a ne da sve blesne.
  document.querySelectorAll('[data-reveal-group]').forEach((group) => {
    [...group.children].forEach((child, i) => {
      child.style.setProperty('--reveal-delay', `${Math.min(i, 5) * 70}ms`);
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.1 },
  );

  items.forEach((item) => observer.observe(item));
})();
