#!/usr/bin/env python3
"""
Build Standards audit + patch for 18 unmounted repos.
Run from your terminal: python3 audit_patch_18.py
Requires: git, gh (GitHub CLI) or HTTPS access, Python 3
"""

import os, sys, json, subprocess, shutil, tempfile, re

REPOS = [
    ("n:2",  "psychops-intel"),
    ("n:4",  "ai-budget-calc"),
    ("n:7",  "aloha-culture-monitor"),
    ("n:9",  "aloha-behavioral-intelligence"),
    ("n:10", "aloha-creator-rights"),
    ("n:11", "aloha-encoding-effect"),
    ("n:13", "aloha-ai-governance"),
    ("n:14", "legal-risk-monitor"),
    ("n:15", "bm-intel-ivory"),
    ("n:21", "transform-observatory"),
    ("n:28", "entheogen-atlas"),
    ("n:29", "psychonaut-bookworm"),
    ("n:30", "destig-toolkit"),
    ("n:31", "law-communication-library"),
    ("n:33", "eolpc-demo"),
    ("n:34", "myelin-ce"),
    ("n:35", "dru-assessment"),
    ("n:61", "nervous-system-studio"),
]

GITHUB_ORG = "rn-collins"

# ─── UTM + analytics snippets ────────────────────────────────────────────────

def utm_iife(source):
    return (
        "(function(){\n"
        "  var p=new URLSearchParams(location.search),u={};\n"
        "  ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(function(k){if(p.get(k))u[k]=p.get(k);});\n"
        "  if(Object.keys(u).length)sessionStorage.setItem('rn_utm',JSON.stringify(u));\n"
        "  window._getUTM=function(){try{return JSON.parse(sessionStorage.getItem('rn_utm')||'{}')}catch(e){return{}}};\n"
        "  window.addEventListener('load',function(){\n"
        f"    fetch('/api/track',{{method:'POST',headers:{{'Content-Type':'application/json'}},\n"
        f"      body:JSON.stringify({{event:'page_view',source:'{source}',referrer:document.referrer||'direct',utm:window._getUTM()}})\n"
        "    }}).catch(function(){});\n"
        "  });\n"
        "  var ms=[25,50,75,90],fired={};\n"
        "  window.addEventListener('scroll',function(){\n"
        "    var h=document.body.scrollHeight-window.innerHeight;if(h<=0)return;\n"
        "    var pct=Math.round((window.scrollY/h)*100);\n"
        "    ms.forEach(function(m){if(pct>=m&&!fired[m]){fired[m]=1;\n"
        "      fetch('/api/track',{method:'POST',headers:{'Content-Type':'application/json'},\n"
        f"        body:JSON.stringify({{event:'scroll_depth',source:'{source}',depth:m+'%'}})"+"}}).catch(function(){});\n"
        "    }});\n"
        "  },{passive:true});\n"
        "})()"
    )

ANALYTICS_HTML = (
    '<script defer src="/_vercel/insights/script.js"></script>\n'
    '<script defer src="/_vercel/speed-insights/script.js"></script>\n'
)

def utm_html(source):
    return f'<script>\n{utm_iife(source)}\n</script>\n'

def jsonld_html(slug):
    site_url = f"https://{slug}.vercel.app"
    return (
        '<script type="application/ld+json">\n'
        + json.dumps({
            "@context": "https://schema.org",
            "@graph": [
                {"@type":"Person","@id":"https://rn-portfolio-khaki.vercel.app/#rn-collins",
                 "name":"RN Collins","jobTitle":"AI Educator & Consultant",
                 "url":"https://rn-portfolio-khaki.vercel.app",
                 "sameAs":["https://linkedin.com/in/rn-collins"]},
                {"@type":"WebPage","name":slug.replace("-"," ").title()+" — RN Collins",
                 "url":site_url,
                 "author":{"@id":"https://rn-portfolio-khaki.vercel.app/#rn-collins"}}
            ]
        }, indent=2)
        + '\n</script>\n'
    )

CONTACT_HTML = """
<!-- Contact the Architect -->
<div style="position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999">
  <button onclick="document.getElementById('ca-modal').style.display='flex'"
    style="font-size:.65rem;text-transform:uppercase;letter-spacing:.08em;background:#B8842A;
    color:#fff;border:none;padding:.55rem 1.1rem;border-radius:2rem;cursor:pointer;
    box-shadow:0 2px 12px rgba(0,0,0,.35)">Contact the Architect</button>
</div>
<div id="ca-modal" role="dialog" aria-modal="true"
  style="display:none;position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.8);
  align-items:center;justify-content:center">
  <div style="background:#fff;max-width:420px;width:90%;padding:2rem;border-radius:4px">
    <h2 style="margin:0 0 1rem">Contact the Architect</h2>
    <input id="ca-name" placeholder="Name (optional)"
      style="width:100%;padding:.6rem;margin-bottom:.75rem;border:1px solid #ccc;box-sizing:border-box"/>
    <input id="ca-email" type="email" placeholder="Email (required)"
      style="width:100%;padding:.6rem;margin-bottom:.75rem;border:1px solid #ccc;box-sizing:border-box"/>
    <textarea id="ca-msg" rows="3" placeholder="Message"
      style="width:100%;padding:.6rem;margin-bottom:.75rem;border:1px solid #ccc;box-sizing:border-box;resize:vertical"></textarea>
    <div style="display:flex;gap:.75rem;justify-content:flex-end">
      <button onclick="document.getElementById('ca-modal').style.display='none'"
        style="background:none;border:1px solid #ccc;padding:.5rem 1rem;cursor:pointer">Cancel</button>
      <button id="ca-send"
        style="background:#1B7A68;color:#fff;border:none;padding:.5rem 1rem;cursor:pointer">Send</button>
    </div>
  </div>
</div>
<script>
document.getElementById('ca-send').onclick=function(){
  var e=document.getElementById('ca-email').value;
  if(!e){alert('Email is required');return;}
  fetch('/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({name:document.getElementById('ca-name').value,email:e,
    message:document.getElementById('ca-msg').value,source:'contact-architect-SLUG'})})
  .then(function(){document.getElementById('ca-modal').style.display='none';alert('Sent!');})
  .catch(function(){alert('Error. Please try again.');});
};
</script>
"""

RN_BUILDS_HTML = """
<div style="text-align:center;padding:.75rem 1rem;font-size:.7rem;border-top:1px solid rgba(0,0,0,.1);margin-top:2rem">
  Built by <a href="https://rn-portfolio-khaki.vercel.app" target="_blank" rel="noopener"
  style="color:#1B7A68;text-decoration:none">RN Builds</a> — explore all AI tools and projects.
</div>
"""

VERCEL_JSON = json.dumps({
    "cleanUrls": True,
    "headers": [{
        "source": "/(.*)",
        "headers": [
            {"key":"Content-Security-Policy","value":"default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self'; img-src 'self' data: https:; frame-ancestors 'none'"},
            {"key":"X-Frame-Options","value":"DENY"},
            {"key":"X-Content-Type-Options","value":"nosniff"},
            {"key":"Referrer-Policy","value":"strict-origin-when-cross-origin"},
            {"key":"Permissions-Policy","value":"camera=(), microphone=(), geolocation=()"},
            {"key":"Strict-Transport-Security","value":"max-age=63072000; includeSubDomains; preload"}
        ]
    }]
}, indent=2)

# ─── Detection ───────────────────────────────────────────────────────────────

def detect_type(repo_dir):
    """Returns 'nextjs', 'static', or 'api-only'"""
    has_pages = os.path.isdir(os.path.join(repo_dir, 'pages'))
    has_app   = os.path.isdir(os.path.join(repo_dir, 'app'))
    has_pkg   = os.path.isfile(os.path.join(repo_dir, 'package.json'))
    has_index = os.path.isfile(os.path.join(repo_dir, 'index.html'))
    has_api   = os.path.isdir(os.path.join(repo_dir, 'api'))

    if has_pkg:
        try:
            pkg = json.load(open(os.path.join(repo_dir, 'package.json')))
            deps = {**pkg.get('dependencies',{}), **pkg.get('devDependencies',{})}
            if 'next' in deps:
                return 'nextjs'
        except: pass

    if has_pages or has_app:
        return 'nextjs'
    if has_index:
        return 'static'
    if has_api and not has_pages and not has_index:
        return 'api-only'
    return 'static'  # default guess

# ─── Audit ───────────────────────────────────────────────────────────────────

def audit(repo_dir, slug, rtype):
    checks = {}
    if rtype == 'api-only':
        checks['vercel.json'] = os.path.isfile(os.path.join(repo_dir,'vercel.json'))
        return checks

    # Collect all relevant text
    texts = []
    for root, dirs, files in os.walk(repo_dir):
        dirs[:] = [d for d in dirs if d not in ['.git','node_modules','.next']]
        for fn in files:
            if fn.endswith(('.js','.jsx','.ts','.tsx','.html','.json')) and fn != 'package-lock.json':
                try: texts.append(open(os.path.join(root,fn)).read())
                except: pass
    full = '\n'.join(texts)

    checks['analytics']    = '/_vercel/insights' in full
    checks['speed']        = '/_vercel/speed-insights' in full
    checks['utm']          = '/api/track' in full
    checks['contact']      = '/api/lead' in full
    checks['rn-builds']    = 'rn-portfolio-khaki' in full
    checks['json-ld']      = 'ld+json' in full
    checks['sitemap']      = 'sitemap' in full
    checks['vercel.json']  = os.path.isfile(os.path.join(repo_dir,'vercel.json'))
    return checks

# ─── Patch: static HTML ──────────────────────────────────────────────────────

def patch_static(repo_dir, slug):
    idx_path = os.path.join(repo_dir, 'index.html')
    if not os.path.isfile(idx_path):
        # look one level deep
        for f in os.listdir(repo_dir):
            candidate = os.path.join(repo_dir, f, 'index.html')
            if os.path.isfile(candidate):
                idx_path = candidate
                break
    if not os.path.isfile(idx_path):
        return False, "No index.html found"

    with open(idx_path) as f:
        html = f.read()

    site_url = f"https://{slug}.vercel.app"

    head_inject = (
        f'<link rel="sitemap" type="application/xml" href="/sitemap.xml"/>\n'
        f'<meta name="robots" content="index, follow"/>\n'
        + ANALYTICS_HTML
        + utm_html(slug)
        + jsonld_html(slug)
    )
    body_inject = CONTACT_HTML.replace('SLUG', slug) + RN_BUILDS_HTML

    if '/_vercel/insights' not in html:
        html = html.replace('</head>', head_inject + '</head>', 1)
    if '/api/lead' not in html:
        html = html.replace('</body>', body_inject + '</body>', 1)

    with open(idx_path, 'w') as f:
        f.write(html)

    # vercel.json
    vj_path = os.path.join(repo_dir, 'vercel.json')
    if not os.path.isfile(vj_path):
        with open(vj_path, 'w') as f:
            f.write(VERCEL_JSON)

    return True, "Patched"

# ─── Patch: Next.js ──────────────────────────────────────────────────────────

def nextjs_utm_dangerously(slug):
    iife = utm_iife(slug).replace('`','\\`').replace('${','\\${')
    return (
        "        <script dangerouslySetInnerHTML={{__html: `"
        + utm_iife(slug).replace('\\','\\\\').replace('`','\\`')
        + "`}} />\n"
    )

def patch_nextjs(repo_dir, slug):
    pages_dir = os.path.join(repo_dir, 'pages')
    app_dir   = os.path.join(repo_dir, 'app')

    # ── _document.js ──
    doc_path = os.path.join(pages_dir, '_document.js') if os.path.isdir(pages_dir) else None
    if doc_path and os.path.isfile(doc_path):
        with open(doc_path) as f:
            doc = f.read()
        if '/_vercel/insights' not in doc:
            inject = (
                "        <script defer src=\"/_vercel/insights/script.js\" />\n"
                "        <script defer src=\"/_vercel/speed-insights/script.js\" />\n"
                + nextjs_utm_dangerously(slug)
            )
            # Try injecting into existing Head
            if '<Head />' in doc:
                doc = doc.replace('<Head />', '<Head>\n' + inject + '      </Head>')
            elif '<Head>' in doc:
                doc = doc.replace('<Head>', '<Head>\n' + inject, 1)
            else:
                doc = doc.replace('<Main />', inject + '\n        <Main />', 1)
            with open(doc_path, 'w') as f:
                f.write(doc)
    elif doc_path and not os.path.isfile(doc_path) and os.path.isdir(pages_dir):
        # Create _document.js
        utm_block = nextjs_utm_dangerously(slug)
        doc_content = (
            "import { Html, Head, Main, NextScript } from 'next/document';\n\n"
            "export default function Document() {\n"
            "  return (\n"
            "    <Html lang=\"en\">\n"
            "      <Head>\n"
            "        <script defer src=\"/_vercel/insights/script.js\" />\n"
            "        <script defer src=\"/_vercel/speed-insights/script.js\" />\n"
            f"        {utm_block.strip()}\n"
            "      </Head>\n"
            "      <body>\n"
            "        <Main />\n"
            "        <NextScript />\n"
            "      </body>\n"
            "    </Html>\n"
            "  );\n"
            "}\n"
        )
        with open(doc_path, 'w') as f:
            f.write(doc_content)

    # ── pages/index.js or app/page.js ──
    idx_path = None
    for candidate in [
        os.path.join(pages_dir, 'index.js'),
        os.path.join(pages_dir, 'index.jsx'),
        os.path.join(pages_dir, 'index.tsx'),
        os.path.join(app_dir, 'page.js'),
        os.path.join(app_dir, 'page.jsx'),
        os.path.join(app_dir, 'page.tsx'),
    ]:
        if os.path.isfile(candidate):
            idx_path = candidate
            break

    if idx_path:
        with open(idx_path) as f:
            idx = f.read()

        # Head additions
        if 'sitemap' not in idx:
            sitemap_etc = (
                "      <link rel=\"sitemap\" type=\"application/xml\" href=\"/sitemap.xml\"/>\n"
                "      <meta name=\"robots\" content=\"index, follow\"/>\n"
                "      <script type=\"application/ld+json\" dangerouslySetInnerHTML={{__html: JSON.stringify({\n"
                "        '@context': 'https://schema.org',\n"
                "        '@graph': [\n"
                f"          {{'@type':'Person','@id':'https://rn-portfolio-khaki.vercel.app/#rn-collins',\n"
                "           'name':'RN Collins','jobTitle':'AI Educator & Consultant',\n"
                "           'url':'https://rn-portfolio-khaki.vercel.app',\n"
                "           'sameAs':['https://linkedin.com/in/rn-collins']},\n"
                f"          {{'@type':'WebPage','name':'{slug.replace('-',' ').title()} — RN Collins',\n"
                f"           'url':'https://{slug}.vercel.app',\n"
                "           'author':{'@id':'https://rn-portfolio-khaki.vercel.app/#rn-collins'}}\n"
                "        ]\n"
                "      })}} />\n"
            )
            idx = re.sub(r'(\s*</Head>)', sitemap_etc + r'\1', idx, count=1)

        # Contact + RN Builds before closing tag
        if '/api/lead' not in idx:
            CONTACT_JSX = f"""
{{/* Contact the Architect */}}
<div style={{{{position:'fixed',bottom:'1.5rem',right:'1.5rem',zIndex:9999}}}}>
  <button onClick={{()=>document.getElementById('ca-modal').style.display='flex'}}
    style={{{{fontSize:'.65rem',textTransform:'uppercase',letterSpacing:'.08em',background:'#B8842A',
    color:'#fff',border:'none',padding:'.55rem 1.1rem',borderRadius:'2rem',cursor:'pointer',
    boxShadow:'0 2px 12px rgba(0,0,0,.35)'}}}}>Contact the Architect</button>
</div>
<div id="ca-modal" role="dialog" aria-modal="true"
  style={{{{display:'none',position:'fixed',inset:0,zIndex:10000,background:'rgba(0,0,0,.8)',
  alignItems:'center',justifyContent:'center'}}}}>
  <div style={{{{background:'#fff',maxWidth:420,width:'90%',padding:'2rem',borderRadius:4}}}}>
    <h2 style={{{{margin:'0 0 1rem'}}}}>Contact the Architect</h2>
    <input id="ca-name" placeholder="Name (optional)"
      style={{{{width:'100%',padding:'.6rem',marginBottom:'.75rem',border:'1px solid #ccc',boxSizing:'border-box'}}}}/>
    <input id="ca-email" type="email" placeholder="Email (required)"
      style={{{{width:'100%',padding:'.6rem',marginBottom:'.75rem',border:'1px solid #ccc',boxSizing:'border-box'}}}}/>
    <textarea id="ca-msg" rows={{3}} placeholder="Message"
      style={{{{width:'100%',padding:'.6rem',marginBottom:'.75rem',border:'1px solid #ccc',boxSizing:'border-box',resize:'vertical'}}}}></textarea>
    <div style={{{{display:'flex',gap:'.75rem',justifyContent:'flex-end'}}}}>
      <button onClick={{()=>document.getElementById('ca-modal').style.display='none'}}
        style={{{{background:'none',border:'1px solid #ccc',padding:'.5rem 1rem',cursor:'pointer'}}}}>Cancel</button>
      <button onClick={{()=>{{
        const e=document.getElementById('ca-email').value;
        if(!e){{alert('Email is required');return;}}
        fetch('/api/lead',{{method:'POST',headers:{{'Content-Type':'application/json'}},
          body:JSON.stringify({{name:document.getElementById('ca-name').value,email:e,
          message:document.getElementById('ca-msg').value,source:'contact-architect-{slug}'}})}})\n        .then(()=>{{document.getElementById('ca-modal').style.display='none';alert('Sent!');}})
        .catch(()=>alert('Error. Please try again.'));
      }}}} style={{{{background:'#1B7A68',color:'#fff',border:'none',padding:'.5rem 1rem',cursor:'pointer'}}}}>Send</button>
    </div>
  </div>
</div>"""

            RN_JSX = """<div style={{textAlign:'center',padding:'.75rem 1rem',fontSize:'.7rem',borderTop:'1px solid rgba(0,0,0,.1)',marginTop:'2rem'}}>
  Built by <a href="https://rn-portfolio-khaki.vercel.app" target="_blank" rel="noopener"
  style={{color:'#1B7A68',textDecoration:'none'}}>RN Builds</a> — explore all AI tools and projects.
</div>"""

            # Try common closing patterns
            for pattern in ['  </>)\n}', '  </div>\n)\n\nexport', '  </main>\n)\n}', '</>\n  );\n}']:
                if pattern in idx:
                    idx = idx.replace(pattern, CONTACT_JSX + '\n' + RN_JSX + '\n' + pattern, 1)
                    break

        with open(idx_path, 'w') as f:
            f.write(idx)

    # vercel.json
    vj_path = os.path.join(repo_dir, 'vercel.json')
    if not os.path.isfile(vj_path):
        with open(vj_path, 'w') as f:
            f.write(VERCEL_JSON)

    return True, "Patched"

# ─── Main ─────────────────────────────────────────────────────────────────────

def run(cmd, cwd=None):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=cwd)
    return r.returncode, r.stdout.strip(), r.stderr.strip()

def main():
    workdir = os.path.expanduser('~/rn-audit-tmp')
    os.makedirs(workdir, exist_ok=True)
    results = []

    for num, slug in REPOS:
        print(f"\n{'='*60}")
        print(f"  {num}  {slug}")
        print(f"{'='*60}")

        repo_dir = os.path.join(workdir, slug)

        # Clone
        if os.path.isdir(repo_dir):
            print(f"  ↩  Already cloned — pulling latest")
            rc, out, err = run('git pull --rebase origin main', cwd=repo_dir)
        else:
            print(f"  ⬇  Cloning...")
            rc, out, err = run(
                f'gh repo clone {GITHUB_ORG}/{slug} {repo_dir}',
            )
            if rc != 0:
                # fallback to https
                rc, out, err = run(
                    f'git clone https://github.com/{GITHUB_ORG}/{slug}.git {repo_dir}',
                )
            if rc != 0:
                print(f"  ❌  Clone failed: {err}")
                results.append((num, slug, 'CLONE_FAIL', {}))
                continue

        rtype = detect_type(repo_dir)
        print(f"  Type: {rtype}")

        checks_before = audit(repo_dir, slug, rtype)
        missing = [k for k,v in checks_before.items() if not v]
        print(f"  Missing: {missing if missing else 'nothing — already compliant'}")

        if not missing:
            results.append((num, slug, 'ALREADY_OK', checks_before))
            continue

        if rtype == 'api-only':
            # Just write vercel.json if missing
            vj_path = os.path.join(repo_dir, 'vercel.json')
            if not os.path.isfile(vj_path):
                with open(vj_path, 'w') as f:
                    f.write(VERCEL_JSON)
                print("  ✅  Created vercel.json")
        elif rtype == 'static':
            ok, msg = patch_static(repo_dir, slug)
            print(f"  {'✅' if ok else '❌'}  {msg}")
        else:
            ok, msg = patch_nextjs(repo_dir, slug)
            print(f"  {'✅' if ok else '❌'}  {msg}")

        checks_after = audit(repo_dir, slug, rtype)
        still_missing = [k for k,v in checks_after.items() if not v]

        # Git commit + push
        rc, out, err = run('git add -A', cwd=repo_dir)
        rc, out, err = run(
            'git diff --cached --quiet || git commit -m "build-standards: analytics, UTM, contact, rn-builds, json-ld, sitemap, vercel.json"',
            cwd=repo_dir
        )
        print(f"  Commit: {out or '(nothing to commit)'}")
        rc, out, err = run('git push origin main', cwd=repo_dir)
        if rc == 0:
            print(f"  ✅  Pushed")
        else:
            print(f"  ❌  Push failed: {err}")

        results.append((num, slug, 'PATCHED' if not still_missing else 'PARTIAL', checks_after))

    # Summary
    print(f"\n{'='*60}")
    print("  SUMMARY")
    print(f"{'='*60}")
    for num, slug, status, checks in results:
        icon = '✅' if status in ('ALREADY_OK','PATCHED') else '⚠️' if status == 'PARTIAL' else '❌'
        print(f"  {icon}  {num}  {slug}  [{status}]")
        if status == 'PARTIAL':
            bad = [k for k,v in checks.items() if not v]
            print(f"        still missing: {bad}")

    print(f"\nDone. Repos cloned to: {workdir}")

if __name__ == '__main__':
    main()
