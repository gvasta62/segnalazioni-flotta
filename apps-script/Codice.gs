/**
 * ============================================================================
 *  Segnalazioni anomalie/guasti — Flotta Freccialink & The Mall
 *  Backend Google Apps Script (script "bound" al Google Sheet)
 * ============================================================================
 *
 *  COSA FA:
 *   - doPost  : riceve la segnalazione dal form pubblico (GitHub Pages),
 *               la salva nel foglio con stato "Pending", salva gli allegati
 *               su Drive e invia le 3 email (g.vasta, r.ocello, segnalatore).
 *   - doGet   : se aperto dall'admin (tu, loggato) mostra il pannello di
 *               gestione; altrimenti restituisce solo un testo neutro.
 *   - Funzioni admin (chiamate dal pannello): elenco, prendi in carico,
 *               chiudi, statistiche.
 *
 *  Vedi README per i passi di installazione e i DUE deployment necessari.
 * ============================================================================
 */

// ============================== CONFIGURAZIONE ==============================
const CONFIG = {
  ADMIN_EMAIL:   'gvasta@gmail.com',          // account Google che gestisce il pannello
  DEST_TO:       'g.vasta@fsbusitalia.it',    // destinatario principale email
  DEST_CC:       'r.ocello@fsbusitalia.it',   // in copia
  REPLY_TO:      'g.vasta@fsbusitalia.it',     // a chi risponde il segnalatore
  MITTENTE_NOME: 'Segnalazioni Flotta',
  SHEET_NAME:    'Segnalazioni',
  DRIVE_FOLDER:  'Segnalazioni Flotta - Allegati'
};

const STATI = { PENDING: 'Pending', LAVORAZIONE: 'In lavorazione', CHIUSO: 'Chiuso' };

const HEADERS = [
  'ID', 'Data/ora segnalazione', 'Flotta', 'Numero sociale', 'Dove intercettare',
  'Email segnalatore', 'Descrizione anomalia', 'WiFi', 'Sistema video',
  'Allegati', 'Stato', 'Data presa in carico', 'Descrizione lavorazione',
  'Data conclusione', 'Riepilogo intervento'
];
// indici colonna (1-based) per comodità
const COL = {
  ID:1, DATA:2, FLOTTA:3, NS:4, DOVE:5, EMAIL:6, DESCR:7, WIFI:8, VIDEO:9,
  ALLEGATI:10, STATO:11, DATA_PIC:12, DESCR_LAV:13, DATA_FINE:14, RIEPILOGO:15
};

// =============================== SETUP (1 volta) ============================
/** Esegui UNA volta dall'editor per creare il foglio e l'intestazione. */
function setup() {
  const sh = getSheet_();
  SpreadsheetApp.flush();
  Logger.log('Foglio pronto: ' + sh.getName());
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sh) sh = ss.insertSheet(CONFIG.SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
      .setFontWeight('bold').setBackground('#a3173b').setFontColor('#ffffff');
    sh.setFrozenRows(1);
    sh.autoResizeColumns(1, HEADERS.length);
  }
  return sh;
}

// =============================== ENDPOINT WEB ===============================
function doGet(e) {
  // Sul deployment "Admin" (accesso solo a te) l'utente attivo è la tua email.
  // Sul deployment "Pubblico" (accesso a chiunque) è vuota -> niente pannello.
  const user = (Session.getActiveUser().getEmail() || '').toLowerCase();
  if (user && user === CONFIG.ADMIN_EMAIL.toLowerCase()) {
    return HtmlService.createHtmlOutputFromFile('Admin')
      .setTitle('Gestione segnalazioni flotta')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
  }
  return ContentService.createTextOutput('Endpoint segnalazioni attivo.');
}

/** Riceve la segnalazione dal form pubblico (JSON nel body). */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // honeypot anti-spam
    if (data._honey) return jsonOut_({ ok: true });

    const sh = getSheet_();
    const now = new Date();
    const id = 'SEG-' + Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss')
                      + '-' + Math.floor(Math.random() * 900 + 100);

    // ---- allegati su Drive ----
    let linkAllegati = '';
    const blobs = [];
    if (data.attachments && data.attachments.length) {
      const root = getOrCreateFolder_(CONFIG.DRIVE_FOLDER);
      const folder = root.createFolder(id);
      try { folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (err) {}
      data.attachments.forEach(function (a) {
        const blob = Utilities.newBlob(Utilities.base64Decode(a.data), a.mimeType, a.name);
        folder.createFile(blob);
        blobs.push(blob);
      });
      linkAllegati = folder.getUrl();
    }

    // ---- riga sul foglio ----
    sh.appendRow([
      id, now, str_(data.flotta), str_(data.numeroSociale), str_(data.doveIntercettare),
      str_(data.email), str_(data.descrizione), str_(data.wifi), str_(data.video),
      linkAllegati, STATI.PENDING, '', '', '', ''
    ]);

    // ---- email ----
    inviaEmailSegnalazione_(id, now, data, linkAllegati, blobs);

    return jsonOut_({ ok: true, id: id });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  }
}

// ================================ EMAIL ====================================
function inviaEmailSegnalazione_(id, now, d, linkAllegati, blobs) {
  const dataStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
  const oggetto = '🚍 Segnalazione ' + str_(d.flotta) + ' — mezzo ' + str_(d.numeroSociale);

  const righe = [
    ['ID segnalazione', id],
    ['Data e ora', dataStr],
    ['Flotta', str_(d.flotta)],
    ['Numero sociale', str_(d.numeroSociale)],
    ['Dove intercettarlo', str_(d.doveIntercettare)],
    ['Segnalatore', str_(d.email)],
    ['WiFi', str_(d.wifi) || 'non indicato'],
    ['Sistema video', str_(d.video) || 'non indicato'],
    ['Descrizione', str_(d.descrizione)]
  ];

  let html = '<div style="font-family:Arial,sans-serif;color:#1f2430">'
    + '<h2 style="color:#a3173b;margin:0 0 10px">Nuova segnalazione anomalia/guasto</h2>'
    + '<table cellpadding="8" cellspacing="0" style="border-collapse:collapse;font-size:14px">';
  righe.forEach(function (r) {
    html += '<tr>'
      + '<td style="background:#f4f5f7;border:1px solid #e2e5ea;font-weight:bold;white-space:nowrap">' + r[0] + '</td>'
      + '<td style="border:1px solid #e2e5ea">' + escapeHtml_(r[1]) + '</td></tr>';
  });
  html += '</table>';
  if (linkAllegati) html += '<p style="margin-top:14px">📎 <a href="' + linkAllegati + '">Allegati su Drive</a></p>';
  html += '<p style="color:#6b7280;font-size:12px;margin-top:18px">Stato iniziale: <b>Pending</b>. '
        + 'Gestisci la segnalazione dal pannello.</p></div>';

  const opt = {
    name: CONFIG.MITTENTE_NOME,
    replyTo: CONFIG.REPLY_TO,
    cc: CONFIG.DEST_CC,
    htmlBody: html
  };
  if (blobs.length) opt.attachments = blobs;

  // email interna (g.vasta + cc r.ocello, con allegati)
  GmailApp.sendEmail(CONFIG.DEST_TO, oggetto, plainText_(righe, linkAllegati), opt);

  // copia di riepilogo al segnalatore
  if (d.email && /\S+@\S+\.\S+/.test(d.email)) {
    const htmlSeg = '<div style="font-family:Arial,sans-serif;color:#1f2430">'
      + '<h2 style="color:#a3173b">Abbiamo ricevuto la tua segnalazione</h2>'
      + '<p>Grazie. Di seguito il riepilogo:</p>' + html.split('<h2')[1].replace(/^[^>]*>.*?<\/h2>/, '')
      + '</div>';
    GmailApp.sendEmail(d.email, '✅ Riepilogo segnalazione ' + str_(d.numeroSociale),
      plainText_(righe, linkAllegati),
      { name: CONFIG.MITTENTE_NOME, replyTo: CONFIG.REPLY_TO, htmlBody: htmlSeg });
  }
}

// =========================== FUNZIONI ADMIN ================================
function assertAdmin_() {
  const user = (Session.getActiveUser().getEmail() || '').toLowerCase();
  if (user !== CONFIG.ADMIN_EMAIL.toLowerCase())
    throw new Error('Accesso non autorizzato.');
}

/** Elenco segnalazioni (per il pannello). */
function getSegnalazioni() {
  assertAdmin_();
  const sh = getSheet_();
  const last = sh.getLastRow();
  if (last < 2) return [];
  const vals = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
  const tz = Session.getScriptTimeZone();
  const fmt = function (v) { return v instanceof Date ? Utilities.formatDate(v, tz, 'dd/MM/yyyy HH:mm') : (v || ''); };
  return vals.map(function (r) {
    return {
      id: r[COL.ID - 1],
      data: fmt(r[COL.DATA - 1]),
      flotta: r[COL.FLOTTA - 1],
      numeroSociale: r[COL.NS - 1],
      dove: r[COL.DOVE - 1],
      email: r[COL.EMAIL - 1],
      descrizione: r[COL.DESCR - 1],
      wifi: r[COL.WIFI - 1],
      video: r[COL.VIDEO - 1],
      allegati: r[COL.ALLEGATI - 1],
      stato: r[COL.STATO - 1],
      dataPic: fmt(r[COL.DATA_PIC - 1]),
      descrLav: r[COL.DESCR_LAV - 1],
      dataFine: fmt(r[COL.DATA_FINE - 1]),
      riepilogo: r[COL.RIEPILOGO - 1]
    };
  }).reverse(); // più recenti in alto
}

function findRow_(sh, id) {
  const ids = sh.getRange(2, COL.ID, Math.max(0, sh.getLastRow() - 1), 1).getValues();
  for (var i = 0; i < ids.length; i++) if (ids[i][0] === id) return i + 2;
  return -1;
}

/** Prendi in carico -> "In lavorazione" + data presa in carico + descrizione. */
function prendiInCarico(id, descrizione) {
  assertAdmin_();
  const sh = getSheet_();
  const row = findRow_(sh, id);
  if (row < 0) throw new Error('Segnalazione non trovata.');
  sh.getRange(row, COL.STATO).setValue(STATI.LAVORAZIONE);
  if (!sh.getRange(row, COL.DATA_PIC).getValue()) sh.getRange(row, COL.DATA_PIC).setValue(new Date());
  sh.getRange(row, COL.DESCR_LAV).setValue(descrizione || '');
  return { ok: true };
}

/** Chiudi -> "Chiuso" + data conclusione + riepilogo intervento. */
function chiudiSegnalazione(id, riepilogo) {
  assertAdmin_();
  const sh = getSheet_();
  const row = findRow_(sh, id);
  if (row < 0) throw new Error('Segnalazione non trovata.');
  // se non era stata presa in carico, registro comunque la presa in carico ora
  if (!sh.getRange(row, COL.DATA_PIC).getValue()) sh.getRange(row, COL.DATA_PIC).setValue(new Date());
  sh.getRange(row, COL.STATO).setValue(STATI.CHIUSO);
  sh.getRange(row, COL.DATA_FINE).setValue(new Date());
  sh.getRange(row, COL.RIEPILOGO).setValue(riepilogo || '');
  return { ok: true };
}

// ============================== STATISTICHE ================================
function getStatistiche() {
  assertAdmin_();
  const sh = getSheet_();
  const last = sh.getLastRow();
  const base = { totali: 0, pending: 0, lavorazione: 0, chiuso: 0,
    settimana: vuoto_(), mese: vuoto_(), anno: vuoto_(), perMese: [] };
  if (last < 2) return base;

  const vals = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
  const now = new Date();
  const startWeek = startOfWeek_(now), startMonth = new Date(now.getFullYear(), now.getMonth(), 1),
        startYear = new Date(now.getFullYear(), 0, 1);

  const acc = { settimana: accInit_(), mese: accInit_(), anno: accInit_() };
  const perMese = {}; // 'YYYY-MM' -> {count, sumH, closed}

  vals.forEach(function (r) {
    const dataSeg = r[COL.DATA - 1];
    const stato = r[COL.STATO - 1];
    const dataFine = r[COL.DATA_FINE - 1];
    if (!(dataSeg instanceof Date)) return;

    base.totali++;
    if (stato === STATI.PENDING) base.pending++;
    else if (stato === STATI.LAVORAZIONE) base.lavorazione++;
    else if (stato === STATI.CHIUSO) base.chiuso++;

    // conteggi per periodo (in base alla data segnalazione)
    if (dataSeg >= startWeek) acc.settimana.count++;
    if (dataSeg >= startMonth) acc.mese.count++;
    if (dataSeg >= startYear) acc.anno.count++;

    // tempo medio risoluzione (per chiuse, in base alla data conclusione)
    if (stato === STATI.CHIUSO && dataFine instanceof Date) {
      const ore = (dataFine.getTime() - dataSeg.getTime()) / 36e5;
      if (dataFine >= startWeek) { acc.settimana.sumH += ore; acc.settimana.closed++; }
      if (dataFine >= startMonth) { acc.mese.sumH += ore; acc.mese.closed++; }
      if (dataFine >= startYear) { acc.anno.sumH += ore; acc.anno.closed++; }

      const key = dataFine.getFullYear() + '-' + ('0' + (dataFine.getMonth() + 1)).slice(-2);
      if (!perMese[key]) perMese[key] = { count: 0, sumH: 0 };
    }
    // conteggio mensile per data segnalazione
    const k2 = dataSeg.getFullYear() + '-' + ('0' + (dataSeg.getMonth() + 1)).slice(-2);
    if (!perMese[k2]) perMese[k2] = { count: 0, sumH: 0, closed: 0 };
    perMese[k2].count++;
    if (stato === STATI.CHIUSO && dataFine instanceof Date) {
      perMese[k2].sumH += (dataFine.getTime() - dataSeg.getTime()) / 36e5;
      perMese[k2].closed = (perMese[k2].closed || 0) + 1;
    }
  });

  base.settimana = pack_(acc.settimana);
  base.mese = pack_(acc.mese);
  base.anno = pack_(acc.anno);

  base.perMese = Object.keys(perMese).sort().reverse().slice(0, 12).map(function (k) {
    const m = perMese[k];
    return { mese: k, count: m.count,
      tempoMedio: m.closed ? formatOre_(m.sumH / m.closed) : '—' };
  });
  return base;
}

function vuoto_() { return { count: 0, tempoMedio: '—' }; }
function accInit_() { return { count: 0, sumH: 0, closed: 0 }; }
function pack_(a) { return { count: a.count, tempoMedio: a.closed ? formatOre_(a.sumH / a.closed) : '—' }; }
function startOfWeek_(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const g = (x.getDay() + 6) % 7; // lunedì = 0
  x.setDate(x.getDate() - g);
  return x;
}
function formatOre_(ore) {
  if (ore < 1) return Math.round(ore * 60) + ' min';
  if (ore < 48) return (Math.round(ore * 10) / 10) + ' h';
  const g = Math.floor(ore / 24), h = Math.round(ore % 24);
  return g + ' g ' + h + ' h';
}

// =============================== UTILITY ===================================
function getOrCreateFolder_(name) {
  const it = DriveApp.getFoldersByName(name);
  return it.hasNext() ? it.next() : DriveApp.createFolder(name);
}
function jsonOut_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function str_(v) { return v == null ? '' : String(v); }
function escapeHtml_(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
}
function plainText_(righe, link) {
  var t = righe.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n');
  if (link) t += '\nAllegati: ' + link;
  return t;
}
