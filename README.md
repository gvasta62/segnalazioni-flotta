# Segnalazioni anomalie/guasti — Flotta Freccialink & The Mall

Sistema completo di **segnalazione e gestione** anomalie/guasti sui mezzi della flotta
**Freccialink** e **The Mall**.

🔗 **Form pubblico:** https://gvasta62.github.io/segnalazioni-flotta/

## Architettura
| Componente | Tecnologia | Dove |
|-----------|-----------|------|
| Form pubblico di segnalazione | HTML statico | **GitHub Pages** |
| Database segnalazioni | Google Sheet | Google Drive |
| Backend (salvataggio, email, allegati) | Google Apps Script | Google |
| Pannello gestione + statistiche | Apps Script (HtmlService) | Google, accesso **solo g.vasta** |

Il form pubblico invia i dati al backend Apps Script, che: salva la riga nel foglio con
stato **Pending**, archivia le foto su Drive e invia **3 email** (g.vasta, r.ocello in copia,
e copia di riepilogo al segnalatore).

## Ciclo di vita di una segnalazione
1. **Pending** — appena ricevuta.
2. **In lavorazione** — quando premi *Prendi in carico*: registra **data presa in carico** +
   **descrizione lavorazione**.
3. **Chiuso** — quando premi *Chiudi*: registra **data conclusione** + **riepilogo intervento**.

Ad ogni cambio di stato (presa in carico e chiusura) parte una **email di aggiornamento**
al segnalatore, a g.vasta@fsbusitalia.it e a r.ocello@fsbusitalia.it.

## Gestione flotte
Le flotte del menu a tendina sono nel foglio **"Flotte"** e si gestiscono dal pannello
(scheda **🚌 Flotte**): aggiungi/rimuovi una flotta e il form pubblico si aggiorna da solo.

## QR code
- `qr-form-segnalazioni.png` — QR semplice che apre il form.
- `volantino-qr-segnalazioni.png` — volantino A4 stampabile con QR e istruzioni.

## Statistiche (nel pannello)
- Conteggi totali per stato (pending / in lavorazione / chiuse).
- Segnalazioni di **questa settimana / questo mese / quest'anno** con **tempo medio di
  risoluzione** per ciascun periodo.
- Andamento mensile (ultimi 12 mesi) con tempo medio di risoluzione.

---

# 🛠️ Installazione (una volta sola)

### 1. Crea il database (Google Sheet)
1. Vai su https://sheets.google.com e crea un nuovo foglio, es. **"Segnalazioni Flotta"**.
2. Menu **Estensioni › Apps Script**: si apre l'editor di Apps Script *collegato* al foglio.

### 2. Inserisci il codice
1. Nell'editor, sostituisci il contenuto di `Codice.gs` con il file
   [`apps-script/Codice.gs`](apps-script/Codice.gs) di questo repo.
2. Crea un nuovo file HTML: **+ › HTML**, chiamalo esattamente **`Admin`**, e incolla dentro
   il contenuto di [`apps-script/Admin.html`](apps-script/Admin.html).
3. (Opzionale) In cima a `Codice.gs`, nella sezione `CONFIG`, verifica gli indirizzi email.
4. Salva (💾).

### 3. Prepara il foglio e autorizza
1. Nell'editor, seleziona la funzione **`setup`** dal menu a tendina e premi **Esegui**.
2. Google chiede l'autorizzazione: accedi con **gvasta@gmail.com**, "Avanzate" ›
   "Vai a … (non sicuro)" › consenti (servono permessi Foglio, Drive, Gmail).
3. Dopo l'esecuzione, nel foglio comparirà la scheda **Segnalazioni** con le intestazioni.

### 4. Pubblica il backend (deployment PUBBLICO)
1. In alto a destra: **Distribuisci › Nuova distribuzione**.
2. Tipo: **App web**.
3. Imposta:
   - **Esegui come:** *Me stesso (gvasta@gmail.com)*
   - **Chi ha accesso:** **Chiunque**
4. **Distribuisci** e **copia l'URL dell'app web** (termina con **`/exec`**).

### 5. Collega il form
1. In [`index.html`](index.html) trova la riga:
   ```js
   const SCRIPT_URL = "INCOLLA_QUI_URL_EXEC_PUBBLICO";
   ```
   e incolla l'URL `/exec` copiato.
2. Salva, poi pubblica su GitHub (vedi sotto).

### 6. Apri il pannello di gestione (solo tu)
- Nell'editor Apps Script: **Distribuisci › Distribuzioni di prova** (oppure il pulsante
  **Anteprima**) e usa l'**URL che termina con `/dev`**.
- Quell'indirizzo mostra il pannello **solo a te** (devi essere loggato come gvasta@gmail.com),
  esegue sempre l'ultima versione del codice. **Salvalo nei preferiti.**
- *(In alternativa, per un URL fisso, crea una seconda distribuzione "App web" con
  Esegui come: «Utente che accede», Accesso: «Solo me stesso».)*

---

## Pubblicare le modifiche su GitHub Pages
```bash
git add .
git commit -m "Aggiornamento"
git push
```
Il sito si aggiorna automaticamente in 1-2 minuti.

## Manutenzione
- **Modifica codice backend:** aggiorni `Codice.gs`/`Admin.html` nell'editor. Il pannello
  (`/dev`) usa subito il nuovo codice. Per il form pubblico, se cambi `doPost`, aggiorna la
  distribuzione: **Distribuisci › Gestisci distribuzioni › matita › Nuova versione**.
- **Cambiare destinatari email:** sezione `CONFIG` in `Codice.gs`.
- **Aggiungere un campo:** aggiungi l'input in `index.html`, la chiave nel `payload`, e la
  colonna in `HEADERS`/`appendRow` di `Codice.gs`.

## File del progetto
| File | Descrizione |
|------|-------------|
| `index.html` | Form pubblico di segnalazione (GitHub Pages) |
| `grazie.html` | Pagina di conferma post-invio |
| `apps-script/Codice.gs` | Backend: salvataggio, email, allegati, azioni admin, statistiche |
| `apps-script/Admin.html` | Pannello di gestione e statistiche |
| `README.md` | Questo file |

> ℹ️ **Nota:** questa versione usa Apps Script per inviare le email (mittente
> gvasta@gmail.com, reply-to g.vasta@fsbusitalia.it). FormSubmit **non è più utilizzato**.
