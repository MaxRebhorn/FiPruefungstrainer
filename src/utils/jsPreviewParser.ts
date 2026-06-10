export interface FunctionInfo {
  name: string;
  params: string[];
  hasBody: boolean;
}

export interface ClassInfo {
  name: string;
  methods: FunctionInfo[];
}

export interface JSPreview {
  functions: FunctionInfo[];
  classes: ClassInfo[];
}

/**
 * Parse JavaScript starter code to extract function and class declarations.
 */
export function parseJSPreview(starterCode: string): JSPreview {
  const functions: FunctionInfo[] = [];
  const classes: ClassInfo[] = [];

  // Parse function declarations: function name(params) {
  const funcRegex = /(?:export\s+)?function\s+(\w+)\s*\(([^)]*)\)\s*\{?/g;
  let match: RegExpExecArray | null;
  while ((match = funcRegex.exec(starterCode)) !== null) {
    functions.push({
      name: match[1],
      params: match[2].split(",").map((p) => p.trim()).filter(Boolean),
      hasBody: true,
    });
  }

  // Parse arrow functions assigned to const/let/var: const name = (params) =>
  const arrowRegex = /(?:const|let|var)\s+(\w+)\s*=\s*(?:\(([^)]*)\)|(\w+))\s*=>/g;
  while ((match = arrowRegex.exec(starterCode)) !== null) {
    functions.push({
      name: match[1],
      params: (match[2] || match[3]).split(",").map((p) => p.trim()).filter(Boolean),
      hasBody: true,
    });
  }

  // Parse class declarations: class Name { ... }
  const classRegex = /(?:export\s+)?class\s+(\w+)\s*\{/g;
  while ((match = classRegex.exec(starterCode)) !== null) {
    const className = match[1];
    const methods: FunctionInfo[] = [];

    // Find the class body to extract methods
    const classStart = match.index;
    const fromIndex = starterCode.indexOf("{", classStart);
    if (fromIndex !== -1) {
      let depth = 1;
      let pos = fromIndex + 1;
      while (depth > 0 && pos < starterCode.length) {
        if (starterCode[pos] === "{") depth++;
        else if (starterCode[pos] === "}") depth--;
        pos++;
      }
      const classBody = starterCode.substring(fromIndex + 1, pos - 1);

      // Extract method definitions from class body
      const methodRegex = /(?:async\s+)?(\w+)\s*\(([^)]*)\)\s*\{/g;
      let m: RegExpExecArray | null;
      while ((m = methodRegex.exec(classBody)) !== null) {
        if (m[1] !== "constructor") {
          methods.push({
            name: m[1],
            params: m[2].split(",").map((p) => p.trim()).filter(Boolean),
            hasBody: true,
          });
        }
      }

      // Also extract constructor
      const ctorRegex = /constructor\s*\(([^)]*)\)\s*\{/;
      const ctorMatch = classBody.match(ctorRegex);
      if (ctorMatch) {
        methods.unshift({
          name: "constructor",
          params: ctorMatch[1].split(",").map((p) => p.trim()).filter(Boolean),
          hasBody: true,
        });
      }
    }

    classes.push({
      name: className,
      methods,
    });
  }

  return { functions, classes };
}
