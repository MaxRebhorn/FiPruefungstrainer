import { describe, it, expect } from "vitest";
import { parseJSPreview } from "../jsPreviewParser";

describe("parseJSPreview", () => {
  it("extracts function declarations", () => {
    const code = `
function berechneZuzahlung(kosten, status) {
  return kosten * 0.1;
}
function sagHallo(name) {
  return "Hallo " + name;
}
`;
    const result = parseJSPreview(code);
    expect(result.functions).toHaveLength(2);
    expect(result.functions[0].name).toBe("berechneZuzahlung");
    expect(result.functions[0].params).toEqual(["kosten", "status"]);
    expect(result.functions[1].name).toBe("sagHallo");
    expect(result.functions[1].params).toEqual(["name"]);
  });

  it("extracts exported functions", () => {
    const code = "export function calculate(a, b) { return a + b; }";
    const result = parseJSPreview(code);
    expect(result.functions).toHaveLength(1);
    expect(result.functions[0].name).toBe("calculate");
  });

  it("extracts arrow functions", () => {
    const code = `
const add = (a, b) => a + b;
const greet = name => "Hi " + name;
let multiply = (x, y) => x * y;
`;
    const result = parseJSPreview(code);
    expect(result.functions).toHaveLength(3);
    expect(result.functions[0].name).toBe("add");
    expect(result.functions[0].params).toEqual(["a", "b"]);
    expect(result.functions[1].name).toBe("greet");
    expect(result.functions[1].params).toEqual(["name"]);
  });

  it("extracts class with methods", () => {
    const code = `
class Rechnung {
  constructor(nummer) {
    this.nummer = nummer;
  }
  addPosition(pos) {
    this.positionen.push(pos);
  }
  getSumme() {
    return this.positionen.length;
  }
}
`;
    const result = parseJSPreview(code);
    expect(result.classes).toHaveLength(1);
    expect(result.classes[0].name).toBe("Rechnung");
    expect(result.classes[0].methods).toHaveLength(3);
    expect(result.classes[0].methods[0].name).toBe("constructor");
    expect(result.classes[0].methods[0].params).toEqual(["nummer"]);
    expect(result.classes[0].methods[1].name).toBe("addPosition");
    expect(result.classes[0].methods[2].name).toBe("getSumme");
  });

  it("extracts exported classes", () => {
    const code = "export class Foo { bar() { return 1; } }";
    const result = parseJSPreview(code);
    expect(result.classes).toHaveLength(1);
    expect(result.classes[0].name).toBe("Foo");
  });

  it("extracts async methods", () => {
    const code = "class API { async fetch(url) { return null; } }";
    const result = parseJSPreview(code);
    expect(result.classes).toHaveLength(1);
    expect(result.classes[0].methods).toHaveLength(1);
    expect(result.classes[0].methods[0].name).toBe("fetch");
  });

  it("returns empty preview for empty code", () => {
    const result = parseJSPreview("");
    expect(result.functions).toEqual([]);
    expect(result.classes).toEqual([]);
  });

  it("returns empty preview for code without functions/classes", () => {
    const result = parseJSPreview("const x = 42; console.log(x);");
    expect(result.functions).toEqual([]);
    expect(result.classes).toEqual([]);
  });
});
