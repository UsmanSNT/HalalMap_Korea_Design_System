import ts from 'typescript';
import fs from 'node:fs';
for (const file of fs.readdirSync('src/screens').filter(f=>f.endsWith('Screens.tsx'))) {
 const source=fs.readFileSync(`src/screens/${file}`,'utf8');
 const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 function visit(n) {
  if(ts.isJsxElement(n) && n.openingElement.tagName.getText(ast)==='button') {
   const attrs=n.openingElement.attributes.properties.map(a=>a.name?.getText(ast));
   if(!attrs.includes('onClick') && !attrs.includes('disabled') && !n.openingElement.getText(ast).includes('type="submit"')) {
    console.log(`${file}:${ast.getLineAndCharacterOfPosition(n.getStart()).line+1} ${n.getText(ast).match(/t\(["`]([^"`]+)["`]\)/g)?.join(' ') ?? n.getText(ast).replace(/<[^>]*>/g,'').replace(/\s+/g,' ').slice(-130)}`);
   }
  }
  ts.forEachChild(n,visit);
 }
 visit(ast);
}
