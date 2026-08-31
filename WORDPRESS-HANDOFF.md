# Keystone Intelligence Group — WordPress Handoff Notes
## For the WordPress Designer/Developer

*Last updated: May 2026*

---

## Site Structure

```
index.html              → Homepage (landing page)
about.html              → About — The Partners
how-it-works.html       → Four-step process (Discovery Call → Report → Build → Expand) + pricing
industries.html         → Case Studies (anchor links: #waste-hub, #ar-guardian, #wip-invoice, #email-triage, #balance-sheet)
blog.html               → Insights listing page
contact.html            → Book Your Discovery Call (form page)
blog/
  ai-for-irish-businesses.html
  is-your-business-ready-for-ai.html
  ai-for-irish-construction.html
  ai-for-irish-solicitors.html
  ai-for-irish-gp-practices.html
keystone.css            → Shared design system
```

**Note on naming:** the file is named `industries.html` but the page is a case studies page and the nav link / page title read "Case Studies." Either keep the filename and add a 301 redirect at `/case-studies/ → /industries/`, or rename the file and update internal links sitewide. The latter is cleaner long-term.

---

## WordPress Template Mapping

| HTML File | WordPress Template |
|---|---|
| index.html | Front Page (homepage) |
| about.html | Page — About |
| how-it-works.html | Page — How It Works |
| industries.html | Page — Case Studies |
| blog.html | Blog / Archive template |
| contact.html | Page — Contact |
| blog/*.html | Single Post template |

---

## Design Tokens (from keystone.css)

**Backgrounds:**
- Primary bg: `#0C0C12`
- Secondary bg: `#111118`
- Card bg: `rgba(255,255,255,0.03)`

**Brand colours:**
- Gold (primary accent): `#C49A3C`
- Gold hover: `#D4AF5A`
- Gold dim (backgrounds): `rgba(196,154,60,0.12)`
- Border: `rgba(196,154,60,0.13)`

**Text:**
- White: `#FFFFFF`
- Body text: `#C0BBB3`
- Secondary text: `#706B62`

**Typography:**
- Headlines: `Cormorant Garamond` (Google Fonts) — weights 400, 500, 600, 700
- Body: `Inter` (Google Fonts) — weights 300, 400, 500, 600, 700
- Monospace (stats/numbers): `JetBrains Mono` (Google Fonts) — weights 400, 700

---

## Key Design Principles

1. **Dark first** — all backgrounds are near-black. Do not introduce white or light backgrounds.
2. **Gold is the only accent colour** — use it for labels, highlights, CTAs, borders, stats.
3. **One CTA** — "Book a Free Discovery Call" linking to the contact page. No secondary CTAs on conversion pages.
4. **Mobile first** — test on a 375px viewport. Navigation collapses to hamburger on mobile.
5. **The nav CTA** — the "Book a Free Discovery Call" button in the nav is gold background, dark text.

---

## Navigation

Nav links in order:
1. About
2. How It Works
3. Case Studies
4. Insights (Blog)
5. **Book a Free Discovery Call** [CTA button — gold bg]

Nav is fixed, with backdrop blur. Background: `rgba(12,12,18,0.88)` at 18px blur.

---

## Commercial Model (referenced on Homepage + How It Works + About)

The site is built around a four-step commercial structure. Any new content added needs to align with these steps and these prices:

| Step | Price | Outcome |
|---|---|---|
| **01 · Discovery Call** | Free, 20 minutes | Honest read on whether AI is the right move |
| **02 · Discovery Report** | €999, within 48 hours | Written report — keep, build elsewhere, or proceed to Step 03. €999 credited against the build if you do |
| **03 · Build the Hub** | €8,000–€20,000, fixed | Core intelligence hub, typically 4 weeks |
| **04 · Expand the Hub** | Per app, from €1,000 | New agents on top of the hub; compounding economies of scale |

Recurring claim across the site: **average client sees 3× annual saving on implementation cost.** Keep this consistent — it appears in meta description, hero subhead, hero proof stats, and partner stat row. Any change to the number needs to update all four locations.

---

## Contact Form

The contact form on `contact.html` needs to be connected to your form handler / CRM. Options:
- **Calendly embed** — works well for this use case, replaces the form entirely with a booking widget
- **HubSpot / Pipedrive form** — embed directly
- **WPForms / Gravity Forms** — standard WordPress form plugin, style to match the existing form design

The form fields are:
- First Name + Last Name (2-col row)
- Email Address
- Phone Number
- Company Name
- Annual Turnover (select: €1M–€3M / €3M–€10M / €10M–€25M / €25M–€50M / €50M+)
- Industry (select dropdown — collects prospect's sector; this is not Keystone's specialism list)
- Biggest operational problem (textarea)
- Submit: "Request Your Discovery Call"

The form submit copy uses "Request Your Discovery Call" to match the commercial model.

---

## Recommended WordPress Plugins

| Plugin | Purpose |
|---|---|
| Yoast SEO or Rank Math | SEO — meta descriptions, schema markup, canonicals |
| WP Rocket or LiteSpeed Cache | Page speed — critical for Core Web Vitals |
| WPForms or Gravity Forms | Contact form + CRM integration |
| Smush or ShortPixel | Image compression |
| UpdraftPlus | Backups |
| Wordfence | Security |

---

## SEO Notes

- Canonical URLs are set in each blog post — update to final domain when live
- All blog posts have meta descriptions — preserve them in Yoast/RankMath
- Schema markup (BlogPosting, Organization, BreadcrumbList) should be added via Yoast or manually
- Target domain (update throughout): `keystoneintelligence.ie`
- The Insights footer column links to only the three live blog posts. When new posts are added, update the column sitewide.

---

## Case Studies Anchors

The case studies page uses anchor IDs that are referenced from footer columns and the homepage:

| Anchor | Case Study | Source |
|---|---|---|
| `#construction-hub` | Five workflows under one roof — an Irish construction company | Anonymised client build |
| `#legal-call-actions` | Client calls turned into action items, automatically — an Irish solicitor practice | Anonymised client build |
| `#waste-hub` | A 30-vehicle waste operation run by nine AI agents | Internal (partner business) |
| `#ar-guardian` | Invoice reconciliation across Salesforce and Xero | Internal |
| `#wip-invoice` | WIP-to-Invoice automation | Internal |
| `#email-triage` | Email triage agent | Internal |
| `#balance-sheet` | Month-end close in hours | Internal |

All case studies are anonymised but specific. The standard phrasing is "an Irish [sector] business we built for" — never identifying the client by name. If a future case study moves to be named (with client permission), the section label should flag it with a "· Named Client" suffix to signal the change in disclosure.

When new case studies are added, the homepage Case Studies preview block (`industries-grid`) and the footer Case Studies column should be updated to include them. The homepage preview currently shows 5 case studies (Construction, Legal Call-Actions, Waste Hub, Invoice Reconciliation, WIP-to-Invoice) plus the "Your business is next" CTA card. The remaining two (Email Triage, Balance Sheet Recon) live on the case studies page only.

---

## Blog Post Structure (Single Post Template)

All blog posts use the same two-column layout:
- **Left (article body):** Headline, meta, article content with h2/h3 hierarchy
- **Right (sidebar):** Table of contents + CTA card

On mobile (< 900px): sidebar drops below article body.

The sidebar CTA is always:
```
[p] Brief contextual description
[btn-primary] Book a Free Discovery Call → /contact
[btn-outline] See Case Studies → /industries (or specific case study anchor)
```

The "Related Reading" section at the bottom of each post shows three cards: two other live blog posts plus one contextually relevant case study from the Case Studies page.

---

## Tone & Copy Rules (for any new pages added)

- No jargon. No "AI-powered", "cutting edge", "digital transformation", "seamless integration"
- Short sentences. Strong verbs.
- Every headline should stop a busy founder mid-scroll
- Single CTA: Book a Free Discovery Call
- Peer-to-peer tone — founders talking to founders
- Cross-sector positioning: avoid claiming sector specialism. The Keystone proposition is *operational pattern recognition across sectors*, anchored in AI deployed inside the partners' own businesses

### Specific phrases to AVOID
- "Two operators" / "two of us" / "two founders" — the site does not disclose the partner count
- "Eight industries we serve" — the positioning is cross-sector, not industry-segmented
- "Gross margin" — use "margin" throughout
- "Four-week engagement" — the new structure is step-based, not time-bound

### Specific phrases to USE
- "The Partners" (not "the founders" or "the two operators")
- "Built in our own businesses first"
- "Sectors differ. Operations rhyme."
- "Hub" — the central intelligence layer that reuses across multiple businesses

---

## Contact

Email to use sitewide: `hello@keystoneintelligence.ie`
Update this once confirmed.

---

*Delivered by Keystone Intelligence Group content build — May 2026*
