# Portale Segnalazione Anomalie/Guasti — Flotta Freccialink & The Mall

> **Sistema digitale in-house per la segnalazione, la gestione e l'analisi delle
> anomalie e dei guasti sui mezzi della flotta Freccialink e The Mall.**
> Dal guasto rilevato a bordo fino alla chiusura dell'intervento, tutto tracciato,
> notificato e misurato — a costo zero.

---

## 1. Il problema

Le anomalie sui mezzi (WiFi non funzionante, sistema video guasto, difetti vari)
venivano segnalate in modo informale e frammentato (telefonate, messaggi, email
sparse), con il rischio di:

- segnalazioni **perse o non tracciate**;
- **nessuno storico** consultabile;
- **tempi di risoluzione non misurabili**;
- difficoltà a sapere **dove si trova** il mezzo da riparare.

## 2. La soluzione

Un **portale web** accessibile da smartphone (anche tramite **QR code** a bordo)
che raccoglie le segnalazioni in modo strutturato, le archivia in un **database**,
**notifica via email** i responsabili e il segnalatore, e mette a disposizione un
**pannello di gestione** con flusso di lavorazione e **statistiche** in tempo reale.

---

## 3. Numeri chiave

| Dato | Valore |
|------|--------|
| Costo di esercizio | **0 € (gratuito)** |
| Destinatari notificati per ogni segnalazione | **3** (referente, responsabile, segnalatore) |
| Stati del ciclo di vita | **3** (Pending → In lavorazione → Chiuso) |
| Momenti di notifica automatica | **3** (apertura, presa in carico, chiusura) |
| Server da mantenere | **0** (architettura serverless) |
| Accesso per i colleghi | **senza login** (QR o link) |
| Accesso al pannello di gestione | **solo titolare** (login Google) |

---

## 4. Architettura

Sistema **serverless**, costruito su servizi gratuiti, senza alcun server da gestire.

| Componente | Tecnologia | Dove risiede |
|-----------|-----------|--------------|
| **Form pubblico** di segnalazione | HTML/JavaScript statico | GitHub Pages |
| **Database** delle segnalazioni | Google Sheet | Google Drive |
| **Backend** (logica, email, allegati) | Google Apps Script | Google Cloud |
| **Pannello di gestione + statistiche** | Apps Script (HtmlService) | Google Cloud |
| **Archivio allegati** (foto) | Google Drive | Google Drive |

**Flusso dei dati:** Form (GitHub Pages) → Apps Script → Google Sheet + Google Drive
→ Email (Gmail) ai destinatari.

---

## 5. Come funziona — flusso end-to-end

1. **Segnalazione** — il collega inquadra il QR a bordo (o apre il link), compila il
   form da smartphone e invia. Data e ora sono inserite automaticamente.
2. **Archiviazione** — la segnalazione viene salvata nel database con stato **Pending**;
   le foto allegate sono ottimizzate e archiviate su Drive.
3. **Notifica di apertura** — partono 3 email di riepilogo (referente, responsabile,
   segnalatore).
4. **Presa in carico** — dal pannello, il gestore preme *Prendi in carico*: lo stato
   diventa **In lavorazione**, con data e descrizione registrate automaticamente, e
   parte un'**email di aggiornamento**.
5. **Chiusura** — a intervento concluso, *Chiudi*: stato **Chiuso**, con data di
   conclusione e riepilogo dell'intervento, e nuova **email di aggiornamento**.
6. **Analisi** — la sezione statistiche aggiorna conteggi e tempi medi di risoluzione.

---

## 6. Ciclo di vita di una segnalazione

```
   [PENDING]  ──prendi in carico──▶  [IN LAVORAZIONE]  ──chiudi──▶  [CHIUSO]
   appena                            + data presa in carico         + data conclusione
   ricevuta                          + descrizione lavorazione      + riepilogo intervento
```

Ogni transizione di stato è **tracciata con data/ora** e **notificata via email**.

---

## 7. Cosa raccoglie ogni segnalazione

- **Data e ora** (automatica)
- **Flotta** (Freccialink / The Mall, elenco gestibile)
- **Numero sociale** del mezzo
- **Dove è possibile intercettare** il mezzo (linea, deposito, città)
- **Email del segnalatore**
- **Descrizione** dell'anomalia
- Stato **WiFi** di bordo (funzionante / non funzionante)
- Stato **sistema video** di bordo (funzionante / non funzionante)
- **Foto allegate** (ottimizzate automaticamente, fino a 10 MB)

---

## 8. Funzionalità principali

- 📱 **Mobile-first**: pensato per l'uso da smartphone a bordo.
- 🔳 **Accesso via QR code**: volantino stampabile da affiggere sui mezzi.
- 🗂️ **Database centralizzato**: ogni segnalazione storicizzata e consultabile.
- 🔄 **Workflow degli stati**: presa in carico e chiusura con date e note automatiche.
- ✉️ **Notifiche email automatiche**: all'apertura e ad ogni cambio di stato.
- 🚌 **Flotte gestibili**: si aggiungono/rimuovono dal pannello, il form si aggiorna da solo.
- 📷 **Allegati fotografici**: compressi lato browser e archiviati su Drive.
- 📊 **Statistiche**: volumi e tempi medi di risoluzione per settimana/mese/anno.
- 🔒 **Gestione riservata**: pannello accessibile solo al titolare via login Google.

---

## 9. Le email automatiche

Ad ogni evento il sistema invia email a **referente (g.vasta)**, **responsabile (r.ocello)**
e **segnalatore**:

| Evento | Oggetto | Contenuto |
|--------|---------|-----------|
| **Apertura** | Nuova segnalazione | Riepilogo completo + link agli allegati |
| **Presa in carico** | Segnalazione presa in carico | Stato, data, descrizione lavorazione |
| **Chiusura** | Segnalazione chiusa | Stato, data conclusione, riepilogo intervento |

---

## 10. Statistiche disponibili

- **Conteggi per stato**: totali, Pending, In lavorazione, Chiuse.
- **Volumi per periodo**: questa settimana / questo mese / quest'anno.
- **Tempo medio di risoluzione** per ciascun periodo.
- **Andamento mensile** (ultimi 12 mesi) con volumi e tempi medi.

---

## 11. Tecnologie e costi

- **Frontend:** HTML5, CSS, JavaScript (nessun framework) su **GitHub Pages**.
- **Backend & database:** **Google Apps Script** + **Google Sheet** + **Google Drive**.
- **Email:** **Gmail** (via Apps Script), nessun servizio esterno a pagamento.
- **Costo totale:** **0 €** — interamente su piani gratuiti.
- **Manutenzione:** in-house, nessun fornitore esterno, nessun canone.

---

## 12. Accessi e sicurezza

- **Colleghi (segnalatori):** accesso libero al form, senza credenziali.
- **Gestore (titolare):** pannello protetto da **login Google**; nessun altro vi accede.
- **Allegati:** archiviati su Drive del titolare.
- **Anti-spam:** campo nascosto (honeypot) sul form.

---

## 13. QR code

- **QR del form**: apre direttamente la pagina di segnalazione.
- **Volantino A4 stampabile**: QR + istruzioni essenziali, da affiggere a bordo.

---

## 14. Link utili

- **Form pubblico:** https://gvasta62.github.io/segnalazioni-flotta/
- **Repository:** https://github.com/gvasta62/segnalazioni-flotta
- **Pannello di gestione:** riservato (login Google del titolare).

---

## 15. Possibili sviluppi futuri

- Notifiche anche via WhatsApp/Telegram.
- Export periodici automatici (PDF/Excel) e report schedulati.
- Dashboard grafica con andamenti e KPI.
- Categorie di anomalia e priorità.
- Integrazione con l'anagrafica mezzi e i turni.

---

*Progetto digitale in-house — Flotta Freccialink & The Mall. Documento illustrativo
predisposto come base per la realizzazione di un'infografica.*
