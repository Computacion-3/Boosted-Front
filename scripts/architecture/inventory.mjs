#!/usr/bin/env node
// Prints a Markdown inventory of every feature module: entities, repository contracts,
// use cases, DTOs, datasources, mappers, containers, slices/thunks, ViewModels, hooks,
// components and the routes that consume them. Ends with capabilities that exist in
// inner layers but are not exposed outward (reuse candidates).
// Usage: node inventory.mjs [--feature=<name>]
import { sourceFiles, classify, parse, hasModifier, isTestFile, ts } from './arch-lib.mjs';

const onlyFeature = process.argv.slice(2).find((a) => a.startsWith('--feature='))?.split('=')[1];
const files = sourceFiles().filter((f) => !isTestFile(f));

const clean = (s) => s.replace(/\s+/g, ' ').trim();
const params = (node, sf) => node.parameters.map((p) => clean(p.getText(sf))).join(', ');
const sig = (m, sf) => `${m.name.getText(sf)}(${params(m, sf)})${m.type ? `: ${clean(m.type.getText(sf))}` : ''}`;
const isPublic = (m) => !hasModifier(m, ts.SyntaxKind.PrivateKeyword) && !hasModifier(m, ts.SyntaxKind.ProtectedKeyword);

function describeInterface(decl, sf) {
    return decl.members.map((m) => clean(m.getText(sf)).replace(/;$/, ''));
}

function describeClass(cls, sf) {
    const impl = cls.heritageClauses?.find((h) => h.token === ts.SyntaxKind.ImplementsKeyword);
    const ctor = cls.members.find(ts.isConstructorDeclaration);
    const methods = cls.members
        .filter((m) => ts.isMethodDeclaration(m) && isPublic(m))
        .map((m) => `${hasModifier(m, ts.SyntaxKind.StaticKeyword) ? 'static ' : ''}${sig(m, sf)}`);
    return {
        name: cls.name?.text ?? '(anonymous)',
        implements: impl ? impl.types.map((t) => t.getText(sf)) : [],
        ctor: ctor ? params(ctor, sf) : '',
        methods,
    };
}

function declarations(sf) {
    const out = { interfaces: [], classes: [], types: [], functions: [], consts: [] };
    for (const s of sf.statements) {
        if (ts.isInterfaceDeclaration(s)) out.interfaces.push({ name: s.name.text, members: describeInterface(s, sf) });
        else if (ts.isClassDeclaration(s)) out.classes.push(describeClass(s, sf));
        else if (ts.isTypeAliasDeclaration(s)) out.types.push(`${s.name.text} = ${clean(s.type.getText(sf))}`);
        else if (ts.isFunctionDeclaration(s) && s.name) out.functions.push(s);
        else if (ts.isVariableStatement(s)) out.consts.push(...s.declarationList.declarations);
    }
    return out;
}

/** Extracts `{ key: new UseCase(repo) }` pairs from a DI container object literal. */
function containerEntries(decl, sf) {
    if (!decl.initializer || !ts.isObjectLiteralExpression(decl.initializer)) return [];
    return decl.initializer.properties.filter(ts.isPropertyAssignment).map((p) => {
        const init = p.initializer;
        const cls = ts.isNewExpression(init) ? init.expression.getText(sf) : clean(init.getText(sf));
        return `${p.name.getText(sf)} -> ${cls}`;
    });
}

function sliceInfo(sf) {
    const thunks = [];
    let sliceName = null;
    let reducers = [];
    let stateFields = [];
    for (const s of sf.statements) {
        if (ts.isInterfaceDeclaration(s) && /State$/.test(s.name.text)) stateFields = describeInterface(s, sf);
        if (!ts.isVariableStatement(s)) continue;
        for (const d of s.declarationList.declarations) {
            const init = d.initializer;
            if (!init || !ts.isCallExpression(init)) continue;
            const callee = init.expression.getText(sf);
            if (/createAsyncThunk/.test(callee)) {
                const type = init.arguments[0] && ts.isStringLiteral(init.arguments[0]) ? init.arguments[0].text : '?';
                const fn = init.arguments[1];
                const arg = fn && (ts.isArrowFunction(fn) || ts.isFunctionExpression(fn)) && fn.parameters[0] ? clean(fn.parameters[0].getText(sf)) : '';
                const calls = [...fn.getText(sf).matchAll(/(\w+Container)\.(\w+)\.execute/g)].map((m) => `${m[1]}.${m[2]}`);
                thunks.push(`${d.name.getText(sf)} ('${type}')${arg && arg !== '_' ? ` arg: ${arg}` : ''}${calls.length ? ` -> ${calls.join(', ')}` : ''}`);
            }
            if (callee === 'createSlice' && ts.isObjectLiteralExpression(init.arguments[0])) {
                for (const p of init.arguments[0].properties) {
                    if (!ts.isPropertyAssignment(p)) continue;
                    const key = p.name.getText(sf);
                    if (key === 'name' && ts.isStringLiteral(p.initializer)) sliceName = p.initializer.text;
                    if (key === 'reducers' && ts.isObjectLiteralExpression(p.initializer)) {
                        reducers = p.initializer.properties.map((r) => r.name?.getText(sf)).filter(Boolean);
                    }
                }
            }
        }
    }
    return { sliceName, thunks, reducers, stateFields };
}

/** Keys of the object literal returned by a hook function. */
function hookReturn(fn, sf) {
    let keys = [];
    const walkNode = (n) => {
        if (ts.isReturnStatement(n) && n.expression && ts.isObjectLiteralExpression(n.expression)) {
            keys = n.expression.properties.map((p) => p.name?.getText(sf) ?? clean(p.getText(sf)));
        }
        if (!ts.isFunctionLike(n) || n === fn) ts.forEachChild(n, walkNode);
    };
    walkNode(fn);
    return keys;
}

// --- Collect -------------------------------------------------------------------------
const features = new Map();
const feat = (name) => {
    if (!features.has(name)) features.set(name, { files: [], routes: new Set() });
    return features.get(name);
};
const storeReducers = [];

for (const rel of files) {
    const where = classify(rel);
    if (where.area === 'feature') feat(where.feature).files.push({ rel, ...where });
    if (where.area === 'app') {
        for (const imp of parse(rel).imports) {
            const t = imp.resolved ? classify(imp.resolved) : null;
            if (t?.area === 'feature') feat(t.feature).routes.add(rel);
        }
    }
    if (where.area === 'store' && /store\.ts$/.test(rel)) {
        const m = parse(rel).text.match(/reducer\s*:\s*{([\s\S]*?)}/);
        if (m) storeReducers.push(...m[1].split(',').map(clean).filter(Boolean));
    }
}

// --- Print ---------------------------------------------------------------------------
const out = [];
const line = (s = '') => out.push(s);
line('# Architecture inventory');
line();
line(`Global store reducers: ${storeReducers.length ? storeReducers.join(', ') : '(none registered)'}`);

for (const [name, info] of [...features].sort()) {
    if (onlyFeature && name !== onlyFeature) continue;
    line();
    line(`## Feature: ${name}`);
    const repoMethods = new Map(); // interface -> [method names]
    const datasourceMethods = new Map();
    const usedRepoMethods = new Set();
    const containerKeys = [];
    const thunkCalls = new Set();

    const section = (title, layer, sublayer) => {
        const list = info.files.filter((f) => f.layer === layer && (sublayer === undefined || f.sublayer === sublayer));
        if (!list.length) return;
        line(`### ${title}`);
        for (const f of list) {
            const { sf, text } = parse(f.rel);
            const d = declarations(sf);
            line(`- \`${f.rel}\``);
            for (const i of d.interfaces) {
                line(`  - interface **${i.name}**: ${i.members.join('; ') || '(empty)'}`);
                const methodNames = i.members.filter((m) => m.includes('(')).map((m) => m.split('(')[0].trim());
                if (sublayer === 'repositories' && layer === 'domain' && /Repository$/.test(i.name)) repoMethods.set(i.name, methodNames);
                if (sublayer === 'datasources' && /Datasource$/.test(i.name)) datasourceMethods.set(i.name, methodNames);
            }
            for (const t of d.types) line(`  - type ${t}`);
            for (const c of d.classes) {
                const impl = c.implements.length ? ` implements ${c.implements.join(', ')}` : '';
                const ctor = c.ctor ? ` ctor(${c.ctor})` : '';
                line(`  - class **${c.name}**${impl}${ctor}: ${c.methods.join('; ') || '(no public methods)'}`);
                if (sublayer === 'usecases') {
                    for (const m of text.matchAll(/this\.\w+\.(\w+)\(/g)) usedRepoMethods.add(m[1]);
                }
            }
            if (layer === 'di') {
                for (const decl of d.consts) {
                    const entries = containerEntries(decl, sf);
                    if (entries.length) {
                        line(`  - **${decl.name.getText(sf)}**: ${entries.join(', ')}`);
                        containerKeys.push(...entries.map((e) => `${decl.name.getText(sf)}.${e.split(' ')[0]}`));
                    }
                }
            }
            if (layer === 'presentation' && sublayer === 'store') {
                const s = sliceInfo(sf);
                line(`  - slice **${s.sliceName ?? '?'}** state: { ${s.stateFields.join('; ')} }`);
                line(`  - thunks: ${s.thunks.join(' | ') || '(none)'}`);
                line(`  - sync reducers: ${s.reducers.join(', ') || '(none)'}`);
                for (const m of text.matchAll(/(\w+Container)\.(\w+)\.execute/g)) thunkCalls.add(`${m[1]}.${m[2]}`);
            }
            if (layer === 'presentation' && (sublayer === 'hooks' || sublayer === 'components')) {
                for (const fn of d.functions) {
                    if (!hasModifier(fn, ts.SyntaxKind.ExportKeyword)) continue;
                    const detail = sublayer === 'hooks' ? `returns { ${hookReturn(fn, sf).join(', ')} }` : `(${params(fn, sf)})`;
                    line(`  - ${sublayer === 'hooks' ? 'hook' : 'component'} **${fn.name.text}** ${detail}`);
                }
            }
        }
    };

    section('Domain / entities', 'domain', 'entities');
    section('Domain / repository contracts', 'domain', 'repositories');
    section('Domain / use cases', 'domain', 'usecases');
    section('Infrastructure / DTOs', 'infrastructure', 'dtos');
    section('Infrastructure / datasources', 'infrastructure', 'datasources');
    section('Infrastructure / mappers', 'infrastructure', 'mappers');
    section('Infrastructure / repository implementations', 'infrastructure', 'repositories');
    section('DI / composition root', 'di');
    section('Presentation / viewmodels', 'presentation', 'viewmodels');
    section('Presentation / store (slices + thunks)', 'presentation', 'store');
    section('Presentation / hooks (facades)', 'presentation', 'hooks');
    section('Presentation / components', 'presentation', 'components');

    line(`### Consumed by routes`);
    line(info.routes.size ? [...info.routes].map((r) => `- \`${r}\``).join('\n') : '- (no route imports this feature)');

    line(`### Reuse candidates (exist inside, not exposed outward)`);
    const gaps = [];
    for (const [iface, methods] of repoMethods) {
        for (const m of methods) if (!usedRepoMethods.has(m)) gaps.push(`repository method \`${iface}.${m}\` has no use case`);
    }
    for (const key of containerKeys) if (!thunkCalls.has(key)) gaps.push(`use case \`${key}\` is wired in DI but no thunk calls it`);
    line(gaps.length ? gaps.map((g) => `- ${g}`).join('\n') : '- none');
    if (datasourceMethods.size) {
        line(`- datasource contract methods: ${[...datasourceMethods].map(([i, ms]) => `${i}{${ms.join(', ')}}`).join('; ')}`);
    }
}

if (features.size === 0) line('\nNo feature modules found under src/features/.');
console.log(out.join('\n'));
