# AD.nl — GraphQL API Recon

**Target:** mijnomgeving.ad.nl  
**Datum:** 2026-06-02  

## Endpoint
```
https://mijnomgeving.ad.nl/api/graphql
```

## Eigenschappen
- **Methode:** GET (queries) / POST (mutations)
- **Auth:** Session cookie vereist
- **Modus:** PersistedQueryOnly — geen arbitrary queries mogelijk
- **Framework:** Next.js + urql client

## Hash Extractie
Alle 86 persisted query hashes zijn uitlesbaar via browser console:
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

## Kritieke Query Hashes

| Query | Hash |
|-------|------|
| ActiveSubscriptionsOverviewQuery | `3bd526270d2deadda2b789ffa1eaf7de2cbae43c6e33b4f2f9f4fa855f4d080e` |
| InactiveSubscriptionsOverviewQuery | `f51ea3da57caef2bfd1641c51b3385786cb8a970a63dfe09d10dc000fbf2a26e` |
| **getSharedAccessOverview** ⚠️ | `0b06a5b46615e9e404b1cd2cf54873b3c26d48801e2c2502211882eea2893028` |
| getLinkedSubscription (1) | `00b30426cc1f9bbecc4ad9e22ca05cbb7468f477739f141ee0996f71ad46aaa7` |
| getLinkedSubscription (2) | `34d7ec9365a6f4ffc6e2ee2a71423397fab19e1eafa3fd56cc1db276491c01c2` |
| getSubscriptionInvoices | `5829da00d9f9b3d3fd74465e2175b8a011da80121d5cd12bf6d7a2f282b8cc7a` |

## Mutations Gevonden
- `SubmitUpdateAddress($input: UmsAddressInput!)`
- `SubmitMovingHouseV2`
- `InitiateChangeEmail($input: UmsInitiateChangeEmailInput!)` → returns `challengeId`, `controlCharacter`
- `ChangeEmail($input: UmsChangeEmailInput!)`
- `ChangePaymentToDirectDebit($input: ChangePaymentToDirectDebitInput!)`
- `SharedAccessSendInvite($brandId, $subscriptionId, $name, $email)`
- `SharedAccessRevokeCoReader($brandId, $subscriptionId, $accountId)`
- `UnsubscribeCoReader($subscriptionId, $brandId)`

## Service Pagina's
| URL | Functie |
|-----|---------|
| /verhuisservice/doorgeven | Adres wijzigen |
| /vakantieservice/doorgeven | Bezorging pauzeren |
| /bezorgservice/klacht | Bezorgklacht |
| /betaalservice/wijzigen | Betaalmethode wijzigen |
| /klantenservice/email | Email wijzigen |
| /abonnementen/[brand_id]/[subscription_id] | Abonnement detail — IDOR kandidaat |
