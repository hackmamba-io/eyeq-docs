// tools/extract-headers.ts
// Strict, no implicit any, Node 18+.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

/**
 * Fumadocs MDX Generator — Full-stack C Headers → MDX
 * ---------------------------------------------------
 * CONFIG-IN-CODE VERSION (no CLI flags)
 *
 * ⚠️Note: Your extracted header file only works for Doxygen-style comments e.g it doesn't read #define, #ifdef, #endif only comment block.
 * 
 * How to use:
 * 1) Set INPUT_ROOTS and OUTPUT_ROOTS below.
 *    - One OUT + many INs  → all inputs mirror into that single output
 *    - Pairwise mapping     → INPUT_ROOTS.length === OUTPUT_ROOTS.length
 * 2) Optional: set ASSETS_DIR for copied images/snippets; DEFINES for preprocessor.
 * 3) Run: ts-node tools/extract-headers.ts
 *
 * Examples (edit the arrays below):
 *  - Single in → single out:
 *      INPUT_ROOTS = ["headers"]
 *      OUTPUT_ROOTS = ["content/docs/api-reference"]
 *
 *  - Multiple inputs → one output:
 *      INPUT_ROOTS  = ["headers", "vendor/include"]
 *      OUTPUT_ROOTS = ["content/docs/api-reference"]
 *
 *  - Pairwise (A→X, B→Y):
 *      INPUT_ROOTS  = ["headers", "vendor/include"]
 *      OUTPUT_ROOTS = ["content/docs/core", "content/docs/vendor-api"]
 */

// ============================================================================
// Project Configuration (edit these)
// ============================================================================
const INPUT_ROOTS: string[] = [
  "headers",
];

const OUTPUT_ROOTS: string[] = [
  "content/docs/api-reference",
  // "content/docs/vendor-api",
];

const ASSETS_DIR: string = "content/docs/_assets";
const DEFINES: string[] = [
  // "API_EXPORT", "PLATFORM_POSIX"
];
const FAIL_ON_WARN: boolean = false;

// ============================================================================
// Types & Data Model
// ============================================================================
type Category =
  | "file"
  | "macro-const"
  | "macro-fn"
  | "typedef"
  | "callback-typedef"
  | "enum"
  | "struct"
  | "union"
  | "function"
  | "group"
  | "page";

type Doc = {
  brief?: string;
  description?: string;
  params: { name: string; desc: string }[];
  returns?: string;
  errors: string[];
  since?: string;
  deprecated?: string;
  notes: string[];
  warnings: string[];
  todos: string[];
  bugs: string[];
  see: string[]; // ref labels or text
  example?: string;
  assets: { kind: "image" | "include" | "snippet"; src: string; alt?: string; label?: string }[];
  tagsRaw: Record<string, string[]>;
  isInternal?: boolean; // @internal
  // For groups/pages:
  page?: { id: string; title: string; isMain: boolean } | null;
  groupDefs: { id: string; title: string }[];
  groupAdd: { id: string; title?: string }[];
  groupIn: { id: string }[];
  unresolvedCopydoc: { ref: string }[];
};

type BaseEntry = {
  category: Category;
  name: string;
  anchor: string;
  fileRel: string; // input-relative (for provenance)
  fromDocblock: boolean;
  doc: Doc;
  signature?: string;
  warnings: string[];
};

type FnEntry = BaseEntry & {
  category: "function";
  signature: string;
  paramsParsed: { name: string; type: string }[];
};

type MacroConstEntry = BaseEntry & {
  category: "macro-const";
  value?: string;
};

type MacroFnEntry = BaseEntry & {
  category: "macro-fn";
  signature: string;
  paramsParsed: { name: string; type: string }[];
};

type TypedefEntry = BaseEntry & {
  category: "typedef" | "callback-typedef";
  typedef: string;
};

type EnumEntry = BaseEntry & {
  category: "enum";
  enumerators: { name: string; value?: string; brief?: string }[];
};

type StructUnionEntry = BaseEntry & {
  category: "struct" | "union";
  members: { name: string; type: string; brief?: string }[][];
} extends never
  ? never
  : BaseEntry & {
      category: "struct" | "union";
      members: { name: string; type: string; brief?: string }[];
    };

type FileEntry = BaseEntry & { category: "file" };
type GroupEntry = BaseEntry & { category: "group" };
type PageEntry = BaseEntry & { category: "page"; pageId: string; pageTitle: string };

type AnyEntry =
  | FnEntry
  | MacroConstEntry
  | MacroFnEntry
  | TypedefEntry
  | EnumEntry
  | StructUnionEntry
  | FileEntry
  | GroupEntry
  | PageEntry;

type GeneratedPage = {
  fileRel: string; // header-relative path (e.g., net/http.h) used for mdx path
  mdx: string;
  entries: AnyEntry[];
};

type SymbolIndex = Map<string /* symbol key */, AnyEntry>;

// Stable IDs model
type StableIds = {
  // key = fileRel + "::" + name + "::" + category
  [key: string]: string /* stable anchor id */;
};

// ============================================================================
// Utilities
// ============================================================================
const MDX_ESCAPE_LT_GT = (s: string) => s.replace(/</g, "&lt;").replace(/>/g, "&gt;");
const SLUG = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function ensureDir(p: string): void {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}
function read(file: string): string {
  return fs.readFileSync(file, "utf8");
}
function write(file: string, data: string): void {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, data, "utf8");
}
function sha1(s: string): string {
  return crypto.createHash("sha1").update(s).digest("hex");
}

// Stable anchor id from ids.json or new
function makeStableKey(fileRel: string, name: string, category: Category): string {
  return `${fileRel}::${name}::${category}`;
}
function getStableAnchor(
  ids: StableIds,
  fileRel: string,
  name: string,
  category: Category,
  proposed: string
): { anchor: string; changedFrom?: string } {
  const key = makeStableKey(fileRel, name, category);
  const existing = ids[key];
  if (existing) return { anchor: existing };
  const fresh = `${SLUG(`${category}-${name}`)}-${sha1(key).slice(0, 8)}`;
  ids[key] = fresh;
  if (fresh !== proposed) return { anchor: fresh, changedFrom: proposed };
  return { anchor: fresh };
}
function mapPairings(ins: string[], outs: string[]): string[] {
  if (ins.length === 0) throw new Error("No INPUT_ROOTS configured.");
  if (!(outs.length === 1 || outs.length === ins.length)) {
    throw new Error("Invalid in/out mapping: use one OUT for all INs, or match counts 1:1.");
  }
  return outs.length === 1 ? ins.map(() => outs[0]) : outs.slice();
}

// ============================================================================
// Preprocessor (light) — allowlist symbols only
// ============================================================================
function preprocess(source: string, defines: Set<string>): string {
  const lines = source.split(/\r?\n/);
  const out: string[] = [];

  type Frame = { active: boolean; seenTrue: boolean; kind: "#if" | "#ifdef" | "#ifndef" };
  const stack: Frame[] = [];

  const isActive = () => stack.every((f) => f.active);

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const m = raw.match(/^\s*#\s*(if|ifdef|ifndef|elif|else|endif)(.*)$/);
    if (m) {
      const directive = m[1];
      const rest = m[2]?.trim() ?? "";

      if (directive === "ifdef") {
        const sym = rest.replace(/\s+/g, " ");
        const cond = defines.has(sym);
        stack.push({ active: isActive() && cond, seenTrue: cond, kind: "#ifdef" });
        continue;
      }
      if (directive === "ifndef") {
        const sym = rest.replace(/\s+/g, " ");
        const cond = !defines.has(sym);
        stack.push({ active: isActive() && cond, seenTrue: cond, kind: "#ifndef" });
        continue;
      }
      if (directive === "if") {
        const symMatch = rest.match(/^\s*(!)?\s*([A-Za-z_]\w*)\s*$/);
        let cond = false;
        if (symMatch) {
          const neg = !!symMatch[1];
          const sym = symMatch[2];
          cond = defines.has(sym);
          if (neg) cond = !cond;
        }
        stack.push({ active: isActive() && cond, seenTrue: cond, kind: "#if" });
        continue;
      }
      if (directive === "elif") {
        if (!stack.length) continue;
        const top = stack[stack.length - 1];
        if (top.kind !== "#if") continue;
        if (top.seenTrue) {
          top.active = false;
        } else {
          const symMatch = rest.match(/^\s*(!)?\s*([A-Za-z_]\w*)\s*$/);
          let cond = false;
          if (symMatch) {
            const neg = !!symMatch[1];
            const sym = symMatch[2];
            cond = defines.has(sym);
            if (neg) cond = !cond;
          }
          top.active = isActive() && cond;
          top.seenTrue = cond;
        }
        continue;
      }
      if (directive === "else") {
        if (!stack.length) continue;
        const top = stack[stack.length - 1];
        top.active = isActive() && !top.seenTrue;
        top.seenTrue = top.seenTrue || top.active;
        continue;
      }
      if (directive === "endif") {
        stack.pop();
        continue;
      }
    }

    if (isActive()) out.push(raw);
    else out.push(""); // preserve line numbers
  }

  return out.join("\n");
}

// ============================================================================
// Comment stripping & signature cleaning
// ============================================================================
function stripBlockComments(s: string): string {
  return s.replace(/\/\*[\s\S]*?\*\//g, "");
}
function stripLineComments(s: string): string {
  return s.replace(/\/\/.*$/gm, "");
}
function stripAllComments(s: string): string {
  return stripLineComments(stripBlockComments(s));
}
function cleanSignature(sig: string): string {
  return stripAllComments(sig).replace(/\s+/g, " ").trim();
}
function funcName(signature: string): string {
  return signature.match(/\b([A-Za-z_]\w*)\s*\(/)?.[1] ?? "";
}

// ============================================================================
// Doxygen Docblock Parser (extended)
// ============================================================================
function parseDocblock(raw: string): Doc {
  const lines = raw.split("\n").map((l) => l.replace(/^\s*\*\s?/, "").trim());

  const doc: Doc = {
    params: [],
    errors: [],
    notes: [],
    warnings: [],
    todos: [],
    bugs: [],
    see: [],
    tagsRaw: {},
    unresolvedCopydoc: [],
    groupDefs: [],
    groupAdd: [],
    groupIn: [],
    page: null,
    assets: [],
  };

  const prose: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("@brief")) doc.brief = line.replace("@brief", "").trim();
    else if (line.startsWith("@param")) {
      const m = line.match(/@param\s+(?:\[\s*(?:in|out|in,\s*out)\s*\]\s+)?(\w+)\s+(.*)$/i);
      if (m) doc.params.push({ name: m[1], desc: m[2] });
    } else if (/@returns?/.test(line)) {
      doc.returns = line.replace(/@returns?/, "").trim();
    } else if (line.startsWith("@error")) {
      doc.errors.push(line.replace("@error", "").trim());
    } else if (line.startsWith("@since")) {
      doc.since = line.replace("@since", "").trim();
    } else if (line.startsWith("@deprecated")) {
      doc.deprecated = line.replace("@deprecated", "").trim();
    } else if (line.startsWith("@note")) {
      doc.notes.push(line.replace("@note", "").trim());
    } else if (line.startsWith("@warning")) {
      doc.warnings.push(line.replace("@warning", "").trim());
    } else if (line.startsWith("@todo")) {
      doc.todos.push(line.replace("@todo", "").trim());
    } else if (line.startsWith("@bug")) {
      doc.bugs.push(line.replace("@bug", "").trim());
    } else if (line.startsWith("@see")) {
      const v = line.replace("@see", "").trim();
      if (v) doc.see.push(v);
    } else if (line.startsWith("@example")) {
      const ex: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("@")) {
        ex.push(lines[i]);
        i++;
      }
      i--;
      const exText = ex.join("\n").trim();
      if (exText) doc.example = exText;
    } else if (line.startsWith("@image")) {
      const m = line.match(/^@image\s+\w+\s+(\S+)(?:\s+(.*))?$/);
      if (m) doc.assets.push({ kind: "image", src: m[1], alt: m[2]?.trim() });
    } else if (line.startsWith("@include")) {
      const m = line.match(/^@include\s+(.+)$/);
      if (m) doc.assets.push({ kind: "include", src: m[1].trim() });
    } else if (line.startsWith("@snippet")) {
      const m = line.match(/^@snippet\s+(.+?)(?:\s+(.*))?$/);
      if (m) doc.assets.push({ kind: "snippet", src: m[1].trim(), label: m[2]?.trim() });
    } else if (line.startsWith("@internal")) {
      doc.isInternal = true;
    } else if (line.startsWith("@copydoc")) {
      const ref = line.replace("@copydoc", "").trim();
      if (ref) doc.unresolvedCopydoc.push({ ref });
    } else if (line.startsWith("@defgroup")) {
      const m = line.match(/^@defgroup\s+(\S+)\s+(.*)$/);
      if (m) doc.groupDefs.push({ id: m[1], title: m[2] ?? m[1] });
    } else if (line.startsWith("@addtogroup")) {
      const m = line.match(/^@addtogroup\s+(\S+)(?:\s+(.*))?$/);
      if (m) doc.groupAdd.push({ id: m[1], title: m[2] });
    } else if (line.startsWith("@ingroup")) {
      const m = line.match(/^@ingroup\s+(\S+)$/);
      if (m) doc.groupIn.push({ id: m[1] });
    } else if (line.startsWith("@page")) {
      const m = line.match(/^@page\s+(\S+)\s+(.*)$/);
      if (m) doc.page = { id: m[1], title: m[2], isMain: true };
    } else if (line.startsWith("@")) {
      const m = line.match(/^@(\w+)\s*(.*)$/);
      if (m) {
        const tag = m[1];
        const val = m[2]?.trim() ?? "";
        doc.tagsRaw[tag] = doc.tagsRaw[tag] ?? [];
        doc.tagsRaw[tag].push(val);
      }
    } else if (line) {
      prose.push(line);
    }
  }

  const text = prose.join("\n").trim();
  if (text) doc.description = text;
  return doc;
}

// ============================================================================
// Regexes (paired & global) — hardened
// ============================================================================
// Capture only the doc text; I've located the following declaration here.
const BLOCK = /\/\*\*([\s\S]*?)\*\/\s*(?:\/\*[\s\S]*?\*\/\s*)*/g;

// Qualifiers and types before symbol name
const QUAL_OR_TYPE =
  "(?:extern|static|inline|const|unsigned|signed|void|int|char|long|short|float|double|size_t|ssize_t|bool|struct\\s+[A-Za-z_]\\w*|enum\\s+[A-Za-z_]\\w*|union\\s+[A-Za-z_]\\w*|[A-Za-z_]\\w+)";

// function declaration (not definition), balanced params (no bodies)
const PROTO_SINGLE = new RegExp(
  `^[ \\t]*(?:${QUAL_OR_TYPE})[ \\t\\*]+([A-Za-z_]\\w*)\\s*\\((?:[^(){};]|\\([^()]*\\))*\\)\\s*;`,
  "m"
);
const PROTO_GLOBAL = new RegExp(
  `^[ \\t]*(?:${QUAL_OR_TYPE})[ \\t\\*]+([A-Za-z_]\\w*)\\s*\\((?:[^(){};]|\\([^()]*\\))*\\)\\s*;[ \\t]*$`,
  "gm"
);

// NEW: function **definitions** (inline/static) ending with "{", not ";"
const DEF_GLOBAL = new RegExp(
  `^[ \\t]*(?:${QUAL_OR_TYPE})[ \\t\\*]+([A-Za-z_]\\w*)\\s*\\((?:[^(){};]|\\([^()]*\\))*\\)\\s*\\{`,
  "gm"
);

// Macros
const MACRO_CONST_RE = /^[ \t]*#\s*define\s+([A-Za-z_]\w+)\s+(.+?)\s*$/gm;
const MACRO_FN_RE = /^[ \t]*#\s*define\s+([A-Za-z_]\w+)\(([^)]*)\)\s+(.+?)\s*$/gm;

// Typedefs (incl callback typedefs)
const TYPEDEF_RE = /^[ \t]*typedef\s+(.+?);\s*$/gm;

// Enums (with enumerators)
const ENUM_RE = /(^|\n)[ \t]*enum\s+([A-Za-z_]\w*)?\s*\{([\s\S]*?)\}\s*([A-Za-z_]\w*)?\s*;\s*/g;

// Struct/Union with members
const SU_RE = /(^|\n)[ \t]*(struct|union)\s+([A-Za-z_]\w*)?\s*\{([\s\S]*?)\}\s*([A-Za-z_]\w*)?\s*;\s*/g;

// Parameter quick parse (best-effort)
function parseParamsFromSignature(sig: string): { name: string; type: string }[] {
  const m = sig.match(/\((.*)\)/);
  if (!m) return [];
  const params = m[1].trim();
  if (!params || params === "void") return [];
  const parts: string[] = [];
  let depth = 0,
    cur = "";
  for (const ch of params) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      parts.push(cur);
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) parts.push(cur);
  return parts.map((p) => {
    const t = p.trim();
    const m2 = t.match(/(.+?)\s*([A-Za-z_]\w*)$/);
    if (m2) return { type: m2[1].trim(), name: m2[2].trim() };
    return { type: t, name: t };
  });
}
function parseMembers(block: string): { name: string; type: string }[] {
  const out: { name: string; type: string }[] = [];
  const lines = block.split(/\r?\n/);
  for (const l of lines) {
    const s = l.trim();
    if (!s || s.startsWith("//")) continue;
    const m = s.match(/^(.+?)\s+([A-Za-z_]\w*)\s*;\s*$/);
    if (m) out.push({ type: m[1].trim(), name: m[2] });
  }
  return out;
}
function parseEnumerators(block: string): { name: string; value?: string }[] {
  const out: { name: string; value?: string }[] = [];
  const raw = block.split(",");
  for (const r of raw) {
    const s = r.trim();
    if (!s) continue;
    const m = s.match(/^([A-Za-z_]\w*)(?:\s*=\s*(.+))?$/);
    if (m) out.push({ name: m[1], value: m[2]?.trim() });
  }
  return out;
}

// ============================================================================
// Asset / Snippet copier
// ============================================================================
function copyAsset(srcPath: string, inputRoots: string[], outAssetsRoot: string): { file: string } | null {
  const candidates: string[] = [];
  if (fs.existsSync(srcPath) && fs.statSync(srcPath).isFile()) candidates.push(srcPath);
  for (const root of inputRoots) {
    const p = path.resolve(root, srcPath);
    if (fs.existsSync(p) && fs.statSync(p).isFile()) candidates.push(p);
  }
  const chosen = candidates[0];
  if (!chosen) return null;

  const hash = sha1(chosen).slice(0, 10);
  const base = path.basename(chosen);
  const dest = path.join(outAssetsRoot, `${hash}-${base}`);
  ensureDir(path.dirname(dest));
  fs.copyFileSync(chosen, dest);
  return { file: dest };
}

// ============================================================================
// Symbol Index & copydoc/ref resolution
// ============================================================================
function makeSymbolKey(name: string, category: Category): string {
  return `${category}:${name}`;
}
function buildSymbolIndex(entries: AnyEntry[]): SymbolIndex {
  const idx: SymbolIndex = new Map();
  for (const e of entries) {
    const key = makeSymbolKey(e.name, e.category);
    if (!idx.has(key)) idx.set(key, e);
  }
  return idx;
}
function resolveCopydocAndRefs(allEntries: AnyEntry[], idx: SymbolIndex): void {
  for (const e of allEntries) {
    const doc = e.doc;
    if (!doc) continue;

    for (const cd of doc.unresolvedCopydoc) {
      let target: AnyEntry | undefined;
      const ref = cd.ref;
      if (ref.includes(":")) {
        target = idx.get(ref as string);
      } else {
        target =
          idx.get(makeSymbolKey(ref, "function")) ||
          idx.get(makeSymbolKey(ref, "typedef")) ||
          idx.get(makeSymbolKey(ref, "macro-fn")) ||
          idx.get(makeSymbolKey(ref, "macro-const"));
      }
      if (target) {
        const tdoc = target.doc;
        if (tdoc.brief && !doc.brief) doc.brief = tdoc.brief;
        if (tdoc.description && !doc.description) doc.description = tdoc.description;
        if (tdoc.params.length && !doc.params.length) doc.params = [...tdoc.params];
        if (tdoc.returns && !doc.returns) doc.returns = tdoc.returns;
        if (tdoc.example && !doc.example) doc.example = tdoc.example;
        doc.see = [...new Set([...(doc.see || []), ...(tdoc.see || [])])];
      } else {
        e.warnings.push(`@copydoc target not found: ${ref}`);
      }
    }

    const replaceRefs = (text?: string) =>
      text?.replace(/\\ref\s+([A-Za-z_]\w*(?::[a-z-]+)?)\b/g, (_m, g1) => {
        const id = g1 as string;
        let target: AnyEntry | undefined;
        if (id.includes(":")) target = idx.get(id);
        else {
          target =
            idx.get(makeSymbolKey(id, "function")) ||
            idx.get(makeSymbolKey(id, "typedef")) ||
            idx.get(makeSymbolKey(id, "macro-fn")) ||
            idx.get(makeSymbolKey(id, "macro-const")) ||
            idx.get(makeSymbolKey(id, "enum")) ||
            idx.get(makeSymbolKey(id, "struct")) ||
            idx.get(makeSymbolKey(id, "union"));
        }
        if (!target) return `\`${id}\``;
        const page = e.fileRel.replace(/\.h$/i, ".mdx");
        const tpage = target.fileRel.replace(/\.h$/i, ".mdx");
        const rel = path.posix.relative(path.posix.dirname(page), tpage);
        return `[\`${target.name}\`](${rel}#${target.anchor})`;
      });

    doc.brief = replaceRefs(doc.brief);
    doc.description = replaceRefs(doc.description);
    doc.returns = replaceRefs(doc.returns);
  }
}

// ============================================================================
// Renderers
// ============================================================================
function renderTOC(entries: AnyEntry[]): string[] {
  const lines: string[] = [];
  const groups: Record<string, AnyEntry[]> = {
    file: [],
    "macro-const": [],
    "macro-fn": [],
    typedef: [],
    "callback-typedef": [],
    enum: [],
    struct: [],
    union: [],
    function: [],
  };
  for (const e of entries) {
    if (e.category in groups) (groups as any)[e.category].push(e);
  }

  const order: (keyof typeof groups)[] = [
    "file",
    "macro-const",
    "macro-fn",
    "typedef",
    "callback-typedef",
    "enum",
    "struct",
    "union",
    "function",
  ];
  lines.push("## API");
  for (const k of order) {
    if (!(groups as any)[k]?.length) continue;
    const labelMap: Record<string, string> = {
      file: "File",
      "macro-const": "Macros (Constants)",
      "macro-fn": "Macros (Function-like)",
      typedef: "Typedefs",
      "callback-typedef": "Callback Typedefs",
      enum: "Enums",
      struct: "Structs",
      union: "Unions",
      function: "Functions",
    };
    lines.push(`\n### ${labelMap[k]}`);
    for (const e of (groups as any)[k]) lines.push(`- [\`${e.name}\`](#${e.anchor})`);
  }
  lines.push("");
  return lines;
}

function renderDocCommon(doc: Doc, out: string[]): void {
  if (doc.brief) out.push(doc.brief + "\n");
  if (doc.description) out.push(doc.description + "\n");

  if (doc.notes.length) {
    out.push("\n**Notes**");
    for (const n of doc.notes) out.push(`- ${n}`);
  }
  if (doc.warnings.length) {
    out.push("\n**Warnings**");
    for (const w of doc.warnings) out.push(`- ${w}`);
  }
  if (doc.todos.length) {
    out.push("\n**TODOs**");
    for (const t of doc.todos) out.push(`- ${t}`);
  }
  if (doc.bugs.length) {
    out.push("\n**Known Bugs**");
    for (const b of doc.bugs) out.push(`- ${b}`);
  }
  if (doc.see.length) {
    out.push("\n**See also**");
    for (const s of doc.see) out.push(`- ${s}`);
  }
  if (doc.deprecated) {
    out.push(`\n> **Deprecated** — ${doc.deprecated}`);
  }
  if (doc.since) {
    out.push(`\n> Since: ${doc.since}`);
  }
}

function renderFunction(e: FnEntry, out: string[]): void {
  out.push(`<a id="${e.anchor}"></a>`);
  out.push(`### \`${e.name}\``);
  if (!e.fromDocblock) {
    out.push("> ⚠️ No doc comment found. Add a `/** ... */` block above this declaration.\n");
  }
  renderDocCommon(e.doc, out);
  out.push("\n**Signature**\n```c");
  out.push(e.signature.trim());
  out.push("```");

  if (e.doc.params.length) {
    out.push("\n**Parameters**\n| Name | Description |");
    out.push("|------|-------------|");
    for (const p of e.doc.params) out.push(`| \`${p.name}\` | ${p.desc} |`);
  }
  if (e.doc.returns) {
    out.push("\n**Returns**\n" + e.doc.returns);
  }
  if (e.doc.errors.length) {
    out.push("\n**Errors**");
    for (const er of e.doc.errors) out.push(`- ${er}`);
  }
  if (e.doc.example) {
    out.push("\n**Example**\n```c");
    out.push(e.doc.example);
    out.push("```");
  }
}

function renderMacroConst(e: MacroConstEntry, out: string[]): void {
  out.push(`<a id="${e.anchor}"></a>`);
  out.push(`### \`${e.name}\``);
  renderDocCommon(e.doc, out);
  if (e.value) {
    out.push("\n**Value**\n```c");
    out.push(`#define ${e.name} ${e.value}`);
    out.push("```");
  }
}

function renderMacroFn(e: MacroFnEntry, out: string[]): void {
  out.push(`<a id="${e.anchor}"></a>`);
  out.push(`### \`${e.name}\``);
  renderDocCommon(e.doc, out);
  out.push("\n**Signature**\n```c");
  out.push(`#define ${e.name}${e.signature.slice(e.signature.indexOf("("))}`);
  out.push("```");
}

function renderTypedef(e: TypedefEntry, out: string[]): void {
  out.push(`<a id="${e.anchor}"></a>`);
  out.push(`### \`${e.name}\``);
  renderDocCommon(e.doc, out);
  out.push("\n**Definition**\n```c");
  out.push(e.typedef.trim().endsWith(";") ? e.typedef.trim() : e.typedef.trim() + ";");
  out.push("```");
}

function renderEnum(e: EnumEntry, out: string[]): void {
  out.push(`<a id="${e.anchor}"></a>`);
  out.push(`### \`${e.name}\``);
  renderDocCommon(e.doc, out);
  if (e.enumerators.length) {
    out.push("\n**Enumerators**\n| Name | Value |");
    out.push("|------|-------|");
    for (const k of e.enumerators) out.push(`| \`${k.name}\` | ${k.value ?? ""} |`);
  }
}

function renderStructUnion(e: StructUnionEntry, out: string[]): void {
  out.push(`<a id="${e.anchor}"></a>`);
  out.push(`### \`${e.name}\``);
  renderDocCommon(e.doc, out);
  if (e.members.length) {
    out.push("\n**Members**\n| Name | Type |");
    out.push("|------|------|");
    for (const m of e.members) out.push(`| \`${m.name}\` | \`${MDX_ESCAPE_LT_GT(m.type)}\` |`);
  }
}

function renderHeaderPage(headerRel: string, entries: AnyEntry[]): string {
  const headerBase = path.basename(headerRel, ".h");
  const fm = `---\ntitle: ${headerBase}\n---\n\n`;
  const intro = `> Auto-generated from \`${headerRel}\`. Edit doc comments in the header and rebuild.\n\n`;

  const out: string[] = [];
  out.push(...renderTOC(entries));

  for (const e of entries) {
    switch (e.category) {
      case "function":
        renderFunction(e as FnEntry, out);
        break;
      case "macro-const":
        renderMacroConst(e as MacroConstEntry, out);
        break;
      case "macro-fn":
        renderMacroFn(e as MacroFnEntry, out);
        break;
      case "typedef":
      case "callback-typedef":
        renderTypedef(e as TypedefEntry, out);
        break;
      case "enum":
        renderEnum(e as EnumEntry, out);
        break;
      case "struct":
      case "union":
        renderStructUnion(e as StructUnionEntry, out);
        break;
      case "file":
      case "group":
      case "page":
        break;
      default:
        (e as AnyEntry).warnings.push(`Unhandled category in renderer: ${(e as AnyEntry).category}`);
    }
    out.push("");
  }

  return fm + intro + out.join("\n") + "\n";
}

// ============================================================================
// Parsing passes (per header)
// ============================================================================
function parseHeaderToEntries(
  inputRoot: string,
  absHeader: string,
  ids: StableIds,
  defines: Set<string>,
  inputRootsAll: string[],
  outAssetsRoot: string
): AnyEntry[] {
  const raw = read(absHeader);
  const pre = preprocess(raw, defines);
  const fileRel = path.relative(inputRoot, absHeader).replace(/\\/g, "/");

  const entries: AnyEntry[] = [];
  const seenSig = new Set<string>();
  const seenNameCat = new Set<string>();

  const baseDocFrom = (docRaw: string): Doc => {
    const doc = parseDocblock(docRaw);
    for (const a of doc.assets) {
      if (a.kind === "image" || a.kind === "include" || a.kind === "snippet") {
        const copied = copyAsset(a.src, [path.dirname(absHeader), ...inputRootsAll], outAssetsRoot);
        if (copied) a.src = path.relative(process.cwd(), copied.file).replace(/\\/g, "/");
      }
    }
    return doc;
  };

  // 0) File-level docblock (@file, @page, @defgroup only)
  {
    const m = pre.match(/\/\*\*([\s\S]*?)\*\//);
    if (m) {
      const firstDoc = parseDocblock(m[1]);
      if (firstDoc.tagsRaw["file"] || firstDoc.page || firstDoc.groupDefs.length) {
        const proposed = SLUG(`file-${path.basename(fileRel, ".h")}`);
        const { anchor } = getStableAnchor(ids, fileRel, path.basename(fileRel), "file", proposed);
        const fe: FileEntry = {
          category: "file",
          name: path.basename(fileRel),
          anchor,
          fileRel,
          fromDocblock: true,
          doc: firstDoc,
          warnings: [],
        };
        entries.push(fe);
      }
    }
  }

  // 1) Docblock pairing to prototypes (functions only)
  BLOCK.lastIndex = 0;
  let bm: RegExpExecArray | null;
  while ((bm = BLOCK.exec(pre))) {
    const rawDoc = bm[1] ?? "";
    const tail = pre.slice(BLOCK.lastIndex, Math.min(pre.length, BLOCK.lastIndex + 2000));
    const pm = tail.match(PROTO_SINGLE);
    if (!pm) continue;

    const full = pm[0];
    const protoClean = cleanSignature(full);
    const name = funcName(protoClean);
    if (!name) continue;

    const sigKey = `function::${protoClean}`;
    const nameKey = `function::${name}`;
    if (seenSig.has(sigKey) || seenNameCat.has(nameKey)) continue;

    const proposed = SLUG(`function-${name}`);
    const { anchor } = getStableAnchor(ids, fileRel, name, "function", proposed);
    const doc = baseDocFrom(rawDoc);
    const e: FnEntry = {
      category: "function",
      name,
      anchor,
      fileRel,
      fromDocblock: true,
      doc,
      signature: MDX_ESCAPE_LT_GT(protoClean),
      paramsParsed: parseParamsFromSignature(protoClean),
      warnings: [],
    };
    if (doc.isInternal) {
      /* keep for index if needed */
    }
    entries.push(e);
    seenSig.add(sigKey);
    seenNameCat.add(nameKey);
  }

  // 2) Bare prototypes on comment-free buffer
  const noComments = stripAllComments(pre);
  PROTO_GLOBAL.lastIndex = 0;
  let gm: RegExpExecArray | null;
  while ((gm = PROTO_GLOBAL.exec(noComments))) {
    const full = gm[0] ?? "";
    const protoClean = cleanSignature(full);
    const name = funcName(protoClean);
    if (!name) continue;

    const sigKey = `function::${protoClean}`;
    const nameKey = `function::${name}`;
    if (seenSig.has(sigKey) || seenNameCat.has(nameKey)) continue;

    const proposed = SLUG(`function-${name}`);
    const { anchor } = getStableAnchor(ids, fileRel, name, "function", proposed);
    const e: FnEntry = {
      category: "function",
      name,
      anchor,
      fileRel,
      fromDocblock: false,
      doc: {
        params: [],
        errors: [],
        notes: [],
        warnings: [],
        todos: [],
        bugs: [],
        see: [],
        tagsRaw: {},
        unresolvedCopydoc: [],
        groupDefs: [],
        groupAdd: [],
        groupIn: [],
        page: null,
        assets: [],
      },
      signature: MDX_ESCAPE_LT_GT(protoClean),
      paramsParsed: parseParamsFromSignature(protoClean),
      warnings: [],
    };
    entries.push(e);
    seenSig.add(sigKey);
    seenNameCat.add(nameKey);
  }

  // NEW: 2b) Inline function **definitions** (e.g., static inline foo(...) { ... })
  DEF_GLOBAL.lastIndex = 0;
  let dm: RegExpExecArray | null;
  while ((dm = DEF_GLOBAL.exec(noComments))) {
    const full = dm[0] ?? "";
    // Extract signature up to '{', then close at last ')' and synthesize ';' for display
    const upto = full.indexOf("{");
    const sigRaw = upto >= 0 ? full.slice(0, upto) : full;
    const closingParen = sigRaw.lastIndexOf(")");
    const proto = (closingParen >= 0 ? sigRaw.slice(0, closingParen + 1) : sigRaw).trim() + ";";

    const protoClean = cleanSignature(proto);
    const name = funcName(protoClean);
    if (!name) continue;

    const sigKey = `function::${protoClean}`;
    const nameKey = `function::${name}`;
    if (seenSig.has(sigKey) || seenNameCat.has(nameKey)) continue;

    const proposed = SLUG(`function-${name}`);
    const { anchor } = getStableAnchor(ids, fileRel, name, "function", proposed);
    const e: FnEntry = {
      category: "function",
      name,
      anchor,
      fileRel,
      fromDocblock: false,
      doc: {
        params: [],
        errors: [],
        notes: [],
        warnings: [],
        todos: [],
        bugs: [],
        see: [],
        tagsRaw: {},
        unresolvedCopydoc: [],
        groupDefs: [],
        groupAdd: [],
        groupIn: [],
        page: null,
        assets: [],
      },
      signature: MDX_ESCAPE_LT_GT(protoClean),
      paramsParsed: parseParamsFromSignature(protoClean),
      warnings: [],
    };
    entries.push(e);
    seenSig.add(sigKey);
    seenNameCat.add(nameKey);
  }

  // 3) Macros (const and function-like)
  {
    let mm: RegExpExecArray | null;
    MACRO_CONST_RE.lastIndex = 0;
    while ((mm = MACRO_CONST_RE.exec(noComments))) {
      const name = mm[1];
      const value = mm[2];
      const nameKey = `macro-const::${name}`;
      if (seenNameCat.has(nameKey)) continue;
      const proposed = SLUG(`macro-${name}`);
      const { anchor } = getStableAnchor(ids, fileRel, name, "macro-const", proposed);
      const e: MacroConstEntry = {
        category: "macro-const",
        name,
        anchor,
        fileRel,
        fromDocblock: false,
        doc: {
          params: [],
          errors: [],
          notes: [],
          warnings: [],
          todos: [],
          bugs: [],
          see: [],
          tagsRaw: {},
          unresolvedCopydoc: [],
          groupDefs: [],
          groupAdd: [],
          groupIn: [],
          page: null,
          assets: [],
        },
        value,
        warnings: [],
      };
      entries.push(e);
      seenNameCat.add(nameKey);
    }

    MACRO_FN_RE.lastIndex = 0;
    while ((mm = MACRO_FN_RE.exec(noComments))) {
      const name = mm[1];
      const args = mm[2];
      const body = mm[3];
      const nameKey = `macro-fn::${name}`;
      if (seenNameCat.has(nameKey)) continue;
      const proposed = SLUG(`macro-${name}`);
      const { anchor } = getStableAnchor(ids, fileRel, name, "macro-fn", proposed);
      const signature = `${name}(${args})`;
      const e: MacroFnEntry = {
        category: "macro-fn",
        name,
        anchor,
        fileRel,
        fromDocblock: false,
        doc: {
          params: [],
          errors: [],
          notes: [],
          warnings: [],
          todos: [],
          bugs: [],
          see: [],
          tagsRaw: {},
          unresolvedCopydoc: [],
          groupDefs: [],
          groupAdd: [],
          groupIn: [],
          page: null,
          assets: [],
        },
        signature: MDX_ESCAPE_LT_GT(signature + " /* " + body + " */"),
        paramsParsed: args
          .split(",")
          .map((s) => ({ name: s.trim(), type: "macro-param" }))
          .filter((p) => p.name.length > 0),
        warnings: [],
      };
      entries.push(e);
      seenNameCat.add(nameKey);
    }
  }

  // 4) Typedefs
  {
    let tm: RegExpExecArray | null;
    TYPEDEF_RE.lastIndex = 0;
    while ((tm = TYPEDEF_RE.exec(noComments))) {
      const typedefLine = tm[0].trim();
      const full = tm[1];
      const m2 = full.match(/([A-Za-z_]\w*)\s*$/);
      if (!m2) continue;
      const name = m2[1];
      const isCallback = /\(\s*\*\s*[A-Za-z_]\w*\s*\)\s*\(/.test(full);
      const category: Category = isCallback ? "callback-typedef" : "typedef";
      const nameKey = `${category}::${name}`;
      if (seenNameCat.has(nameKey)) continue;
      const proposed = SLUG(`${category}-${name}`);
      const { anchor } = getStableAnchor(ids, fileRel, name, category, proposed);
      const e: TypedefEntry = {
        category,
        name,
        anchor,
        fileRel,
        fromDocblock: false,
        doc: {
          params: [],
          errors: [],
          notes: [],
          warnings: [],
          todos: [],
          bugs: [],
          see: [],
          tagsRaw: {},
          unresolvedCopydoc: [],
          groupDefs: [],
          groupAdd: [],
          groupIn: [],
          page: null,
          assets: [],
        },
        typedef: typedefLine,
        warnings: [],
      };
      entries.push(e);
      seenNameCat.add(nameKey);
    }
  }

  // 5) Enums
  {
    let em: RegExpExecArray | null;
    ENUM_RE.lastIndex = 0;
    while ((em = ENUM_RE.exec(noComments))) {
      const name = em[2] || em[4] || "anonymous_enum_" + sha1(em[3]).slice(0, 6);
      const nameKey = `enum::${name}`;
      if (seenNameCat.has(nameKey)) continue;
      const proposed = SLUG(`enum-${name}`);
      const { anchor } = getStableAnchor(ids, fileRel, name, "enum", proposed);
      const enumerators = parseEnumerators(em[3]);
      const e: EnumEntry = {
        category: "enum",
        name,
        anchor,
        fileRel,
        fromDocblock: false,
        doc: {
          params: [],
          errors: [],
          notes: [],
          warnings: [],
          todos: [],
          bugs: [],
          see: [],
          tagsRaw: {},
          unresolvedCopydoc: [],
          groupDefs: [],
          groupAdd: [],
          groupIn: [],
          page: null,
          assets: [],
        },
        enumerators,
        warnings: [],
      };
      entries.push(e);
      seenNameCat.add(nameKey);
    }
  }

  // 6) Struct / Union
  {
    let sm: RegExpExecArray | null;
    SU_RE.lastIndex = 0;
    while ((sm = SU_RE.exec(noComments))) {
      const kind = sm[2] as "struct" | "union";
      const name = sm[3] || sm[5] || `anonymous_${kind}_` + sha1(sm[4]).slice(0, 6);
      const nameKey = `${kind}::${name}`;
      if (seenNameCat.has(nameKey)) continue;
      const proposed = SLUG(`${kind}-${name}`);
      const { anchor } = getStableAnchor(ids, fileRel, name, kind, proposed);
      const members = parseMembers(sm[4]);
      const e: StructUnionEntry = {
        category: kind,
        name,
        anchor,
        fileRel,
        fromDocblock: false,
        doc: {
          params: [],
          errors: [],
          notes: [],
          warnings: [],
          todos: [],
          bugs: [],
          see: [],
          tagsRaw: {},
          unresolvedCopydoc: [],
          groupDefs: [],
          groupAdd: [],
          groupIn: [],
          page: null,
          assets: [],
        },
        members,
        warnings: [],
      };
      entries.push(e);
      seenNameCat.add(nameKey);
    }
  }

  return entries;
}

// ============================================================================
// Group & Page emitters
// ============================================================================
function emitGroupsAndPagesFromDocs(entries: AnyEntry[], fileRel: string, ids: StableIds): AnyEntry[] {
  const extras: AnyEntry[] = [];
  for (const e of entries) {
    const d = e.doc;
    for (const g of d.groupDefs) {
      const name = g.id;
      const proposed = SLUG(`group-${name}`);
      const { anchor } = getStableAnchor(ids, fileRel, name, "group", proposed);
      const ge: GroupEntry = {
        category: "group",
        name,
        anchor,
        fileRel,
        fromDocblock: true,
        doc: { ...d, brief: g.title ?? d.brief },
        warnings: [],
      };
      extras.push(ge);
    }
    if (d.page) {
      const name = d.page.id;
      const proposed = SLUG(`page-${name}`);
      const { anchor } = getStableAnchor(ids, fileRel, name, "page", proposed);
      const pe: PageEntry = {
        category: "page",
        name,
        anchor,
        fileRel,
        fromDocblock: true,
        doc: d,
        warnings: [],
        pageId: d.page.id,
        pageTitle: d.page.title,
      };
      extras.push(pe);
    }
  }
  return extras;
}
function renderGroupPage(groupId: string, group: GroupEntry, pages: GeneratedPage[], outRoot: string): void {
  const title = group.doc.brief || group.name;
  const mdx = `---
title: ${title}
---

> Group: \`${group.name}\`

${group.doc.description ?? ""}

`;
  const rel = group.fileRel.replace(/\.h$/i, `.group.${group.name}.mdx`);
  const outFile = path.join(outRoot, rel);
  write(outFile, mdx);
  pages.push({ fileRel: rel.replace(/\.mdx$/i, ".h"), mdx, entries: [group] });
}
function renderStandalonePage(page: PageEntry, pages: GeneratedPage[], outRoot: string): void {
  const mdx = `---
title: ${page.pageTitle}
---

${page.doc.description ?? page.doc.brief ?? ""}

`;
  const rel = page.fileRel.replace(/\.h$/i, `.page.${page.pageId}.mdx`);
  const outFile = path.join(outRoot, rel);
  write(outFile, mdx);
  pages.push({ fileRel: rel.replace(/\.mdx$/i, ".h"), mdx, entries: [page] });
}

// ============================================================================
// Link / Anchor checker (cross-page)
// ============================================================================
type AnchorIndex = Map<string /* pageRel .mdx */, Set<string /* anchors */>>;
type BrokenLink = { page: string; target: string; reason: string };

function indexAnchors(pages: GeneratedPage[]): AnchorIndex {
  const idx: AnchorIndex = new Map();
  for (const p of pages) {
    const pageRel = p.fileRel.replace(/\.h$/i, ".mdx");
    const anchors = new Set<string>();
    for (const e of p.entries) anchors.add(e.anchor);
    idx.set(pageRel, anchors);
  }
  return idx;
}
function checkLinks(pages: GeneratedPage[]): BrokenLink[] {
  const idx = indexAnchors(pages);
  const problems: BrokenLink[] = [];
  const MD_LINK_RE = /\[[^\]]*?\]\(([^)]+)\)/g;

  for (const p of pages) {
    const pageRel = p.fileRel.replace(/\.h$/i, ".mdx");
    const text = p.mdx;
    let m: RegExpExecArray | null;

    while ((m = MD_LINK_RE.exec(text))) {
      const raw = m[1];
      if (!raw) continue;
      if (/^(https?:|mailto:)/i.test(raw)) continue;

      let targetPage = pageRel;
      let targetAnchor: string | null = null;

      if (raw.startsWith("#")) {
        targetAnchor = raw.slice(1);
      } else {
        const [rel, hash] = raw.split("#");
        if (!rel.endsWith(".mdx")) continue;
        targetPage = path.posix.normalize(path.posix.join(path.posix.dirname(pageRel), rel));
        targetAnchor = hash ?? null;
        if (!idx.has(targetPage)) {
          problems.push({ page: pageRel, target: raw, reason: "Page not generated" });
          continue;
        }
      }

      if (targetAnchor) {
        const anchors = idx.get(targetPage);
        if (!anchors || !anchors.has(targetAnchor)) {
          problems.push({ page: pageRel, target: raw, reason: "Anchor not found" });
        }
      }
    }
  }
  return problems;
}

// ============================================================================
// Main
// ============================================================================
function walkHeaders(root: string): string[] {
  const files: string[] = [];
  const stack: string[] = [root];
  while (stack.length) {
    const dir = stack.pop() as string;
    for (const name of fs.readdirSync(dir)) {
      const p = path.join(dir, name);
      const st = fs.statSync(p);
      if (st.isDirectory()) stack.push(p);
      else if (st.isFile() && /\.h$/i.test(name)) files.push(p);
    }
  }
  return files.sort();
}

function main(): void {
  const outRoots = mapPairings(INPUT_ROOTS, OUTPUT_ROOTS).map((x) => path.resolve(x));
  const inputRootsAbs = INPUT_ROOTS.map((x) => path.resolve(x));
  const assetsAbs = path.resolve(ASSETS_DIR);

  ensureDir(assetsAbs);
  outRoots.forEach(ensureDir);

  const idsPerOut: StableIds[] = outRoots.map(() => ({}));

  const allGenerated: GeneratedPage[] = [];
  const allEntriesForIndex: AnyEntry[] = [];
  const allWarnings: string[] = [];
  const allEntries: AnyEntry[] = [];
  const deferredWrites: (
    | { kind: "header"; headerRel: string; headerSymbols: AnyEntry[]; outRoot: string; absHeader: string }
    | { kind: "group"; group: GroupEntry; outRoot: string }
    | { kind: "page"; page: PageEntry; outRoot: string }
  )[] = [];

  for (let i = 0; i < inputRootsAbs.length; i++) {
    const inRoot = inputRootsAbs[i];
    const outRoot = outRoots[i];
    const ids = idsPerOut[i];

    const landing = path.join(outRoot, "index.mdx");
    if (!fs.existsSync(landing)) {
      write(
        landing,
        `---
title: API Reference
---
Browse API references generated from header files in \`${path.basename(inRoot)}\`.
`
      );
    }

    const headers = walkHeaders(inRoot);
    if (headers.length === 0) {
      console.warn(`(i) No .h files under ${inRoot}`);
      continue;
    }

    for (const absHeader of headers) {
      const headerRel = path.relative(inRoot, absHeader).replace(/\\/g, "/");
      const entries = parseHeaderToEntries(inRoot, absHeader, ids, new Set(DEFINES), inputRootsAbs, assetsAbs);

      const extras = emitGroupsAndPagesFromDocs(entries, headerRel, ids);
      const all = [...entries, ...extras];
      allEntries.push(...all);

      const headerSymbols = all.filter((e) =>
        ["function", "macro-const", "macro-fn", "typedef", "callback-typedef", "enum", "struct", "union"].includes(
          e.category
        )
      );

      if (headerSymbols.length) {
        deferredWrites.push({ kind: "header", headerRel, headerSymbols, outRoot, absHeader });
        allEntriesForIndex.push(...headerSymbols);
      }

      for (const ex of extras) {
        if (ex.category === "group") {
          deferredWrites.push({ kind: "group", group: ex as GroupEntry, outRoot });
        } else if (ex.category === "page") {
          deferredWrites.push({ kind: "page", page: ex as PageEntry, outRoot });
        }
      }
    }

    // no persistent id map or redirects to write
  }

  const index = buildSymbolIndex(allEntriesForIndex);
  resolveCopydocAndRefs(allEntriesForIndex, index);

  for (const e of allEntries) {
    for (const w of e.warnings) allWarnings.push(`${e.fileRel}: ${w}`);
  }

  for (const op of deferredWrites) {
    if (op.kind === "header") {
      const mdx = renderHeaderPage(op.headerRel, op.headerSymbols);
      const outFile = path.join(op.outRoot, op.headerRel.replace(/\.h$/i, ".mdx"));
      write(outFile, mdx);
      allGenerated.push({ fileRel: op.headerRel, mdx, entries: op.headerSymbols });
      console.log(`${op.absHeader} → ${outFile}  (${op.headerSymbols.length} symbol(s))`);
    } else if (op.kind === "group") {
      renderGroupPage(op.group.name, op.group, allGenerated, op.outRoot);
    } else {
      renderStandalonePage(op.page, allGenerated, op.outRoot);
    }
  }

  const problems = checkLinks(allGenerated);
  if (problems.length) {
    console.error("\n❌ Broken links detected:");
    for (const p of problems) {
      console.error(` - [${p.page}] → (${p.target}) — ${p.reason}`);
    }
    process.exit(3);
  }

  if (allWarnings.length) {
    console.warn("\n⚠️ Generator warnings:");
    for (const w of allWarnings) console.warn(" - " + w);
    if (FAIL_ON_WARN) process.exit(4);
  }

  console.log(`\n Generated ${allGenerated.length} page(s).`);
}

main();
