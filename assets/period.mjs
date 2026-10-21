import { idgaf } from './idgaf.mjs';

// Period fittings: a hit counter in base IDGAF that only this browser keeps, and marquees that pause on hover or on request
// ("Hold still" also stops the page's other neon) and stand still for visitors who prefer less motion.
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

const counter = document.querySelector('[data-counter]');
if (counter) {
  try {
    const visits = (Number(localStorage.getItem('unglish:visits')) || 0) + 1;
    localStorage.setItem('unglish:visits', String(visits));
    const written = idgaf(visits);
    counter.querySelector('[data-odometer]').replaceChildren(...[...written.padEnd(6, ' ')].map(letter => {
      const cell = document.createElement('span');
      cell.textContent = letter;
      return cell;
    }));
    counter.querySelector('[data-odometer-text]').textContent = written;
    counter.querySelector('[data-odometer-decimal]').textContent = visits.toLocaleString('en-GB');
    counter.querySelector('[data-odometer-unit]').textContent = visits === 1 ? 'visit' : 'visits';
    counter.hidden = false;
  } catch {
    // Storage is unavailable, so there is nothing honest to count.
  }
}

for (const marquee of document.querySelectorAll('marquee')) {
  const hold = marquee.parentElement.querySelector('[data-hold]');
  if (still) {
    const text = document.createElement('p');
    text.className = 'marquee';
    text.textContent = marquee.textContent.trim();
    marquee.replaceWith(text);
    hold?.remove();
    continue;
  }
  let held = false;
  marquee.addEventListener('mouseenter', () => marquee.stop());
  marquee.addEventListener('mouseleave', () => held || marquee.start());
  if (!hold) continue;
  hold.hidden = false;
  hold.addEventListener('click', () => {
    held = !held;
    held ? marquee.stop() : marquee.start();
    document.documentElement.classList.toggle('held', held);
    hold.setAttribute('aria-pressed', String(held));
  });
}
