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

## Where the data lives
Nothing is uploaded anywhere. Work is kept in your browser, and the **station .json file is the master copy**: keep it in the office folder or mail it to colleagues. Station files are not stored in this repository.

## Switching on GitHub Pages (one time)
Repo → **Settings → Pages** → Source: *Deploy from a branch* → Branch `main`, folder `/ (root)` → Save. After a minute the link above works.
