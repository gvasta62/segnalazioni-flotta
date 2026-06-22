// Genera il documento illustrativo del progetto in formato Word (.docx)
const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel, BorderStyle,
  WidthType, ShadingType, VerticalAlign, PageNumber, ImageRun, ExternalHyperlink
} = require('docx');

const RED = 'A3173B', DARK = '7D0F2C', INK = '1F2430', GREY = '6B7280';
const CW = 9026; // larghezza contenuto A4 con margini 1"

const border = { style: BorderStyle.SINGLE, size: 1, color: 'D9DDE3' };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 140, right: 140 };

function h1(t){ return new Paragraph({ heading: HeadingLevel.HEADING_1, children:[new TextRun(t)] }); }
function h2(t){ return new Paragraph({ heading: HeadingLevel.HEADING_2, children:[new TextRun(t)] }); }
function p(t, opts={}){ return new Paragraph({ spacing:{after:120}, children:[new TextRun({text:t, ...opts})] }); }
function bullet(t){ return new Paragraph({ numbering:{reference:'b', level:0}, spacing:{after:40}, children:[new TextRun(t)] }); }
function num(t){ return new Paragraph({ numbering:{reference:'n', level:0}, spacing:{after:60}, children:[new TextRun(t)] }); }

function headCell(t, w){ return new TableCell({ borders, width:{size:w,type:WidthType.DXA}, margins:cellMargins,
  shading:{fill:RED, type:ShadingType.CLEAR}, verticalAlign:VerticalAlign.CENTER,
  children:[new Paragraph({children:[new TextRun({text:t, bold:true, color:'FFFFFF'})]})] }); }
function cell(runs, w){ const arr = Array.isArray(runs)?runs:[new TextRun(String(runs))];
  return new TableCell({ borders, width:{size:w,type:WidthType.DXA}, margins:cellMargins,
  children:[new Paragraph({children:arr})] }); }

function table(widths, header, rows){
  const trh = new TableRow({ tableHeader:true, children: header.map((t,i)=>headCell(t,widths[i])) });
  const trs = rows.map(r => new TableRow({ children: r.map((c,i)=>cell(c, widths[i])) }));
  return new Table({ width:{size:widths.reduce((a,b)=>a+b,0), type:WidthType.DXA}, columnWidths:widths, rows:[trh,...trs] });
}
function spacer(){ return new Paragraph({ children:[new TextRun('')] }); }

// QR image
let qrPara = spacer();
try {
  const qr = fs.readFileSync('qr-form-segnalazioni.png');
  qrPara = new Paragraph({ alignment: AlignmentType.CENTER, spacing:{before:120, after:60},
    children:[ new ImageRun({ type:'png', data:qr, transformation:{width:170, height:170},
      altText:{title:'QR', description:'QR code del form', name:'QR'} }) ] });
} catch(e){}

const doc = new Document({
  styles: {
    default: { document: { run: { font: 'Arial', size: 21, color: INK } } },
    paragraphStyles: [
      { id:'Title', name:'Title', basedOn:'Normal', next:'Normal',
        run:{ size:46, bold:true, color:DARK, font:'Arial' }, paragraph:{ spacing:{after:60} } },
      { id:'Heading1', name:'Heading 1', basedOn:'Normal', next:'Normal', quickFormat:true,
        run:{ size:30, bold:true, color:RED, font:'Arial' }, paragraph:{ spacing:{before:280, after:140}, outlineLevel:0 } },
      { id:'Heading2', name:'Heading 2', basedOn:'Normal', next:'Normal', quickFormat:true,
        run:{ size:24, bold:true, color:DARK, font:'Arial' }, paragraph:{ spacing:{before:180, after:100}, outlineLevel:1 } },
    ]
  },
  numbering: { config: [
    { reference:'b', levels:[{ level:0, format:LevelFormat.BULLET, text:'•', alignment:AlignmentType.LEFT,
      style:{ paragraph:{ indent:{ left:560, hanging:280 } } } }] },
    { reference:'n', levels:[{ level:0, format:LevelFormat.DECIMAL, text:'%1.', alignment:AlignmentType.LEFT,
      style:{ paragraph:{ indent:{ left:560, hanging:280 } } } }] },
  ]},
  sections: [{
    properties: { page: { size:{ width:11906, height:16838 }, margin:{ top:1440, right:1440, bottom:1440, left:1440 } } },
    footers: { default: new Footer({ children:[ new Paragraph({ alignment:AlignmentType.CENTER,
      children:[ new TextRun({ text:'Segnalazione Anomalie Flotta Freccialink & The Mall  —  pag. ', size:16, color:GREY }),
                 new TextRun({ children:[PageNumber.CURRENT], size:16, color:GREY }) ] }) ] }) },
    children: [
      new Paragraph({ style:'Title', children:[new TextRun('Portale Segnalazione Anomalie/Guasti')] }),
      new Paragraph({ spacing:{after:40}, children:[new TextRun({ text:'Flotta Freccialink & The Mall', size:26, bold:true, color:RED })] }),
      new Paragraph({ spacing:{after:200}, border:{ bottom:{ style:BorderStyle.SINGLE, size:10, color:RED, space:6 } },
        children:[new TextRun({ text:'Sistema digitale in-house: dal guasto rilevato a bordo alla chiusura dell’intervento — tracciato, notificato e misurato, a costo zero.', italics:true, color:GREY })] }),

      h1('1. Il problema'),
      p('Le anomalie sui mezzi (WiFi, sistema video, difetti vari) venivano segnalate in modo informale e frammentato — telefonate, messaggi, email sparse — con rischio di:'),
      bullet('segnalazioni perse o non tracciate;'),
      bullet('nessuno storico consultabile;'),
      bullet('tempi di risoluzione non misurabili;'),
      bullet('difficoltà a sapere dove si trova il mezzo da riparare.'),

      h1('2. La soluzione'),
      p('Un portale web accessibile da smartphone (anche tramite QR code a bordo) che raccoglie le segnalazioni in modo strutturato, le archivia in un database, notifica via email i responsabili e il segnalatore, e offre un pannello di gestione con flusso di lavorazione e statistiche in tempo reale.'),

      h1('3. Numeri chiave'),
      table([5200, 3826], ['Indicatore','Valore'], [
        ['Costo di esercizio', 'gratuito (0 €)'],
        ['Destinatari notificati per segnalazione', '3 — referente, responsabile, segnalatore'],
        ['Stati del ciclo di vita', '3 — Pending, In lavorazione, Chiuso'],
        ['Momenti di notifica automatica', '3 — apertura, presa in carico, chiusura'],
        ['Server da mantenere', '0 — architettura serverless'],
        ['Accesso colleghi', 'senza login (QR o link)'],
        ['Accesso pannello gestione', 'solo titolare (login Google)'],
      ]),

      h1('4. Architettura'),
      p('Sistema serverless costruito su servizi gratuiti, senza alcun server da gestire.'),
      table([2700, 3000, 3326], ['Componente','Tecnologia','Dove risiede'], [
        ['Form pubblico di segnalazione','HTML/JS statico','GitHub Pages'],
        ['Database delle segnalazioni','Google Sheet','Google Drive'],
        ['Backend (logica, email, allegati)','Google Apps Script','Google Cloud'],
        ['Pannello gestione + statistiche','Apps Script (HtmlService)','Google Cloud'],
        ['Archivio allegati (foto)','Google Drive','Google Drive'],
      ]),
      p('Flusso dei dati: Form (GitHub Pages) → Apps Script → Google Sheet + Google Drive → Email (Gmail) ai destinatari.', {color:GREY, size:18}),

      h1('5. Come funziona — flusso end-to-end'),
      num('Segnalazione — il collega inquadra il QR (o apre il link), compila il form da smartphone e invia. Data e ora automatiche.'),
      num('Archiviazione — salvataggio nel database con stato Pending; foto ottimizzate e archiviate su Drive.'),
      num('Notifica di apertura — 3 email di riepilogo (referente, responsabile, segnalatore).'),
      num('Presa in carico — dal pannello: stato In lavorazione, con data e descrizione; parte un’email di aggiornamento.'),
      num('Chiusura — a intervento concluso: stato Chiuso, con data di conclusione e riepilogo; nuova email di aggiornamento.'),
      num('Analisi — la sezione statistiche aggiorna conteggi e tempi medi di risoluzione.'),

      h1('6. Ciclo di vita di una segnalazione'),
      table([3009,3009,3008], ['PENDING','IN LAVORAZIONE','CHIUSO'], [
        ['Appena ricevuta','+ data presa in carico\n+ descrizione lavorazione','+ data conclusione\n+ riepilogo intervento'],
      ]),
      p('Ogni transizione di stato è tracciata con data/ora e notificata via email.', {color:GREY, size:18}),

      h1('7. Cosa raccoglie ogni segnalazione'),
      bullet('Data e ora (automatica)'),
      bullet('Flotta (Freccialink / The Mall — elenco gestibile dal pannello)'),
      bullet('Numero sociale del mezzo'),
      bullet('Dove è possibile intercettare il mezzo (linea, deposito, città)'),
      bullet('Email del segnalatore'),
      bullet('Descrizione dell’anomalia'),
      bullet('Stato WiFi di bordo (funzionante / non funzionante)'),
      bullet('Stato sistema video di bordo (funzionante / non funzionante)'),
      bullet('Foto allegate (ottimizzate automaticamente, fino a 10 MB)'),

      h1('8. Funzionalità principali'),
      bullet('Mobile-first: pensato per l’uso da smartphone a bordo.'),
      bullet('Accesso via QR code: volantino stampabile da affiggere sui mezzi.'),
      bullet('Database centralizzato: ogni segnalazione storicizzata e consultabile.'),
      bullet('Workflow degli stati: presa in carico e chiusura con date e note automatiche.'),
      bullet('Notifiche email automatiche: all’apertura e ad ogni cambio di stato.'),
      bullet('Flotte gestibili: aggiunte/rimosse dal pannello, il form si aggiorna da solo.'),
      bullet('Allegati fotografici: compressi lato browser e archiviati su Drive.'),
      bullet('Statistiche: volumi e tempi medi di risoluzione per settimana/mese/anno.'),
      bullet('Gestione riservata: pannello accessibile solo al titolare via login Google.'),

      h1('9. Le email automatiche'),
      p('Ad ogni evento il sistema invia email a referente (g.vasta), responsabile (r.ocello) e segnalatore:'),
      table([2300, 3100, 3626], ['Evento','Oggetto','Contenuto'], [
        ['Apertura','Nuova segnalazione','Riepilogo completo + link agli allegati'],
        ['Presa in carico','Segnalazione presa in carico','Stato, data, descrizione lavorazione'],
        ['Chiusura','Segnalazione chiusa','Stato, data conclusione, riepilogo intervento'],
      ]),

      h1('10. Statistiche disponibili'),
      bullet('Conteggi per stato: totali, Pending, In lavorazione, Chiuse.'),
      bullet('Volumi per periodo: questa settimana / questo mese / quest’anno.'),
      bullet('Tempo medio di risoluzione per ciascun periodo.'),
      bullet('Andamento mensile (ultimi 12 mesi) con volumi e tempi medi.'),

      h1('11. Tecnologie e costi'),
      bullet('Frontend: HTML5, CSS, JavaScript (nessun framework) su GitHub Pages.'),
      bullet('Backend & database: Google Apps Script + Google Sheet + Google Drive.'),
      bullet('Email: Gmail via Apps Script, nessun servizio esterno a pagamento.'),
      bullet('Costo totale: 0 € — interamente su piani gratuiti.'),
      bullet('Manutenzione: in-house, nessun fornitore esterno, nessun canone.'),

      h1('12. Accessi e sicurezza'),
      bullet('Colleghi (segnalatori): accesso libero al form, senza credenziali.'),
      bullet('Gestore (titolare): pannello protetto da login Google; nessun altro vi accede.'),
      bullet('Allegati: archiviati sul Drive del titolare.'),
      bullet('Anti-spam: campo nascosto (honeypot) sul form.'),

      h1('13. QR code di accesso'),
      p('Inquadra per aprire il form di segnalazione:'),
      qrPara,
      new Paragraph({ alignment:AlignmentType.CENTER, spacing:{after:160},
        children:[ new ExternalHyperlink({ link:'https://gvasta62.github.io/segnalazioni-flotta/',
          children:[new TextRun({ text:'gvasta62.github.io/segnalazioni-flotta', style:'Hyperlink', size:18 })] }) ] }),

      h1('14. Possibili sviluppi futuri'),
      bullet('Notifiche anche via WhatsApp/Telegram.'),
      bullet('Export periodici automatici (PDF/Excel) e report schedulati.'),
      bullet('Dashboard grafica con andamenti e KPI.'),
      bullet('Categorie di anomalia e livelli di priorità.'),
      bullet('Integrazione con anagrafica mezzi e turni.'),
    ]
  }]
});

Packer.toBuffer(doc).then(buf => { fs.writeFileSync('Progetto_Segnalazione_Flotta.docx', buf); console.log('OK docx', buf.length, 'bytes'); });
