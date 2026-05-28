---
name: canvas
description: Create Redactd UI on the active Redactd canvas from Codex using bundled component knowledge and the Redactd canvas MCP tool.
---

# Canvas

Use this skill when the user asks Codex to create, add, send, or modify UI on a Redactd canvas.

## Workflow

1. If component details are needed, call `get_redactd_component_knowledge` with `format: "summary"`.
2. Build a Redactd component tree with `id`, `type`, `props`, and `children` on every node.
3. Call `create_redactd_recipe` with `{ "tree": ..., "open_canvas": true }`.
4. Tell the user the exact `canvas_url` returned by the tool. Do not rewrite it.

## Auth

- If no API key is already available, ask the user for their Redactd API key and pass it as `apiKey`.
- Tell the user they can find it in Redactd at Profile > Settings or Team Settings > Account Settings > API Key.
- For automated or local development use, `REDACTD_API_KEY` in the plugin environment is also supported.
- Do not include `workspace_id`; Redactd resolves the active workspace from the API key.

## Tree Rules

- Use only component types and props from the bundled Redactd knowledge.
- Never invent Redactd component names, aliases, props, CSS tokens, or Material UI names.
- Do not send the tree directly as the request body. The tool sends `{ "tree": ..., "open_canvas": true }`.
- Root additions should usually use `Container` with `center: true` and `size: "medium"` unless the user asks for a fragment.
- Card content must be inside a direct child `CardBody`.
- Button and Link text belongs on the component props, not inside a child `Body`.
- Use documented spacing tokens such as `var(--space-300)` rather than raw token numbers.
- Avoid `Message` for inline helper text, form help, mid-content notes, or routine status copy. Use `FormMessage` inside forms, or `Body` with `variant: "info"` and an `_Icon` with `slot: "before"` for lightweight informational copy. Reserve `Message` for persistent page-level notices with a short heading and slotted body copy.

## Response

- If the tool returns `ok: true`, summarize what was added and include `canvas_url`.
- If the tool returns `ok: false`, show the returned `error` and `request_id`.
