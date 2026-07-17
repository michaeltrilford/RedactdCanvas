---
name: redactd-canvas-muibook
description: Create Muibook UI on an active Redactd canvas from Codex using the Muibook knowledge MCP or the Redactd Canvas plugin's bundled Muibook knowledge.
---

# Redactd Canvas: Muibook

Use this skill when the user asks Codex to create, add, send, or modify Muibook UI on a Redactd canvas.

## Knowledge Routing

Choose the available Muibook knowledge source before building the tree:

1. **Bundled Redactd knowledge:** If `get_redactd_component_knowledge` is available, call it with
   `format: "summary"`. Prefer this source in the full Redactd Canvas plugin because it matches the
   Muibook version supported by that Redactd release.
2. **Muibook MCP:** Otherwise, if the Muibook knowledge MCP is available, call its `start_here` tool
   first, then use its rules, compositions, component lookup, and dynamic attrs as needed.
3. **No knowledge source:** Do not invent components or props. Explain that either the Muibook
   knowledge MCP or the full Redactd Canvas plugin is required.

The Muibook MCP plus the Codex browser is sufficient for the lightweight browser-only workflow.
The Redactd Canvas MCP backend is optional unless the API fallback is needed.

## Transport Routing

Choose the transport before creating the UI:

1. **Codex browser:** If the Browser skill is available and Codex can access an already-open
   `redactd.xyz` canvas tab, use the browser paste workflow below. Do not ask for a Redactd API key.
2. **API:** Otherwise, if `create_redactd_recipe` is available, use it as the headless, automated,
   and non-browser fallback. It requires a Redactd API key.
3. **Unavailable:** If neither browser access nor `create_redactd_recipe` is available, explain that
   the user must open Redactd in the Codex browser or install the full Redactd Canvas plugin.

Do not call the API first when an accessible Redactd canvas is already open in the Codex browser.
The MCP server is intentionally API-only; browser availability is decided by the skill and the
Codex host.

## Shared Workflow

1. Select the knowledge source using Knowledge Routing above.
2. Build a Redactd component tree with `id`, `type`, `props`, and `children` on every node.
3. Follow either the Codex browser workflow or the API workflow.

## Codex Browser Workflow

1. Use the Browser skill and claim the already-open `redactd.xyz` tab. Do not open a duplicate tab.
2. Serialize the tree with `JSON.stringify(tree)` and write it to the browser tab clipboard.
3. Click the wider canvas background so the selected item is `Canvas`, not an individual component.
4. Open the canvas instance ellipsis menu and choose **Paste JSON**.
5. Verify the canvas shows the pasted structure and the `✓ Pasted` confirmation.
6. If the deployed canvas reports a component is not in its registry, treat that as version drift.
   Recompose that part from registered primitives only when the user wants compatibility with the
   currently deployed version.

Never use **Cut**, **Delete**, or **Copy for AI** as a substitute for **Paste JSON**. Preserve the
user's existing canvas content unless they explicitly asked to replace it.

## API Workflow

1. Call `create_redactd_recipe` with `{ "tree": ..., "open_canvas": true }`.
2. Tell the user the exact `canvas_url` returned by the tool. Do not rewrite it.

## API Auth

- Ask for an API key only after selecting the API workflow.
- If no API key is already available, ask the user for their Redactd API key and pass it as `apiKey`.
- Tell the user they can find it in Redactd at Profile > Settings or Team Settings > Account Settings > API Key.
- For automated or local development use, `REDACTD_API_KEY` in the plugin environment is also supported.
- Do not include `workspace_id`; Redactd resolves the active workspace from the API key.

## Tree Rules

- Use only component types and props from the selected Muibook knowledge source.
- Never invent Redactd component names, aliases, props, CSS tokens, or Material UI names.
- Do not send the tree directly as the request body. The tool sends `{ "tree": ..., "open_canvas": true }`.
- Root additions should usually use `Container` with `center: true` and `size: "medium"` unless the user asks for a fragment.
- Card content must be inside a direct child `CardBody`.
- Button and Link text belongs on the component props, not inside a child `Body`.
- Use documented spacing tokens such as `var(--space-300)` rather than raw token numbers.
- Avoid `Message` for inline helper text, form help, mid-content notes, or routine status copy. Use `FormMessage` inside forms, or `Body` with `variant: "info"` and an `_Icon` with `slot: "before"` for lightweight informational copy. Reserve `Message` for persistent page-level notices with a short heading and slotted body copy.

## Response

- Browser workflow: summarize what was pasted and confirm it is open on the canvas.
- API workflow with `ok: true`: summarize what was added and include `canvas_url`.
- API workflow with `ok: false`: show the returned `error` and `request_id`.
