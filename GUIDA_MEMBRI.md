# Guida rapida — Aggiungere te stesso, un progetto o una pubblicazione al sito XAIber-Lab

Il sito **non si modifica mai a mano**: si aggiorna da solo leggendo tre Google Sheet (Members, Projects, Publications). Basta compilare la riga giusta nel foglio giusto — il sito si ricostruisce automaticamente una volta al giorno, agli orari indicati più sotto in fondo alla guida.

## Link ai fogli

*(da compilare — link diretti ai tre fogli, per aprirli senza doverli cercare)*

- **Members**: [inserire link]
- **Projects**: [inserire link]
- **Publications**: [inserire link]

Il foglio Hub (quello con le liste di Rank, Status, Funding Regions, ecc.) non è linkato qui apposta: non serve aprirlo, i menu a discesa nei tre fogli sopra lo leggono già in automatico.

## Regole generali, valide su tutti i fogli

- **Colonna "Slug"**: non scriverci mai sopra a mano. Si genera da sola, in automatico, non appena scrivi il Nome/Titolo nella riga. Se per errore la modifichi comunque, comparirà un avviso a schermo — leggilo, ti spiega cosa rischi (i collegamenti che puntano a quella riga smettono di funzionare finché non li correggi).
- **Colonne con un menu a tendina** (Rank, Status, Funding Regions, Section, Publication Type, e i campi "…Slug" che collegano a membri/progetti): scegli solo tra le opzioni proposte nel menu, non scrivere a mano un valore nuovo — verrebbe rifiutato. Se il valore che ti serve non è nell'elenco (es. una nuova regione di finanziamento), **non inventare una variante simile**: fai richiesta al Professor Angelini, che gestisce quella lista nel foglio Hub — in un attimo il nuovo valore compare selezionabile ovunque.
- **Colonne "Keywords"** (parole chiave di ricerca): qui invece scrivi pure liberamente, separate da virgola — non sono un elenco chiuso, il numero e la varietà dei concetti sono normali.

## Come caricare foto e immagini

Le foto profilo e le immagini dei progetti **non vanno caricate su GitHub** — l'accesso al repository del sito è di sola lettura per i membri, quindi non potresti comunque farlo. Usa invece Google Drive:

1. Carica l'immagine sul tuo Google Drive.
2. Clic destro sul file → **Condividi** → cambia l'accesso in **"Chiunque abbia il link"** (senza questo passaggio l'immagine non sarà visibile a chi visita il sito).
3. Copia il link di condivisione — ha un formato tipo `https://drive.google.com/file/d/AbCdEfGhIjKlMnOp/view?usp=sharing`. L'unica parte che ti serve è il codice lungo in mezzo (`AbCdEfGhIjKlMnOp` in questo esempio).
4. Costruisci il link da incollare nel foglio così:
   ```
   https://drive.google.com/uc?export=view&id=AbCdEfGhIjKlMnOp
   ```
   (sostituisci solo il codice, tenendo `export=view` esattamente com'è — è diverso dal formato usato per i PDF, vedi sotto).
5. Incolla questo link nella cella giusta (Photo URL per il tuo profilo, Image 1/2/3 URL per un progetto).

## Caricare il PDF di una pubblicazione

Anche qui il PDF **non va caricato su GitHub** direttamente da te — stesso motivo delle immagini. Hai due strade, e sono deliberatamente diverse tra loro.

**Subito, da solo — Google Drive (soluzione temporanea).** Stessa procedura delle immagini: carica il PDF su Drive, Condividi → "Chiunque abbia il link", poi costruisci il link così:
```
https://drive.google.com/uc?export=download&id=IL-TUO-CODICE
```
(nota: qui è `export=download`, non `export=view` come per le immagini). Incollalo nella cella **PDF URL** — la pubblicazione è subito online.

**La soluzione definitiva — un amministratore lo aggiunge su GitHub.** Un PDF ospitato su Drive ha un limite tecnico reale, non solo teorico: i due pulsanti del sito "View PDF" e "Download PDF" finiscono per comportarsi allo stesso modo (entrambi scaricano subito il file), invece di restare distinti come sono pensati. La sistemazione corretta è avere il file nella cartella `papers/` del repository — cosa che solo chi ha accesso in scrittura può fare.

**Cosa fare in pratica**: pubblica pure subito su Drive per non perdere tempo, poi scrivi una email a **[nome/email amministratore]** allegando il PDF, chiedendo di spostarlo nella posizione definitiva. Non è urgente, ma è la cosa giusta da fare per una pubblicazione che deve restare online a lungo termine.

---

## 1. Aggiungersi come membro (foglio **Members**, tab "Members")

Aggiungi una nuova riga in fondo e compila:

| Colonna | Come compilarla |
|---|---|
| Name | Nome e cognome per esteso |
| Slug | **Lascia vuota**, si genera da sola |
| Rank | Menu a discesa: `director` / `professor` / `phd` / `collaborator` |
| Role | Si autocompila da sola in base al Rank scelto (es. `professor` → "Professor"). Puoi lasciarla così, oppure personalizzarla se vuoi un titolo più specifico — es. "Direttore e Professore Ordinario di [materia]" invece del generico "Director" — una volta modificata a mano resta quella |
| Institution | Affiliazione istituzionale |
| Bio | Testo lungo per la tua pagina personale |
| Bio Snippet | Versione breve, per la card nell'elenco membri |
| Avatar Initials | Le tue iniziali, usate solo se non carichi una foto |
| Photo URL | Link diretto a una tua foto — vedi la sezione "Come caricare foto e immagini" più sotto |
| Badge Word | Una parola/etichetta breve mostrata sulla tua card |
| Email | Il tuo indirizzo normale (es. `nome.cognome@linkstudents.it`) — il sito lo trasforma da solo in formato anti-spam per la visualizzazione, non serve scriverlo già "offuscato" |
| LinkedIn / Google Scholar / ResearchGate / Personal Site | Link diretti ai tuoi profili, uno per colonna |
| Keywords | Parole chiave di ricerca, separate da virgola, libere |
| Research Summary | Breve paragrafo sui tuoi interessi di ricerca |
| PhD Date | Solo per i PhD: testo libero, scrivilo come vuoi che appaia (es. "Dal Novembre 2023" o "XLI Ciclo") |
| PhD Topic Title / PhD Topic Description | Solo per i PhD: titolo e descrizione del tuo argomento di dottorato |

---

## 2. Aggiungere le tue attività (stesso foglio Members, tab "Member Activities")

Una riga per ogni voce del tuo percorso — un progetto a cui collabori, un incarico di didattica, un hobby.

| Colonna | Come compilarla |
|---|---|
| Member Slug | Menu a discesa: scegli il tuo nome dalla lista, invece di scriverlo a mano |
| Section | Menu a discesa: `projects` / `teaching` / `hobbies` |
| Date Range | Testo libero (es. "2024 – oggi") |
| Title | Titolo della voce |
| Org Line | Riga con ente/corso/contesto |
| Description | Descrizione breve |
| Bullets | Punti elenco: uno per riga nella stessa cella — premi **Alt+Invio** (Option+Invio su Mac) per andare a capo senza uscire dalla cella |
| Project Slug | Solo se questa attività riguarda un progetto del sito: menu a discesa, scegli il progetto |

---

## 3. Aggiungere un progetto (foglio **Projects**)

| Colonna | Come compilarla |
|---|---|
| Title | Titolo del progetto |
| Slug | **Lascia vuota**, si genera da sola |
| Status | Menu a discesa: `Active` / `Completed` |
| Time Span | Testo libero (es. "2024–2027") |
| Tagline | Frase breve di presentazione |
| Funding Regions | Menu a discesa **multi-selezione**: scegli una o più regioni tra quelle proposte |
| Funding Line | Testo con l'ente finanziatore |
| Description / About | Descrizioni lunga e "about" del progetto |
| Official Site / Repository URL | Link diretti |
| Keywords | Parole chiave libere, separate da virgola |
| Image 1/2/3 URL | Link alle immagini — stessa procedura descritta in "Come caricare foto e immagini" più sotto |

Il "Team" del progetto **non si scrive qui**: compare da solo, derivato automaticamente da chi ha collegato quel progetto tramite "Project Slug" nella tab Member Activities.

---

## 4. Aggiungere una pubblicazione (foglio **Publications**)

| Colonna | Come compilarla |
|---|---|
| Title | Titolo esatto della pubblicazione |
| Slug | **Lascia vuota**, si genera da sola |
| Authors / Date / Venue | Come apparsi nella pubblicazione |
| URL | Link alla pagina/DOI della pubblicazione |
| Abstract | Abstract del paper |
| Type | Menu a discesa (es. `Conference paper` / `Journal article`) |
| Conference Name / Date / Location | Solo se pertinente |
| Thumbnail URL | Immagine di anteprima |
| BibTeX / APA Citation | Citazioni nei due formati |
| Repository URL | Link a codice/dati collegati, se esiste |
| Member Slugs | Menu a discesa **multi-selezione**: gli autori che sono membri del laboratorio |
| Project Slugs | Menu a discesa **multi-selezione**: i progetti collegati a questa pubblicazione |
| PDF URL | Per pubblicare subito, usa Google Drive — vedi "Caricare il PDF di una pubblicazione" più sotto per la procedura e per capire quando conviene chiedere la sistemazione definitiva |

Le **parole chiave della pubblicazione stessa** (se un domani verranno aggiunte) non passano da nessun menu a discesa: restano quelle esatte con cui è stata pubblicata, anche se leggermente diverse da un paper all'altro sullo stesso argomento — è voluto, per fedeltà alla pubblicazione originale.

---

## Domande frequenti

**Perché Rank è un menu a discesa obbligato, ma Role si può modificare liberamente?**
Sono due cose diverse. Rank decide in quale sezione compari nell'elenco membri (Direttore/Professori/PhD/Collaboratori) — deve essere esattamente uno dei quattro valori proposti, altrimenti quella logica si rompe, per questo è chiuso. Role invece è solo il testo che si legge sulla tua card e sulla tua pagina — non guida nessuna logica del sito, quindi puoi renderlo più specifico del generico valore di Rank, senza rischi. Non devi comunque scrivere nulla se non vuoi: appena scegli il Rank, Role si autocompila da solo con un default coerente (es. "Professor", "PhD Candidate"). Se invece preferisci un titolo più preciso — es. "Direttore e Professore Ordinario di [materia]" invece del semplice "Director" — puoi scriverlo tu a mano, e da quel momento resta quello, anche se in futuro il tuo Rank dovesse cambiare.

**Il valore che mi serve non è nel menu a discesa (es. una regione di finanziamento nuova)?**
Fai richiesta al Professor Angelini — è l'unico che può aggiungerlo nel foglio Hub. Una volta aggiunto, compare selezionabile ovunque, senza bisogno di altre modifiche.

**Ho sbagliato a scrivere il mio Slug/quello di un progetto e ho corretto la cella a mano — è un problema?**
Compare un avviso quando lo fai: significa che eventuali pubblicazioni/attività che puntavano al vecchio Slug smettono di collegarsi correttamente. Se lo Slug era già in uso da qualche parte, aggiorna a mano anche quei riferimenti tu stesso, o segnalalo al Professor Angelini se non sei sicuro di dove cercarli.

**Quanto ci mette il sito ad aggiornarsi dopo che ho modificato il foglio?**
Il sito si ricostruisce da solo una volta al giorno, in automatico, a questi orari indicativi (ora italiana, un'ora prima in inverno):

| Foglio | Orario di aggiornamento |
|---|---|
| Publications | verso le 8:00 |
| Members | verso le 9:00 |
| Projects | verso le 10:00 |

Se modifichi il foglio dopo l'orario del giorno, la modifica compare sul sito il giorno successivo. Non serve fare nulla per avviarlo: è automatico, basta aspettare il prossimo passaggio.
