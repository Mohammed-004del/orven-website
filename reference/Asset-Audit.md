# ORVEN portfolio asset audit

Reviewed 18 October 2026. This is an editorial source audit, not a claim that case-study performance or security was independently verified. No existing UI source was changed. All exported assets preserve source pixels; embedded PDF JPEGs were extracted without re-rendering or compression.

## Prepared assets

17 reviewed assets are in `outputs/ORVEN-Website/assets/`. Detailed source paths and SHA-256 values are in `work/asset-audit/source-manifest.json`.

### Spiky: approved public marketing screenshots

All 14 newly supplied `Screenshot 2026-10-12*.png` files were visually reviewed in contact sheets; the requested cover and five gallery screenshots were also inspected individually at full resolution. They are Arabic public marketing pages, not private user records. Preserve their authentic Arabic pixels on both ORVEN locales, with surrounding caption `Arabic-only product` / `منتج باللغة العربية فقط` if useful. Do not convert the screenshot text to formal Arabic; the user’s formal-Arabic requirement applies to ORVEN copy.

| Original timestamp | Content | Disposition / exported file |
| --- | --- | --- |
| 173400 | Desktop homepage hero | Work/Home cover: `spiky-public-cover-ar.png` (1905 × 949) |
| 173501 | Desktop coach introduction | Required gallery: `spiky-public-coach-ar.png` (1903 × 949). Browser zoom panel intrudes at top, so frame a lower crop for polish. |
| 173547 | Desktop public packages | Safe but redundant; not exported. |
| 173626 | Desktop CTA and footer | Required gallery: `spiky-public-contact-ar.png` (1905 × 948) |
| 173811 | Mobile headline and partial hero | Safe but redundant; not exported. |
| 174020 | Mobile coach hero | Required gallery: `spiky-public-mobile-hero-ar.png` (371 × 844) |
| 174227 | Mobile coach introduction | Safe but redundant; not exported. |
| 174303 | Mobile basic package | Safe but redundant; not exported. |
| 174314 | Mobile advanced package | Required gallery: `spiky-public-mobile-package-ar.png` (376 × 841) |
| 174331 | Mobile premium package | Safe but redundant; not exported. |
| 174349 | Mobile CTA and footer | Safe but redundant; not exported. |
| 174754 | Desktop collapsed FAQ | Safe but redundant; not exported. |
| 174810 | Desktop expanded FAQ | Required gallery: `spiky-public-faq-ar.png` (1900 × 942) |
| 175414 | Mobile navigation | Safe but redundant; not exported. |

These screenshots contain the coach’s own public identity, service prices, product claims, and colloquial Arabic. They must remain recognizable as original project screenshots; do not restate their numbers or fitness claims as ORVEN results or guarantees.

### Spiky: Dashboard and Client App are separate interfaces

- `spiky-dashboard-redacted-ar.png` is a direct copy of supplied `SPK_01_dashboard_redacted.png`. Names and dates in the subscription list have already been obscured in the source. It still shows anonymous operational totals (clients, renewals, books) and statuses. These are screenshot evidence of the interface, not ORVEN impact claims. Use a neutral caption and never enlarge the counts as proof. If the requirement is to remove all operational figures too, obtain a truly sanitized export before launch; CSS masking cannot remove information from a downloadable file.
- `spiky-client-recipes-ar.png` is the generic recipe-library screen from `SPK_05_training.png`. Its old filename is misleading: the screen shows recipes, not a training schedule. It shows the coach’s public name and generic recipe nutrition, but no trainee identity, contact details, health measurements or personal logs.
- `spiky-client-exercise-ar.png` is copied from `SPK_06_exercise_video.png`. It shows the exercise-video interface without a user name, phone, measurement or diary entry. It contains the referenced public YouTube video and set/repetition UI. Use as a separate original Client App preview.

Do not publish `Dasboard.png` or `Dashboard responsive.png`: both expose trainee names and subscription information. Do not publish `SPK_02_coach_content.png` / `Complete system.png`: the client’s full name and individualized content are visible. Do not publish `SPK_03_client_overview.png` / `Client experience.png`: they reveal a client first name, calories and hydration dates/logs. Avoid the nutrition-plan and coach-notes screens, since they show individualized dietary details or notes and have no explicit demo provenance. Never copy private review chats to public assets. CSS crop alone is insufficient for private originals because the image file remains accessible.

### Future Interiors: authentic locale-matched public screenshots

The supplied PDF includes original embedded **1440px-wide JPEG screenshots**. Extracting those preserves more detail than using the older full-PDF-page PNG assets and removes the surrounding document layout without altering screenshot pixels.

| Arabic output | English output | PDF pages | Content |
| --- | --- | --- | --- |
| `future-public-ar-01.jpg` | `future-public-en-01.jpg` | 7 / 11 | Homepage hero and supervision introduction; 1440 × 1899 |
| `future-public-ar-02.jpg` | `future-public-en-02.jpg` | 8 / 12 | Work, client journey and process |
| `future-public-ar-03.jpg` | `future-public-en-03.jpg` | 9 / 13 | Engineer introduction and FAQ |
| `future-public-ar-04.jpg` | `future-public-en-04.jpg` | 10 / 14 | Contact CTA and footer |

Select the matching locale in the rendering data. Work cover should frame the upper hero of the `01` asset. These are screenshot sources, not a source of ORVEN’s contact information; the Future Interiors source includes its own demo contact line.

The PDF states on pages 1–2 that all portal/admin screenshots use a separate test database with fictional names, phone numbers, balances and supervision ratios, and the real client identity is hidden. Page 35 is a usable Arabic demo expense-grid image (`X126.jpg`, 1440 × 1230), but there is no matching English admin-finance screenshot. It contains a demo project code and fictional financial detail. Page 23 has an Arabic demo client portal; page 29 has its real English counterpart. These are portal screenshots, not admin screenshots.

Recommendation: keep finance as a short functional paragraph and omit financial screenshots entirely. This meets the user’s maximum of one and avoids an Arabic admin image on the English case study. If one financial demo is later selected, label it explicitly `Demo data` / `بيانات تجريبية`, use only one rendered financial image per case study, and do not reproduce its figures in prose. No financial or private-admin assets were copied into the public output directory by this audit.

## CSS framing guidance (presentation only)

- Spiky cover: natural aspect ratio 1905 / 949, `object-fit: contain`; the entire hero reads well on Work cards. Avoid cropping the portrait or headline unnecessarily.
- Spiky coach screenshot: hide the browser zoom popup by using an overflow-hidden presentation frame with a crop starting below approximately y = 150 of the 949px original. Keep the original file unchanged. This crop is cosmetic, not a privacy redaction.
- Spiky mobile screenshots: natural 371 / 844 and 376 / 841 ratios, `object-fit: contain`, narrow portrait frames. Do not stretch them into desktop shapes.
- Future Interiors cover: 1440 × 900 frame, image width 100%, height auto, `object-position: top` / clipped overflow. A full-image gallery can show the entire 1440 × 1899 screenshot below.
- Keep all screenshot pixels in their project colors (Spiky lime / Future Interiors neutral). ORVEN’s surrounding chrome uses bronze #B9A189; never recolor project screenshots.

## Preserved boundaries

No testimonials, growth metrics, delivery guarantees or AI tool claims were created. No case-study client work was re-attributed to ORVEN as contracting entity. No About-page tagline was selected. Existing approved English copy was not edited by this task.
