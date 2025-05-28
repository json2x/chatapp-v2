/**
 * Type declarations for MathJax
 */
declare module 'mathjax' {
  export function init(config: Record<string, unknown>): Promise<unknown>;
}
