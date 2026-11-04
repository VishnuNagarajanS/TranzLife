# TranzLife Website – Page-by-Page Vision

Nov 2, 2026 · @i am vishnu

## Summary

Keep the Drop Store's skeleton (pinned headline, floating product tiles, product detail pages, story page, dark footer) and replace its water-crisis story with TranzLife's story: **"From the roots of Nature to the infinity of Science."** The five launch products take the place of the 20 water-themed products, the three water "challenges" become three wellness focus areas, and the cart becomes an enquiry flow.

**Assumption to confirm:** the brochure has full product sheets for PulmoClear (lung gummies), LiverDetox (liver syrup), the Craving Control inhaler series (4 variants, treated as one product), BreatheFree (inhaler) and CycleRelief (roll-on). I used these as the five. The brochure also shows Reviva, Respira+ and RespiraJel+, so if one of those is in your five, it is only a data swap; every page below is driven by one JSON file.

## Brand foundation (from the brochure)

The whole site should read as one idea: roots (nature) joined to an infinity loop (science). The logo already shows it: a tree whose roots run into a green-and-gold DNA infinity symbol.

| Element | Use on the site |
| --- | --- |
| Company | Tranz Life Biosciences Pvt. Ltd., Chennai |
| Tagline | Innovating Life Beyond Limits |
| Motto | From the roots of Nature to the infinity of Science, TranzLife is shaping the future of Life. |
| Vision | To be a globally trusted leader in life sciences, transforming natural resources and innovative science into safe, effective and sustainable solutions that enhance health and enrich lives. |
| Mission | 1. Science-backed, natural, sustainable products that promote wellness and prevent disease. 2. Quality, safety and regulatory compliance at every step. 3. Collaborate, research and adopt advanced technologies for global health challenges. 4. Create stakeholder value with ethical practice and environmental responsibility. |
| Values | Innovation, Integrity, Quality, Sustainability, Well-being (the cover page also lists Impact and Compassion) |
| What we do | Innovate, Develop, Deliver, Impact |
| Core strengths | Science-backed innovation, natural and sustainable, quality and safety assured, expert team and collaborations, global vision with local impact |
| Contact | 6, Flat 2D, 2nd Floor, Queenscourt, Montieth Road, Egmore, Chennai 600 008 · info@tranzlife.in · www.tranzlife.in |

**Look and feel.** Cream background (a pale green-cream, not white), deep forest green for text and dark sections, gold for accents and rules. Each product also carries its own accent: green (lung), green and gold (liver), purple (CycleRelief), and the four inhaler colours. Sample exact hex values from the logo file when you build; I read them by eye.

**Tone.** Calm, confident, scientific-but-warm. Short headlines in the Drop Store's big grotesk style, with a serif used only for the TranzLife wordmark.

## What your cloned site has today

It is a Next.js app (GSAP scroll animation, a WebGL water blob, Tailwind). Five routes, one data file, and every piece of copy lives in `src/data/dropstore.json`.

| Route | What it shows now | Main components |
| --- | --- | --- |
| `/` (Home) | Pinned headline "Your market for a world in water crisis", a see-through water blob that chases the cursor, 20 product tiles scattered with mouse parallax, an "Act Now" button | `app/page.tsx`, `ProductTile` |
| `/collection/[slug]` (20 pages) | Commerce hero with a 61-frame spinning product, intro text, details, promo line, customer comments, "Why is this water so expensive?" with a big number, a challenge section, "You may also like" marquee | `ProductPage`, `ProductSections`, `ChallengeSection`, `Marquee` |
| `/challenges/[type]` (3 pages) | Too little / too much / too dirty water: title, visual, description, who is affected, what can be done, links to the other two | `ChallengePage` |
| `/about` (Our Story) | Hero, parallax photo gallery with text, "5 Billion People" dotted world map, "Water affects everything" product list, partners and initiatives, "Act now" call to action, socials | `AboutPage` and 5 section files |
| `/disclaimer` | Short legal text | `DisclaimerPage` |

**Shared parts:** top navigation (two links: Drop Collection, Our Story, plus Cart), a Cart side panel that says "Soon in stock", a full-screen dark footer ("Water affects everything and everyone." with link columns and socials), a mobile menu, a loader, and page-to-page transitions where the clicked product tile grows into the product page.

The good news: most of the layout code is generic. The water theme sits mainly in the JSON, the images, and a few section files (`WorldMapSection`, `WaterAffectsEverythingSection`, `ChallengeSection`, the blob colour).

## Target site map

Seven pages instead of five. Same engine, new story.

| Today | TranzLife page | What changes |
| --- | --- | --- |
| `/` Home | `/` Home | New headline, 5 tiles instead of 20, green-gold orb instead of water blob |
| `/collection/[slug]` x20 | `/products/[slug]` x5 | Same template; new sections for ingredients, usage and how it works |
| `/challenges/[type]` x3 | `/focus/[type]` x3 | Three focus areas: Breathe, Cleanse, Balance |
| `/about` Our Story | `/about` Our Story | Vision, mission, values, what we do, strengths, credentials |
| none | `/science` | New: R&D pipeline and genetics vision (can launch as a section first) |
| none | `/contact` | New: enquiry form, address, distributor enquiry |
| `/disclaimer` | `/disclaimer` | Rewritten for nutraceutical and Ayurvedic products |

**Navigation:** Products, Our Story, Science, Contact, and an Enquire button where Cart sits today.

## Home page, section by section

Goal: in ten seconds a visitor knows who TranzLife is and sees all five products.

1. **Hero (pinned headline).** Big headline: *Innovating life beyond limits.* Small line under it: *From the roots of Nature to the infinity of Science.* Replace the "Act Now" button with **Meet the five** (scrolls to the tiles). Replace the water blob with a glassy green-gold "essence drop" that chases the cursor; keep the same WebGL code and change the colour and opacity in `blob.ts` and `blob-shaders.ts`. Option for later: put the infinity logo faintly inside it.
2. **Product tiles.** Five tiles, not twenty, so give each one more room: two columns on desktop, larger scale steps, the same mouse parallax. Each tile shows the product pack on a soft tint of its own accent colour, plus name and one line (for example *PulmoClear · Lung detox gummies*). Remove the price from the tile (the brochure gives an MRP only for Reviva).
3. **Nature meets Science band (new).** One screen, cream background, a big statement: *Rooted in nature. Driven by science.* Four small icons from the brochure's "What we do": Innovate, Develop, Deliver, Impact, one line each.
4. **Trust strip (new).** Row of badges the brochure already uses: GMP certified, ISO 9001:2015, Made in India, 100% natural, no added colours. Only show a badge once the certificate exists (see the launch checklist).
5. **Footer.** Full-screen dark-green footer (details in the Global section).

Side labels: change the rotated "Get The Drop" text on the left to "TranzLife Biosciences" and the two icons on the right to the infinity mark and a leaf. The right-hand "W." badge in your recordings is the original site's award ribbon; remove it.

## Product pages

Keep one template for all five; only the data changes. Each existing section gets a new job:

| Section today | Becomes | Content |
| --- | --- | --- |
| Commerce (spinning product, price, Add to cart) | **Product hero** | Pack shot (360 spin if you have renders), name, pack size, accent colour, **Enquire** button |
| Hero (intro title, slang line) | **The promise** | Three-word headline, one-paragraph description |
| Detail (price breakdown) | **What's inside** | Composition table (per gummy / per 10 ml), key benefit icons |
| Promotion (big quote line) | **How to use** | 3 to 4 steps with icons; caution and storage in small print |
| Reviews (comments) | **Real people** | Show only real, verified reviews. Until you have them, show "Why it works" instead |
| Water ("14L" big number) | **Powered by nature** | One big number (for example "9 actives") plus the hero ingredients |
| Challenge | **Focus area** | Link to Breathe, Cleanse or Balance |
| "You may also like" marquee | **Also from TranzLife** | The other four products |

### The five products, from the brochure

| Product | Pack | Headline | Big number | Page-specific idea |
| --- | --- | --- | --- | --- |
| PulmoClear (Lung Booster gummies) | 60 gummies, natural berry flavour | Detoxifies. Cleanses. Strengthens. | 9 actives: Vasaka, Tulsi, Mulethi, Turmeric, Giloy, Black Pepper, Vitamin C, Vitamin D3, Zinc | Lungs illustration that fills as you scroll; usage: 2 gummies twice daily after meals |
| LiverDetox (Liver Booster) | 500 ml polyherbal syrup | Detoxifies. Protects. Rejuvenates. | 11 herbs, including Bhumyamalaki, Kalmegh, Kutki, Guduchi, Amla | Herb-by-herb ingredient list with mg per 10 ml; usage: 10 ml twice daily after meals |
| Craving Control series (4 inhalers) | Aromatherapy inhaler | Choose your support. Choose your strength. | 4 variants | **Variant switcher**: Craving Control (green), Plus (gold), Gold (black), Night (purple). Page recolours per variant, with who each is for and its aroma blend. Add the 4-week quit programme as a scroll timeline |
| BreatheFree | Aromatherapy inhaler, pocket size | Breathe free. Live limitless. | 6 essential oils: peppermint, eucalyptus, lavender, lemon, black pepper, tulsi | Circular ingredient diagram from the brochure; 3 steps: inhale, aromas activate the brain, breathe easy |
| CycleRelief | 8 ml roll-on | Nature's care. Every cycle. | 2 essential oils: dill and eucalyptus | Purple page; how to use: roll around the navel in the morning; plant-based, not tested on animals |

Build the Craving Control variant switcher as a small client component on one product page. This avoids four near-identical pages.

## Focus area pages (replace Challenges)

The three "water challenge" pages already have the right shape: a big title, a visual, a short description, a "who" block, a "what" block, and links to the others. Reuse it for three wellness areas.

| Focus area | Products | "Who is it for" block | "How it helps" block |
| --- | --- | --- | --- |
| **Breathe** (lung health and quitting tobacco) | PulmoClear, Craving Control series, BreatheFree | Heavy smokers ready to quit; people exposed to pollution | Gummies for lung detox, inhalers for cravings, the 4-week programme |
| **Cleanse** (liver health) | LiverDetox | People looking for daily detox and digestion support | Polyherbal formula, Ayurvedic ingredients |
| **Balance** (women's wellness) | CycleRelief | Women with menstrual discomfort | Roll-on plant-based relief; room to add Femina range later |

Each page ends with "Explore other focus areas" (already built) and the product tiles for that area. As the pipeline products arrive (Rasayana Elite, Femina, Viryamax, Kidzen), they slot into these pages or into new areas without any code change.

If Cleanse and Balance feel too thin with one product each at launch, hide those two routes and show the three areas only as labels on the home page and product pages.

## Our Story page

The current page has six sections. Each maps cleanly to brochure content.

| Section today | Becomes | Content |
| --- | --- | --- |
| Hero | **Who we are** | "Tranz Life Biosciences is an innovation-led life sciences company..." (brochure About text) with the infinity-tree logo |
| Parallax gallery with text | **Roots of nature** | Parallax images of leaves, herbs, lab; text on research-driven formulations. Use the brochure's event photos (NRDC, conferences) here or in a credentials block |
| "5 Billion People" world map | **Vision and mission** | Replace the dotted map with one huge statement: the vision sentence. Mission as four points that appear one by one on scroll |
| "Water affects everything" list | **What we do** | Innovate, Develop, Deliver, Impact, each with its icon and the brochure's line |
| Partners and initiatives | **Credentials and recognition** | FSSAI, Make in India, Startup India (DPIIT), MSME, GeM, plus GMP and ISO 9001:2015 once certified. Same logo grid, same hover behaviour |
| "Act now" call to action | **Join the journey** | Distributor, retailer and research collaboration enquiry, linking to Contact |

Add two bands from the brochure: **Our values** (five icons on a dark-green strip, as in the brochure) between mission and what-we-do, and **Core strengths** just above the credentials grid.

Close with the motto in large type, then the dark footer.

## New pages: Contact and Science

### Contact / Enquire (`/contact`)

The clone has no contact page, and a brand site without one loses leads. Build it with the same big-type style:

1. Headline: *Let's build a healthier tomorrow.*
2. Enquiry form with three reasons: product enquiry, distributor or retailer, research collaboration. Send to info@tranzlife.in.
3. Address, email and phone from the brochure, plus a map link to the Egmore office.
4. The Cart side panel is reused as a quick **Enquire** drawer from any product page.

### Science (`/science`) — can start as a section on Our Story

The last brochure page describes a bigger vision: genetic innovation, biomarker discovery, AI-powered solutions, prenatal and genetic screening, preventive healthcare. It tells visitors and investors where the company is heading.

1. Hero: *Advancing genetic insights. Discovering biomarkers. Transforming futures.* with a slow-turning DNA helix.
2. Five pillars, one per brochure icon.
3. **Coming next**: the pipeline ranges as teaser cards with "Coming soon" (adults: Rasayana Elite, Total360, Golden Years; women: Femina; men: Viryamax; children: Kidzen). Reuse the cart's "Soon in stock" wording.
4. Leave out the autism and cancer R&D items for now (see the launch checklist).

## Global: navigation, footer, cart, look

| Part | Change | File |
| --- | --- | --- |
| Logo in nav | Replace the text "TheDropStore" with the TranzLife logo (infinity-tree mark plus wordmark) | `PageLayout.tsx` |
| Nav links | Products, Our Story, Science, Contact | `navigation.links` in the JSON |
| Cart button and panel | Rename to **Enquire**. Panel text: how to reach you, WhatsApp or email link, "Online store coming soon" if there is no checkout yet. Decide later whether to add real e-commerce | `PageLayout.tsx`, `cart` in the JSON |
| Footer | Dark forest green. Title: *Roots of nature. Infinity of science.* Columns: Products, Company, Contact. Replace "Download social kit" with **Download brochure** (the PDF). Bottom line: © TranzLife Biosciences Pvt. Ltd. and Disclaimer | `PageLayout.tsx`, `footer` and `socials` |
| Mobile menu | Same links as the nav | `PageLayout.tsx` |
| Loader | Show the infinity logo drawing itself, then the tree growing, then the page | `AppShell.tsx` |
| Page transitions | Keep: tile grows into the product page. Works as is | `ScreenTransition.tsx` |
| Site of the Day badge | Remove | layout files |
| Page titles and meta | Title: TranzLife Biosciences – Innovating Life Beyond Limits. New open-graph image; tranzlife.in as metadataBase | app/layout.tsx and each page.tsx |

**Colours:** define them once in `globals.css` (cream background, forest green, gold) and give each product an `accent` colour field in the JSON. **Type:** keep the large grotesk headlines; add one serif font for the wordmark only. **Motion:** keep the GSAP scrolling and parallax; slow the blob down so it feels organic rather than liquid-metal.

## Data mapping and assets needed

Most of the work is rewriting `src/data/dropstore.json` (and the matching types in `src/lib/dropstore-data.ts`). The product fields map like this:

| Drop Store field | TranzLife meaning |
| --- | --- |
| `title`, `slug` | Product name, URL (`pulmoclear`, `liverdetox`, `craving-control`, `breathefree`, `cyclerelief`) |
| `introTitle`, `retailSlang` | Three-word promise, short descriptor |
| `description` | Brochure product paragraph |
| `promotionText` | The big statement line |
| `comments` | Verified reviews, or empty until you have them |
| `waterTitle`, `waterAmount`, `waterDescription` | "Powered by nature" title, big number, hero ingredient text |
| `challengeType` | Focus area: `breathe`, `cleanse`, `balance` |
| `amount`, `price` | Pack size; price or MRP only if you want it shown |
| `detailsTitle`, `details` | Composition table |
| `imageSequence` | Product images; fall back to one still if no 360 renders |
| new: `accent`, `benefits[]`, `howToUse[]`, `caution`, `variants[]` | Colour, icon benefits, usage steps, safety line, Craving Control variants |

**Assets to prepare before building:**

- Logo as SVG (full lockup and infinity mark alone).
- Transparent PNG or WebP of each pack. The brochure only has flat label art and mock-ups, so you need real packaging renders or photos; a 360 spin is optional.
- Icons from the brochure (lungs, liver, leaf, DNA, shield, GMP, ISO), redrawn as SVG.
- Ingredient images (vasaka, tulsi, turmeric, guduchi, peppermint, lavender and others).
- Event and lab photos for Our Story and the credentials block.
- The brochure PDF as a downloadable file.

## Fix before launch

I am not a lawyer or a regulatory adviser; please have your regulatory person check the claims. These are things I noticed in the brochure that affect the website.

**Health claims.** The site will be public advertising. Statements such as "supports healthy blood sugar levels" and "Natural Support for Diabetes" (Reviva), smoking cessation, "clinically researched ingredients" and "detoxifies" can fall under Indian rules on health claims for nutraceuticals and Ayurvedic products (FSSAI, AYUSH, Drugs and Magic Remedies Act). Check the wording and keep evidence on file. PulmoClear's pack says "Nutraceutical. Not for medicinal use" while LiverDetox says "Ayurvedic Proprietary Medicine"; the site should say the right one for each.

**Pipeline items.** Autism and cancer appear as R&D topics. Publishing them on a consumer site could imply a treatment claim. I suggest leaving them out until you decide how to present them.

**Inconsistencies in the brochure:**

| Item | Issue |
| --- | --- |
| Phone number | Three different numbers: +91 44 1234 5678, +91 98765 43210, +91 917 611 2188 |
| PulmoClear | Two different ingredient lists (Lung Booster gummies vs the "Carving Control" heavy-smokers page); "Carving" is also a typo for "Craving" |
| Craving Control colours | Brochure shows green, gold, black, purple; the portfolio page shows green, blue, gold, navy |
| Reviva vs CycleRelief | Same ingredient list (dill and eucalyptus oil) and the same belly-button usage text; looks copied |
| Packaging data | Licence number, barcodes and batch details look like placeholders |
| Testimonial | "Real people. Real transformation" has a sample quote; use only real, consented reviews |
| Certificates | GMP and ISO 9001:2015 badges appear on packs; show them on the site only when you hold the certificates |

Also check that you have rights to the event photos and to any government logos (FSSAI, Startup India, MSME, GeM, NRDC) before putting them on the site.

## Suggested build order

1. **Content first.** Finalise the five products and their copy in the JSON, resolve the brochure inconsistencies above, collect packs and logo.
2. **Theme.** Colours, fonts, logo, nav, footer, loader, metadata. Remove Drop Store text and the Site of the Day badge everywhere.
3. **Home.** New hero text, the green-gold orb, five tiles, the two new bands.
4. **Product template.** Rework the sections as in the table above; test with PulmoClear, then add the other four. Rename the route folder `collection` to `products` and update links.
5. **Craving Control variant switcher.**
6. **Our Story and focus areas.** Swap the map and water sections for vision, values and credentials; rename `challenges` to `focus`.
7. **Contact, Science, Disclaimer.**
8. **Polish.** Mobile layout, performance of images, accessibility, open-graph image, `npm run check`.

When you start step 1 or 3, send me the file you are changing (for example `dropstore.json` or `app/page.tsx`) and I will give you only the edited file with an explanation of each change.
