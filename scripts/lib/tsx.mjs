import ts from 'typescript';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const read = p => readFileSync(p, 'utf8');
const edit = (p, fn) => writeFileSync(p, fn(read(p)));
function component(file, name, fn) {
  const source = read(file), ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  for (const st of ast.statements) {
    if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) if (d.name.getText(ast) === name) {
      const start = st.getStart(ast), end = st.end;
      writeFileSync(file, source.slice(0,start) + fn(source.slice(start,end)) + source.slice(end)); return;
    }
  }
  throw new Error(`Missing ${name}`);
}
function hook(source, code) {
  const ast = ts.createSourceFile('x.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const arrow = ast.statements[0].declarationList.declarations[0].initializer;
  if (ts.isBlock(arrow.body)) return source.slice(0,arrow.body.getStart(ast)+1) + '\n' + code + '\n' + source.slice(arrow.body.getStart(ast)+1);
  const start = arrow.body.getStart(ast), end = arrow.body.end;
  return source.slice(0,start) + '{\n' + code + '\nreturn ' + source.slice(start,end) + ';\n}' + source.slice(end);
}
function wire(source, mappings, tags = ['button']) {
  const ast = ts.createSourceFile('x.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX), patches = [];
  const walk = n => {
    if (ts.isJsxOpeningElement(n) && tags.includes(n.tagName.getText(ast)) && !n.attributes.properties.some(p => p.name?.getText(ast) === 'onClick')) {
      const text = n.parent.getText(ast).replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g,' ').trim();
      const entry = mappings.find(([match]) => typeof match === 'string' ? text === match : match.test(text));
      if (entry) patches.push([n.tagName.end, `${n.tagName.getText(ast) === 'button' ? ' type="button"' : ''} onClick={${entry[1]}}`]);
    }
    ts.forEachChild(n, walk);
  }; walk(ast);
  for (const [pos,text] of patches.sort((a,b)=>b[0]-a[0])) source = source.slice(0,pos)+text+source.slice(pos);
  return source.replace(/type="button" onClick=(\{[^\n]*?\}) type="button"/g, 'type="button" onClick=$1');
}

export { read, edit, component, hook, wire };
