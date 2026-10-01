# Intigriti Submission — AD.nl getSharedAccessOverview Error

**Program:** DPG Media / Algemeen Dagblad  
**Researcher:** smdjack  
**Datum:** 2026-06-02  
**Asset:** mijnomgeving.ad.nl (*.ad.nl — Tier 3)  
**Type:** Misconfiguration / Information Disclosure  
**Severity:** Medium  

---

## Title
`Server-side JavaScript error and Sentry ID exposure in getSharedAccessOverview GraphQL query`

## Asset
`mijnomgeving.ad.nl`

## Vulnerability Type
Misconfiguration

## CVSS
`AV:N/AC:L/PR:L/UI:N/S:U/C:L/I:N/A:N` — **5.3 Medium**

---

## Proof of Concept

**Stap 1:** Log in op https://mijnomgeving.ad.nl met een geldig account.

**Stap 2:** Stuur de volgende request:

```http
GET /api/graphql?variables=%7B%22brandId%22%3A%22ad%22%2C%22subscriptionId%22%3A%22100000%22%7D&extensions=%7B%22persistedQuery%22%3A%7B%22sha256Hash%22%3A%220b06a5b46615e9e404b1cd2cf54873b3c26d48801e2c2502211882eea2893028%22%2C%22version%22%3A1%7D%7D HTTP/1.1
Host: mijnomgeving.ad.nl
X-Intigriti-Username: smdjack
Accept: application/json
```

**Stap 3:** Observeer de response:

```json
{
  "errors": [
    {
      "message": "f?.some is not a function",
      "path": ["getSharedAccessOverview"],
      "extensions": {
        "sentryEventId": "7944c97a89de463481f1ca8f69eb00cd"
      }
    }
  ],
  "data": {
    "__typename": "Query",
    "getSharedAccessOverview": null
  }
}
```

**Stap 4:** Herhaal met andere subscriptionId waarden (200000, 300000, etc.) — de error treedt consistent op voor alle inputs.

---

## Impact

Een geauthenticeerde aanvaller kan:
1. `getSharedAccessOverview` aanroepen met willekeurige `subscriptionId` waarden
2. Interne Sentry event IDs verzamelen
3. Vaststellen dat er geen authorization check is op de subscriptionId parameter

De server-side JavaScript error (`f?.some is not a function`) wijst op een null safety bug in de backend resolver. Dit suggereert dat het endpoint bedoeld is om co-reader accountdata (inclusief emails) terug te geven voor een abonnement, maar crasht voor de authorization check kan plaatsvinden.

---

## Recommended Fix

1. Null safety check: zorg dat `f` geïnitialiseerd is voor `.some()` aanroep
2. Geen interne error details retourneren naar clients
3. Geen `sentryEventId` exposen in API responses
4. Authorization check: verifieer dat de geauthenticeerde gebruiker eigenaar is van de `subscriptionId`
