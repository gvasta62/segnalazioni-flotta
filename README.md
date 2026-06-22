# Segnalazione anomalia/guasto — Flotta Freccialink & The Mall

Portale web statico (GitHub Pages) per consentire ai colleghi di segnalare anomalie o
guasti sui mezzi della flotta **Freccialink** e **The Mall**.

🔗 **Portale online:** https://gvasta62.github.io/segnalazioni-flotta/

## Cosa raccoglie la segnalazione
- **Data e ora** (inserite automaticamente)
- **Flotta** (Freccialink / The Mall)
- **Numero sociale** del mezzo
- **Dove è possibile intercettare** il mezzo (linea, deposito, città…)
- **Email del segnalatore**
- **Descrizione** dell'anomalia
- Flag **WiFi** funzionante / non funzionante
- Flag **Sistema video** funzionante / non funzionante
- **Allegati** (foto), ottimizzate automaticamente lato browser

## Invio delle email
Ad ogni invio parte una email con il riepilogo (formato tabella) a:
- **g.vasta@fsbusitalia.it** (destinatario principale)
- **r.ocello@fsbusitalia.it** (in copia, campo `_cc`)
- **segnalatore** (copia di riepilogo automatica, campo `_autoresponse`)

Il servizio di inoltro email è **[FormSubmit.co](https://formsubmit.co)** (gratuito, nessun
backend da gestire). Gli allegati sono limitati a **10 MB totali** per invio: per questo le
foto vengono ridimensionate a max 1600px lato browser prima dell'invio.

> ⚠️ Vincolo tecnico FormSubmit: per supportare *allegati + autoresponse* l'invio è un POST
> classico (non AJAX), con redirect alla pagina `grazie.html`.

## ⚙️ Attivazione (UNA volta sola)
La **primissima** segnalazione inviata fa partire una email di **attivazione** da FormSubmit
verso `g.vasta@fsbusitalia.it`. Apri quella email e clicca il link **"Activate Form"**:
da quel momento tutti gli invii successivi funzionano senza ulteriori conferme.

## 🔒 Nota privacy/anti-spam (opzionale)
Le email `g.vasta@…` e `r.ocello@…` sono scritte in chiaro nell'HTML. Dopo l'attivazione,
FormSubmit fornisce un **endpoint cifrato** (`https://formsubmit.co/XXXXXXXX`) che nasconde
l'indirizzo. Per usarlo, sostituire nell'`action` del form in `index.html` l'email con la
stringa cifrata che trovi nella dashboard / email di attivazione di FormSubmit.

## File del progetto
| File | Descrizione |
|------|-------------|
| `index.html` | Modulo di segnalazione |
| `grazie.html` | Pagina di conferma post-invio |
| `README.md` | Questo file |

## Modifiche frequenti
- **Cambiare destinatari:** in `index.html`, `action` del form (principale) e campo nascosto `_cc`.
- **Cambiare oggetto/riepilogo:** funzioni `_subject` e `buildRecap()` nello `<script>`.
- **Aggiungere campi:** aggiungi un `<input name="...">` nel form; comparirà automaticamente
  nella tabella della email.
