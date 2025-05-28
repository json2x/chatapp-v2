import { describe, expect, test, beforeAll, vi } from 'vitest';
import { renderMarkdown } from '../markdownRenderer';

// Mock KaTeX to avoid actual rendering in tests
vi.mock('katex', () => ({
  default: {
    renderToString: vi.fn((content) => `<katex>${content}</katex>`)
  }
}));

// Mock dynamic import for mhchem
vi.mock('katex/dist/contrib/mhchem.js', () => ({}));

// Configure virtual modules
vi.mock('virtual:some-module', () => ({}));

describe('markdownRenderer', () => {
  beforeAll(() => {
    // Mock console.error to avoid polluting test output
    console.error = vi.fn();
  });

  describe('Basic Markdown rendering', () => {
    test('renders empty string', () => {
      expect(renderMarkdown('')).toBe('');
    });

    test('renders basic markdown', () => {
      const input = '# Heading\n\nThis is a paragraph with **bold** and *italic* text.';
      const output = renderMarkdown(input);
      
      expect(output).toContain('<h1>Heading</h1>');
      expect(output).toContain('<strong>bold</strong>');
      expect(output).toContain('<em>italic</em>');
    });

    test('renders links correctly', () => {
      const input = 'Visit [Google](https://www.google.com) or [Yahoo][1].\n\n[1]: https://www.yahoo.com';
      const output = renderMarkdown(input);
      
      expect(output).toContain('<a href="https://www.google.com">Google</a>');
      expect(output).toContain('<a href="https://www.yahoo.com">Yahoo</a>');
    });

    test('renders code blocks with syntax highlighting', () => {
      const input = '```javascript\nfunction greet(name) {\n  console.log(\'Hello, \' + name + \'!\');\n}\ngreet(\'World\');\n```';
      const output = renderMarkdown(input);
      
      expect(output).toContain('<pre class="hljs"><code class="language-javascript">');
      expect(output).toContain('function');
      expect(output).toContain('greet');
    });
  });

  describe('Mathematical expressions', () => {
    test('renders standard inline math', () => {
      const input = 'This is inline math: $E = mc^2$.';
      const output = renderMarkdown(input);
      
      expect(output).toContain('<span class="math inline"><katex>E = mc^2</katex></span>');
    });

    test('renders standard display math', () => {
      const input = 'This is display math: $$E = mc^2$$';
      const output = renderMarkdown(input);
      
      expect(output).toContain('<div class="math display"><katex>E = mc^2</katex></div>');
    });

    test('renders standard display math with LaTeX syntax', () => {
      const input = 'This is standard display math: $$E = mc^2 + \\alpha$$.';
      const output = renderMarkdown(input);
      
      expect(output).toContain('<div class="math display"><katex>E = mc^2 + \\alpha</katex></div>');
    });

    test('renders standard inline math with LaTeX syntax', () => {
      const input = 'This is standard inline math: $E = mc^2 + \\beta$.';
      const output = renderMarkdown(input);
      
      expect(output).toContain('<span class="math inline"><katex>E = mc^2 + \\beta</katex></span>');
    });

    test('handles arrow notation conversion', () => {
      const input = 'Implication: $A \\rightarrow B$.';
      const output = renderMarkdown(input);
      
      expect(output).toContain('<span class="math inline"><katex>A \\to B</katex></span>');
    });
  });

  describe('Chemical formulas and equations', () => {
    test('converts text notation to chemical equation format', () => {
      const input = 'Water is $\\text{H2O}$ and carbon dioxide is $\\text{CO}_2$.';
      const output = renderMarkdown(input);
      
      // The preprocessor should convert \text{H2O} to \ce{H2O}
      expect(output).toContain('<span class="math inline"><katex>');
      expect(output).toContain('\\ce{H2O}');
      expect(output).toContain('\\ce{CO}_2');
    });

    test('handles direct chemical equation notation', () => {
      const input = 'Ammonia is $\\ce{NH3}$.';
      const output = renderMarkdown(input);
      
      expect(output).toContain('<span class="math inline"><katex>\\ce{NH3}</katex></span>');
    });

    test('handles chemical reactions', () => {
      const input = 'A reaction: $$\\ce{2H2 + O2 -> 2H2O}$$';
      const output = renderMarkdown(input);
      
      expect(output).toContain('<div class="math display"><katex>\\ce{2H2 + O2 -> 2H2O}</katex></div>');
    });

    test('handles complex chemical formulas with subscripts', () => {
      const input = 'Glucose: $\\ce{C6H12O6}$';
      const output = renderMarkdown(input);
      
      expect(output).toContain('<span class="math inline"><katex>\\ce{C6H12O6}</katex></span>');
    });

    test('handles photosynthesis equation', () => {
      const input = '$ 6 \\, \\text{CO}_2 + 6 \\, \\ce{H_2}\\text{O} + \\text{light energy} \\to \\ce{C_6}\\text{H}_{12}\\ce{O_6} + 6 \\, \\ce{O_2} $';
      const output = renderMarkdown(input);
      
      // Verify the preprocessor correctly handles this complex equation
      expect(output).toContain('<span class="math inline"><katex>');
      // Just check if the content is processed and rendered
      expect(output).toContain('\\ce{H2}');
      expect(output).toContain('\\ce{C6}');
    });
  });

  describe('Mixed content', () => {
    test('handles mixed markdown and math content', () => {
      const input = '# Chemistry Notes\n\nWater ($\\ce{H2O}$) is essential for life.\n\n## Equations\n\n$$E = mc^2$$';
      const output = renderMarkdown(input);
      
      expect(output).toContain('<h1>Chemistry Notes</h1>');
      expect(output).toContain('<span class="math inline"><katex>\\ce{H2O}</katex></span>');
      expect(output).toContain('<div class="math display"><katex>E = mc^2</katex></div>');
    });

    test('handles markdown links and LLM math together', () => {
      const input = 'Check [this link](info.com) and also [E = mc^2].';
      const output = renderMarkdown(input);
      
      expect(output).toContain('info.com');
      expect(output).toContain('this link');
      expect(output).toContain('E = mc^2');
    });
  });

  describe('Complex LLM responses', () => {
    test('handles a typical AI explanation with math', () => {
      const input = `
# Understanding Quantum Mechanics

Quantum mechanics is governed by the Schrödinger equation:

$$i\\hbar\\frac{\\partial}{\\partial t}\\Psi(\\mathbf{r},t) = \\hat H\\Psi(\\mathbf{r},t)$$

Where:
- $\\Psi(\\mathbf{r},t)$ is the wave function
- $\\hbar$ is the reduced Planck constant
- $\\hat H$ is the Hamiltonian operator

For a particle in a box, the energy levels are quantized as:

$$E_n = \\frac{n^2\\pi^2\\hbar^2}{2mL^2}$$

Where $n$ is a positive integer, $m$ is the mass, and $L$ is the length of the box.
`;
      const output = renderMarkdown(input);
      
      expect(output).toContain('<h1>Understanding Quantum Mechanics</h1>');
      expect(output).toContain('<div class="math display"><katex>');
      expect(output).toContain('<span class="math inline"><katex>\\Psi(\\mathbf{r},t)</katex></span>');
    });

    test('handles a chemistry explanation with reactions', () => {
      const input = `
# Chemical Equilibrium

The equilibrium constant $K_c$ for the reaction:

$$\\ce{aA + bB <=> cC + dD}$$

is given by:

$$K_c = \\frac{[C]^c[D]^d}{[A]^a[B]^b}$$

For example, in the Haber process:

$$\\ce{N2(g) + 3H2(g) <=> 2NH3(g)}$$

The equilibrium constant is:

$$K_c = \\frac{[\\ce{NH3}]^2}{[\\ce{N2}][\\ce{H2}]^3}$$
`;
      const output = renderMarkdown(input);
      
      expect(output).toContain('<h1>Chemical Equilibrium</h1>');
      expect(output).toContain('<div class="math display"><katex>\\ce{aA + bB <=> cC + dD}</katex></div>');
      expect(output).toContain('<div class="math display"><katex>\\ce{N2(g) + 3H2(g) <=> 2NH3(g)}</katex></div>');
    });

    test('handles code examples with explanations', () => {
      const input = `
# Solving Quadratic Equations

The quadratic formula for solving $ax^2 + bx + c = 0$ is:

$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

Here's how to implement it in JavaScript:

\`\`\`javascript
function solveQuadratic(a, b, c) {
  const discriminant = b*b - 4*a*c;
  
  if (discriminant < 0) {
    return "No real solutions";
  } else if (discriminant === 0) {
    return [-b / (2*a)];
  } else {
    const x1 = (-b + Math.sqrt(discriminant)) / (2*a);
    const x2 = (-b - Math.sqrt(discriminant)) / (2*a);
    return [x1, x2];
  }
}

// Example: x² + 5x + 6 = 0
console.log(solveQuadratic(1, 5, 6)); // [-2, -3]
\`\`\`
`;
      const output = renderMarkdown(input);
      
      expect(output).toContain('<h1>Solving Quadratic Equations</h1>');
      expect(output).toContain('<span class="math inline"><katex>ax^2 + bx + c = 0</katex></span>');
      expect(output).toContain('<div class="math display"><katex>x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}</katex></div>');
      expect(output).toContain('<pre class="hljs"><code class="language-javascript">');
      expect(output).toContain('solveQuadratic');
    });
  });
});
