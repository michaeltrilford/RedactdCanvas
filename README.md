# Redactd Canvas for Codex

Redactd Canvas lets you prompt UI in Codex and send it directly to your active Redactd canvas on redactd.xyz. Ask Codex for a form, dashboard, pricing section, onboarding flow, or other interface, then open the returned Redactd link to keep editing.

## What You Need

- Codex with plugin support enabled.
- A Redactd account.
- A Redactd API key.

You can find your API key in Redactd at Profile > Settings or Team Settings > Account Settings > API Key.

## Add Redactd Canvas to Codex

### Option 1: Add from GitHub

In Codex, add this repository as a plugin marketplace:

```text
Source: michaeltrilford/RedactdCanvas
Git ref: main
Sparse paths:
.agents/plugins
plugins
```

The full GitHub URL also works: `https://github.com/michaeltrilford/RedactdCanvas.git`.

You can also add it from the Codex CLI:

```bash
codex plugin marketplace add michaeltrilford/RedactdCanvas
```

Then install the plugin named `Redactd Canvas`.

### Option 2: Add from a local checkout

1. Download or clone this repository to your computer.
2. Open Codex.
3. Add this repository as a plugin marketplace.
4. Install the plugin named `Redactd Canvas`.
5. Start a new Codex chat and ask Codex to create UI on your Redactd canvas.

When Codex needs to send the design to Redactd, it will ask for your Redactd API key. The key is used for that request so Redactd can add the generated UI to the correct workspace.

## Example Prompts

```text
Create a sign in form on my Redactd canvas.
```

```text
Add a dashboard layout with metrics, recent activity, and a filter bar.
```

```text
Create a three-tier pricing section for a SaaS product.
```

## How It Works

Redactd Canvas gives Codex a Redactd-aware design tool. Codex uses the included Redactd component knowledge to create valid UI, then queues the result to your active Redactd canvas.

After a successful request, Codex will return a Redactd canvas link. Open that link to review and continue editing the design in Redactd.

## Troubleshooting

If Codex cannot send UI to Redactd, check that:

- The `Redactd Canvas` plugin is installed and enabled in Codex.
- Your Redactd API key is correct.
- Your Redactd account has access to the workspace you want to update.
- You have an active internet connection.

For help, visit [redactd.xyz](https://redactd.xyz).
