/**
 * Server-side SVG Sanitizer for Cloudflare Worker
 * Strips dangerous tags, executable scripts, and event handlers.
 */
export function sanitizeSvgServer(rawSvg: string): { sanitized: string; isClean: boolean; warnings: string[] } {
  const warnings: string[] = [];

  if (!rawSvg || typeof rawSvg !== 'string') {
    return { sanitized: '', isClean: false, warnings: ['Empty SVG content'] };
  }

  if (!/<svg\b[^>]*>/i.test(rawSvg)) {
    return { sanitized: '', isClean: false, warnings: ['Invalid SVG: missing <svg> root element'] };
  }

  let cleaned = rawSvg;

  // 1. Strip <script>...</script>
  if (/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(cleaned)) {
    cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    warnings.push('Embedded <script> tags were stripped');
  }

  // 2. Strip dangerous elements
  const dangerousTags = ['foreignObject', 'iframe', 'object', 'embed', 'applet', 'meta', 'link'];
  for (const tag of dangerousTags) {
    const regex = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?<\\/${tag}>)?`, 'gi');
    if (regex.test(cleaned)) {
      cleaned = cleaned.replace(regex, '');
      warnings.push(`Dangerous <${tag}> elements were stripped`);
    }
  }

  // 3. Strip all on* attributes
  const onAttrRegex = /\s+on[a-z]+=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
  if (onAttrRegex.test(cleaned)) {
    cleaned = cleaned.replace(onAttrRegex, '');
    warnings.push('Event listener attributes (on*) were stripped');
  }

  // 4. Strip dangerous protocols
  const dangerousProtocols = /(href|xlink:href)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*'|"vbscript:[^"]*"|'vbscript:[^']*'|"data:text\/html[^"]*"|'data:text\/html[^']*')/gi;
  if (dangerousProtocols.test(cleaned)) {
    cleaned = cleaned.replace(dangerousProtocols, '$1=""');
    warnings.push('Malicious protocol links were neutralized');
  }

  return {
    sanitized: cleaned,
    isClean: warnings.length === 0,
    warnings,
  };
}
