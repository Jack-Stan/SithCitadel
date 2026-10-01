# Sith Citadel — Holocron Index

> **CLAUDE CODE:** Lees dit bestand aan het begin van elke bug bounty sessie volledig door.

---

## ⚠️ KRITIEKE REGELS — NOOIT OVERTREDEN

> **Officiële T&C:** https://kb.intigriti.com/en/articles/5466165-researcher-terms-conditions  
> **CLAUDE CODE:** Raadpleeg deze URL bij twijfel over wat mag/niet mag. Dit is de bindende versie.

### Intigriti Platform (geldt voor ALLE programma's)

| Regel | Bron |
|-------|------|
| Lees Program Conditions **voor** je begint | T&C Art. 5 |
| **Nooit** automated scanners of bulk requests | T&C Art. 6 |
| **Nooit** data van anderen kopiëren/downloaden | T&C Art. 10 |
| **Nooit** findings delen buiten Intigriti | T&C Art. 9 |
| **Onmiddellijk** submitten bij een finding | T&C Art. 7 |
| Alleen eigen test accounts gebruiken | T&C Art. 6 |
| Nooit out-of-scope assets testen | T&C Art. 5 |
| Bounty claim vervalt na **6 maanden** | T&C Art. 8 |
| Jij bent persoonlijk aansprakelijk | T&C Art. 14 |

### Per Request Checklist (Program-Specific)
**AD.nl, Aikido, etc:**
- [ ] Verplichte header `X-Intigriti-Username: smdjack` aanwezig?
- [ ] Max 5 requests/sec gerespecteerd?

**Torfs:**
- [ ] Geen X-Intigriti-Username header vereist (maar ook niet verboden)
- [ ] Max 1 request/sec gerespecteerd (STRICTER)

**GlobalSign:**
- [ ] Geen verplichte header
- [ ] Max 1 request/sec gerespecteerd (STRICT, min. 1000ms pauze)
- [ ] BAC/IDOR = lage prioriteit (mogelijk platform-wide uitgesloten, zie target-notes)
- [ ] Rapport in het Engels

**Alle Programma's:**
- [ ] Handmatig (niet geautomatiseerd)?
- [ ] Target is in scope?
- [ ] Vulnerability type is niet out of scope?
- [ ] @intigriti.me email gebruikt voor test accounts?

### AI Gebruik
- ✅ AI als assistent, analyse, rapport schrijven = OK
- ❌ AI die automatisch bulk requests stuurt = VERBODEN

---

## Researcher Info

| | |
|--|--|
| **Username** | smdjack |
| **Email A** | smdjack@intigriti.me |
| **Email B** | smdjack+ad2@intigriti.me |
| **Testing IP** | 84.199.239.210 |
| **PAT Token** | `$env:INTIGRITI_PAT` (Windows env var) |

---

## Vault Structuur

### Targets
- [[GlobalSign]] — Global CA/PKI provider, 1 req/sec (strict), BAC/IDOR platform-wide mogelijk uitgesloten
- [[RIPE NCC]] — Regional Internet Registry, RPKI/whois, source-in-scope, 2 req/sec, header X-Intigriti-User
- [[Torfs]] — Belgian shoe retailer, 5 Tier 2 sites, shared codebase, 1 req/sec limit
- [[AD.nl - DPG Media]] — Scope, bounties, test accounts
- [[KU Leuven - Huisvesting]] — SAP UI5/OData app, Tier 2, geen findings

### Recon
- [[AD.nl - GraphQL API]] — 86 hashes, mutations, endpoints
- [[KU Leuven - Huisvesting Recon]] — OData entities, 46-kolom XLSX, volledige testresultaten

### Vulnerabilities
- [[AD.nl - getSharedAccessOverview Server Error]] — Medium, in triage

### Rapporten
- [[AD.nl - Intigriti Submission]] — Submission-ready rapport

### Tools
- `Tools/intigriti_setup.ps1` — Auto CLAUDE.md generator via Intigriti API

### Vault (Kennisbank)
- [[Intigriti Researcher T&C - Regels]] — Volledige T&C samenvatting
- [[Security Patterns]] — Geleerde patronen uit sessies

---

## Workflow Nieuwe Bug Bounty Sessie

```
1. Maak nieuwe map aan:
   mkdir "C:\RFT\Projects\Sith-Citadel\Holocron\Targets\[Programma]"

2. Genereer CLAUDE.md via script:
   .\Holocron\Tools\intigriti_setup.ps1 -ProgramId "[handle]"

3. Controleer regels:
   - Lees Program Conditions op Intigriti
   - Verifieer verplichte headers
   - Noteer rate limits

4. Start testing:
   - Altijd X-Intigriti-Username header
   - Max 5 req/sec
   - Alleen handmatig

5. Bij finding:
   - Documenteer in Vulnerabilities/
   - Schrijf rapport in Rapporten/
   - Submit via Intigriti (jij doet dit zelf)
```

---

## Submission Checklist

- [ ] Titel duidelijk en beschrijvend
- [ ] Juiste asset geselecteerd
- [ ] Correct vulnerability type (CWE)
- [ ] CVSS score berekend en correct
- [ ] Reproductiestappen duidelijk (stap voor stap)
- [ ] Attack scenario beschreven
- [ ] Impact sectie ingevuld
- [ ] Recommended fix toegevoegd
- [ ] Screenshot/PoC als attachment
- [ ] IP adres: 84.199.239.210 vermeld
- [ ] Email smdjack@intigriti.me vermeld
- [ ] X-Intigriti-Username in PoC requests

---

## Actieve Campaigns

| Datum | Programma | Status | Fase | Notes |
|-------|-----------|--------|------|-------|
| 2026-06-15 | GlobalSign (Intigriti) | Active | 0: Scope review klaar | 1 req/sec, BAC/IDOR mogelijk platform-wide uitgesloten, prio: atlas/secure/shop/support |
| 2026-06-10 | RIPE NCC (Intigriti) | Active | 0: Source review | Plan + recon klaar; authz-lead lirportal→rpki-core |
| 2026-06-09 | Torfs.be (Bug Bounty) | Active | 1: Recon planned | 5 Tier 2 sites, shared codebase |
| 2026-06-02 | AD.nl (DPG Media) | Completed | 1 finding submitted | Out of Scope, then closed |
| - | KU Leuven - Huisvesting | Completed | 0 findings | SAP UI5/OData, no vulns found |

## Vorige Submissions

| Datum | Programma | Finding | Severity | Status |
|-------|-----------|---------|----------|--------|
| 2026-06-02 | AD.nl (DPG Media) | getSharedAccessOverview Server Error | Medium | Out of Scope |
| 2026-06-02 | Aikido Security | OAuth2 Open Redirect via redirect_uri | Exceptional 9.6 | Not Applicable |
