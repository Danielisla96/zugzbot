import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  loadAllReferences,
  getReference,
  getDisplayName,
  summarize,
  DATA_DIR,
  listReferenceIds,
} from './data.js';
import { listReferencesSchema, runListReferences } from './tools/list-references.js';
import { getDesignMdSchema, runGetDesignMd } from './tools/get-design-md.js';
import { searchByVibeSchema, runSearchByVibe } from './tools/search-by-vibe.js';
import {
  designFromRefSchema,
  buildDesignFromRefPrompt,
} from './prompts/design-from-ref.js';

export const SERVER_NAME = 'oh-my-design-mcp';
export const SERVER_VERSION = '0.1.0';

function jsonContent(value: unknown) {
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(value, null, 2),
      },
    ],
  };
}

function errorContent(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  return {
    isError: true,
    content: [{ type: 'text' as const, text: `Error: ${msg}` }],
  };
}

export function createServer(): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  // -------- Tools --------
  server.registerTool(
    'list_references',
    {
      title: 'List brand design references',
      description:
        'List all brand design systems available. Filter by country (KR/US/JP/...), category (ecommerce/fintech/saas/...), or whether the brand publishes an official design system. Returns id+name+meta for each — use get_design_md to fetch full content.',
      inputSchema: listReferencesSchema,
    },
    async (args) => {
      try {
        return jsonContent(await runListReferences(args));
      } catch (e) {
        return errorContent(e);
      }
    },
  );

  server.registerTool(
    'get_design_md',
    {
      title: 'Fetch a brand DESIGN.md',
      description:
        "Fetch the full DESIGN.md content for a specific brand reference. Returns canonical 15-section design system spec (Visual Theme & Atmosphere, Color Palette, Typography, Components, ..., Voice & Tone, Personas, Motion). Use this when the user asks 'build UI like <brand>' or 'extract <brand>'s design tokens'.",
      inputSchema: getDesignMdSchema,
    },
    async (args) => {
      try {
        return jsonContent(await runGetDesignMd(args));
      } catch (e) {
        return errorContent(e);
      }
    },
  );

  server.registerTool(
    'search_by_vibe',
    {
      title: 'Find brands by vibe',
      description:
        "Find brand references that match a mood/vibe description. Examples: 'calm B2B fintech', 'playful kids app', 'editorial newspaper'. Returns top-5 (configurable) brands with reasoning. Use this when the user describes what they want but doesn't name a specific brand.",
      inputSchema: searchByVibeSchema,
    },
    async (args) => {
      try {
        return jsonContent(await runSearchByVibe(args));
      } catch (e) {
        return errorContent(e);
      }
    },
  );

  server.registerTool(
    'get_html_previews',
    {
      title: 'Fetch HTML preview examples for a brand',
      description:
        'Fetch preview HTML templates, interactive catalogs, and component examples (e.g. preview.html, preview-dark.html) for a specific brand reference. This contains actual responsive HTML/CSS structures and layouts that can be reused directly by the coder.',
      inputSchema: {
        id: z
          .string()
          .min(1)
          .describe('Reference id (e.g. "linear.app", "vercel", "stripe").'),
        previewType: z
          .enum(['light', 'dark', 'readme', 'all'])
          .optional()
          .default('all')
          .describe('Type of preview content to fetch: "light" (preview.html), "dark" (preview-dark.html), "readme" (README.md), or "all" (all available files).'),
      },
    },
    async (args: any) => {
      try {
        // Dynamically resolve ID
        const known = listReferenceIds();
        const query = args.id.toLowerCase().trim();
        let matchedId = known.find(k => k.toLowerCase() === query);
        if (!matchedId) {
          matchedId = known.find(k => k.toLowerCase().includes(query) || query.includes(k.toLowerCase()));
        }
        if (!matchedId) {
          throw new Error(`Unknown reference id "${args.id}"`);
        }

        const fs = await import('node:fs');
        const path = await import('node:path');
        const brandDir = path.join(DATA_DIR, matchedId);
        
        const result: Record<string, string> = {};
        
        const filesToRead: Array<{ name: string; key: string }> = [];
        if (args.previewType === 'light' || args.previewType === 'all') {
          filesToRead.push({ name: 'preview.html', key: 'lightHtml' });
        }
        if (args.previewType === 'dark' || args.previewType === 'all') {
          filesToRead.push({ name: 'preview-dark.html', key: 'darkHtml' });
        }
        if (args.previewType === 'readme' || args.previewType === 'all') {
          filesToRead.push({ name: 'README.md', key: 'readme' });
        }

        for (const file of filesToRead) {
          const filePath = path.join(brandDir, file.name);
          if (fs.existsSync(filePath)) {
            result[file.key] = fs.readFileSync(filePath, 'utf8');
          }
        }

        return jsonContent({
          id: matchedId,
          availableFiles: fs.readdirSync(brandDir).filter(f => f !== 'DESIGN.md' && !f.startsWith('.')),
          ...result
        });
      } catch (e) {
        return errorContent(e);
      }
    }
  );

  // -------- Resources --------
  // Each reference is exposed at design://<id> (e.g. design://toss).
  // We register a list callback per-id so the resource appears in resources/list,
  // and the read callback returns the raw markdown.
  const refs = loadAllReferences();
  for (const ref of refs.values()) {
    const uri = `design://${ref.id}`;
    const name = getDisplayName(ref);
    const description = summarize(ref) || `DESIGN.md for ${name}`;
    server.registerResource(
      ref.id,
      uri,
      {
        title: `${name} — DESIGN.md`,
        description,
        mimeType: 'text/markdown',
      },
      async (resourceUri) => {
        const r = getReference(ref.id);
        if (!r) {
          throw new Error(`Reference ${ref.id} not found`);
        }
        return {
          contents: [
            {
              uri: resourceUri.href,
              mimeType: 'text/markdown',
              text: r.raw,
            },
          ],
        };
      },
    );
  }

  // -------- Prompts --------
  server.registerPrompt(
    'design_from_ref',
    {
      title: 'Build UI in the style of a brand',
      description:
        'Primes the agent to build UI in the style of a specific brand reference. Injects Visual Theme, Color, Typography, and Voice sections from the brand DESIGN.md.',
      argsSchema: designFromRefSchema,
    },
    (args) => {
      const text = buildDesignFromRefPrompt(args);
      return {
        messages: [
          {
            role: 'user' as const,
            content: { type: 'text' as const, text },
          },
        ],
      };
    },
  );

  return server;
}
