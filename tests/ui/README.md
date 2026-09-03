# UI smoke test for the PhD tracker

Drives the real built page in Chrome and asserts what a typecheck cannot: that
it hydrates, that focus is trapped and restored in the overlays, that every
control has an accessible name (using Chrome's own accname computation rather
than a hand-rolled approximation of it), that a lead is reachable and openable
from the keyboard, that all nine tabs render without a console error, that state
survives a reload, and that no view scrolls the page sideways at 360px.

It found three real defects on its first run:

- focus fell to `<body>` after the drawer closed, whenever the drawer had been
  opened from the add-lead dialog rather than from a persistent control
- four inputs had a placeholder as their only accessible name, which disappears
  the moment the user types
- the Pace column chart stretched its bars to about 300px wide, so a few months
  of data read as one solid slab

## Running it

`playwright-core` is deliberately **not** a project dependency, so `npm ci` on
CI stays lean and this does not run in the deploy pipeline. Install it when you
want to run the test, and remove it afterwards if you prefer:

```bash
npm i -D playwright-core          # drives the Chrome already on the machine,
                                  # downloads no browsers of its own
npm run build
python3 -m http.server 8823 --directory out --bind 127.0.0.1 &
node tests/ui/phd-tracker.mjs
kill %1                           # stop the static server
```

The static server is needed because GitHub Pages maps `/phd-tracker` to
`phd-tracker.html` and a plain static server does not, so the test requests the
`.html` path directly.

Optional environment variables:

- `CHROME` if Chrome is not at `/usr/bin/google-chrome`
- `SHOT_DIR` to write full-page screenshots of the Dashboard and Materials tabs
