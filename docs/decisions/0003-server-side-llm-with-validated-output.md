# 0003. LLM calls server-side only, with schema-validated output

- Status: accepted
- Date: 2026-11-06

## Context

The product sends document text to a large language model (Anthropic Claude) for extraction and question answering. API keys must stay secret, costs must be controlled, and model output is probabilistic.

## Decision

- The model is called only from server code (Route Handlers, Server Actions) through a single module (`lib/ai/`), which holds model IDs, prompts and limits.
- Every response that feeds data or UI is validated against a Zod schema. Validation failures become explicit error states.
- Question answering is grounded: the model receives retrieved context only and must cite sources or state that the answer is not available.
- Prompt or model changes are evaluated against the eval set before merge.

## Consequences

- No key exposure in the browser; one place to change model, prompt or provider.
- Invalid or hallucinated structures never reach the database.
- An eval set must be maintained alongside the prompts.

## Alternatives considered

- **Calling the model from the browser:** exposes keys and bypasses cost and access control.
- **Free-text output parsed with regex:** fragile; structured output with schema validation is the supported approach.
