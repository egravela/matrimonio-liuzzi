// Modulo "a tavola": intolleranze e preferenze alimentari degli ospiti.

export type DietEntry = {
  id: string;
  created_at: string;
  submission_id: string;
  replaces_submission_id: string | null;
  sort_order: number;
  full_name: string;
  restrictions: string[];
  notes: string | null;
  contact: string | null;
};

/** Termine ultimo comunicato agli ospiti (il catering chiude i menù prima). */
export const DEADLINE = '31 agosto 2026';

/** Scelta esclusiva fra le voci di dieta: selezionandola si azzerano le altre. */
export const NONE = 'nessuna';

/**
 * Due famiglie di voci:
 * - `dieta`: cosa può mangiare l'ospite, dove «nessuna» esclude tutto il resto;
 * - `esigenza`: cosa serve al tavolo, indipendente dalla dieta (chi non ha
 *   intolleranze può comunque avere bisogno del seggiolone).
 */
export type RestrictionKind = 'dieta' | 'esigenza';

export const RESTRICTIONS: { key: string; label: string; kind: RestrictionKind }[] = [
  { key: NONE, label: 'Nessuna intolleranza', kind: 'dieta' },
  { key: 'glutine', label: 'Celiachia / glutine', kind: 'dieta' },
  { key: 'lattosio', label: 'Lattosio', kind: 'dieta' },
  { key: 'vegetariano', label: 'Vegetariano', kind: 'dieta' },
  { key: 'vegano', label: 'Vegano', kind: 'dieta' },
  { key: 'frutta-secca', label: 'Frutta secca', kind: 'dieta' },
  { key: 'crostacei', label: 'Crostacei e molluschi', kind: 'dieta' },
  { key: 'pesce', label: 'Pesce', kind: 'dieta' },
  { key: 'uova', label: 'Uova', kind: 'dieta' },
  { key: 'soia', label: 'Soia', kind: 'dieta' },
  { key: 'bambini', label: 'Menù bambini', kind: 'dieta' },
  { key: 'altro', label: 'Altro (dettagli sotto)', kind: 'dieta' },
  { key: 'seggiolone', label: 'Seggiolone', kind: 'esigenza' },
  { key: 'gravidanza', label: 'In gravidanza', kind: 'esigenza' },
  { key: 'passeggino', label: 'Posto per passeggino', kind: 'esigenza' },
];

export const DIET_TAGS = RESTRICTIONS.filter((r) => r.kind === 'dieta');
export const NEED_TAGS = RESTRICTIONS.filter((r) => r.kind === 'esigenza');

const NEED_KEYS = new Set(NEED_TAGS.map((r) => r.key));

/** Voce "di servizio" che convive con «nessuna intolleranza». */
export function isNeedTag(key: string) {
  return NEED_KEYS.has(key);
}

const LABELS = new Map(RESTRICTIONS.map((r) => [r.key, r.label]));

export function labelFor(key: string) {
  return LABELS.get(key) ?? key;
}
