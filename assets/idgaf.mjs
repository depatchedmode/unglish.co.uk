// Base IDGAF: a, e, i, o, u, then back to a with b added (ab, eb … ub, ac … uz), then aba, and so on.
// Places alternate vowels and consonants, the least significant on the left, and there is no zero.
const VOWELS = 'aeiou';
const CONSONANTS = 'bcdfghjklmnpqrstvwxyz';

export function idgaf(count) {
  if (!Number.isSafeInteger(count) || count < 1) throw new RangeError('Base IDGAF counts from a, which is one.');
  let rest = count;
  let place = 0;
  let written = '';
  while (rest > 0) {
    const digits = place % 2 ? CONSONANTS : VOWELS;
    rest -= 1;
    written += digits[rest % digits.length];
    rest = Math.floor(rest / digits.length);
    place += 1;
  }
  return written;
}
