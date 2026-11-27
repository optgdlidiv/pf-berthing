# PF Berthing Chart

A single-page tool for drawing platform berthing charts at any station: trains, PFs and timings go in, and you get a print-ready chart (PDF / SVG). Bars are drawn to the exact minute.

**Open it:** https://optgdlidiv.github.io/pf-berthing/ (after GitHub Pages is switched on, see below)

## Daily use
1. **Open file** → pick your station file (e.g. `Bijwasan_Jn_Berthing.json`), or **+ New station**.
2. Edit in **Trains**: PF, Type (Terminating / Originating / Term → Orig / Passing / EMU / Passenger), train no., PF from / to, days (`Daily`, `1,3,5`, `Ex.4,7`; 1 = Mon … 7 = Sun).
   Days can also go in brackets after each train no. — Arr `19337(1),20983(3,6)`, Dep `19338(1),20984(3,6)` — leave Days blank; the chart shows one line per pair and the day filter shows only that day's trains.
   *Paste from Excel* works with columns `PF · Type · Arr · Dep · From · To · Days · Load · Remarks`.
3. **Save file** (Ctrl+S). In Chrome / Edge it writes back to the same file; in other browsers it downloads a fresh copy.
4. **Chart → Download PDF** (A3 / A4 / A2 landscape, multi-sheet if needed) or **Download SVG**.

Checks flag clashes (same PF, overlapping time, common day), bad timings and load > PF capacity. *Free PF finder* lists the free PFs for a proposed slot.

## Two chart formats
When creating a station tick **PF Berthing** and/or **Stable / Center / Washing lines** and give the number of each. Name the lines as you like under *Station setup* (W/L 1, Stable line 3, Center line 2A, Shunting neck 1 …).
- **PF Berthing** – one row per PF, terminating / originating boxes (as before).
- **Lines** – one block per line, columns 00–24 hrs, rows Mon–Sun. Enter in **Line occupations**: Line · Train/rake · Activity (RPC, Stabling, PM maintenance, Stabled after maintenance, Secondary) · From · To · Days. Consecutive stretches of the same rake join into one bar; a stay past midnight continues in the next day's row (Sun → Mon). Overlaps on the same line and day are flagged as clashes.
Choose which one to view/print with **Chart** on the Chart tab. **Click the title, a PF number or a line name on the chart to rename it** (also under *Station setup*); every rename goes into the change log.

## Train count
**Train count** tab: PF-wise and station-total counts of Terminating, Originating (and how many terminate & originate on the same PF), Passing, EMU and Passenger trains, with the train numbers. Comma-separated train nos. are counted individually (`19337(1),20983(3,6)` = 2); a train no. in several rows is counted once. Choose *All days* or one day; download as CSV.

## Where the data lives
- **Google Drive (recommended):** click **Drive: off** in the top bar and follow the one-time setup. It uses a small Apps Script ([`drive/Code.gs`](drive/Code.gs)) that you deploy from your own Google account. Each **Save** writes into your Drive folder **PF Berthing Charts**:
  - `stations/<station>.json` – current data (trains, PFs, change log)
  - `charts/<station>.svg` – picture of the current chart
  - `versions/<station>/<date_time>_<name>.json` – a copy of **every** save; *Change log → Saved versions* lets you download any version or open it again
  - **PF Berthing – Change log** (Google Sheet) – one row per change: when, station, who, old → new
- **Without Drive:** work is kept in this browser; **Save** writes the station `.json` file, **Download file** gives a copy any time.
- No berthing data is stored in this GitHub repository (it holds only the page; `.json` files are git-ignored).

## Change log
Every edit is recorded with date-time, your name and *old → new*, e.g. `22492 [PF 1 06:00-06:30]: PF 1 → 7`. It is kept inside the station file, shown in the **Change log** tab (downloadable as CSV) and, with Drive connected, added to the Change log Google Sheet on each Save.
