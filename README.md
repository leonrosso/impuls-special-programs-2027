# impuls 2027 Deadlines

Dashboard PWA di sola lettura per le scadenze del progetto "impuls Academy 2027 - Special Programs".

I dati vengono letti in tempo reale da un foglio Google Sheets pubblicato come CSV. Nessun backend, nessuna autenticazione, nessuna scrittura: è un cruscotto puramente informativo.

## Sviluppo

```bash
npm install
npm run dev
```

## Build di produzione

```bash
npm run build
npm run preview
```

L'output statico in `dist/` è pronto per il deploy su Vercel senza configurazione aggiuntiva.

## Note tecniche

- **Parsing CSV**: il foglio sorgente ha due difetti noti (un'intestazione con virgola non quotata e una virgola finale su molte righe). `src/csv.ts` fa il parsing posizionale con Papaparse (`header: false`) e ignora qualsiasi colonna oltre l'ottava, evitando di fidarsi delle chiavi generate dall'header rotto.
- **Offline**: `src/useDeadlines.ts` salva l'ultimo CSV scaricato con successo in `localStorage` (con timestamp) e lo usa come fallback quando il fetch fallisce, mostrando un banner "Dati offline". Un service worker (`public/sw.js`) cachea inoltre l'app shell e la risposta CSV via Cache API per l'installabilità offline della PWA.
