# 0008. Data minimization towards AI providers

- Status: accepted
- Date: 2026-11-11

## Context

Customers upload invoices, contracts and quotes. These documents contain personal data of third parties (names, addresses, tax codes, IBANs) and commercial data. Under the GDPR the customer is the data controller, DocFlow is a data processor, and every external service that receives the data (Anthropic, the embeddings provider, Supabase, Vercel) is a sub-processor.

Anonymizing documents before extraction is not an option: supplier, amounts and dates are the very data the model must extract. Protection therefore comes from sending as little as possible, keeping nothing extra, and being able to delete everything.

## Decision

- **What leaves the system.** An AI provider receives only the document text needed for the task: the text of one document for extraction, the retrieved chunks and the question for answers. User emails, file names, storage paths, company and user identifiers are never sent.
- **FatturaPA never reaches a model** (ADR 0002). A test asserts that the extraction path for XML makes no AI call.
- **No document content in logs.** Server logs, error reports and cost logging record identifiers, token counts, durations and error codes only, never prompts, document text or model output.
- **Provider terms.** Each AI provider is used through its commercial API under a data processing agreement, with no use of customer data for training and the shortest available retention. The terms in force are checked on the provider's site and recorded in the sub-processor list before production.
- **Deletion is complete.** Deleting a document removes the file in Storage, its `extracted_fields` row and its `document_chunks` (embeddings included). A test asserts that no related row or file remains.
- **Sub-processor list.** A public page lists who processes the data, for what, and where (Supabase EU region, AI providers), linked from the login page.
- **Masking in chat context (optional).** IBANs and tax codes may be replaced by placeholders in the chunks sent for answers; decided in M4 with the answer evals, since masking can lower answer quality.

## Consequences

- A customer's question "what do you send outside, and to whom?" has a written answer.
- Debugging relies on identifiers and on reproducing the issue with synthetic fixtures, not on reading production content in logs.
- Adding a new external service means adding it to the sub-processor list in the same pull request.
- Contracts with customers (DPA) and the privacy notice are a legal task, reviewed by a privacy advisor before the first real customer.

## Alternatives considered

- **Anonymizing documents before extraction:** removes the fields to be extracted.
- **Self-hosted open-weight model:** no third-party sub-processor, but higher cost and operational load and lower extraction quality for an MVP; reconsidered if a customer requires on-premise processing.
- **No AI, rules and templates only:** works for FatturaPA (already parsed) but not for free-form PDFs and contracts.
