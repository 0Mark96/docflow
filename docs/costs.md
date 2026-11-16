# Costs and plans

Status: **working estimate**. Volumes and token counts are assumptions, not measurements. Replace them with measured values once cost and token logging exists (roadmap M7). Provider prices change: check the provider pages before relying on a number.

## 1. Who pays whom

- The customer (a company) pays DocFlow a subscription.
- DocFlow pays its providers: the AI provider, the embeddings provider, Supabase and Vercel.
- Customers never hold an AI API key. The AI cost per customer is part of DocFlow's price and is tracked per company (M7).

## 2. Cost drivers

| Driver | Billed by | Scales with |
|---|---|---|
| Extraction of PDF and TXT documents | AI provider, per token | Number of unstructured documents and their length |
| Chat answers | AI provider, per token | Number of questions and size of the retrieved context |
| Embeddings (M4) | Embeddings provider | Number and length of documents |
| Database, Storage, Auth | Supabase plan | Stored data and active users |
| Hosting | Vercel plan | Traffic and team seats |

FatturaPA XML is parsed by code (ADR 0002) and has no AI cost.

## 3. AI price points used for the estimate

Per million tokens, from the provider's public pricing page, read on 2026-11-12:

| Model | Input | Output |
|---|---|---|
| Haiku 5.5 | $0.10 | $0.50 |
| Sonnet 5.5 | $2 | $10 |
| Opus 5.5 | $4 | $20 |

Assumption for one extraction or one chat answer: about 3,000 input tokens and 300 output tokens.

| Per call | Haiku | Sonnet | Opus |
|---|---|---|---|
| One extraction or one answer | $0.0005 | $0.009 | $0.018 |

## 4. Example: one mid-sized company

Assumed monthly volume: 2,000 documents, 70% FatturaPA XML (no AI), so 600 unstructured documents, plus 1,000 chat questions. That is 1,600 AI calls.

| Item | Monthly cost |
|---|---|
| AI, Sonnet 5.5 | about $15 |
| AI, Haiku 5.5 | below $1 |
| Embeddings | a few dollars |
| Supabase paid plan | fixed, shared by all customers (check current price) |
| Vercel paid plan | fixed, shared by all customers (check current price) |

At this volume AI is a small share of the price. The larger recurring costs are support, security, compliance and development.

## 5. Evaluation runs

One run over a 30-document eval set costs about $0.014 with Haiku and $0.27 with Sonnet. Twenty runs during development: about $0.27 and $5.40. Evals run in CI only on pull requests that change prompts, model IDs or the extraction schema (architecture §5).

## 6. Cost controls

- A monthly spend limit on the AI provider account, always set before a public deployment.
- Per-company limits on documents and questions (M7).
- Token logging per company, with identifiers and counts only, never content (ADR 0008).
- The smallest model that meets the eval thresholds for extraction; a larger model only where answers need it.
- Prompt caching for repeated context (M7).
- A fake AI provider behind `lib/ai/` for development, tests and demos, so they need no API key and cost nothing. Evals use the real model.

## 7. Pricing models to choose from

- Tiers by monthly document volume, with a price per extra block of documents.
- Flat fee per company with fair-use limits.
- Per-document price, simplest to explain, harder to predict for the customer.

The choice is a commercial decision and is not made in this document.

## 8. Larger customers

A customer with its own cloud agreement may ask to run the model in its own account or region (for example the same model family through a cloud marketplace in the EU). The single AI module (ADR 0003) keeps that change small. A change of provider needs a new ADR and a new eval run.
