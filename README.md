# Platform Moderation Evidence Lab

A source-linked register of public records about how Meta has moderated
drug-policy content. Every record states what its source establishes, what it does
not, and — the field this register exists for — the specific wrong inference the
record invites and why that inference fails.

The characteristic failure in this subject area is not fabricated evidence. It is
real evidence stretched one step past what it can carry. The register holds
counter-evidence on purpose: one adjudicated decision cuts against the suppression
thesis, and it is published alongside the ones that support it.

One record cites a source that returned HTTP 404 with no archived copy. It is kept,
marked, and stripped of evidentiary weight rather than deleted.

## Editing content

`lib/records.js` is the single source of truth for records, source classes and
reading rules. It feeds both the edge endpoint at `api/dashboard.js` and the
renderer. After changing it:

```sh
node scripts/render.mjs   # writes public/index.html and public/sources.html
npm test                  # fails if the committed HTML is stale against lib/
npm run build             # file and contract validation
```

There is no deploy-time build. The committed HTML is the artefact, so the register
is readable, linkable and printable with JavaScript switched off; `public/app.js`
only adds filtering, ordering, shareable views, browser-local review and export.

The application has no account, analytics, or submission endpoint. Browser-local
review state uses the key `platform-evidence-lab-v1`.
