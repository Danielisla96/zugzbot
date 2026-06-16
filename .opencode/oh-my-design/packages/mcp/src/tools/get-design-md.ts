import { z } from 'zod';
import { getReference, listReferenceIds } from '../data.js';

export const getDesignMdSchema = {
  id: z
    .string()
    .min(1)
    .describe('Reference id (e.g. "toss", "stripe", "linear"). Use list_references to discover ids.'),
};

const InputSchema = z.object(getDesignMdSchema);

export async function runGetDesignMd(input: z.infer<typeof InputSchema>) {
  let ref = getReference(input.id);
  
  // If not found, try a substring match or clean id match (e.g. "linear" -> "linear.app")
  if (!ref) {
    const known = listReferenceIds();
    const query = input.id.toLowerCase().trim();
    // Try exact matches after lowercasing
    let matchedId = known.find(k => k.toLowerCase() === query);
    if (!matchedId) {
      // Try resolving if query is a prefix or substring of a known id, or vice versa
      matchedId = known.find(k => k.toLowerCase().includes(query) || query.includes(k.toLowerCase()));
    }
    if (matchedId) {
      ref = getReference(matchedId);
    }
  }

  if (!ref) {
    const known = listReferenceIds();
    const hint = known.slice(0, 5).join(', ');
    throw new Error(
      `Unknown reference id "${input.id}". ${known.length} known. Examples: ${hint}. Use list_references to discover all ids.`,
    );
  }
  return {
    id: ref.id,
    frontmatter: ref.frontmatter,
    sections: ref.sections,
    content: ref.raw,
  };
}
