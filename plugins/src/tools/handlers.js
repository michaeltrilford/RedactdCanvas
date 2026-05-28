import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_ENDPOINT = 'https://redactd.xyz/.netlify/functions/recipes-create';
const PLUGIN_ROOT = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const KNOWLEDGE_PATH = join(PLUGIN_ROOT, 'assets', 'muibook-gpt-knowledge.json');

let cachedKnowledge = null;

async function readKnowledge() {
  cachedKnowledge ??= JSON.parse(await readFile(KNOWLEDGE_PATH, 'utf8'));
  return cachedKnowledge;
}

function normalizeApiKey(value) {
  let normalized = typeof value === 'string' ? value.trim() : '';
  while (/^Bearer\s+/i.test(normalized)) {
    normalized = normalized.replace(/^Bearer\s+/i, '').trim();
  }
  return normalized || null;
}

function normalizeTreeNode(value, path = 'tree') {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${path} must be an object.`);
  }

  const type = typeof value.type === 'string' ? value.type.trim() : '';
  if (!type) throw new Error(`${path}.type must be a non-empty string.`);

  const props = value.props && typeof value.props === 'object' && !Array.isArray(value.props)
    ? value.props
    : {};

  const rawChildren = value.children === undefined || value.children === null ? [] : value.children;
  if (!Array.isArray(rawChildren)) throw new Error(`${path}.children must be an array when provided.`);

  return {
    id:
      typeof value.id === 'string' && value.id.trim()
        ? value.id.trim()
        : `codex_${type.toLowerCase()}_${randomUUID().slice(0, 8)}`,
    type,
    ...(typeof value.slot === 'string' && value.slot.trim() ? { slot: value.slot.trim() } : {}),
    props,
    children: rawChildren.map((child, index) => normalizeTreeNode(child, `${path}.children[${index}]`))
  };
}

function makeKnowledgeSummary(knowledge) {
  const system = typeof knowledge.system === 'string' ? knowledge.system : '';
  const componentSection = system.split('Available Components:')[1]?.split('SPACING VALUES:')[0]?.trim() || '';
  const examples = knowledge.examples && typeof knowledge.examples === 'object'
    ? Object.keys(knowledge.examples)
    : [];

  return {
    rules: system.split('\n\nAvailable Components:')[0]?.trim() || system.slice(0, 4000),
    availableComponents: componentSection,
    exampleNames: examples
  };
}

function formatCreateResponse(response) {
  if (!response || typeof response !== 'object') return 'Redactd returned an empty response.';

  if (response.ok === false) {
    return [
      'Redactd did not queue the command.',
      '',
      `Error: ${response.error || 'Unknown error'}`,
      response.request_id ? `Request ID: ${response.request_id}` : null
    ]
      .filter(Boolean)
      .join('\n');
  }

  const lines = [
    'Done.',
    '',
    response.message || 'I added the requested UI to your Redactd canvas.'
  ];

  if (response.canvas_url) {
    lines.push('', 'Open it here:', response.canvas_url, '', 'This command will run once, then expire.');
  }

  return lines.join('\n');
}

export async function callTool(name, args) {
  if (name === 'get_redactd_component_knowledge') {
    const knowledge = await readKnowledge();
    const format = args.format === 'full' ? 'full' : 'summary';
    const data = format === 'full' ? knowledge : makeKnowledgeSummary(knowledge);

    return {
      displayText: JSON.stringify(data, null, 2),
      data
    };
  }

  if (name === 'create_redactd_recipe') {
    const apiKey = normalizeApiKey(args.apiKey) || normalizeApiKey(process.env.REDACTD_API_KEY);
    if (!apiKey) {
      throw new Error(
        'Missing Redactd API key. Pass apiKey to create_redactd_recipe or set REDACTD_API_KEY in the plugin environment.'
      );
    }

    const endpoint =
      typeof args.endpoint === 'string' && args.endpoint.trim() ? args.endpoint.trim() : DEFAULT_ENDPOINT;
    const tree = normalizeTreeNode(args.tree);
    const openCanvas = args.open_canvas === undefined ? true : Boolean(args.open_canvas);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        tree,
        open_canvas: openCanvas
      })
    });

    let data;
    try {
      data = await response.json();
    } catch {
      const text = await response.text();
      throw new Error(`Redactd returned non-JSON response (${response.status}): ${text.slice(0, 500)}`);
    }

    if (!response.ok && data.ok !== false) {
      throw new Error(`Redactd request failed with HTTP ${response.status}.`);
    }

    return {
      displayText: formatCreateResponse(data),
      data
    };
  }

  throw new Error(`Unknown tool: ${name}`);
}
