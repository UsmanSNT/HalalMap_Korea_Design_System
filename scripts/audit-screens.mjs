import ts from 'typescript';
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
const roots = ['src/screens', 'src/courier', 'src/dashboard', 'src/admin'];
const files = roots.flatMap(root => readdirSync(root).filter(f => f.endsWith('.tsx')).map(f => `${root}/${f}`));
const inventory = [];
for (const file of files) {
  const source = readFileSync(file, 'utf8');
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const collect = (node, name) => {
    const controls = [], links = new Set();
    const walk = n => {
      if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) {
        const tag = n.tagName.getText(ast);
        if (['button', 'a', 'input', 'select', 'textarea', 'BackButton', 'BottomNav', 'CBottomNav', 'Btn', 'SwipeConfirm'].includes(tag)) {
          const parent = ts.isJsxElement(n.parent) ? n.parent : n;
          const text = parent.getText(ast).replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          controls.push({ line: ast.getLineAndCharacterOfPosition(n.getStart(ast)).line + 1, tag, text: text.slice(0, 180), props: n.attributes.getText(ast).replace(/\s+/g, ' ').slice(0, 260), wired: /onClick|onChange|onSubmit|onConfirm|href|onBack|onTabChange/.test(n.attributes.getText(ast)) });
        }
      }
      if (ts.isCallExpression(n) && /onNavigate|navigate|onNav|navTo|setScreen|setCurrent|setActive/.test(n.expression.getText(ast))) {
        const arg = n.arguments[0];
        if (arg && ts.isStringLiteral(arg)) links.add(arg.text);
      }
      ts.forEachChild(n, walk);
    };
    walk(node);
    inventory.push({ name, file, line: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1, links: [...links], controls });
  };
  for (const statement of ast.statements) {
    if (!statement.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
    if (ts.isFunctionDeclaration(statement) && statement.name) collect(statement, statement.name.text);
    if (ts.isVariableStatement(statement)) for (const d of statement.declarationList.declarations) {
      if (d.initializer && (ts.isArrowFunction(d.initializer) || ts.isFunctionExpression(d.initializer)) && /^[A-Z]/.test(d.name.getText(ast))) collect(d, d.name.getText(ast));
    }
  }
}
mkdirSync('plans', { recursive: true });
const suffix = process.argv.includes('--baseline') ? '-baseline' : '';
writeFileSync(`plans/screen-audit${suffix}.json`, JSON.stringify(inventory, null, 2) + '\n');
console.log(inventory.filter(x => !/Shared|App.tsx/.test(x.file)).map(x => `${x.file}:${x.line} ${x.name} | ${x.controls.filter(c => !c.wired).length}/${x.controls.length} unwired | ${x.links.join(', ')}`).join('\n'));
