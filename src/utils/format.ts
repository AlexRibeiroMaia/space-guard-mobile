// "2026-06-07" → "07/06/2026" (mantém o original se não bater o formato)
export function formatDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return iso;
  const [, y, m, d] = match;
  return `${d}/${m}/${y}`;
}

export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.replace(/(\d+)/, '($1');
  if (digits.length <= 6) return digits.replace(/(\d{2})(\d+)/, '($1) $2');
  if (digits.length <= 10)
    return digits.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
  return digits.replace(/(\d{2})(\d{5})(\d+)/, '($1) $2-$3');
}
