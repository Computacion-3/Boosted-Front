#!/usr/bin/env node
// Clean Architecture linter for Next.js + Redux Toolkit feature modules.
// Usage: node lint-clean.mjs [--feature=<name>] [--json] [--strict]
//   --strict  treat warnings as errors (exit code 1)
import {
    STRUCTURE,
    LAYERS,
    UI_PACKAGES,
    STATE_PACKAGES,
    HTTP_PACKAGES,
    sourceFiles,
    classify,
    parse,
    visit,
    hasModifier,
    isTestFile,
    ts,
} from './arch-lib.mjs';

const args = process.argv.slice(2);
const onlyFeature = args.find((a) => a.startsWith('--feature='))?.split('=')[1];
const asJson = args.includes('--json');
const strict = args.includes('--strict');

const findings = [];
const report = (severity, rule, file, line, message, hint) => findings.push({ severity, rule, file, line, message, hint });
const error = (...a) => report('error', ...a);
const warn = (...a) => report('warn', ...a);

const isPackage = (imp) => imp.resolved === null;
const target = (imp) => (imp.resolved ? classify(imp.resolved) : null);

for (const rel of sourceFiles()) {
    const where = classify(rel);
    if (onlyFeature && where.feature !== onlyFeature) continue;
    const file = parse(rel);
    const test = isTestFile(rel);

    if (where.area === 'feature') checkFeatureFile(rel, where, file, test);
    if (where.area === 'app') checkAppFile(rel, file);
    if (where.area === 'store' && !onlyFeature) checkStoreFile(rel, file);
}

function checkFeatureFile(rel, where, file, test) {
    const { feature, layer, sublayer } = where;
    // Next.js Server Actions are the approved server-side boundary in Boosted.
    // Only a module-level directive, not an arbitrary presentation module, qualifies.
    const first = file.sf.statements[0];
    const serverAction = layer === 'presentation' && sublayer === 'actions' && first &&
        ts.isExpressionStatement(first) && ts.isStringLiteral(first.expression) && first.expression.text === 'use server';
    if (layer === 'presentation' && sublayer === 'actions' && !serverAction) {
        error('server-action-boundary', rel, 1, 'Server Actions require a module-level use server directive.');
    }

    // --- Structure and naming -------------------------------------------------
    if (!LAYERS.includes(layer)) {
        warn('structure', rel, 1, `"${layer}" is not a layer. Expected one of: ${LAYERS.join(', ')}.`,
            'Move the file into domain/, infrastructure/, di/ or presentation/.');
    } else if (!test) {
        const allowed = STRUCTURE[layer];
        const name = rel.split('/').pop();
        if (!(sublayer in allowed)) {
            warn('structure', rel, 1, `"${layer}/${sublayer || '(root)'}" is not part of the defined structure.`,
                `Allowed under ${layer}/: ${Object.keys(allowed).map((s) => s || '(root)').join(', ')}. If this is a new concept, agree on it before adding a folder.`);
        } else if (!allowed[sublayer].test(name)) {
            warn('naming', rel, 1, `File name "${name}" does not follow the ${layer}/${sublayer || ''} convention ${allowed[sublayer]}.`);
        }
    }

    // --- Import boundaries ----------------------------------------------------
    for (const imp of file.imports) {
        const t = target(imp);

        if (t?.area === 'feature' && t.feature !== feature) {
            const sev = t.layer === 'domain' ? warn : error;
            sev('cross-feature', rel, imp.line, `Imports "${imp.spec}" from feature "${t.feature}" (${t.layer}).`,
                t.layer === 'domain'
                    ? 'Sharing domain types between features is tolerated; move them to src/core if both features own them.'
                    : 'Features must not reach into each other\'s infrastructure/presentation/di. Expose a use case instead.');
        }

        if (layer === 'domain') {
            if (isPackage(imp)) {
                error('domain-purity', rel, imp.line, `Domain imports package "${imp.spec}".`,
                    'Domain is 100% plain TypeScript: no React, Next.js, Redux, HTTP clients or other libraries.');
            } else if (t && !(t.area === 'feature' && t.layer === 'domain') && !(t.area === 'core' && ['errors', 'domain'].includes(t.sub))) {
                error('domain-purity', rel, imp.line, `Domain depends on an outer layer ("${imp.spec}").`,
                    'Dependencies point inward only. Declare an interface in domain/repositories and let infrastructure implement it.');
            }
        }

        if (layer === 'infrastructure' || layer === 'di') {
            if (isPackage(imp) && (UI_PACKAGES.test(imp.spec) || STATE_PACKAGES.test(imp.spec))) {
                error(`${layer}-boundary`, rel, imp.line, `${layer} imports "${imp.spec}".`,
                    `${layer} must not know about React, Next.js or Redux.`);
            }
            if (t?.area === 'feature' && t.layer === 'presentation') {
                error(`${layer}-boundary`, rel, imp.line, `${layer} imports presentation code ("${imp.spec}").`,
                    'Presentation depends on the inner layers, never the other way around.');
            }
            if (layer === 'infrastructure' && t?.area === 'feature' && t.layer === 'di') {
                error('infrastructure-boundary', rel, imp.line, `Infrastructure imports the composition root ("${imp.spec}").`,
                    'Only di/ wires implementations together; infrastructure receives collaborators through its constructor.');
            }
        }

        if (layer === 'presentation') {
            if (t?.area === 'feature' && t.layer === 'infrastructure') {
                error('presentation-no-infrastructure', rel, imp.line, `Presentation imports infrastructure ("${imp.spec}").`,
                    'DTOs, mappers, datasources and repository implementations stay behind the use cases. Use domain types or ViewModels.');
            }
            if (t?.area === 'feature' && t.layer === 'di' && sublayer !== 'store' && !serverAction) {
                error('di-access', rel, imp.line, `Only slices or verified Server Action modules may read the container; "${rel}" imports "${imp.spec}".`,
                    'Hooks and components reach use cases through thunks: component -> facade hook -> dispatch(thunk) -> container.useCase.execute().');
            }
            if (t?.area === 'feature' && t.layer === 'domain' && t.sublayer === 'usecases') {
                error('usecase-access', rel, imp.line, `Presentation imports a use case class directly ("${imp.spec}").`,
                    'Use cases are instantiated in di/ and invoked by thunks via the container.');
            }
            if (isPackage(imp) && HTTP_PACKAGES.test(imp.spec)) {
                error('presentation-no-http', rel, imp.line, `Presentation imports HTTP client "${imp.spec}".`,
                    'HTTP lives in infrastructure/datasources.');
            }
        }

        if (layer === 'presentation' && sublayer === 'components') {
            const reduxy =
                (isPackage(imp) && STATE_PACKAGES.test(imp.spec)) ||
                t?.area === 'store' ||
                (t?.area === 'feature' && t.layer === 'presentation' && t.sublayer === 'store');
            if (reduxy) {
                error('components-redux-free', rel, imp.line, `Visual component depends on Redux ("${imp.spec}").`,
                    'Components receive props or call the feature facade hook (presentation/hooks/use-*.ts). Never import react-redux, the store or a slice.');
            }
            if (t?.area === 'feature' && t.layer === 'domain' && t.sublayer === 'entities') {
                warn('components-use-viewmodels', rel, imp.line, `Component imports a domain entity ("${imp.spec}").`,
                    'Render ViewModels (presentation/viewmodels) so formatting rules stay out of JSX and Redux state stays serializable.');
            }
        }

        if (layer === 'presentation' && sublayer === 'store' && t?.area === 'feature' && t.layer === 'domain' && t.sublayer === 'entities') {
            warn('slice-serializable', rel, imp.line, `Slice imports a domain entity ("${imp.spec}").`,
                'Redux state must hold plain serializable data. Map entities to ViewModels inside the thunk before returning them.');
        }
    }

    // --- AST checks ---------------------------------------------------------------
    const { sf, lineOf } = file;

    if (layer === 'domain' || (layer === 'presentation' && sublayer !== 'components')) {
        const forbidden = layer === 'domain'
            ? new Set(['fetch', 'window', 'document', 'localStorage', 'sessionStorage', 'XMLHttpRequest', 'process'])
            : new Set(['fetch', 'XMLHttpRequest']);
        visit(sf, (node) => {
            if (!ts.isIdentifier(node) || !forbidden.has(node.text)) return;
            const parent = node.parent;
            // Ignore property names such as `obj.fetch` or `{ fetch: ... }`.
            if (ts.isPropertyAccessExpression(parent) && parent.name === node) return;
            if ((ts.isPropertyAssignment(parent) || ts.isMethodDeclaration(parent) || ts.isPropertySignature(parent) || ts.isMethodSignature(parent)) && parent.name === node) return;
            if (layer === 'domain') {
                error('domain-purity', rel, lineOf(node), `Domain uses the runtime global "${node.text}".`,
                    'Network, browser storage and environment access belong to infrastructure (or to di/ for env-based wiring).');
            } else {
                error('thunk-purity', rel, lineOf(node), `"${node.text}" used in presentation.`,
                    'A thunk never calls fetch directly: it calls container.<useCase>.execute(), which reaches the datasource through the repository.');
            }
        });
    }

    if (layer === 'domain' && sublayer === 'usecases' && !test) {
        const classes = sf.statements.filter(ts.isClassDeclaration);
        if (classes.length === 0) {
            error('usecase-shape', rel, 1, 'Use case file exports no class.', 'One class per user intent with a single public execute() method.');
        }
        for (const cls of classes) {
            const methods = cls.members.filter((m) => ts.isMethodDeclaration(m) && !hasModifier(m, ts.SyntaxKind.PrivateKeyword) && !hasModifier(m, ts.SyntaxKind.ProtectedKeyword));
            const names = methods.map((m) => m.name.getText(sf));
            if (!names.includes('execute')) {
                error('usecase-shape', rel, lineOf(cls), `Use case ${cls.name?.text} has no execute() method.`);
            }
            for (const m of methods) {
                if (m.name.getText(sf) !== 'execute') {
                    warn('usecase-shape', rel, lineOf(m), `Use case exposes extra public method "${m.name.getText(sf)}".`, 'Split it into another use case or make it private.');
                }
            }
            const ctor = cls.members.find(ts.isConstructorDeclaration);
            for (const p of ctor?.parameters ?? []) {
                if (p.type && /Impl\b|Datasource\b/.test(p.type.getText(sf))) {
                    error('usecase-shape', rel, lineOf(p), `Use case depends on a concretion (${p.type.getText(sf)}).`,
                        'Depend on the domain repository interface (DIP).');
                }
            }
        }
    }

    if (layer === 'domain' && sublayer === 'entities') {
        for (const cls of sf.statements.filter(ts.isClassDeclaration)) {
            for (const m of cls.members) {
                if (ts.isPropertyDeclaration(m) && !hasModifier(m, ts.SyntaxKind.PrivateKeyword) && !hasModifier(m, ts.SyntaxKind.ReadonlyKeyword)) {
                    warn('entity-immutability', rel, lineOf(m), `Entity property "${m.name.getText(sf)}" is not readonly.`,
                        'Entities are immutable; produce a new instance to change state.');
                }
            }
        }
    }

    if (layer === 'infrastructure' && (sublayer === 'repositories' || sublayer === 'datasources')) {
        for (const cls of sf.statements.filter(ts.isClassDeclaration)) {
            const implementsClause = cls.heritageClauses?.some((h) => h.token === ts.SyntaxKind.ImplementsKeyword);
            if (!implementsClause) {
                (sublayer === 'repositories' ? error : warn)('contract', rel, lineOf(cls),
                    `${cls.name?.text} does not implement an interface.`,
                    sublayer === 'repositories'
                        ? 'Repository implementations must `implements` the domain repository interface.'
                        : 'Datasources should implement the *-datasource.interface.ts contract so mock and API sources are swappable.');
            }
        }
    }
}

function checkAppFile(rel, file) {
    for (const imp of file.imports) {
        const t = target(imp);
        if (isPackage(imp) && STATE_PACKAGES.test(imp.spec)) {
            error('route-boundary', rel, imp.line, `Route file imports "${imp.spec}".`,
                'Pages consume feature facade hooks; Redux stays inside presentation/hooks and presentation/store.');
        }
        if (t?.area === 'feature' && ['domain', 'infrastructure', 'di'].includes(t.layer) && !imp.typeOnly) {
            const isTypeHome = t.layer === 'domain' && t.sublayer === 'repositories';
            (isTypeHome ? warn : error)('route-boundary', rel, imp.line, `Route file imports ${t.layer} code ("${imp.spec}").`,
                'app/ only composes presentation: hooks (presentation/hooks) and components (presentation/components).');
        }
        if (t?.area === 'feature' && t.layer === 'presentation' && t.sublayer === 'store') {
            error('route-boundary', rel, imp.line, `Route file imports a slice ("${imp.spec}").`, 'Expose what the page needs through the facade hook.');
        }
        if (t?.area === 'store' && !/StoreProvider/.test(imp.spec)) {
            error('route-boundary', rel, imp.line, `Route file imports store internals ("${imp.spec}").`, 'Only the root layout mounts <StoreProvider>.');
        }
    }
}

function checkStoreFile(rel, file) {
    const { sf, lineOf } = file;
    for (const imp of file.imports) {
        const t = target(imp);
        if (t?.area === 'feature' && !(t.layer === 'presentation' && t.sublayer === 'store')) {
            error('store-wiring', rel, imp.line, `Global store imports "${imp.spec}".`,
                'src/store only registers feature reducers from presentation/store/*.slice.ts.');
        }
    }
    if (/StoreProvider\.tsx$/.test(rel) && !file.useClient) {
        error('store-wiring', rel, 1, 'StoreProvider is missing the \'use client\' directive.', 'react-redux uses React Context, which only runs in Client Components.');
    }
    // `export const store = configureStore(...)` at module level leaks state between server requests.
    for (const stmt of sf.statements) {
        if (!ts.isVariableStatement(stmt)) continue;
        for (const d of stmt.declarationList.declarations) {
            if (d.initializer && ts.isCallExpression(d.initializer) && d.initializer.expression.getText(sf) === 'configureStore') {
                error('store-wiring', rel, lineOf(d), 'Store created as a module-level singleton.',
                    'Use a makeStore() factory and create it once per client with useState(makeStore) in StoreProvider.');
            }
        }
    }
    if (/StoreProvider\.tsx$/.test(rel)) {
        visit(sf, (node) => {
            if (ts.isCallExpression(node) && node.expression.getText(sf) === 'makeStore') {
                const inHook = ts.isCallExpression(node.parent) && /^use(State|Ref|Memo)$/.test(node.parent.expression.getText(sf));
                const insideRefGuard = /storeRef\.current/.test(node.parent.getText(sf));
                if (!inHook && !insideRefGuard) {
                    warn('store-wiring', rel, lineOf(node), 'makeStore() called directly in the provider body.',
                        'It recreates the store on every render. Use useState(makeStore) or a useRef guard.');
                }
            }
        });
    }
}

// --- Output ---------------------------------------------------------------------
const errors = findings.filter((f) => f.severity === 'error');
const warnings = findings.filter((f) => f.severity === 'warn');

if (asJson) {
    console.log(JSON.stringify({ errors: errors.length, warnings: warnings.length, findings }, null, 2));
} else {
    const byFile = new Map();
    for (const f of findings) byFile.set(f.file, [...(byFile.get(f.file) ?? []), f]);
    for (const [fileName, list] of [...byFile].sort()) {
        console.log(`\n${fileName}`);
        for (const f of list.sort((a, b) => a.line - b.line)) {
            console.log(`  ${String(f.line).padStart(4)}  ${f.severity.padEnd(5)}  ${f.message}  [${f.rule}]`);
            if (f.hint) console.log(`        -> ${f.hint}`);
        }
    }
    const scope = onlyFeature ? ` (feature: ${onlyFeature})` : '';
    console.log(`\nclean-architecture${scope}: ${errors.length} error(s), ${warnings.length} warning(s)`);
}

process.exit(errors.length > 0 || (strict && warnings.length > 0) ? 1 : 0);
