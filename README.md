# Ubuntu Pay

**Instant, accountable social grant disbursement for South Africa — straight from government to the spaza shop, with no middleman and no missed payday.**

Built for Interledger FIH · Team 7

---

## The Problem

Every month, millions of South Africans rely on SASSA grants to survive. But the system that gets that money into their hands is slow, costly, and exclusionary:

- **Long queues and travel costs.** Many recipients — often elderly grandmothers ("grannies") caring for grandchildren — travel long distances to the nearest pay-point or ATM, queueing for hours.
- **High transaction fees.** Cash-out fees and middleman card systems quietly erode the value of a grant that's already tightly stretched.
- **Settlement delay.** Bank-rail payments can take days to clear, leaving both recipients and the local spaza shops that serve them in limbo.
- **Fraud and impersonation risk.** Without a verification step at the point of collection, grants are vulnerable to interception.

Ubuntu Pay rebuilds this flow from the ground up using **Interledger's Open Payments protocol** — settling grants instantly and directly into the till of a registered local spaza shop, with a one-time PIN that puts control back in the hands of the person the grant is actually for.

## What Ubuntu Pay Does

Ubuntu Pay is a three-sided payment platform connecting **government**, **beneficiaries**, and **local spaza shops**:

1. **Government authorises a batch grant.** SASSA pre-authorises a single Interledger payment grant covering the full beneficiary list for the month — one approval, not thousands of individual transactions.
2. **Beneficiaries are notified instantly.** The moment the batch is authorised, every beneficiary receives an SMS *and* a voice call — in their own language — telling them their grant is ready, which shop to visit, and a fresh one-time PIN (OTP) for that month.
3. **Beneficiaries collect at their local spaza shop.** No bank branch, no ATM queue, no long walk to a pay-point. The recipient brings their ID and OTP to a spaza shop already registered as a payment agent in their own neighbourhood.
4. **Money moves instantly over Interledger.** The shop owner enters the beneficiary's ID and OTP into Ubuntu Pay. On a correct match, funds move from the SASSA wallet straight into the shop's wallet via the Open Payments protocol — settled in seconds, not days.
5. **Every transaction is logged.** A live transaction feed gives full visibility into who was paid, where, and when — auditable by design.

## Why the OTP Matters

The OTP isn't decorative — it's the core trust mechanism that makes a phone-free, card-free payment safe to use in person at a local shop:

- A **new 4-digit OTP is generated for every beneficiary every time a grant batch is authorised** — last month's code never works again.
- The OTP is sent **only** to the beneficiary's own phone, by SMS and voice call, never displayed anywhere else in production.
- A shop cannot release funds without the correct OTP matched against the correct ID — stopping impersonation at the till, not after the fact.
- Because the OTP is single-use per grant cycle, even if a code is overheard or written down, it has no value once that month's grant is claimed.

## Reaching Everyone, in Their Own Language

South Africa has 12 official languages, and a grant system that only speaks English excludes the very people it's meant to serve. Every SMS and voice notification in Ubuntu Pay is sent in the beneficiary's registered home language:

| Language | Code |
|---|---|
| English | `en` |
| isiZulu | `zu` |
| isiXhosa | `xh` |
| Afrikaans | `af` |
| Sepedi (Northern Sotho) | `nso` |

This isn't a translation layer bolted on after the fact — language is a first-class field on every beneficiary record, and every message (SMS *and* voice script) is authored natively for that language, not machine-translated at send time.

## How It Works (Technical Overview)

```
┌─────────────┐      1. Authorise batch grant       ┌──────────────────┐
│   SASSA     │ ───────────────────────────────────► │  Ubuntu Pay      │
│ (Government)│                                       │  Server          │
└─────────────┘                                       └──────────────────┘
                                                              │
                                          2. Generate OTPs    │
                                          + notify via        ▼
                                          Infobip SMS/Voice  ┌──────────────────┐
                                                              │  Beneficiaries   │
                                                              │  (in 5 languages)│
                                                              └──────────────────┘
                                                                      │
                                                3. Visit spaza shop   │
                                                   with ID + OTP      ▼
┌──────────────┐    4. Verify ID + OTP match      ┌──────────────────┐
│ Spaza Shop   │ ◄─────────────────────────────── │  Ubuntu Pay      │
│ (Agent)      │                                   │  Server          │
└──────────────┘    5. Instant ILP settlement      └──────────────────┘
       ▲            via Interledger Open Payments
       └─────────────────────────────────────────────────────┘
```

**Core stack:**

- **Backend:** Node.js + Express
- **Payments rail:** [Interledger Open Payments](https://interledger.org/) — open, interoperable, currency-agnostic instant settlement between the SASSA wallet and each spaza shop's wallet
- **Notifications:** Infobip SMS + Text-to-Speech voice API, with per-beneficiary language routing
- **Frontend:** A single-page dashboard with three views — Government (batch authorisation + beneficiary roster), Spaza Portal (ID + OTP verification and claim flow), and Transactions (live, auditable payment feed)

**Key flows in the codebase:**

- `server.js` — beneficiary records, OTP generation, batch authorisation, and the claim/verification API
- `infobip.js` — multi-language SMS and voice notification templates and delivery
- `quikpay-transfer.js` — the underlying Interledger Open Payments grant and transfer logic
- `public/index.html` — the Government / Spaza Portal / Transactions dashboard

## Why This Matters

Ubuntu Pay isn't just a faster rail for moving money — it's a redesign of *where* and *how* a grant becomes spendable:

- **Dignity:** no queues, no travel, collection at a shop already trusted in the community.
- **Inclusion:** every notification reaches people in the language they actually speak at home.
- **Security:** a verification step that protects the beneficiary, not just the institution.
- **Local economic impact:** every grant collected at a spaza shop puts liquidity directly into that shop — and that neighbourhood — instead of routing it through a distant bank branch.
- **Auditability:** every transaction is logged and traceable, by design, not as an afterthought.

*Ubuntu* — "I am because we are." A grant system built on that principle should move money the way a community actually moves: locally, instantly, and with trust at the center.

## Running Ubuntu Pay Locally

```bash
npm install
npm run dev
```

This starts:
- The main Ubuntu Pay dashboard at `http://localhost:3000`
- An Interledger grant-approval callback listener at `http://localhost:3999`

> **Note for judges/reviewers:** this is a hackathon demo running against the Interledger **test network** (`ilp.interledger-test.dev`), with synthetic beneficiary data. No real grant funds, ID numbers, or phone numbers are used in this build.

---

Built with care for the people Ubuntu Pay is meant to serve.
