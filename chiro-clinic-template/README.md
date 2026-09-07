# Vertebra & Vitality — Chiropractic & Spine Care Clinic Template

A premium, responsive HTML template for chiropractic and spine care clinics, built with
TailwindCSS in a deep emerald-teal + muted brass gold palette with an editorial Fraunces +
Inter typeface pairing. Fully self-contained — no external CDN dependencies for CSS, icons,
or images, so it works offline and loads reliably wherever it's hosted.

## Pages Included

**Core clinic pages**
- `index.html` — Home 1 (split hero, services preview, awards strip, doctors preview, testimonials, blog preview)
- `home2.html` — Home 2, an alternate homepage layout: full-bleed photo hero, "Why Choose Us" panel, all
  three flagship services as photo tiles, all six doctors, a 3-step "How It Works" timeline, a testimonial
  spotlight, and a blog preview. Reachable from the header's "Home" dropdown (Home 1 / Home 2) alongside
  `index.html`, so both layouts stay live and linkable at once.
- `about.html` — About Us (story, mission & values, 15-year timeline, accreditations, team preview)
- `services.html` — Alternating flagship-service showcase, compact list of additional services, a
  3-step "How It Works" section, and a closing booking CTA
- `service-details.html` — Single service detail with FAQ accordion, pricing table, and a full sidebar
  (all 9 services, a "What to Expect" card, a patient quote, and a call-us card)
- `doctors.html` — Founder spotlight, alternating associate-doctor rows, credentials, careers CTA
- `testimonials.html` — Patient testimonials, star-rating breakdown, video testimonial section
- `contact.html` — Contact info, appointment booking form, live map embed, same-day care callout, mini FAQ

**Extended template pages**
- `pricing.html` — What's-included strip + centered "Pricing & Packages" tiers + comparison table +
  centered "Frequently Asked Questions" + closing booking CTA
- `blog.html` — Featured post + magazine-style article list with categories/popular-posts sidebar
- `blog-details.html` — Full article layout with sidebar, comments, related posts
- `login.html` / `register.html` — Patient portal authentication screens with benefit highlights
- `404.html` — Not found page with popular-page shortcuts
- `coming-soon.html` — Maintenance / launch countdown page

Services, Doctors, and Blog were deliberately given three different layout structures
(alternating feature rows, a founder spotlight + list, and a magazine/sidebar layout) so the
site doesn't feel like the same card grid repeated three times.

## Tech Stack

- **TailwindCSS 3** — pre-compiled to `assets/css/tailwind.css` (no CDN/JIT script at runtime),
  with a custom `teal` (deep emerald) and `gold` (muted brass) color scale
- **Font Awesome 6** (Free) — self-hosted in `assets/vendor/fontawesome/`
- **Google Fonts** — Fraunces (display/serif) + Inter (body), loaded via `fonts.googleapis.com`
- Vanilla JavaScript (`assets/js/main.js`) — no framework or build step required to run the site

## Features

- Fully responsive, mobile-first layout with a slide-down mobile nav
- Primary header nav stays short: a "Home" dropdown (Home 1 / Home 2), Services, Doctors,
  Testimonials, Contact, plus a "More" dropdown (About Us, Blog, Pricing) — every page stays one
  click away via a dropdown, the mobile menu, or the footer's Quick Links / Patient Account columns
- Log In and Sign Up are always two separate, correctly sized buttons (never merged, never
  wrapping to two lines), alongside a compact "Book Now" call-to-action
- Nothing is ever hidden-without-a-mobile-equivalent: dark-mode toggle sits directly in the
  mobile header bar, and RTL toggle, Log In, Sign Up, and Book Appointment all appear as full,
  tappable rows inside the mobile menu — no button is desktop-only
- The Login and Register pages carry their own dark-mode and RTL/LTR toggle buttons directly on
  the auth card (top-right corner, visible on every screen size) in addition to the shared header
- Social icons (Facebook/Instagram/LinkedIn/YouTube) point to real external profile URLs with
  `target="_blank"`, never to the login/register pages
- Dark / light mode toggle (persisted via `localStorage`, respects system preference)
- RTL / LTR layout toggle for Arabic/Hebrew-ready layouts (uses Tailwind's built-in `rtl:` variants)
- FAQ accordion, testimonial carousel, scroll-reveal animations, back-to-top button
- Client-side form validation on the booking, contact, login, register, newsletter and comment forms
- Blog search + category filtering (client-side, no backend required)
- Semantic HTML5, per-page SEO meta tags, Open Graph / Twitter Card tags, canonical links
- Every photo on the site is a real, freely-licensed HD photograph hotlinked from Pexels
  (`images.pexels.com`, server-side cropped to each slot's exact aspect ratio via URL
  parameters — no local image files to manage). Each of the six named doctors has one
  consistent portrait reused everywhere they appear; each blog category (Posture Tips, Pain
  Relief, Sports Recovery, Wellness, Clinic News) has one consistent photo reused across its
  card, sidebar thumbnail, and featured-post appearances. The only local image is
  `assets/img/favicon.png`, a small generated brand monogram. The contact page's map is a real
  live OpenStreetMap embed rather than a static image.
- The blog list's pagination is fully functional (3 posts per page), recalculates correctly
  when combined with the category filter or search box, and shows a friendly "no results"
  message instead of an empty page when nothing matches
- Login and Register are redesigned as standalone, footer-free full-screen experiences: a
  gradient stage with decorative blur "blobs", a perspective-tilted 3D photo card with floating
  glassmorphic stat badges, and an elevated form card with deep layered shadows

## Customizing

1. **Branding** — clinic name, tagline, phone, email, address, and hours are set once in
   `SITE_NAME`, `PHONE`, `EMAIL`, `ADDRESS`, `HOURS` inside the page templates (see "Regenerating
   pages" below) or can be find-and-replaced directly across the `.html` files.
2. **Images** — every photo is hotlinked from Pexels via the `PX(photo_id, w, h)` helper and
   the `DOCTOR_PHOTOS` / `CATEGORY_PHOTOS` / `SERVICE_PHOTOS` maps near the top of `build.py` /
   `pages_core.py`. To swap a photo, replace its numeric Pexels photo ID in the relevant dict
   (or in the direct `PX(...)` call) and rebuild — no image files to upload or manage. If you'd
   rather self-host, download the photo and swap the `<img src="...">` for a local path at the
   same aspect ratio.
3. **Map** — `contact.html` embeds a live OpenStreetMap `<iframe>`. Update the `bbox` and
   `marker` query parameters in `_page_contact`'s iframe `src` (in `pages_core.py`) to your
   clinic's real coordinates, or swap in a Google Maps embed instead.
4. **Forms** — all forms currently validate client-side only and show a success message with
   no network request. Point each `<form>`'s submit handling (see `initForms()` in
   `assets/js/main.js`) at your booking/CRM backend or a form service (e.g. Formspree, Netlify
   Forms) to actually receive submissions.
5. **Colors** — the teal/gold palette is defined in `assets/css/style.css` (`:root` variables)
   and in the Tailwind theme (`tailwind.config.js` used to compile `assets/css/tailwind.css`).
   To restyle, edit the `teal` and `gold` color scales and re-run the Tailwind build (see below).
6. **Social links** — update the Facebook/Instagram/LinkedIn/YouTube URLs (currently
   placeholder profile URLs) in the header/footer/404/coming-soon templates to your real
   social accounts before launch.

## Regenerating the compiled CSS after edits

The production stylesheet (`assets/css/tailwind.css`) is pre-compiled and scans class names
used across the `.html` files. If you add new Tailwind utility classes to the markup, rebuild it:

```bash
npm install -D tailwindcss@3
npx tailwindcss -i input.css -o assets/css/tailwind.css --minify
```

with a `tailwind.config.js` `content` array pointing at your `*.html` files and an `input.css`
containing:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Notes

- This template ships with no admin dashboard by design.
- No build step is required to preview the site — open any `.html` file directly in a browser,
  or serve the folder with any static file server.
