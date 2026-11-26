/**
 * PF Berthing Chart – Google Drive storage (Apps Script web app)
 *
 * One-time setup:
 *  1. script.google.com → New project → paste this whole file → set KEY below to your own secret.
 *  2. Deploy → New deployment → type "Web app" → Execute as: Me → Who has access: Anyone → Deploy
 *     → Authorize (allow Drive and Sheets access) → copy the Web app URL.
 *  3. In the berthing page: top bar "Drive: off" → paste the URL and the same KEY → Connect.
 *
 * What it keeps in your Drive (folder "PF Berthing Charts"):
 *   stations/<id>.json         – current data of each station (trains, PFs, change log)
 *   charts/<id>.svg            – picture of the current chart (opens in any browser)
 *   versions/<id>/<time>.json  – a copy of EVERY save (description = what changed)
 *   "PF Berthing – Change log" – Google Sheet, one row per change
 * After editing this file, use Deploy → Manage deployments → Edit → Version: New version.
 */
const KEY = 'CHANGE-ME-to-a-long-secret';
const ROOT = 'PF Berthing Charts';
const TZ = 'Asia/Kolkata';

function root_() { const it = DriveApp.getFoldersByName(ROOT); return it.hasNext() ? it.next() : DriveApp.createFolder(ROOT); }
function sub_(parent, name) { const it = parent.getFoldersByName(name); return it.hasNext() ? it.next() : parent.createFolder(name); }
function file_(folder, name) { const it = folder.getFilesByName(name); return it.hasNext() ? it.next() : null; }
function safe_(s) { return String(s || '').replace(/[^\w.\-~@+]/g, '-').slice(0, 80); }
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function read_(f) { return JSON.parse(f.getBlob().getDataAsString('UTF-8')); }

function logSheet_(R) {
  const name = 'PF Berthing – Change log';
  const f = file_(R, name);
  if (f) return SpreadsheetApp.openById(f.getId()).getSheets()[0];
  const ss = SpreadsheetApp.create(name);
  DriveApp.getFileById(ss.getId()).moveTo(R);
  const sh = ss.getSheets()[0];
  sh.appendRow(['Saved at', 'Station', 'Changed at', 'By', 'Change']);
  sh.setFrozenRows(1); sh.getRange('1:1').setFontWeight('bold');
  sh.setColumnWidth(5, 700);
  return sh;
}

function doGet(e) {
  try {
    const p = e.parameter || {};
    if (p.key !== KEY) return out_({ error: 'Wrong key' });
    const R = root_(), S = sub_(R, 'stations');
    if (p.action === 'ping') return out_({ ok: true, folder: R.getUrl() });
    if (p.action === 'list') {
      const a = [], it = S.getFiles();
      while (it.hasNext()) { const f = it.next(); if (/\.json$/.test(f.getName())) a.push({ id: f.getName().slice(0, -5), body: read_(f) }); }
      return out_({ stations: a, folder: R.getUrl() });
    }
    if (p.action === 'versions') {
      const V = sub_(sub_(R, 'versions'), safe_(p.id)), a = [], it = V.getFiles();
      while (it.hasNext()) { const f = it.next(); a.push({ vid: f.getId(), name: f.getName(), time: f.getDateCreated().toISOString(), msg: f.getDescription() || '' }); }
      a.sort((x, y) => y.time.localeCompare(x.time));
      return out_({ versions: a.slice(0, 300) });
    }
    if (p.action === 'version') {
      const V = sub_(sub_(R, 'versions'), safe_(p.id)), f = DriveApp.getFileById(p.vid);
      const ok = f.getParents(); let inside = false;
      while (ok.hasNext()) if (ok.next().getId() === V.getId()) inside = true;
      if (!inside) return out_({ error: 'Not a version of this station' });
      return out_({ body: read_(f) });
    }
    return out_({ error: 'Unknown action' });
  } catch (err) { return out_({ error: String(err) }); }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const b = JSON.parse(e.postData.contents);
    if (b.key !== KEY) return out_({ error: 'Wrong key' });
    const R = root_(), S = sub_(R, 'stations'), C = sub_(R, 'charts'), id = safe_(b.id);
    if (!id) return out_({ error: 'No station id' });

    if (b.action === 'save') {
      const f = file_(S, id + '.json');
      if (f && !b.force) {
        const cur = read_(f);
        if ((cur.savedAt || '') !== (b.base || '')) return out_({ conflict: true, savedAt: cur.savedAt || '', by: cur.savedBy || '' });
      }
      const txt = JSON.stringify(b.station, null, 1);
      if (f) f.setContent(txt); else S.createFile(id + '.json', txt, 'application/json');
      if (b.svg) { const g = file_(C, id + '.svg'); if (g) g.setContent(b.svg); else C.createFile(id + '.svg', b.svg, 'image/svg+xml'); }
      const now = new Date(), stamp = Utilities.formatDate(now, TZ, 'yyyy-MM-dd_HHmmss');
      sub_(sub_(R, 'versions'), id).createFile(stamp + '_' + safe_(b.by) + '.json', txt, 'application/json')
        .setDescription(String(b.message || '').slice(0, 4000));
      const ch = Array.isArray(b.changes) ? b.changes : [];
      if (ch.length) {
        const sh = logSheet_(R), savedAt = Utilities.formatDate(now, TZ, 'dd/MM/yyyy HH:mm');
        const rows = ch.map(c => [savedAt, String(b.station.name || id), c.t ? Utilities.formatDate(new Date(c.t), TZ, 'dd/MM/yyyy HH:mm') : '', String(c.by || ''), String(c.m || '')]);
        sh.getRange(sh.getLastRow() + 1, 1, rows.length, 5).setValues(rows);
      }
      return out_({ ok: true });
    }

    if (b.action === 'delete') {
      const f = file_(S, id + '.json'); if (f) f.setTrashed(true);
      const g = file_(C, id + '.svg'); if (g) g.setTrashed(true);
      logSheet_(R).appendRow([Utilities.formatDate(new Date(), TZ, 'dd/MM/yyyy HH:mm'), String(b.name || id), '', String(b.by || ''), 'Station deleted (older versions kept in versions folder)']);
      return out_({ ok: true });
    }
    return out_({ error: 'Unknown action' });
  } catch (err) { return out_({ error: String(err) }); }
  finally { lock.releaseLock(); }
}
