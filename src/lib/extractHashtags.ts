const HASHTAG_REGEX = /#[\wáéíóúüñ]+/gi;

export function extractHashtags(content: string): string[] {
  const matches = content.match(HASHTAG_REGEX);
  return matches ? matches.map((tag) => tag.slice(1)) : [];
}
