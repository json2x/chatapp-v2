/**
 * Utility functions for chat message rendering and interaction
 */

import DOMPurify from 'dompurify';
import { renderMarkdown } from '../misc/markdownRenderer';

/**
 * Interface for code block information
 */
export interface CodeBlock {
  language: string;
  code: string;
  element?: HTMLElement;
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html - The HTML content to sanitize
 * @returns Sanitized HTML content
 */
export function sanitizeHtml(html: string): string {
  // Configure DOMPurify to allow certain tags and attributes needed for markdown rendering
  const config = {
    ALLOWED_TAGS: [
      'p', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'a', 'img',
      'strong', 'em', 'del', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'hr', 'br', 'sup', 'sub'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'target', 'rel',
      'style', 'data-language'
    ],
    ALLOW_DATA_ATTR: true
  };

  return DOMPurify.sanitize(html, config);
}

/**
 * Renders a chat message with markdown, code highlighting, and LaTeX support
 * @param content - The message content to render
 * @returns Sanitized HTML content with rendered markdown
 */
export function renderChatMessage(content: string): string {
  if (!content) return '';
  
  // Render markdown content
  const renderedContent = renderMarkdown(content);
  
  // Sanitize the rendered HTML
  return sanitizeHtml(renderedContent);
}

/**
 * Extracts code blocks from a rendered message for adding copy buttons
 * @param element - The DOM element containing the rendered message
 * @returns Array of code blocks with language and content
 */
export function extractCodeBlocks(element: HTMLElement): CodeBlock[] {
  if (!element) return [];
  
  const codeBlocks: CodeBlock[] = [];
  const preElements = element.querySelectorAll('pre');
  
  preElements.forEach((preElement) => {
    const codeElement = preElement.querySelector('code');
    if (codeElement) {
      // Extract language from class (e.g., "language-javascript")
      const languageClass = Array.from(codeElement.classList).find(cls => cls.startsWith('language-'));
      const language = languageClass ? languageClass.replace('language-', '') : 'plaintext';
      
      codeBlocks.push({
        language,
        code: codeElement.textContent || '',
        element: preElement
      });
    }
  });
  
  return codeBlocks;
}

/**
 * Copies text to clipboard
 * @param text - The text to copy
 * @returns Promise that resolves when copying is complete
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy text:', error);
    return false;
  }
}

/**
 * Adds copy buttons to code blocks
 * @param codeBlocks - Array of code blocks to add copy buttons to
 * @param onCopy - Callback function to execute after copying
 */
export function addCopyButtons(codeBlocks: CodeBlock[], onCopy?: (success: boolean) => void): void {
  codeBlocks.forEach((block) => {
    if (!block.element) return;
    
    // Check if copy button already exists
    if (block.element.querySelector('.code-copy-button')) return;
    
    // Create copy button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'code-header';
    
    // Add language badge
    const languageBadge = document.createElement('span');
    languageBadge.className = 'code-language';
    languageBadge.textContent = block.language || 'plaintext';
    buttonContainer.appendChild(languageBadge);
    
    // Create copy button
    const copyButton = document.createElement('button');
    copyButton.className = 'code-copy-button';
    copyButton.innerHTML = '<i class="material-icons">content_copy</i>';
    copyButton.setAttribute('aria-label', 'Copy code');
    copyButton.title = 'Copy code';
    
    // Add click event to copy button
    copyButton.addEventListener('click', () => {
      // Use void to explicitly mark the promise as ignored
      void copyToClipboard(block.code).then((success) => {
        // Visual feedback
        copyButton.innerHTML = success ? 
          '<i class="material-icons">check</i>' : 
          '<i class="material-icons">error</i>';
        
        // Reset after 2 seconds
        setTimeout(() => {
          copyButton.innerHTML = '<i class="material-icons">content_copy</i>';
        }, 2000);
        
        // Execute callback if provided
        if (onCopy) onCopy(success);
      });
    });
    
    buttonContainer.appendChild(copyButton);
    
    // Insert the button container before the code block
    block.element.insertBefore(buttonContainer, block.element.firstChild);
  });
}

/**
 * Creates a collapsible section for long content
 * @param element - The DOM element to make collapsible
 * @param maxHeight - Maximum height before collapsing (in pixels)
 * @param threshold - Minimum content height to enable collapsing (in pixels)
 */
export function makeCollapsible(element: HTMLElement, maxHeight = 300, threshold = 400): void {
  if (!element || element.scrollHeight <= threshold) return;
  
  // Create wrapper with max-height
  element.classList.add('collapsible-content');
  element.style.maxHeight = `${maxHeight}px`;
  element.style.overflow = 'hidden';
  element.style.position = 'relative';
  
  // Add gradient overlay
  const overlay = document.createElement('div');
  overlay.className = 'collapse-overlay';
  element.appendChild(overlay);
  
  // Create expand button
  const expandButton = document.createElement('button');
  expandButton.className = 'expand-button';
  expandButton.textContent = 'Show more';
  expandButton.setAttribute('aria-expanded', 'false');
  
  // Add click event to expand button
  expandButton.addEventListener('click', () => {
    const isExpanded = element.classList.toggle('expanded');
    
    if (isExpanded) {
      element.style.maxHeight = 'none';
      expandButton.textContent = 'Show less';
      expandButton.setAttribute('aria-expanded', 'true');
      overlay.style.display = 'none';
    } else {
      element.style.maxHeight = `${maxHeight}px`;
      expandButton.textContent = 'Show more';
      expandButton.setAttribute('aria-expanded', 'false');
      overlay.style.display = 'block';
    }
  });
  
  // Add button after the element
  element.parentNode?.insertBefore(expandButton, element.nextSibling);
}
