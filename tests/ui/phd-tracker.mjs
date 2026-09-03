/**
 * UI smoke test for /phd-tracker. See tests/ui/README.md for how to run it.
 *
 * These are the assertions a typecheck and a logic harness cannot make: real
 * hydration, real focus management, Chrome's own accessible-name computation,
 * real keyboard interaction, and real layout at a narrow viewport.
 */
import { chromium } from 'playwright-core'

const TARGET = 'http://127.0.0.1:8823/phd-tracker.html'
let pass = 0, fail = 0
const ok = (n, c, e = '') => c ? (pass++, console.log('  ok   ' + n)) : (fail++, console.log('  FAIL ' + n + (e ? '  -> ' + e : '')))

const browser = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--no-sandbox'] })
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const page = await ctx.newPage()
const cdp = await ctx.newCDPSession(page)
await cdp.send('Accessibility.enable')

const errors = []
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))

await page.goto(TARGET, { waitUntil: 'networkidle' })
await page.waitForTimeout(600)

console.log('\n== render and hydration ==')
ok('page renders the tracker heading', (await page.locator('h1').first().innerText()).includes('PhD Bench'))
ok('hydration completed (loading state gone)', !(await page.getByText('Loading your bench').isVisible().catch(() => false)))
ok('empty state offers a first action', await page.getByRole('button', { name: /Add your first lead/i }).isVisible())
ok('no console errors on load', errors.length === 0, errors.slice(0, 3).join(' | '))
ok('no hydration mismatch warning', !errors.some((e) => /hydrat/i.test(e)))

console.log('\n== add a lead through the dialog ==')
await page.getByRole('button', { name: /Add your first lead/i }).click()
await page.waitForTimeout(250)
const dlg = page.getByRole('dialog', { name: /Add a programme/i })
ok('dialog opens', await dlg.isVisible())
ok('focus lands in the dialog', await page.evaluate(() => {
  const d = document.querySelector('[role="dialog"]')
  return Boolean(d && d.contains(document.activeElement))
}))
await page.getByLabel('University', { exact: true }).fill('Johns Hopkins University')
await page.getByLabel('Programme or department').fill('Biomedical Engineering')
await page.getByLabel('Country').fill('United States')
await page.getByLabel('Deadline', { exact: true }).fill('2026-12-15')
await page.getByRole('button', { name: /Add to bench/i }).click()
await page.waitForTimeout(500)
ok('drawer opens on the new lead', await page.getByRole('dialog', { name: /Johns Hopkins/i }).isVisible())

console.log('\n== drawer focus trap and restore ==')
const drawer = page.getByRole('dialog', { name: /Johns Hopkins/i })
ok('focus is inside the drawer', await page.evaluate(() => {
  const d = document.querySelector('[role="dialog"]')
  return Boolean(d && d.contains(document.activeElement))
}))
// Tab many times; focus must never escape the panel.
let escaped = false
for (let i = 0; i < 90; i++) {
  await page.keyboard.press('Tab')
  const inside = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]')
    return Boolean(d && d.contains(document.activeElement))
  })
  if (!inside) { escaped = true; break }
}
ok('Tab never leaves the drawer (90 presses)', !escaped)
escaped = false
for (let i = 0; i < 40; i++) {
  await page.keyboard.press('Shift+Tab')
  const inside = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]')
    return Boolean(d && d.contains(document.activeElement))
  })
  if (!inside) { escaped = true; break }
}
ok('Shift+Tab never leaves the drawer', !escaped)
await page.keyboard.press('Escape')
await page.waitForTimeout(350)
ok('Escape closes the drawer', !(await drawer.isVisible().catch(() => false)))
ok('focus restored to a real visible control', await page.evaluate(() => {
  const a = document.activeElement
  return a !== null && a !== document.body && a instanceof HTMLElement && a.offsetParent !== null
}), await page.evaluate(() => document.activeElement === document.body ? 'landed on body' : String(document.activeElement && document.activeElement.tagName)))
ok('page scroll unlocked after close', await page.evaluate(() => document.body.style.overflow !== 'hidden'))

console.log('\n== keyboard path to a lead from the All leads table ==')
await page.getByRole('button', { name: /^All leads/ }).click()
await page.waitForTimeout(350)
const rowBtn = page.locator('table button', { hasText: 'Johns Hopkins University' }).first()
ok('programme name is a real button in the table', await rowBtn.count() > 0)
await rowBtn.focus()
ok('table button is focusable', await page.evaluate(() => document.activeElement?.tagName === 'BUTTON'))
await page.keyboard.press('Enter')
await page.waitForTimeout(400)
ok('Enter opens the lead', await page.getByRole('dialog', { name: /Johns Hopkins/i }).isVisible())
await page.keyboard.press('Escape')
await page.waitForTimeout(300)
ok('no click handler left on the row itself', await page.evaluate(() => {
  const tr = [...document.querySelectorAll('table tbody tr')][0]
  return tr ? tr.getAttribute('onclick') === null && !tr.className.includes('cursor-pointer') : true
}))

console.log('\n== accessible names, per Chrome accname ==')
const CONTROL_ROLES = new Set(['textbox','combobox','checkbox','button','link','listbox','spinbutton','searchbox','radio','slider'])
async function countUnnamed() {
  const { nodes } = await cdp.send('Accessibility.getFullAXTree')
  return nodes.filter((n) => !n.ignored && CONTROL_ROLES.has(n.role?.value) && !(n.name?.value || '').trim()).length
}
const u1 = await countUnnamed()
ok('every control has an accessible name', u1 === 0, String(u1))

console.log('\n== no control relies on a placeholder for its name ==')
const placeholderOnly = await page.evaluate(() => {
  const out = []
  for (const el of document.querySelectorAll('input:not([type=hidden]), textarea')) {
    if (el.offsetParent === null) continue
    if (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')) continue
    if (el.id && document.querySelector('label[for="' + CSS.escape(el.id) + '"]')) continue
    if (el.closest('label')) continue
    if (el.placeholder) out.push(el.placeholder.slice(0, 40))
  }
  return out
})
ok('no placeholder-only labels', placeholderOnly.length === 0, placeholderOnly.join(' | '))

console.log('\n== nested interactive elements ==')
const nested = await page.evaluate(() =>
  [...document.querySelectorAll('button, a[href]')]
    .filter((el) => el.querySelector('button, a[href]'))
    .map((el) => el.tagName.toLowerCase() + ' > ' + el.querySelector('button, a[href]').tagName.toLowerCase()),
)
ok('no control nested inside another control', nested.length === 0, nested.slice(0, 5).join(', '))

console.log('\n== open every tab without crashing ==')
for (const tab of ['Dashboard', 'Dates', 'Pipeline', 'All leads', 'Letters', 'Interviews', 'Decide', 'Insights', 'Materials']) {
  errors.length = 0
  await page.getByRole('button', { name: new RegExp('^' + tab) }).click()
  await page.waitForTimeout(280)
  const visible = await page.locator('main').isVisible()
  ok(`${tab} renders`, visible && errors.length === 0, errors.slice(0, 2).join(' | '))
  const un = await countUnnamed()
  ok(`${tab} has no unnamed controls`, un === 0, String(un))
}

console.log('\n== document registry seeded on first lead ==')
await page.getByRole('button', { name: /^Materials/ }).click()
await page.waitForTimeout(350)
const docCount = await page.locator('input[aria-label="Document name"]').count()
ok('registry seeded after adding a lead', docCount === 8, String(docCount))

console.log('\n== persistence across reload ==')
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(700)
ok('lead survives a reload', (await page.locator('body').innerText()).includes('Johns Hopkins'))
ok('no console errors after reload', errors.filter((e) => !/favicon/i.test(e)).length === 0, errors.slice(0, 2).join(' | '))

console.log('\n== small viewport: no horizontal page scroll ==')
await page.setViewportSize({ width: 360, height: 720 })
for (const tab of ['Dashboard', 'Dates', 'All leads', 'Insights', 'Materials']) {
  await page.getByRole('button', { name: new RegExp('^' + tab) }).click()
  await page.waitForTimeout(300)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  ok(`${tab} does not scroll the page sideways at 360px`, overflow <= 1, `${overflow}px overflow`)
}

await page.setViewportSize({ width: 1280, height: 900 })
await page.getByRole('button', { name: /^Dashboard/ }).click()
await page.waitForTimeout(400)
if (process.env.SHOT_DIR) await page.screenshot({ path: process.env.SHOT_DIR + '/dashboard.png', fullPage: true })
await page.getByRole('button', { name: /^Materials/ }).click()
await page.waitForTimeout(400)
if (process.env.SHOT_DIR) await page.screenshot({ path: process.env.SHOT_DIR + '/materials.png', fullPage: true })

await browser.close()
console.log('\n' + (fail === 0 ? `ALL ${pass} UI CHECKS PASSED` : `${pass} passed, ${fail} FAILED`))
process.exit(fail === 0 ? 0 : 1)
