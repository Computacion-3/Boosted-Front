// Shared helpers for the clean-architecture linter and inventory.
// Knows the project layout: src/features/<feature>/{domain,infrastructure,di,presentation},
// src/store (global Redux wiring), src/core (cross-cutting) and app/ (Next.js routes).
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

export const ROOT = process.cwd();

export const LAYERS = ['domain', 'infrastructure', 'di', 'presentation'];

// Sub-folders allowed inside each layer, with the file-name convention each one expects.
export const STRUCTURE = {
    domain: {
        entities: /^[a-z0-9]+(-[a-z0-9]+)*\.ts$/,
        repositories: /^[a-z0-9-]+\.repository\.ts$/,
        usecases: /^[a-z0-9-]+\.usecase\.ts$/,
    },
    infrastructure: {
        dtos: /^[a-z0-9-]+\.dto\.ts$/,
        mappers: /^[a-z0-9-]+\.mapper\.ts$/,
        datasources: /^[a-z0-9-]+-datasource(\.interface)?\.ts$/,
        repositories: /^[a-z0-9-]+\.repository\.impl\.ts$/,
    },
    di: {
        '': /^[a-z0-9-]+\.container\.ts$/,
    },
    presentation: {
        components: /^[A-Z][A-Za-z0-9]*\.tsx$/,
        hooks: /^use-[a-z0-9-]+\.tsx?$/,
        store: /^[a-z0-9-]+\.slice\.ts$/,
        viewmodels: /^[a-z0-9-]+\.viewmodel\.ts$/,
        actions: /^[a-z0-9-]+\.actions\.ts$/,
        schemas: /^[a-z0-9-]+\.schema\.ts$/,
    },
};

// Packages that tie code to a UI framework or to the state manager.
export const UI_PACKAGES = /^(react|react-dom|next)(\/|$)/;
export const STATE_PACKAGES = /^(react-redux|@reduxjs\/toolkit|redux)(\/|$)/;
export const HTTP_PACKAGES = /^(axios|ky|got|node-fetch)(\/|$)/;

export const toPosix = (p) => p.split(path.sep).join('/');

export function walk(dir, out = []) {
    if (!fs.existsSync(dir)) return out;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full, out);
        else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) out.push(full);
    }
    return out;
}

export function sourceFiles() {
    return [...walk(path.join(ROOT, 'src')), ...walk(path.join(ROOT, 'app'))].map((f) =>
        toPosix(path.relative(ROOT, f)),
    );
}

export const isTestFile = (rel) => /(\.test|\.spec)\.tsx?$/.test(rel) || rel.includes('/__tests__/');

/**
 * Classifies a repo-relative path.
 * area: feature | store | core | app | other
 * For features: feature name, layer and sublayer ('' when the file sits at the layer root).
 */
export function classify(rel) {
    const p = rel.replace(/\.(tsx?|mjs|js)$/, '');
    const parts = p.split('/');
    if (parts[0] === 'app') return { area: 'app' };
    if (parts[0] !== 'src') return { area: 'other' };
    if (parts[1] === 'store') return { area: 'store' };
    if (parts[1] === 'core') return { area: 'core', sub: parts[2] ?? '' };
    if (parts[1] === 'features' && parts[2]) {
        const layer = parts[3];
        const rest = parts.slice(4);
        const sublayer = rest.length > 1 ? rest[0] : '';
        return { area: 'feature', feature: parts[2], layer, sublayer };
    }
    return { area: 'other' };
}

function resolveSpecifier(fromRel, spec) {
    let target;
    if (spec.startsWith('.')) target = path.posix.join(path.posix.dirname(fromRel), spec);
    else if (spec.startsWith('@/')) target = spec.slice(2);
    else return null;
    for (const ext of ['', '.ts', '.tsx', '/index.ts', '/index.tsx']) {
        if (fs.existsSync(path.join(ROOT, target + ext)) && fs.statSync(path.join(ROOT, target + ext)).isFile()) {
            return toPosix(target + ext);
        }
    }
    return target;
}

const cache = new Map();

/** Parses a file once and returns its AST, imports and directives. */
export function parse(rel) {
    if (cache.has(rel)) return cache.get(rel);
    const text = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    const kind = rel.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
    const sf = ts.createSourceFile(rel, text, ts.ScriptTarget.Latest, true, kind);
    const imports = [];
    const lineOf = (node) => sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
    sf.forEachChild((node) => {
        const isImport = ts.isImportDeclaration(node);
        const isReExport = ts.isExportDeclaration(node) && node.moduleSpecifier;
        if (!isImport && !isReExport) return;
        const spec = node.moduleSpecifier.text;
        const clause = isImport ? node.importClause : null;
        const typeOnly = isImport
            ? Boolean(clause?.isTypeOnly) ||
              Boolean(
                  clause?.namedBindings &&
                      ts.isNamedImports(clause.namedBindings) &&
                      !clause.name &&
                      clause.namedBindings.elements.length > 0 &&
                      clause.namedBindings.elements.every((e) => e.isTypeOnly),
              )
            : node.isTypeOnly;
        imports.push({ spec, line: lineOf(node), resolved: resolveSpecifier(rel, spec), typeOnly });
    });
    const first = sf.statements[0];
    const useClient =
        first && ts.isExpressionStatement(first) && ts.isStringLiteral(first.expression) && first.expression.text === 'use client';
    const result = { rel, sf, text, imports, useClient, lineOf };
    cache.set(rel, result);
    return result;
}

/** Depth-first visit of every node in a source file. */
export function visit(node, fn) {
    fn(node);
    ts.forEachChild(node, (child) => visit(child, fn));
}

export const hasModifier = (node, kind) => Boolean(ts.getModifiers?.(node)?.some((m) => m.kind === kind));

export { ts };
