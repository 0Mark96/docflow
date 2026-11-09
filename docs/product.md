# Product

## Target users

- **Primary:** Italian small and medium businesses (under 250 employees) with no in-house IT: accounting firms, agencies, service companies, workshops. The person using DocFlow is the owner, an office manager or an administrative employee.
- **Secondary:** departments of larger organizations that need the same capability with stricter requirements (roles, audit, data residency).

## Problems

1. Key information is buried in documents: finding a contract's end date or a quote's validity means opening files one by one.
2. Invoice and contract data is copied into spreadsheets by hand.
3. Keyword search fails when the document uses different words ("termina il" vs "scadenza").

## Core features (MVP)

| Feature | Description | Acceptance criterion |
|---|---|---|
| Home | First page: explains in plain words what DocFlow does, with a concrete example, and leads to the upload | A first-time visitor can say what the app is for after reading it |
| Document upload ("File caricati") | PDF, TXT and FatturaPA XML in private storage; list and document detail page | Uploaded documents are still listed after reload; going back from a document restores the list position |
| Structured extraction | Supplier, document type, amount, due date | FatturaPA: 100% field accuracy on the fixture set. Unstructured: ≥ 90% on the eval set |
| Data table ("Tabella dati") | Filter, sort and export (CSV) of extracted data, on its own page | Exported CSV matches the table; going back from a document restores filters, sort and position |
| Questions with sources | Chat over the uploaded documents | Every answer cites at least one document; out-of-scope questions get an explicit "not found" |

## Out of scope (MVP)

- Accounting or ERP features (payments, bookkeeping, sending invoices to SdI).
- OCR of handwritten documents.
- Editing documents.
- User accounts, login, multiple companies and roles (ADR 0004; planned after MVP, see roadmap).

## Quality and trust

- The UI always shows where a value came from (parser or AI) and links to the source document.
- AI-extracted values are marked as reviewable; the user can correct them, and corrections are stored.
- Accuracy is measured on a versioned evaluation set, not estimated.
