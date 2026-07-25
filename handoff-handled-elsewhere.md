# Build Standards Audit — Handoff: "Handled Elsewhere" Builds

**For:** whichever chat session owns n:23, 26, 32, 36–50, 60  
**Date:** July 23, 2026  
**Context:** RN Collins is running a Build Standards audit across all 72 live builds. This session completed the 23-build batch. The 19 builds below are yours to audit.

---

## What the Audit Requires

Every build must pass **all applicable checks** before the GitHub repo and live URL are considered publicly shareable.

### For Next.js and static HTML builds (frontend):
| Check | What to look for |
|---|---|
| `analytics` | `/_vercel/insights/script.js` loaded (defer, in `<head>`) |
| `speed` | `/_vercel/speed-insights/script.js` loaded (defer, in `<head>`) |
| `utm` | `/api/track` IIFE capturing UTM params + scroll depth (25/50/75/90%) |
| `contact` | "Contact the Architect" fixed button → modal → `/api/lead` POST |
| `rn-builds` | Footer: "Built by RN Builds" → `https://rn-portfolio-khaki.vercel.app` |
| `json-ld` | `<script type="application/ld+json">` with Person + WebPage @graph |
| `sitemap` | `<link rel="sitemap" type="application/xml" href="/sitemap.xml"/>` |
| `vercel.json` | Security headers: CSP, X-Frame-Options, HSTS, etc. |

### For API-only backends (no frontend HTML):
| Check | What to look for |
|---|---|
| `vercel.json` | Must have security headers (not just an empty `{}` or routes-only file) |

### How to detect API-only:
- No `pages/`, `app/`, or `index.html`
- Only has `api/`, `package.json`, `vercel.json`

---

## The 19 Builds to Audit

| n | URL | Notes |
|---|---|---|
| n:23 | (check builds.json) | |
| n:26 | (check builds.json) | |
| n:32 | (check builds.json) | |
| n:36 | (check builds.json) | |
| n:37 | (check builds.json) | |
| n:38 | (check builds.json) | |
| n:39 | (check builds.json) | |
| n:40 | (check builds.json) | |
| n:41 | (check builds.json) | |
| n:42 | (check builds.json) | |
| n:43 | (check builds.json) | |
| n:44 | (check builds.json) | |
| n:45 | (check builds.json) | |
| n:46 | (check builds.json) | |
| n:47 | (check builds.json) | |
| n:48 | (check builds.json) | |
| n:49 | (check builds.json) | |
| n:50 | (check builds.json) | |
| n:60 | (check builds.json) | |

Get URLs by running in your session:
```bash
node -e "
const b = require('/Users/rn/rn-portfolio-ARCHIVED/data/builds.json');
const t = new Set([23,26,32,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,60]);
b.filter(x=>t.has(x.n)).forEach(x=>console.log('n:'+x.n+' | '+x.title+' | '+x.url));
"
```

---

## Patching Approach

### Static HTML
Inject before `</head>`:
```html
<link rel="sitemap" type="application/xml" href="/sitemap.xml"/>
<meta name="robots" content="index, follow"/>
<script defer src="/_vercel/insights/script.js"></script>
<script defer src="/_vercel/speed-insights/script.js"></script>
<script>/* UTM + scroll depth IIFE — source: '{slug}' */</script>
<script type="application/ld+json">/* Person + WebPage @graph */</script>
```
Inject before `</body>`:
```html
<!-- Contact the Architect fixed button + modal → POST /api/lead source: 'contact-architect-{slug}' -->
<!-- RN Builds footer div → rn-portfolio-khaki.vercel.app -->
```

### Next.js (Pages Router)
- `pages/_document.js` → analytics scripts + UTM via `dangerouslySetInnerHTML`
- `pages/index.js` → sitemap link + json-ld in `<Head>`, contact button + rn-builds before closing tag

### Next.js (App Router)
- `app/layout.tsx` → add `<head>` JSX block with analytics + sitemap + json-ld
- `app/page.tsx` → contact button + rn-builds before `</main>` closing

### base64-encoded files
Some repos store `index.html` or `page.tsx` as `{"data": "base64..."}`. Decode first:
```python
import base64, json
obj = json.load(open('file'))
content = base64.b64decode(obj['data']).decode('utf-8')
# patch content, then write back as plain text (NOT re-wrapped in JSON)
open('file', 'w').write(content)
```

### vercel.json template (security headers)
```json
{
  "cleanUrls": true,
  "headers": [{
    "source": "/(.*)",
    "headers": [
      {"key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self'; img-src 'self' data: https:; frame-ancestors 'none'"},
      {"key": "X-Frame-Options", "value": "DENY"},
      {"key": "X-Content-Type-Options", "value": "nosniff"},
      {"key": "Referrer-Policy", "value": "strict-origin-when-cross-origin"},
      {"key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()"},
      {"key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload"}
    ]
  }]
}
```

---

## Deploy Rule (PERMANENT — no exceptions)
```
git push origin main
```
**Vercel CLI is permanently banned** (100-deploy/day rolling limit on free tier). Never run `vercel`, `vercel --prod`, or `vercel deploy`.

---

## Key Constants
- RN Builds portfolio URL: `https://rn-portfolio-khaki.vercel.app`
- Contact email: `collins.ra@northeastern.edu`
- `/api/lead` source format: `contact-architect-{slug}` (e.g. `contact-architect-destig-toolkit`)
- `/api/track` source format: `{slug}` (e.g. `destig-toolkit`)
- JSON-LD Person @id: `https://rn-portfolio-khaki.vercel.app/#rn-collins`

---

## Audit Script (reusable)

There's a working audit + patch script at:
```
~/aloha-suppression-sweep/audit_patch_18.py
```
You can adapt it — change the REPOS list to your 19 builds, run with Desktop Commander (`mcp__Desktop_Commander__start_process`), which has access to `gh` CLI for cloning.
