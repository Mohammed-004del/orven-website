# ORVEN® — Portfolio Content Brief & Asset Selection
Status: Ready for Phase 03 wireframes · Revised v2 · 17 October 2026

## Source and attribution policy
Present the portfolio as **selected work by the team behind ORVEN**, with each project credited to its named team member. Focus on client needs, solutions, shipped features and verified outcomes. Do not imply that ORVEN was the contracting entity for these projects. Use actual screenshots; never invent analytics, client growth, revenue or before/after comparisons. Both project owners have given publication permission according to the team.

On the ORVEN website, wrap these project screenshots in **ORVEN's** established brand system (Obsidian #0B0B0C, porcelain #F1EFEA, bronze #B9A189), but keep the original product designs/colors inside the screenshot. The lime color is Spiky's project brand, not ORVEN's agency accent.

## Website placements

### Homepage → Selected Work
Two short cards, each with a real image, project name, sector, one-sentence problem/solution, and `View Case Study` link. Credit above or below the cards: `Selected work by the team behind ORVEN.`

**Spiky:** `A connected digital coaching platform for training and nutrition.` / `منصة كوتشينج رقمية تجمع إدارة التدريب والتغذية وتجربة المتدرب في مكان واحد.` Image: SPK_01_dashboard_redacted.png. CTA `Explore Spiky`.

**Future Interiors:** `A public website, client tracking portal, and management dashboard in one system.` / `موقع تعريفي وبوابة متابعة للعميل ولوحة إدارة لمشاريع التشطيبات في نظام واحد.` Image: FI_01_public_website.png. CTA `Explore Future Interiors`.

### Work page
Intro EN: `Selected projects. Real business needs. Purpose-built digital solutions.`
Intro AR: `مشروعات حقيقية. احتياجات مختلفة. حلول رقمية مصممة لكل نشاط.`
Subnote EN: `Selected work by the team behind ORVEN.`
Subnote AR: `مختارات من أعمال الفريق وراء ORVEN.`
Card metadata:
- Spiky — Fitness & Nutrition · Coaching Web Application · Founder Mohamed Hamed · Approx. 2 weeks
- Future Interiors — Interior Finishing · Business Website + Client Portal + Admin Dashboard · Founder Mohamed El-Hadidy · 10 consecutive days
Avoid calling these durations company delivery guarantees.

## Case study 1 — Spiky

### Metadata
Project `Spiky` · Fitness and nutrition · Arabic-first coaching web app · Founder `Mohamed Hamed` · Completed and delivered · In use by coach · Approx. two weeks · Live URL `https://spiky-coaching.vercel.app/`.

### Hero (EN)
**Spiky — One connected coaching experience.**
An Arabic-first coaching platform bringing training plans, nutrition content, an interactive client experience, and downloadable PDF guides into one system.

### Hero (AR)
**Spiky — تجربة كوتشينج مترابطة في منصة واحدة.**
منصة عربية تجمع خطط التدريب والتغذية، وأدوات تفاعلية للمتدربين، وإعداد ملفات PDF منظمة في نظام واحد.

### Challenge
EN: Managing individualized workout/nutrition plans across scattered documents, content, updates, and client communication can make day-to-day coaching harder. The brief was to bring these workflows together for coach and trainee.
AR: إدارة خطط التدريب والتغذية المخصصة عبر ملفات وأدوات متفرقة بتصعّب تنظيم المحتوى وتحديثه ومشاركته. احتاج المدرب تجربة واحدة تربط إدارة الخطط باستخدام المتدرب اليومي.

### Solution
EN: Coach dashboard and reusable content library, personalized workouts/nutrition plans, dedicated client access, training-video references, water tracking, and downloadable training/nutrition PDFs with QR links.
AR: لوحة تحكم للمدرب ومكتبات محتوى قابلة لإعادة الاستخدام والتخصيص، وخطط تدريب وغذاء، ووصول مخصص للمتدربين، ومتابعة المياه، وملفات PDF للتدريب والتغذية تتضمن رموز QR للفيديوهات.

### Scope/features
Coach dashboard; reusable food and exercise libraries; personalization without editing common source items; workout plans, meals and alternatives; weekly routines and supersets; rest timer; notes; daily hydration logs and weekly chart; dedicated client links; PDF guide generation; row-level access controls (RLS) and signed access where needed. Tech: HTML, CSS, Vanilla JS, Supabase, Vercel Serverless Functions, Puppeteer, IBM Plex Sans Arabic, Cairo.

### Content quantities (NOT business-impact outcomes)
151 food items; 101 exercises; 10 muscle groups; 47 recipes, 10 supplements. These describe content supplied in the product, not customer growth or conversion.

### Operational evidence & honest attribution
Coach is using the platform with client records and subscription statuses visible in its dashboard. This supports existence of operational records but does not by itself establish growth or verified engagement. Do not claim sales uplift. Mohamed Hamed coordinated the client requirements, worked from the coach’s supplied visual reference and reviewed the product functionality. Describe the finished solution and those responsibilities without unsupported authorship claims.

### Image sequence
Hero `SPK_01_dashboard_redacted.png`; dashboard/content `SPK_02_coach_content.png`; mobile gallery `SPK_03_client_overview.png`, `SPK_04_nutrition.png`, `SPK_05_training.png`, `SPK_06_exercise_video.png`; optional extended screenshot `SPK_07_client_features.png`.

### Review
Use testimonial only after cropping to relevant text and avoiding unrelated personal chat. The provided WhatsApp review is available in original Spiky HTML as source_8 and as `Spiky review 1.png`. Prefer a typeset quote with exact approved words and `Client feedback · Spiky coach`, not publish whole private conversation unnecessarily.

### Founder credit
EN: `Project lead: Mohamed Hamed · ORVEN co-founder.`
AR: `مسؤول المشروع: محمد حامد · أحد مؤسسي ORVEN.`

## Case study 2 — Future Interiors

### Metadata
Future Interiors · Interior finishing and engineering supervision · Public website + project-tracking client portal + admin dashboard · Founder Mohamed El-Hadidy · Completed/delivered and in use · 10 consecutive development days · Live URL indicated in supplied PDF `https://future-interiors.vercel.app/`.

### Hero (EN)
**Future Interiors — Clarity across every finishing project.**
A bilingual public website, private client portal and administrative dashboard designed around transparent spending, project progress and day-to-day management for an engineering-supervision business.

### Hero (AR)
**Future Interiors — متابعة أوضح لكل مشروع تشطيب.**
موقع عربي وإنجليزي وبوابة خاصة للعملاء ولوحة تحكم للمهندس، لتنظيم المصروفات والدفعات ومراحل التنفيذ والتواصل حول سير العمل.

### Challenge
EN: Engineering-supervision clients need clarity around actual costs and project progress. Previously, expense records could be kept in spreadsheets and clients needed to ask the engineer for updates. The engineer also needed a practical way to manage project details and public content without a developer beside him.
AR: في نموذج الإشراف الهندسي، العميل محتاج يتابع المصاريف والدفعات والمراحل بشفافية. الاعتماد على شيتات وتحديثات يطلبها العميل كل مرة يصعّب المتابعة، والمهندس كان محتاج يدير المشروعات ومحتوى الموقع بنفسه.

### Solution
EN: One connected product with a public website explaining engineering supervision and showcasing work, client portal accessed with project code and phone number, itemized spending/payment views with printable statements, stage progress and photos, plus private administration for clients, projects and site content.
AR: نظام بثلاث واجهات: موقع تعريفي يوضح خدمة الإشراف ويعرض الأعمال، وبوابة متابعة لكل عميل بكود مشروع ورقم هاتف، وكشف حساب قابل للطباعة مع مراحل التنفيذ وصورها، ولوحة تحكم لإدارة المشروعات والعملاء ومحتوى الموقع.

### Features
Bilingual public site; portfolio and inquiry CTA; secure project-code/phone portal; server-side supervision-fee calculation; cost/payment/difference summaries; searchable dated line items; stage/progress tracking and photo collections; browser-based print/PDF statements; spreadsheet-like editable expense/payment grids; project archiving and separation of public gallery from client records; admin-managed bilingual content.

### Tech & reported testing
Next.js 16, TypeScript, Tailwind, Supabase, Vercel. Supplied case study reports 3 surfaces, 18 pages (9 public/portal bilingual and 9 dashboard), 12 mandatory security rules in specification and 101 automated passing tests. These are document claims, not independent audit. Don't advertise security as guaranteed.

### Real operational issue, phrased conservatively
The project was used after delivery; a database availability issue occurred and was fixed. The study documents a particular Supabase pause/read-error case and changes that retained last working public pages during outages, plus isolation of tests from production. Avoid claiming a guaranteed 100% uptime or quantifying prevented losses.

### Screenshots
Hero `FI_01_public_website.png`; client portal `FI_02_client_portal_demo.png`; admin `FI_03_admin_overview_demo.png`; expenses `FI_04_expenses_grid_demo.png`; project progress `FI_05_progress_demo.png`; content management `FI_06_portfolio_management_demo.png`. **These are screenshots of a demo project on separate test database with fictional names/numbers per source PDF; label `Demo data` on pages showing balances or clients.**

### Review from uploaded screenshot (faithful edited paraphrase for web, not direct quotation)
AR: `التعامل كان مريحًا، والتواصل واضحًا، والموقع ساعدني أعرض شغلي وخدماتي بشكل احترافي، مع لوحة لإدارة العملاء والمشروعات ومتابعة تفاصيلها.`
EN: `The client praised clear communication and an organized experience, along with a professional website and practical dashboard for managing projects and clients.`
Before using quotation marks, transcribe the precise approved words from the screenshot; do not pass this paraphrase off as a verbatim testimonial. Original image saved as `FI_07_review_original_for_manual_approval.png` and should not be shipped directly as a public asset without privacy check.

### Founder credit
EN: `Project lead: Mohamed El-Hadidy · ORVEN co-founder.`
AR: `مسؤول المشروع: محمد الحديدي · أحد مؤسسي ORVEN.`

## Image publication checklist
- Spiky source screenshots were pulled from the provided HTML. Redacted dashboard image overlays the visible trainee names and dates with solid opaque fills. Inspect other screenshots again at 100% before shipping for potentially sensitive personal content.
- Future Interiors screen images are from the provided 53-page PDF, not original high-resolution source PNGs. They are suitable as selection/layout placeholders; ask Hadidi for full-resolution exports for final crisp live website assets.
- Do not show actual trainee/customer names, phone numbers, addresses, subscription details, access credentials or individualized data. Client approval of showcasing a project does not replace third-party privacy considerations.
- The Future Interiors review screenshot is kept for editorial processing, not included by default as a public-facing asset.
- If final assets get re-cropped, review redaction anew.

## Wireframe content map
Homepage selected-work section: two cards (Spiky and Future Interiors) + proof line + link to `/[locale]/work`.
Work index: title, introduction, subtle team-work credit (`Selected work by the team behind ORVEN`), two cards, final CTA to Contact.
Spiky case study: Hero → Product overview → Coach workflow challenge → Solution architecture → Coach dashboard → Mobile app gallery → Key features → Technology and scope → Client testimonial → Founder credit → Related work → Start a Project CTA.
Future Interiors case study: Hero → Business problem → Three connected interfaces → Portal expenses and progress → Engineer's admin workflow → Implementation details → Issues resolved in production → Review → Founder credit → Related work → Start a Project CTA.
All pages bilingual `/en` and `/ar`, mobile first, no confidential data, CTA goes to Contact where all four methods are available and form is optional.

## Still necessary for production
1. Confirm final testimonial display style and permission to publish exact review words, not necessarily chat screenshots. User already said permission generally granted.
2. Replace Future Interiors PDF crops with 1440px original screenshots before final launch if feasible.
3. Confirm if dates/counts in Spiky dashboard may be shown at all; redact aggregate stats as well if the coach prefers.
No further project-scope discovery is needed to begin Phase 03 low-fidelity wireframes.
