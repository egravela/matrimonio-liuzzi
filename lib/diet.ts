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

/** Scelta esclusiva: selezionandola si azzerano le altre. */
export const NONE = 'nessuna';

export const RESTRICTIONS: { key: string; label: string }[] = [
  { key: NONE, label: 'Nessuna intolleranza' },
  { key: 'glutine', label: 'Celiachia / glutine' },
  { key: 'lattosio', label: 'Lattosio' },
  { key: 'vegetariano', label: 'Vegetariano' },
  { key: 'vegano', label: 'Vegano' },
  { key: 'frutta-secca', label: 'Frutta secca' },
  { key: 'crostacei', label: 'Crostacei e molluschi' },
  { key: 'pesce', label: 'Pesce' },
  { key: 'uova', label: 'Uova' },
  { key: 'soia', label: 'Soia' },
  { key: 'bambini', label: 'Menù bambini' },
  { key: 'seggiolone', label: 'Seggiolone' },
  { key: 'gravidanza', label: 'In gravidanza' },
  { key: 'altro', label: 'Altro (dettagli sotto)' },
];

const LABELS = new Map(RESTRICTIONS.map((r) => [r.key, r.label]));

export function labelFor(key: string) {
  return LABELS.get(key) ?? key;
}
