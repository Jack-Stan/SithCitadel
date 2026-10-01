# Security Patterns — Bug Bounty

---

## [S-000001] Bug Bounty Rules of Engagement — Verplichte Headers
**Severity:** HIGH  
**Score:** 1  
**Date:** 2026-06-02  
**Source:** AD.nl bug bounty sessie (smdjack)

**Pattern:**
Elke bug bounty op Intigriti vereist specifieke headers op ELKE request. Ontbrekende headers vallen buiten de safe harbour clause.

**Remediation:**
- Voeg `X-Intigriti-Username: {jouw_username}` toe aan elke request
- Gebruik de `intigriti_setup.ps1` om automatisch een project CLAUDE.md te genereren
- Controleer altijd de Rules of Engagement sectie van het programma voor verplichte headers

---

## [S-000002] Bug Bounty — Geen Automated/Bulk Scanning
**Severity:** HIGH  
**Score:** 1  
**Date:** 2026-06-02  
**Source:** AD.nl bug bounty sessie (smdjack)

**Pattern:**
Bulk/parallel requests (bijv. 86 hashes tegelijk testen) worden beschouwd als automated scanning en zijn verboden op Intigriti programma's. Dit kan leiden tot IP-ban, account-ban of afwijzing van submissions.

**Remediation:**
- Max 5 requests/sec
- Nooit meer dan 5 parallelle fetch() calls naar doelwit
- Alleen handmatige, gerichte requests
- Bij twijfel: vraag toestemming via het programma-contact

---

## [S-000003] GraphQL Persisted Queries — Hash Extractie via Webpack
**Severity:** MEDIUM  
**Score:** 1  
**Date:** 2026-06-02  
**Source:** AD.nl bug bounty sessie (smdjack)

**Pattern:**
Next.js applicaties met urql GraphQL client slaan persisted query hashes op in `window.webpackChunk_N_E`. Deze zijn uitlesbaar via browser console:

```javascript
let hashes = new Set();
window.webpackChunk_N_E.forEach(chunk => {
  Object.values(chunk[1] || {}).forEach(mod => {
    try {
      (mod.toString().match(/hash:"([a-f0-9]{64})"/g) || [])
        .forEach(m => hashes.add(m.match(/"([a-f0-9]{64})"/)[1]));
    } catch(e) {}
  });
});
console.log([...hashes]);
```

**Remediation:**
Gebruik deze techniek om snel alle beschikbare GraphQL queries te inventariseren bij Next.js + urql applicaties.

---

## [S-000004] GraphQL Server-Side Error Leakage
**Severity:** MEDIUM  
**Score:** 1  
**Date:** 2026-06-02  
**Source:** AD.nl bug bounty sessie — mijnomgeving.ad.nl

**Pattern:**
`getSharedAccessOverview` query op mijnomgeving.ad.nl geeft een server-side JavaScript error terug voor elke subscriptionId:

```json
{
  "errors": [{
    "message": "f?.some is not a function",
    "path": ["getSharedAccessOverview"],
    "extensions": {"sentryEventId": "7944c97a89de463481f1ca8f69eb00cd"}
  }]
}
```

- Interne Sentry event IDs worden blootgesteld
- Error treedt op voor ELKE subscriptionId (ook willekeurige)
- Geen authorization check voorkomt de aanroep

**Hash:** `0b06a5b46615e9e404b1cd2cf54873b3c26d48801e2c2502211882eea2893028`

**Remediation voor AD:**
- Null safety check op `f` voor `.some()` aanroep
- Geen interne error details retourneren naar client
- Sentry event IDs niet exposen in API responses
