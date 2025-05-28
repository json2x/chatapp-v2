interface Window {
  MathJax: {
    typeset?: (elements: string[]) => void;
    startup?: {
      pageReady: () => void;
    };
    tex?: {
      inlineMath: [string, string][];
      displayMath: [string, string][];
      packages: Record<string, string[]>;
    };
    options?: {
      enableMenu: boolean;
      renderActions: Record<string, unknown>;
    };
  };
}
