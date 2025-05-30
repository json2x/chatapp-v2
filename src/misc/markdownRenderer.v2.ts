import { ref, computed, Ref } from 'vue';
import DOMPurify from 'dompurify';

// AST Node Types
interface ASTNode {
  type: string;
  children?: ASTNode[];
  content?: string;
  attributes?: Record<string, string>;
  meta?: Record<string, any>;
}

interface HeadingNode extends ASTNode {
  type: 'heading';
  level: number;
  id?: string;
}

interface CodeBlockNode extends ASTNode {
  type: 'code_block';
  language?: string;
  code: string;
}

interface TableNode extends ASTNode {
  type: 'table';
  headers: string[];
  rows: string[][];
  alignment?: ('left' | 'center' | 'right')[];
}

interface MathNode extends ASTNode {
  type: 'math';
  inline: boolean;
  expression: string;
}

interface DiagramNode extends ASTNode {
  type: 'diagram';
  diagramType: 'mermaid';
  code: string;
}

interface TaskListNode extends ASTNode {
  type: 'task_list';
  items: { checked: boolean; content: string }[];
}

// Configuration interfaces
interface RenderOptions {
  sanitize?: boolean;
  allowRawHtml?: boolean;
  scopedCssPrefix?: string;
  syntaxHighlighter?: 'prism' | 'highlight' | 'none';
  vueRouterLinks?: boolean;
  lazyImages?: boolean;
  enableMath?: boolean;
  enableDiagrams?: boolean;
  headingIds?: boolean;
  tableClasses?: string;
  codeBlockClasses?: string;
}

interface CacheEntry {
  input: string;
  options: RenderOptions;
  output: string;
  timestamp: number;
}

// Plugin system
interface MarkdownPlugin {
  name: string;
  parse?: (tokens: Token[], options: RenderOptions) => ASTNode[];
  render?: (node: ASTNode, renderer: MarkdownRenderer) => string;
}

interface Token {
  type: string;
  raw: string;
  content?: string;
  meta?: Record<string, any>;
}

// Type for token parsing result
interface TokenParseResult {
  token: Token;
  nextIndex: number;
}

class MarkdownRenderer {
  private cache: Map<string, CacheEntry>;
  private cacheMaxSize: number;
  private cacheMaxAge: number;
  private plugins: MarkdownPlugin[];

  private defaultOptions: Required<RenderOptions>;

  constructor(options?: Partial<RenderOptions>) {
    this.cache = new Map<string, CacheEntry>();
    this.cacheMaxSize = 100;
    this.cacheMaxAge = 5 * 60 * 1000; // 5 minutes
    this.plugins = [];

    this.defaultOptions = {
      sanitize: true,
      allowRawHtml: false,
      scopedCssPrefix: 'md-',
      syntaxHighlighter: 'prism',
      vueRouterLinks: true,
      lazyImages: true,
      enableMath: true,
      enableDiagrams: true,
      headingIds: true,
      tableClasses: 'table table-striped',
      codeBlockClasses: 'code-block'
    };

    if (options) {
      this.defaultOptions = { ...this.defaultOptions, ...options };
    }
  }

  // Main rendering method
  renderMarkdown(markdownString: string, options?: RenderOptions): string {
    const finalOptions: Required<RenderOptions> = { ...this.defaultOptions, ...options };
    const cacheKey = this.getCacheKey(markdownString, finalOptions);
    
    // Check cache
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Tokenize
      const tokens = this.tokenize(markdownString);
      
      // Parse to AST
      const ast = this.parseTokensToAST(tokens, finalOptions);
      
      // Render to HTML
      let html = this.renderAST(ast, finalOptions);
      
      // Apply plugins
      html = this.applyPlugins(html, finalOptions);
      
      // Sanitize if enabled
      if (finalOptions.sanitize) {
        html = this.sanitizeHTML(html, finalOptions);
      }
      
      // Cache result
      this.setCache(cacheKey, html);
      
      return html;
    } catch (error) {
      console.error('Markdown rendering error:', error);
      return `<div class="${finalOptions.scopedCssPrefix}error">Error rendering markdown</div>`;
    }
  }

  // Vue 3 Composition API integration
  createReactiveRenderer(initialMarkdown = '', options?: RenderOptions): {
    markdown: Ref<string>;
    renderedHTML: Ref<string>;
    updateMarkdown: (newMarkdown: string) => void;
    updateOptions: (newOptions: Partial<RenderOptions>) => void;
  } {
    const markdown: Ref<string> = ref(initialMarkdown);
    const rendererOptions: Ref<RenderOptions> = ref(options || {});
    
    const renderedHTML = computed(() => {
      return this.renderMarkdown(markdown.value, rendererOptions.value);
    });

    const updateMarkdown = (newMarkdown: string): void => {
      markdown.value = newMarkdown;
    };

    const updateOptions = (newOptions: Partial<RenderOptions>): void => {
      rendererOptions.value = { ...rendererOptions.value, ...newOptions };
    };

    return {
      markdown,
      renderedHTML,
      updateMarkdown,
      updateOptions
    };
  }

  // Tokenization
  private tokenize(markdown: string): Token[] {
    const tokens: Token[] = [];
    const lines = markdown.split('\n');
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      
      // Code blocks (fenced)
      if (line.trim().startsWith('```')) {
        const result = this.parseCodeBlock(lines, i);
        tokens.push(result.token);
        i = result.nextIndex;
        continue;
      }

      // Math blocks
      if (line.trim().startsWith('$$')) {
        const result = this.parseMathBlock(lines, i);
        tokens.push(result.token);
        i = result.nextIndex;
        continue;
      }

      // Tables
      if (this.isTableRow(line)) {
        const result = this.parseTable(lines, i);
        tokens.push(result.token);
        i = result.nextIndex;
        continue;
      }

      // Headings
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        tokens.push({
          type: 'heading',
          raw: line,
          content: headingMatch[2].trim(),
          meta: { level: headingMatch[1].length }
        });
        i++;
        continue;
      }

      // Blockquotes
      if (line.trim().startsWith('>')) {
        const result = this.parseBlockquote(lines, i);
        tokens.push(result.token);
        i = result.nextIndex;
        continue;
      }

      // Lists
      if (this.isListItem(line)) {
        const result = this.parseList(lines, i);
        tokens.push(result.token);
        i = result.nextIndex;
        continue;
      }

      // Horizontal rule
      if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
        tokens.push({
          type: 'horizontal_rule',
          raw: line
        });
        i++;
        continue;
      }

      // Paragraph or empty line
      if (line.trim() === '') {
        i++;
        continue;
      }

      // Regular paragraph
      const result = this.parseParagraph(lines, i);
      tokens.push(result.token);
      i = result.nextIndex;
    }

    return tokens;
  }

  // Code block parsing
  private parseCodeBlock(lines: string[], startIndex: number): TokenParseResult {
    const startLine = lines[startIndex];
    const langMatch = startLine.match(/^```(\w+)?/);
    const language = langMatch?.[1] || '';
    
    let endIndex = startIndex + 1;
    const codeLines: string[] = [];
    
    while (endIndex < lines.length && !lines[endIndex].trim().startsWith('```')) {
      codeLines.push(lines[endIndex]);
      endIndex++;
    }
    
    return {
      token: {
        type: 'code_block',
        raw: lines.slice(startIndex, endIndex + 1).join('\n'),
        content: codeLines.join('\n'),
        meta: { language }
      },
      nextIndex: endIndex + 1
    };
  }

  // Math block parsing
  private parseMathBlock(lines: string[], startIndex: number): TokenParseResult {
    let endIndex = startIndex + 1;
    const mathLines: string[] = [];
    
    while (endIndex < lines.length && !lines[endIndex].trim().startsWith('$$')) {
      mathLines.push(lines[endIndex]);
      endIndex++;
    }
    
    return {
      token: {
        type: 'math',
        raw: lines.slice(startIndex, endIndex + 1).join('\n'),
        content: mathLines.join('\n'),
        meta: { inline: false }
      },
      nextIndex: endIndex + 1
    };
  }

  // Table parsing
  private parseTable(lines: string[], startIndex: number): TokenParseResult {
    const tableLines: string[] = [];
    let i = startIndex;
    
    // Parse header
    tableLines.push(lines[i++]);
    
    // Parse separator (required)
    if (i < lines.length && this.isTableSeparator(lines[i])) {
      tableLines.push(lines[i++]);
    }
    
    // Parse rows
    while (i < lines.length && this.isTableRow(lines[i])) {
      tableLines.push(lines[i++]);
    }
    
    const headers = this.parseTableRow(tableLines[0]);
    const alignment = this.parseTableAlignment(tableLines[1]);
    const rows = tableLines.slice(2).map(line => this.parseTableRow(line));
    
    return {
      token: {
        type: 'table',
        raw: tableLines.join('\n'),
        meta: { headers, rows, alignment }
      },
      nextIndex: i
    };
  }

  // Blockquote parsing
  private parseBlockquote(lines: string[], startIndex: number): TokenParseResult {
    const quoteLines: string[] = [];
    let i = startIndex;
    
    while (i < lines.length && (lines[i].trim().startsWith('>') || lines[i].trim() === '')) {
      quoteLines.push(lines[i].replace(/^>\s?/, ''));
      i++;
    }
    
    return {
      token: {
        type: 'blockquote',
        raw: lines.slice(startIndex, i).join('\n'),
        content: quoteLines.join('\n')
      },
      nextIndex: i
    };
  }

  // List parsing
  private parseList(lines: string[], startIndex: number): TokenParseResult {
    const listItems: string[] = [];
    let i = startIndex;
    const firstLine = lines[i];
    const isOrdered = /^\d+\./.test(firstLine.trim());
    const isTaskList = /^[\s]*[-*+]\s+\[[ x]\]/.test(firstLine);
    
    while (i < lines.length && this.isListItem(lines[i])) {
      const match = lines[i].match(/^[\s]*(?:\d+\.|\-|\*|\+)\s+(.*)$/);
      if (match) {
        listItems.push(match[1]);
      }
      i++;
    }
    
    return {
      token: {
        type: isTaskList ? 'task_list' : (isOrdered ? 'ordered_list' : 'unordered_list'),
        raw: lines.slice(startIndex, i).join('\n'),
        meta: { items: listItems, isTaskList }
      },
      nextIndex: i
    };
  }

  // Paragraph parsing
  private parseParagraph(lines: string[], startIndex: number): TokenParseResult {
    const paragraphLines: string[] = [];
    let i = startIndex;
    
    while (i < lines.length && 
           lines[i].trim() !== '' && 
           !this.isSpecialLine(lines[i])) {
      paragraphLines.push(lines[i]);
      i++;
    }
    
    return {
      token: {
        type: 'paragraph',
        raw: paragraphLines.join('\n'),
        content: paragraphLines.join(' ')
      },
      nextIndex: i
    };
  }

  // AST parsing
  private parseTokensToAST(tokens: Token[], options: RenderOptions): ASTNode[] {
    return tokens.map(token => this.tokenToASTNode(token, options));
  }

  private tokenToASTNode(token: Token, options: RenderOptions): ASTNode {
    switch (token.type) {
      case 'heading': {
        if (!token.content || !token.meta?.level) {
          return {
            type: 'heading',
            content: token.content || '',
            meta: { level: 1 }
          } as HeadingNode;
        }
        return {
          type: 'heading',
          content: token.content,
          meta: { 
            level: token.meta.level, 
            id: this.generateHeadingId(token.content) 
          }
        } as HeadingNode;
      }

      case 'code_block': {
        if (!token.content) {
          return {
            type: 'code_block',
            content: '',
            meta: { language: token.meta?.language || '' }
          } as unknown as CodeBlockNode;
        }
        return {
          type: 'code_block',
          content: token.content,
          meta: { language: token.meta?.language || '' }
        } as unknown as CodeBlockNode;
      }

      case 'math': {
        if (!token.content) {
          return {
            type: 'math',
            content: '',
            meta: { inline: token.meta?.inline || false }
          } as unknown as MathNode;
        }
        return {
          type: 'math',
          content: token.content,
          meta: { inline: token.meta?.inline || false }
        } as unknown as MathNode;
      }

      case 'table': {
        return {
          type: 'table',
          meta: token.meta || { headers: [], rows: [], alignment: [] }
        } as TableNode;
      }

      case 'task_list': {
        const items = token.meta?.items ? this.parseTaskListItems(token.meta.items) : [];
        return {
          type: 'task_list',
          meta: { items }
        } as TaskListNode;
      }

      default:
        return {
          type: token.type,
          content: token.content || '',
          meta: token.meta || {}
        };
    }
  }

  // HTML rendering
  private renderAST(ast: ASTNode[], options: RenderOptions): string {
    return ast.map(node => this.renderNode(node, options)).join('\n');
  }

  private renderNode(node: ASTNode, options: RenderOptions): string {
    const prefix = options.scopedCssPrefix || '';

    switch (node.type) {
      case 'heading': {
        const headingNode = node as HeadingNode;
        const level = headingNode.meta?.level || 1;
        const id = options.headingIds && headingNode.meta?.id ? ` id="${headingNode.meta.id}"` : '';
        const content = headingNode.content || '';
        return `<h${level}${id} class="${prefix}heading ${prefix}h${level}">${this.renderInlineText(content)}</h${level}>`;
      }

      case 'paragraph': {
        const content = node.content || '';
        return `<p class="${prefix}paragraph">${this.renderInlineText(content)}</p>`;
      }

      case 'code_block': {
        const codeNode = node as unknown as CodeBlockNode;
        const langClass = codeNode.meta?.language ? ` language-${codeNode.meta.language}` : '';
        const content = codeNode.content || '';
        return `<div class="${prefix}code-block ${options.codeBlockClasses || ''}"><pre><code class="${prefix}code${langClass}">${this.escapeHtml(content)}</code></pre></div>`;
      }

      case 'math': {
        const mathNode = node as unknown as MathNode;
        const content = mathNode.content || '';
        const isInline = mathNode.meta?.inline || false;
        return this.renderMath(content, isInline, options);
      }

      case 'table': {
        return this.renderTable(node as TableNode, options);
      }

      case 'task_list': {
        return this.renderTaskList(node as TaskListNode, options);
      }

      case 'blockquote': {
        const content = node.content || '';
        return `<blockquote class="${prefix}blockquote">${this.renderInlineText(content)}</blockquote>`;
      }

      case 'unordered_list': {
        if (!node.meta?.items) {
          return `<ul class="${prefix}list ${prefix}unordered-list"></ul>`;
        }
        
        const ulItems = node.meta.items.map((item: string) => 
          `<li class="${prefix}list-item">${this.renderInlineText(item)}</li>`
        ).join('');
        return `<ul class="${prefix}list ${prefix}unordered-list">${ulItems}</ul>`;
      }

      case 'ordered_list': {
        if (!node.meta?.items) {
          return `<ol class="${prefix}list ${prefix}ordered-list"></ol>`;
        }
        
        const olItems = node.meta.items.map((item: string) => 
          `<li class="${prefix}list-item">${this.renderInlineText(item)}</li>`
        ).join('');
        return `<ol class="${prefix}list ${prefix}ordered-list">${olItems}</ol>`;
      }

      case 'horizontal_rule': {
        return `<hr class="${prefix}horizontal-rule">`;
      }

      default: {
        const content = node.content || '';
        return `<div class="${prefix}unknown">${this.escapeHtml(content)}</div>`;
      }
    }
  }

  // Inline text rendering (bold, italic, links, etc.)
  private renderInlineText(text: string): string {
    if (!text) return '';
    
    // Math inline
    text = text.replace(/\$([^$]+)\$/g, (match, expression) => {
      return this.renderMath(expression, true, this.defaultOptions);
    });

    // Bold
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Italic
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    text = text.replace(/_(.*?)_/g, '<em>$1</em>');

    // Strikethrough
    text = text.replace(/~~(.*?)~~/g, '<del>$1</del>');

    // Inline code
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Links
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
      return this.renderLink(linkText, url);
    });

    // Images
    text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
      return this.renderImage(alt, src);
    });

    return text;
  }

  // Specialized renderers
  private renderMath(expression: string, inline: boolean, options: RenderOptions): string {
    if (!options.enableMath) {
      return inline ? `$${expression}$` : `$$\n${expression}\n$$`;
    }

    const prefix = options.scopedCssPrefix || '';
    const className = inline ? `${prefix}math-inline` : `${prefix}math-block`;
    
    // In a real implementation, you'd integrate KaTeX here
    return `<span class="${className}" data-math="${this.escapeHtml(expression)}">${this.escapeHtml(expression)}</span>`;
  }

  private renderTable(tableNode: TableNode, options: RenderOptions): string {
    const prefix = options.scopedCssPrefix || '';
    const tableData = tableNode.meta || { headers: [], rows: [], alignment: [] };
    const headers = tableData.headers || [];
    const rows = tableData.rows || [];
    const alignment = tableData.alignment || [];
    
    const headerCells = headers.map((header: string, index: number) => {
      const align = alignment[index] ? ` style="text-align: ${alignment[index]}"` : '';
      return `<th class="${prefix}table-header"${align}>${this.renderInlineText(header)}</th>`;
    }).join('');

    const bodyRows = rows.map((row: string[]) => {
      const cells = row.map((cell: string, index: number) => {
        const align = alignment[index] ? ` style="text-align: ${alignment[index]}"` : '';
        return `<td class="${prefix}table-cell"${align}>${this.renderInlineText(cell)}</td>`;
      }).join('');
      return `<tr class="${prefix}table-row">${cells}</tr>`;
    }).join('');

    return `
      <table class="${prefix}table ${options.tableClasses || ''}">
        <thead class="${prefix}table-head">
          <tr class="${prefix}table-row">${headerCells}</tr>
        </thead>
        <tbody class="${prefix}table-body">
          ${bodyRows}
        </tbody>
      </table>
    `;
  }

  private renderTaskList(taskListNode: TaskListNode, options: RenderOptions): string {
    const prefix = options.scopedCssPrefix || '';
    const taskData = taskListNode.meta || { items: [] };
    const items = taskData.items || [];
    
    const listItems = items.map((item: { checked: boolean; content: string }) => {
      const checked = item.checked ? ' checked' : '';
      return `
        <li class="${prefix}task-item">
          <input type="checkbox" class="${prefix}task-checkbox"${checked} disabled>
          <span class="${prefix}task-content">${this.renderInlineText(item.content)}</span>
        </li>
      `;
    }).join('');

    return `<ul class="${prefix}task-list">${listItems}</ul>`;
  }

  private renderLink(text: string, url: string): string {
    const sanitizedUrl = this.sanitizeUrl(url);
    const isInternal = url.startsWith('#') || url.startsWith('/');
    
    if (this.defaultOptions.vueRouterLinks && isInternal) {
      return `<router-link to="${sanitizedUrl}">${text}</router-link>`;
    }
    
    const target = isInternal ? '' : ' target="_blank" rel="noopener noreferrer"';
    return `<a href="${sanitizedUrl}"${target}>${text}</a>`;
  }

  private renderImage(alt: string, src: string): string {
    const sanitizedSrc = this.sanitizeUrl(src);
    const prefix = this.defaultOptions.scopedCssPrefix || '';
    
    if (this.defaultOptions.lazyImages) {
      return `<img class="${prefix}image" src="" data-src="${sanitizedSrc}" alt="${this.escapeHtml(alt)}" loading="lazy">`;
    }
    
    return `<img class="${prefix}image" src="${sanitizedSrc}" alt="${this.escapeHtml(alt)}">`;
  }

  // Utility methods
  private isTableRow(line: string): boolean {
    return line.trim().includes('|');
  }

  private isTableSeparator(line: string): boolean {
    return /^\s*\|?[\s:|-]+\|?[\s:|-]*$/.test(line);
  }

  private isListItem(line: string): boolean {
    return /^[\s]*(?:\d+\.|\-|\*|\+)\s+/.test(line);
  }

  private isSpecialLine(line: string): boolean {
    return /^(#{1,6}\s|>\s|\s*[-*+]\s|\s*\d+\.\s|```|\$\$|---|\*\*\*|___)/.test(line);
  }

  private parseTableRow(row: string): string[] {
    return row.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
  }

  private parseTableAlignment(separator: string): ('left' | 'center' | 'right')[] {
    return separator.split('|').map(cell => {
      const trimmed = cell.trim();
      if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center';
      if (trimmed.endsWith(':')) return 'right';
      return 'left';
    });
  }

  private parseTaskListItems(items: string[]): { checked: boolean; content: string }[] {
    return items.map(item => {
      const match = item.match(/^\[([x ])\]\s*(.*)$/);
      if (match) {
        return {
          checked: match[1] === 'x',
          content: match[2]
        };
      }
      return { checked: false, content: item };
    });
  }

  private generateHeadingId(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }

  private escapeHtml(text: string): string {
    // SSR-safe implementation
    if (typeof document === 'undefined') {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
    
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private sanitizeUrl(url: string): string {
    // SSR-safe implementation
    if (typeof window === 'undefined') {
      // Simple check for javascript: protocol
      if (/^javascript:/i.test(url)) {
        return '#';
      }
      return url;
    }
    
    try {
      const parsed = new URL(url, window.location.origin);
      if (parsed.protocol === 'javascript:' || parsed.protocol === 'data:') {
        return '#';
      }
      return url;
    } catch {
      return '#';
    }
  }

  private sanitizeHTML(html: string, options: RenderOptions): string {
    const config = {
      ALLOWED_TAGS: options.allowRawHtml 
        ? ['p', 'br', 'strong', 'em', 'u', 'del', 'code', 'pre', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'div', 'span', 'router-link']
        : ['p', 'br', 'strong', 'em', 'u', 'del', 'code', 'pre', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'div', 'span', 'router-link'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'id', 'to', 'data-src', 'data-math', 'style', 'target', 'rel', 'loading', 'type', 'checked', 'disabled'],
      ALLOW_DATA_ATTR: true
    };

    return DOMPurify.sanitize(html, config);
  }

  // Caching
  private getCacheKey(markdown: string, options: RenderOptions): string {
    // Use a safer approach than btoa for SSR compatibility
    try {
      return typeof btoa !== 'undefined' 
        ? btoa(markdown + JSON.stringify(options))
        : Buffer.from(markdown + JSON.stringify(options)).toString('base64');
    } catch (e) {
      // Fallback to a simple hash if encoding fails
      return `key_${markdown.length}_${JSON.stringify(options).length}`;
    }
  }

  private getFromCache(key: string): string | null {
    const entry = this.cache.get(key);
    if (entry && Date.now() - entry.timestamp < this.cacheMaxAge) {
      return entry.output;
    }
    if (entry) {
      this.cache.delete(key);
    }
    return null;
  }

  private setCache(key: string, output: string): void {
    if (this.cache.size >= this.cacheMaxSize) {
      // Get the oldest entry (first inserted)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    
    this.cache.set(key, {
      input: '',
      options: {},
      output,
      timestamp: Date.now()
    });
  }

  // Plugin system
  addPlugin(plugin: MarkdownPlugin): void {
    this.plugins.push(plugin);
  }

  removePlugin(pluginName: string): void {
    this.plugins = this.plugins.filter(p => p.name !== pluginName);
  }

  private applyPlugins(html: string, options: RenderOptions): string {
    return this.plugins.reduce((currentHtml, plugin) => {
      if (plugin.render) {
        // Plugin would need access to AST for proper implementation
        return currentHtml;
      }
      return currentHtml;
    }, html);
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getCacheStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.cacheMaxSize,
      hitRate: 0 // Would need to track hits/misses for real implementation
    };
  }
}

// Export for Vue 3 usage
export { MarkdownRenderer, type RenderOptions, type MarkdownPlugin };

// Example usage with Vue 3 Composition API:
/*
import { MarkdownRenderer } from './markdown-renderer';
import { ref, computed } from 'vue';

const renderer = new MarkdownRenderer({
  scopedCssPrefix: 'my-app-',
  syntaxHighlighter: 'prism',
  vueRouterLinks: true
});

// In a component:
export default {
  setup() {
    const { markdown, renderedHTML, updateMarkdown } = renderer.createReactiveRenderer(`
# Hello World

This is **bold** and *italic* text.

- [x] Completed task
- [ ] Pending task

\`\`\`javascript
console.log('Hello World!');
\`\`\`

| Name | Age |
|------|-----|
| John | 25  |
| Jane | 30  |

$$E = mc^2$$
    `);

    return {
      markdown,
      renderedHTML,
      updateMarkdown
    };
  }
};
*/