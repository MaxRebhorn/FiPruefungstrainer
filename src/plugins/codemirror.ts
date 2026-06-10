import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { basicSetup } from "codemirror";
import { sql, SQLite } from "@codemirror/lang-sql";
import { javascript } from "@codemirror/lang-javascript";

export function createCodeMirror(
  container: HTMLElement,
  options: {
    doc?: string;
    lang: "sql" | "javascript";
    onChange?: (value: string) => void;
  }
): EditorView {
  const lang =
    options.lang === "sql"
      ? sql({ dialect: SQLite })
      : javascript();

  const extensions = [
    basicSetup,
    lang,
    EditorView.theme({
      "&": {
        fontSize: "14px",
        fontFamily:
          '"JetBrains Mono", "Fira Code", "Courier New", monospace',
      },
      ".cm-scroller": {
        fontFamily:
          '"JetBrains Mono", "Fira Code", "Courier New", monospace',
      },
    }),
  ];

  if (options.onChange) {
    extensions.push(
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          options.onChange!(update.state.doc.toString());
        }
      })
    );
  }

  const state = EditorState.create({
    doc: options.doc || "",
    extensions,
  });

  const view = new EditorView({
    state,
    parent: container,
  });

  // dev-mode helper for e2e tests
  if (import.meta.env.DEV) {
    (window as any).__cmEditors = (window as any).__cmEditors || [];
    (window as any).__cmEditors.push(view);
  }

  return view;
}
