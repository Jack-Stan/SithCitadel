# Bug Bounty - Rules of Engagement

## Holocron Index
Lees ALTIJD eerst: `Holocron/index.md`
Bevat: kritieke regels, submission checklist, actieve submissions, vault structuur.

## Researcher Info
- **Intigriti username:** smdjack
- **Test account A:** smdjack@intigriti.me (Jack Jackson)
- **Test account B:** smdjack+ad2@intigriti.me (James Jameson)
- **Testing IP:** 84.199.239.210
- **Intigriti PAT:** Opgeslagen als Windows environment variable `INTIGRITI_PAT`
  - Ophalen in PowerShell: `$env:INTIGRITI_PAT`
  - Ophalen in Bash: `$INTIGRITI_PAT`
  - Instellen: `[System.Environment]::SetEnvironmentVariable("INTIGRITI_PAT", "token", "User")`

---

## Intigriti T&C — BINDEND
**Officiële URL:** https://kb.intigriti.com/en/articles/5466165-researcher-terms-conditions  
**Samenvatting:** [[Intigriti Researcher T&C - Regels]] (`Holocron/Vault/Intigriti Researcher T&C - Regels.md`)  
**Index:** `Holocron/index.md`

> Bij twijfel: haal de officiële URL op en controleer. De online versie is altijd bindend.

---

## VERPLICHTE REGELS - NOOIT OVERSLAAN

### 1. Request Header ALTIJD meesturen
Elke HTTP request naar *.ad.nl MOET deze header bevatten:
```
X-Intigriti-Username: smdjack
```

In curl:
```bash
curl -H "X-Intigriti-Username: smdjack" https://...ad.nl/...
```

In JavaScript (browser):
```javascript
fetch(url, { headers: { 'X-Intigriti-Username': 'smdjack' } })
```

### 2. Max 5 requests per seconde
- NOOIT bulk/parallel requests sturen
- NOOIT meer dan 5 gelijktijdige fetch() calls naar AD endpoints
- Wacht minstens 200ms tussen requests
- GEEN geautomatiseerde scanners of tools

### 3. Geen automated scanning
- GEEN geautomatiseerde hash enumeration (zoals de 86-hash bulk test)
- GEEN directory brute forcing
- GEEN parameter fuzzing tools
- Alleen handmatige, gerichte requests

### 4. @intigriti.me email verplicht
- Alle testaccounts op AD platforms MOETEN aangemaakt worden met @intigriti.me email
- Gebruik smdjack@intigriti.me of smdjack+variant@intigriti.me

---

## Scope

### In scope (Tier 2 - hogere bounties)
- myaccount.ad.nl
- webwinkel.ad.nl
- www.ad.nl
- www.ad.nl/abonnementen

### In scope (Tier 3 - lagere bounties)
- *.ad.nl (wildcard, excl. abonnement.ad.nl)
- mijnomgeving.ad.nl ✅

### Uit scope (NIET testen)
- ad.nl/service
- ad.nl/inloggen / ad.nl/login
- ad.nl/registreren
- login2.ad.nl/_monitor
- abonnement.ad.nl

---

## Out of scope vulnerabilities (NIET submitten)
- XSS op www.ad.nl/abonnementen (known issue)
- Missing cookie flags
- Missing security headers
- Self-XSS
- Paywall bypass
- Username/email enumeration
- Rate limit bypass
- Open redirects in /privacygate-confirm, /privacy-wall
- CORS op non-sensitive endpoints
- Blind SSRF zonder bewezen impact
- Host header injection zonder bewezen impact

---

## Voor elke request controleren
- [ ] X-Intigriti-Username: smdjack header aanwezig?
- [ ] Max 5 req/sec gerespecteerd?
- [ ] Handmatig (niet geautomatiseerd)?
- [ ] Target is in scope?
- [ ] Vulnerability type is niet out of scope?

---

## Submission checklist
- [ ] Duidelijke reproductie stappen
- [ ] Concreet aanvalsscenario ("how will this affect AD exactly?")
- [ ] CVSS score berekend
- [ ] IP adres vermeld: 84.199.239.210
- [ ] X-Intigriti-Username header in PoC requests
- [ ] Severity realistisch ingeschat (impact-based)
