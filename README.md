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

- **Parsing CSV**: il foglio ha 9 colonne (Title, Coach, Deadline, Zoom Meetings, Decision, Deadline 2, Equivalent, Description, Full Description) e occasionali righe malformate (es. una colonna Equivalent disallineata su una riga). `src/csv.ts` fa il parsing posizionale con Papaparse (`header: false`) e non si fida delle chiavi generate dall'header. L'app mostra la Full Description (colonna 9); la Description (colonna 8, il riassunto usato sul sito) è usata solo come fallback se la colonna 9 è vuota.
- **Offline**: `src/useDeadlines.ts` salva l'ultimo CSV scaricato con successo in `localStorage` (con timestamp) e lo usa come fallback quando il fetch fallisce, mostrando un banner "Dati offline". Un service worker (`public/sw.js`) cachea inoltre l'app shell e la risposta CSV via Cache API per l'installabilità offline della PWA.
