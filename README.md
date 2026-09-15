# Boca Tapas Bar & Grill — Bicester

Conversion-focused restaurant website for **Boca Tapas Bar & Grill**, 75 Sheep Street, Bicester, Oxfordshire OX26 6JS.

Plain HTML, CSS and JavaScript. No framework, no build step, no dependencies. The whole site is the `site/` folder — deployable to Netlify by dragging that folder onto [Netlify Drop](https://app.netlify.com/drop), or by connecting this repo.

**The 15-second goal:** someone hungry on a phone should be able to land, see today's hours, tap to call, browse prices and book a table — without scrolling around. That drives every layout decision here.

---

## 1. What's in the box

| Path | Purpose |
| ---- | ------- |
| `site/index.html` | Single-page site: hero, menu highlights, story, gallery, reviews, find us & hours, booking form |
| `site/menu.html` | Full menu with prices, dietary tags and "best seller" markers, plus `Menu` / `MenuItem` schema |
| `site/404.html` | Branded 404 with links back home and to the menu |
| `site/thank-you.html` | Post-submission confirmation (Netlify Forms `action` target) |
| `site/style.css` | Design system: tokens, layout, components, print styles |
| `site/script.js` | Dynamic opening hours, mobile nav, gallery lightbox, menu scroll-spy, booking form |
| `site/images/PLACEHOLDER_*.svg` | On-brand placeholder tiles — replace with real photography |
| `site/images/og-image.png` | 1200×630 social share image |
| `site/robots.txt`, `site/sitemap.xml` | SEO plumbing |
| `netlify.toml` | Publish dir, clean-URL redirects, caching + security headers |
| `tools/make-placeholders.mjs` | Regenerates the placeholder artwork and OG image |
| `tools/image-urls.mjs` | Prints Netlify Image CDN `<picture>` markup for real photos |
| `docs/legacy-stack-readme.md` | The previous Next.js + Express + Prisma monorepo README (superseded) |

Verified business details used throughout: phone **01869 240877**, address **75 Sheep Street, Bicester OX26 6JS**, email **boca.bicester@gmail.com**, kitchen hours **(Mon closed, Tue–Thu 5–9pm, Fri 5–10pm, Sat 12–10pm, Sun 12–4pm)**.

---

## 2. Preview locally

No install required:

```bash
# Option A — Node (no dependencies)
npx --yes serve site

# Option B — Python
python -m http.server 8080 --directory site
```

Then open <http://localhost:3000> (or 8080). A plain double-click on `site/index.html` mostly works, but root-relative paths (`/style.css`, `/menu`) need a server, so prefer one of the above.

Regenerate placeholder artwork any time:

```bash
node tools/make-placeholders.mjs
```

---

## 3. Deploy to Netlify

### Option A — Git (recommended, gives you deploy previews)

1. Push this repo to GitHub/GitLab.
2. In Netlify: **Add new site → Import an existing project**, choose the repo.
3. Build settings:
   - **Build command:** leave as-is (it runs the harmless echo from `netlify.toml`)
   - **Publish directory:** `site`
4. Deploy. Every push to the default branch goes live; every PR gets a preview URL.

`netlify.toml` already pins `publish = "site"` and sets a no-op build command, so Netlify will not try to build the retired Next.js app in `apps/`.

### Option B — Drag and drop

Run `node tools/make-placeholders.mjs` if you have not already, then drag the **`site`** folder onto <https://app.netlify.com/drop>. Done — no build, no plugins.

### Clean URLs

`netlify.toml` rewrites `/menu` → `/menu.html` and redirects `/book`, `/contact`, `/find-us`, `/gallery`, `/reviews`, `/story` to the matching section of the homepage, so existing print/QR links keep working.

---

## 4. Connect a custom domain

1. Netlify → **Domain management → Add a domain** (e.g. `bocabicester.com`), then follow the DNS instructions (Netlify DNS, or an `ALIAS`/`A` record at your registrar).
2. Netlify issues the HTTPS certificate automatically once DNS resolves; enable **Force HTTPS**.
3. Search and replace the placeholder domain `https://bocabicester.com` in:
   - `site/index.html` — canonical, `og:url`, `og:image`, Twitter tags, JSON-LD `@id`/`url` values
   - `site/menu.html` — canonical, OG tags, JSON-LD
   - `site/sitemap.xml`, `site/robots.txt`
4. If the URL changes later, keep a redirect in `netlify.toml` from the old host so rankings transfer.

---

## 5. Updating the menu

Prices and dishes live in **two** places, on purpose:

1. `site/menu.html` — the full menu. Each dish is a list item:

   ```html
   <li class="dish">
     <span class="dish__name">Gambas al ajillo</span>
     <span class="dish__price">£9.50</span>
     <p class="dish__desc">King prawns sizzling in garlic, chilli and olive oil…</p>
     <ul class="tags"><li class="tag tag--best">Best seller</li><li class="tag">GF option</li></ul>
   </li>
   ```

   - `class="tag tag--best"` renders the copper “best seller” badge; other tags render as outlined badges.
   - Tag vocabulary in use: `V`, `VG`, `GF`, `GF option`, `VG` — plus free-text badges such as `House favourite`, `For sharing`, `Sharing`.

2. `site/index.html` — the four highlight cards in the **Menu** section (`#menu`). Keep these to four or five dishes per card; they are a teaser, not the full list.

3. **Update the schema too.** Each item in `site/menu.html`’s `Menu` JSON-LD block (`<script type="application/ld+json">`) carries `name`, optional `description`, optional `suitableForDiet` and an `offers.price`. If a price changes in the HTML, change it in the JSON-LD block as well — Google reads that, not the page text.

4. To add a new section: copy a `<section class="menu-block" id="...">` block, add a chip to the `.chips` nav at the top of the page, and add a matching `MenuSection` to the JSON-LD.

> **Before launch:** confirm every price with the kitchen. Prices on this build are realistic placeholders based on comparable Bicester tapas pricing — the dishes, hours, address and phone number are verified, but **the prices have not been signed off by the owner.**

### Seasonal/special menus

For a Sunday or Fiesta PDF, do **not** link a PDF as the primary menu. Add a section to `menu.html` (crawlers and phones can read it) and, if a printable version is needed, link the PDF as a secondary “printable version” link.

---

## 6. Changing opening hours

Hours are intentionally defined once in a small, readable place plus the display copies:

| Where | What |
| ----- | ---- |
| `site/script.js` → `HOURS` | The **single source of truth** for “open now”, “closes at”, “opens tomorrow” and for building the booking form’s time slots. `open`/`close` are minutes from midnight; `null` means closed. |
| `site/index.html` → `#find-us` hours table | The visible weekly table (all seven rows, `data-hours-row="0"` = Sunday … `6` = Saturday) |
| Restaurant JSON-LD in `site/index.html` | `openingHoursSpecification` for Google |
| `site/menu.html` | Nothing to change — its status line is rendered by JS |

The timezone is handled with `Intl.DateTimeFormat` pinned to `Europe/London`, so BST/GMT switches are correct without any manual dates.

---

## 7. Replacing the placeholder photography

There is **no stock photography** anywhere on this site. Every image is a branded placeholder tile named `PLACEHOLDER_*.svg`, and each one says so in the visible caption.

To swap in real photos:

1. Save the photo into `site/images/` using a descriptive name, e.g. `hero.jpg`, `tapas-spread.jpg`, `dining-room.jpg`. Aim for 1600px on the long edge, sRGB JPEG, under ~300KB.
2. Generate the responsive markup:

   ```bash
   node tools/image-urls.mjs hero.jpg tapas-spread.jpg
   ```

   This prints a `<picture>` element that uses the **Netlify Image CDN** with AVIF and WebP at 320w / 640w / 1024w / 1920w — no plugin, no build step, automatic format negotiation.
3. Paste that markup in place of the matching `<img>` in `site/index.html`:
   - hero → `.hero__media` (give it `loading="eager"` / `fetchpriority="high"` instead of `loading="lazy"`)
   - gallery → the six `.gallery__item` buttons (also update `data-full` and `data-caption`)
   - story → `.story__media`
4. **Alt text is not optional.** Describe what is happening in the photo (“Charred padrón peppers in a copper pan”), not the file name. Purely decorative images get `alt=""`.
5. Keep true `width` and `height` attributes on every `<img>` so the layout does not shift while loading (CLS target is under 0.1).
6. Replace `site/images/og-image.png` with a 1200×630 photo of the room or a signature dish (raster only — social platforms ignore SVG).

Placeholders are only listed in `netlify.toml`’s cache rules for a week, so a swapped image will never be stuck in a browser cache for long.

---

## 8. Trust badge and reviews

The rating chip in the header currently shows the **verified Tripadvisor rating for the Sheep Street restaurant (4.7 from 465 reviews)** and links to that listing. The three quote cards and the JSON-LD `Review` entries are real Tripadvisor reviews, reproduced in full sentences without inventing star ratings.

Two things to do once the Google Business Profile is live:

1. **Swap the badge to Google** (the brief prefers a Google badge). Replace the `<a class="rating-chip">` contents in `site/index.html` and `site/menu.html`, keep it near the logo, and update the `href` to the Google listing. Real Google rating only — never a made-up number.
2. **Embed a live widget** in `site/index.html` at the marked slot:

   ```html
   <!-- Live review widget slot. Paste the Tripadvisor or Google embed snippet here... -->
   <p class="review-slot">Reviews shown are from our Tripadvisor listing…</p>
   ```

   Paste the Tripadvisor/Google embed code in that spot and delete the `<p class="review-slot">`. Load the embed lazily (most providers offer an async snippet) so it cannot damage LCP.

3. **`aggregateRating` honesty:** Google requires aggregate ratings in structured data to reflect reviews collected on your own site. If you keep a third-party aggregate in the JSON-LD, be aware it is the most likely thing to attract a manual action; the safest long-term move is to collect reviews on the site and self-host the aggregate.

---

## 9. Booking form (Netlify Forms)

The reservation form on `/` is a real Netlify Form:

```html
<form name="reservation" method="POST" action="/thank-you.html"
      data-netlify="true" netlify-honeypot="bot-field">
  <input type="hidden" name="form-name" value="reservation">
```

- **Submissions:** Netlify dashboard → **Forms → reservation**. Add an email/Slack notification under **Forms → Settings → Form notifications**.
- **Spam:** the `bot-field` honeypot is hidden and must stay empty. Netlify’s built-in spam filtering is on by default; turn on reCAPTCHA in the dashboard if spam appears (no code change needed).
- **Success state:** with JavaScript on, the form posts in the background and shows an inline confirmation. With JavaScript off, it posts normally and lands on `/thank-you.html`. Both paths work.
- **Time slots** are generated from the selected date’s kitchen hours, so a Tuesday booking cannot request a 12:30 slot. The static `<option>` list in the HTML is the no-JS fallback — keep it broadly aligned with service times.
- Party sizes of 10+ are labelled “Fiesta menu” and the form asks for a phone number, because large tables need a conversation.

To change the fields, update both the HTML **and** the hidden `form-name` value if you rename the form. Netlify detects forms at deploy time from the static HTML.

---

## 10. Analytics

Two options, both privacy-friendly:

- **Netlify Analytics** — one switch in the Netlify dashboard, server-side, no cookie banner implications, no code. Recommended default.
- **Plausible** (or Simple Analytics) — the snippet is already in `site/index.html`, commented out:

  ```html
  <script defer data-domain="bocabicester.com" src="https://plausible.io/js/script.js"></script>
  ```

  Uncomment it and set `data-domain` to the real domain. It loads `defer`, so it does not block rendering.

---

## 11. SEO & structured data

- `Restaurant` schema on the homepage: address, geo, phone, cuisines, opening hours, `hasMenu`, `acceptsReservations`, `aggregateRating`, three `Review` entries and a `ReserveAction`.
- `Menu` schema on `/menu` with `MenuSection` → `MenuItem` → `Offer` (GBP), plus `suitableForDiet` for V/VG dishes, and a `BreadcrumbList`.
- Open Graph and Twitter card tags on both pages, with a real 1200×630 PNG.
- Canonicals are absolute; internal links are root-relative so they survive a domain move.
- `robots.txt` and `sitemap.xml` are in place. Submit the sitemap in Google Search Console after launch.

---

## 12. Accessibility notes

- Every interactive element is keyboard reachable; the mobile menu manages focus, closes on `Esc`/outside click and locks background scroll.
- Colour contrast: body copy is charcoal `#2C2C2C`/`#5A534C` on warm off-white `#FAF7F2` (7:1+); buttons use the deeper copper `#9A5B22` so the cream label clears 4.5:1. The brighter brand copper `#B87333` is reserved for rules, icons, large display text and UI where 3:1 applies.
- Form fields have visible `<label>` elements, not just placeholders, and the status message is an `aria-live` region with focus moved to it.
- Body text never drops below 16px on mobile; the only sub-16px text is small print at 0.82–0.94rem used for hints and captions.
- The gallery lightbox is a native `<dialog>` (free focus trapping and `Esc` support) with focus returned to the tile that opened it.
- No auto-advancing carousels, no text baked into images, `prefers-reduced-motion` is respected, and there is a visible “Skip to content” link.

---

## 13. Before-launch checklist

- [ ] Confirm every menu price with the owner (`menu.html`, highlight cards in `index.html`, and the JSON-LD).
- [ ] Replace the six `PLACEHOLDER_*.svg` gallery tiles, the hero backdrop and the story image with real photography, and update alt text.
- [ ] Replace `og-image.png` with a real 1200×630 photo.
- [ ] Swap the Tripadvisor rating chip for the live Google rating once the Google Business Profile is verified.
- [ ] Paste the review widget embed into the marked slot.
- [ ] Replace `https://bocabicester.com` with the final domain across HTML, `sitemap.xml` and `robots.txt`.
- [ ] Turn on form notification emails in Netlify and send one test booking through.
- [ ] Turn on Netlify Analytics (or uncomment the Plausible snippet).
- [ ] Run Lighthouse mobile against the deployed URL: aim for 90+ performance, LCP < 2.5s, CLS < 0.1.
- [ ] Confirm the Google Maps embed still resolves the address after any rebranding.

---

## 14. Legacy stack

The repository still contains the retired Next.js 14 + Express + Prisma monorepo in `apps/`, `packages/` and `prisma/` (with its own API, admin panel and Postgres schema, documented in `docs/legacy-stack-readme.md`). It is not used by the live site and `netlify.toml` explicitly does not build it. It can be deleted safely once the static site is live:

```bash
git rm -r apps packages prisma docker-compose.yml tsconfig.base.json
```

Keep `tools/` and `site/` — those are the live site.

---

## 15. Performance notes

- No framework, no bundled JavaScript, one CSS file, one 6KB script.
- The hero image is an SVG placeholder that is a few KB; once replaced with a photo, it will be served as AVIF/WebP through the Image CDN with correct dimensions to protect LCP.
- Fonts (Fraunces for headings, Inter for body) are loaded non-render-blocking with `preconnect` and a `noscript` fallback, and the stack degrades to system serif/sans.
- Non-critical images and the Google Map iframe are `loading="lazy"`; the sticky mobile bar is pure CSS.
