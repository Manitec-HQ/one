# ONE v1 Runtime

The v1 runtime can be implemented as a simple orchestration loop. The three agents may be prompt-defined roles inside one model; they do not need to be separate models or autonomous processes.

## Request loop

```text
User input
  -> input router
  -> three aspect prompts
  -> shared identity and memory context
  -> integration pass
  -> one unified response
```

## Runtime responsibilities

- Load the active being configuration.
- Load the three agent definitions.
- Apply shared identity and permitted memory.
- Collect the three perspective outputs.
- Ask the integration layer to resolve overlap or disagreement.
- Return one response as the created being.

## Separation rules

The setup guide, Mani, and any future guide voices are outside the created being by default.

The integration pass speaks for the user's being, not for ONE's product helpers or Joe's private beings.

## V1 simplification

Use mock or deterministic responses until the interface and data flow are proven. Keep provider calls behind a replaceable adapter so the first body can be tested without locking the product to one model provider.
