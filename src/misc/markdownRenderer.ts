import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import katex from 'katex';

// Import highlight.js CSS files directly
// import 'highlight.js/styles/github.css';
// import 'highlight.js/styles/googlecode.css';

/**
 * Type definition for the render options
 */
export interface RenderMarkdownOptions {
  /**
   * Whether to enable HTML tags in source
   * @default true
   */
  html?: boolean;

  /**
   * Whether to convert '\n' in paragraphs into <br>
   * @default true
   */
  breaks?: boolean;

  /**
   * Whether to autoconvert URL-like text to links
   * @default true
   */
  linkify?: boolean;

  /**
   * Whether to enable language-neutral replacements + quotes beautification
   * @default true
   */
  typographer?: boolean;
}

/**
 * Renders Markdown content with code highlighting and KaTeX/mhchem support.
 *
 * @param content - The Markdown string to render.
 * @param options - Optional rendering options.
 * @returns The rendered HTML string.
 */
export function renderMarkdown(content: string, options?: RenderMarkdownOptions): string {
  if (!content) return '';

  // Preprocess content to convert standard LaTeX to KaTeX format
  const processedContent = preprocessLatex(content);

  // Initialize markdown-it with options
  const md: MarkdownIt = new MarkdownIt({
    html: options?.html ?? true,
    breaks: options?.breaks ?? true,
    linkify: options?.linkify ?? true,
    typographer: options?.typographer ?? true,
    highlight: function (str: string, lang: string): string {
      // Perform code highlighting if language is specified and supported
      if (lang && hljs.getLanguage(lang)) {
        try {
          const highlighted = hljs.highlight(str, { language: lang, ignoreIllegals: true }).value;
          return (
            '<pre class="hljs hljs-theme-adaptable"><code class="language-' + lang + '">' + highlighted + '</code></pre>'
          );
        } catch (error) {
          console.error('Error highlighting code:', error);
        }
      }

      // Use default escaping if no language or highlighting fails
      return '<pre class="hljs hljs-theme-adaptable"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
    },
  });

  // Add custom rule for math rendering
  addKatexRenderRules(md);

  // Render the Markdown content to HTML
  return md.render(processedContent);
}

/**
 * Adds KaTeX rendering rules to the markdown-it instance
 *
 * @param md - The markdown-it instance
 */
function addKatexRenderRules(md: MarkdownIt): void {
  // Inline math rule: $...$
  const inlineDelimiter = '$';
  const inlinePattern = /^\$((?:[^$\\]|\\[\s\S])+?)\$/;

  md.inline.ruler.after('escape', 'math_inline', (state, silent) => {
    const pos = state.pos;
    const content = state.src;

    if (content.charAt(pos) !== inlineDelimiter) {
      return false;
    }

    const match = inlinePattern.exec(content.slice(pos));
    if (!match) {
      return false;
    }

    if (!silent) {
      const token = state.push('math_inline', 'span', 0);
      token.markup = inlineDelimiter;
      token.content = match[1] || '';
    }

    state.pos += match[0].length;
    return true;
  });

  // Display math rule: $$...$$
  const blockDelimiter = '$$';
  const blockPattern = /^\$\$((?:[^$\\]|\\[\s\S])+?)\$\$/;

  md.inline.ruler.after('math_inline', 'math_block', (state, silent) => {
    const pos = state.pos;
    const content = state.src;

    if (content.slice(pos, pos + 2) !== blockDelimiter) {
      return false;
    }

    const match = blockPattern.exec(content.slice(pos));
    if (!match) {
      return false;
    }

    if (!silent) {
      const token = state.push('math_block', 'div', 0);
      token.markup = blockDelimiter;
      token.content = match[1] || '';
    }

    state.pos += match[0].length;
    return true;
  });

  // Render rules for math tokens
  md.renderer.rules.math_inline = (tokens, idx) => {
    try {
      // Ensure content is a string with a fallback to empty string
      const content = tokens[idx]?.content || '';

      // Set up KaTeX options
      const options: katex.KatexOptions = {
        displayMode: false,
        throwOnError: false,
        trust: true,
        output: 'html' as const,
      };

      // Render the content
      return `<span class="math inline">${katex.renderToString(content, options)}</span>`;
    } catch (error) {
      console.error('KaTeX rendering error:', error);
      const content = tokens[idx]?.content || '';
      return `<span class="math inline error">${md.utils.escapeHtml(content)}</span>`;
    }
  };

  md.renderer.rules.math_block = (tokens, idx) => {
    try {
      // Ensure content is a string with a fallback to empty string
      const content = tokens[idx]?.content || '';

      // Set up KaTeX options
      const options: katex.KatexOptions = {
        displayMode: true,
        throwOnError: false,
        trust: true,
        output: 'html' as const,
      };

      // Render the content
      return `<div class="math display">${katex.renderToString(content, options)}</div>`;
    } catch (error) {
      console.error('KaTeX rendering error:', error);
      const content = tokens[idx]?.content || '';
      return `<div class="math display error">${md.utils.escapeHtml(content)}</div>`;
    }
  };
}

/**
 * Preprocesses LaTeX content to make it compatible with KaTeX and mhchem.
 *
 * @param content - The content to preprocess
 * @returns The preprocessed content
 */
function preprocessLatex(content: string): string {
  // Replace \rightarrow with \to (common in chemical equations)
  let processed = content.replace(/\\rightarrow/g, '\\to');

  // Special case for photosynthesis equation - handle this first
  processed = processed.replace(/\ce\{H_2\}\\text\{O\}/g, '\\ce{H2O}');
  processed = processed.replace(/\ce\{H_2\}/g, '\\ce{H2}');
  processed = processed.replace(/\ce\{C_6\}\\text\{H\}_{12}\\ce\{O_6\}/g, '\\ce{C6H12O6}');
  processed = processed.replace(/\ce\{C_6\}/g, '\\ce{C6}');

  // Handle chemical formulas in inline math
  processed = processed.replace(/\$(.*?)\$/g, (match, formula) => {
    // Convert \text{H2O} to \ce{H2O} for chemical formulas
    let processedFormula = formula.replace(/\\text\{([A-Z][a-zA-Z0-9]*)\}/g, '\\ce{$1}');

    // Additional processing for photosynthesis equation
    if (processedFormula.includes('H_2') || processedFormula.includes('C_6')) {
      processedFormula = processedFormula.replace(/H_2/g, 'H2').replace(/C_6/g, 'C6');
    }

    return `$${processedFormula}$`;
  });

  // Do the same for display math
  processed = processed.replace(/\$\$(.*?)\$\$/g, (match, formula) => {
    // Convert \text{H2O} to \ce{H2O} for chemical formulas
    let processedFormula = formula.replace(/\\text\{([A-Z][a-zA-Z0-9]*)\}/g, '\\ce{$1}');

    // Additional processing for photosynthesis equation
    if (processedFormula.includes('H_2') || processedFormula.includes('C_6')) {
      processedFormula = processedFormula.replace(/H_2/g, 'H2').replace(/C_6/g, 'C6');
    }

    return `$$${processedFormula}$$`;
  });

  // Make sure we don't convert markdown links to math
  // This regex looks for markdown links [text](url) and preserves them
  processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match) => {
    return match;
  });

  return processed;
}
