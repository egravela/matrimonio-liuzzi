// I tavoli del ricevimento: ognuno porta il nome di una molecola, con una
// spiegazione scientifica e la dedica agli ospiti che ci siedono.
// Testi degli sposi; l'ordine è alfabetico come nel loro documento.

/**
 * I tavoli restano una sorpresa fino alla vigilia: venerdì 18 settembre 2026
 * alle 23 (ora italiana, CEST = UTC+2). Prima di quel momento la pagina non
 * è raggiungibile dalla home né dalla barra, e chi arriva con il link diretto
 * trova il conto alla rovescia. Il confronto usa l'orologio del dispositivo.
 */
export const REVEAL_AT = new Date('2026-09-18T23:00:00+02:00');

/** Come raccontiamo agli ospiti il momento dell'apertura. */
export const REVEAL_LABEL = 'venerdì 18 settembre alle 23';

/** Forma del disegno che accompagna la scheda (vedi components/Molecule.tsx). */
export type MoleculeShape = 'anello' | 'catena' | 'elica';

export type Tavolo = {
  /** Identificativo usato nell'ancora dell'URL (`/tavoli#ossitocina`). */
  slug: string;
  name: string;
  /** Famiglia chimica o biologica, mostrata come sottotitolo. */
  kind: string;
  /** Formula bruta per le molecole piccole; le proteine non ne hanno una leggibile. */
  formula?: string;
  science: string;
  dedication: string;
  shape: MoleculeShape;
};

export const TAVOLI: Tavolo[] = [
  {
    slug: 'acetilcolina',
    name: 'Acetilcolina',
    kind: 'Neurotrasmettitore',
    formula: 'C₇H₁₆NO₂⁺',
    science:
      'È un importante neurotrasmettitore, fondamentale nella comunicazione tra cellule nervose.',
    dedication: 'Per chi è stato famiglia durante la faticosa vita universitaria.',
    shape: 'catena',
  },
  {
    slug: 'adrenalina',
    name: 'Adrenalina',
    kind: 'Ormone',
    formula: 'C₉H₁₃NO₃',
    science:
      'Questa molecola aumenta l’energia, l’attenzione e la prontezza, preparando il corpo ad affrontare una sfida.',
    dedication:
      'Come la sana competizione: quella che ci stimola a migliorarci e a metterci in gioco.',
    shape: 'anello',
  },
  {
    slug: 'atp-sintasi',
    name: 'ATP sintasi',
    kind: 'Enzima',
    science:
      'Questo enzima, simile ad una turbina, trasforma un flusso di protoni in energia per la cellula.',
    dedication:
      'Come Elena e Tommaso: due percorsi che si sono incontrati e, insieme, hanno prodotto l’energia per costruire una vita insieme.',
    shape: 'anello',
  },
  {
    slug: 'caffeina',
    name: 'Caffeina',
    kind: 'Alcaloide',
    formula: 'C₈H₁₀N₄O₂',
    science:
      'Molecola che stimola il sistema nervoso centrale, aumentando vigilanza e attenzione.',
    dedication:
      'Per chi porta energia, idee, risate e quella giusta dose di caos senza cui una festa non sarebbe una festa.',
    shape: 'anello',
  },
  {
    slug: 'chaperonina',
    name: 'Chaperonina',
    kind: 'Proteina',
    science:
      'Questi enzimi assistono altre proteine nel corretto ripiegamento, soprattutto quando la cellula è sottoposta a stress.',
    dedication:
      'Per gli amici che sanno esserci quando serve: aiutano, sostengono e rimettono tutto al posto giusto.',
    shape: 'catena',
  },
  {
    slug: 'dna',
    name: 'DNA',
    kind: 'Acido nucleico',
    science:
      'La molecola che custodisce le informazioni che ci rendono unici e porta con sé una parte della nostra storia biologica.',
    dedication:
      'Come la famiglia e gli amici: le nostre radici, ciò da cui veniamo e ciò che abbiamo incontrato durante la nostra vita.',
    shape: 'elica',
  },
  {
    slug: 'dna-polimerasi',
    name: 'DNA polimerasi',
    kind: 'Enzima',
    science:
      'Questo enzima costruisce nuove molecole di DNA aggiungendo, una dopo l’altra, le basi necessarie alla loro formazione.',
    dedication:
      'Come la famiglia e gli amici: presenze che, giorno dopo giorno, aggiungono qualcosa alla nostra storia e contribuiscono a renderci ciò che siamo.',
    shape: 'elica',
  },
  {
    slug: 'endorfina',
    name: 'Endorfina',
    kind: 'Neuropeptide',
    science:
      'È la molecola del benessere e della felicità. Le endorfine sono coinvolte nelle sensazioni di piacere e benessere.',
    dedication:
      'Rappresentano le persone con cui basta stare insieme per stare bene, ridere e dimenticare per un po’ tutto il resto.',
    shape: 'catena',
  },
  {
    slug: 'ligasi',
    name: 'Ligasi',
    kind: 'Enzima',
    science: 'L’enzima che salda tra loro frammenti di DNA, mantenendo uniti i legami.',
    dedication: 'È la proteina perfetta per chi è lontano ma è capace di restare sempre unito.',
    shape: 'elica',
  },
  {
    slug: 'limonene',
    name: 'Limonene',
    kind: 'Terpene',
    formula: 'C₁₀H₁₆',
    science:
      'È una molecola aromatica presente soprattutto nelle bucce degli agrumi, responsabile del loro caratteristico profumo fresco e brillante.',
    dedication: 'Per le persone che portano allegria e colore alla nostra vita.',
    shape: 'anello',
  },
  {
    slug: 'neurexina',
    name: 'Neurexina',
    kind: 'Proteina',
    science:
      'È una proteina fondamentale nelle connessioni tra neuroni e contribuisce alla comunicazione sinaptica.',
    dedication:
      'Come le persone che, anche a distanza, trovano sempre il modo di rimanere connesse.',
    shape: 'catena',
  },
  {
    slug: 'ossitocina',
    name: 'Ossitocina',
    kind: 'Ormone',
    formula: 'C₄₃H₆₆N₁₂O₁₂S₂',
    science:
      'È una molecola coinvolta nell’attaccamento, nella fiducia e nelle relazioni sociali.',
    dedication:
      'È la molecola di chi ti fa sentire a casa, di chi crea vicinanza e di chi sa farti sorridere.',
    shape: 'catena',
  },
  {
    slug: 'resveratrolo',
    name: 'Resveratrolo',
    kind: 'Polifenolo',
    formula: 'C₁₄H₁₂O₃',
    science:
      'È un polifenolo prodotto da alcune piante, tra cui la vite, come risposta a condizioni di stress. È diventato anche simbolo di qualcosa che acquista fascino con il tempo.',
    dedication: 'Per le amicizie che gli anni non consumano, ma rendono ancora più preziose.',
    shape: 'anello',
  },
  {
    slug: 'ricombinasi',
    name: 'Ricombinasi',
    kind: 'Enzima',
    science:
      'Questi enzimi favoriscono il riarrangiamento e lo scambio di segmenti di DNA, generando nuove combinazioni genetiche.',
    dedication:
      'Per gli amici che si sono incontrati, mescolati, ritrovati e hanno creato qualcosa di nuovo insieme.',
    shape: 'elica',
  },
  {
    slug: 'telomerasi',
    name: 'Telomerasi',
    kind: 'Enzima',
    science:
      'L’enzima che protegge ciò che dura nel tempo. La telomerasi contrasta il consumo delle estremità dei cromosomi e contribuisce alla loro stabilità.',
    dedication:
      'L’enzima per i legami che, nonostante il tempo che passa, continuano a rinnovarsi e a restare importanti.',
    shape: 'elica',
  },
];

export function findTavolo(slug: string) {
  return TAVOLI.find((t) => t.slug === slug) ?? null;
}
