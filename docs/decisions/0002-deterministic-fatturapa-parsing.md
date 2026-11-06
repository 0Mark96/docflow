# 0002. Parse FatturaPA deterministically; use an LLM only for unstructured documents

- Status: accepted
- Date: 2026-11-06

## Context

Italian B2B invoices are exchanged as FatturaPA XML, a structured format with labelled fields (supplier, total, payment due date). Contracts, quotes and foreign invoices arrive as free-form PDFs or text with no common layout.

## Decision

- FatturaPA XML is parsed with an XML parser and mapped to the shared `ExtractedFields` schema. No LLM call.
- PDFs and text documents are processed by an LLM with structured output, validated with Zod.
- Every extracted value records its `source` (`parser` or `llm`), shown in the UI.

## Consequences

- Invoice data is exact, free and instant; AI cost and error rate apply only where they add value.
- Two extraction paths share one output schema, so the table and the chat do not care which path produced a value.
- The UI can tell the user which values are certain and which should be reviewed.

## Alternatives considered

- **LLM for every document:** simpler pipeline, but adds cost and a non-zero error rate to data that is already structured.
- **Rule-based extraction (regex/OCR templates) for PDFs:** breaks on every new layout; maintenance grows with the number of suppliers.
