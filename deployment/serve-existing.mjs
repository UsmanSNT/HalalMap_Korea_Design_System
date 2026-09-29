import { createServer, request } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
process.env.API_PORT = '18787';
await import('../server/index.mjs');
const dist = resolve('C:/server/halalmap-korea/dist');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon','.txt':'text/plain','.woff2':'font/woff2'};
createServer((req,res) => {
  if ((req.url || '').startsWith('/api/')) {
    const upstream = request({hostname:'127.0.0.1',port:18787,path:req.url,method:req.method,headers:{...req.headers,host:'127.0.0.1:18787'}}, reply => {res.writeHead(reply.statusCode || 502,reply.headers);reply.pipe(res);});
    upstream.setTimeout(15000,()=>upstream.destroy(new Error('API timeout')));
    upstream.on('error',()=>{if(!res.headersSent)res.writeHead(502,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'HalalMap API unavailable'}));});
    req.pipe(upstream); return;
  }
  if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405);res.end();return;}
  try {
    const path = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    let file = resolve(dist, '.' + path);
    if (file !== dist && !file.startsWith(dist+sep)) {res.writeHead(403);res.end();return;}
    if (!existsSync(file) || !statSync(file).isFile()) {
      if (extname(file)) {res.writeHead(404);res.end();return;}
      file = resolve(dist,'index.html');
    }
    res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':extname(file)==='.html'?'no-cache':'public, max-age=3600'});
    if(req.method==='HEAD')res.end();else createReadStream(file).on('error',()=>res.destroy()).pipe(res);
  } catch {res.writeHead(400);res.end('Bad request');}
}).listen(8443,'127.0.0.1',()=>console.log('HalalMap web ready on 127.0.0.1:8443; API on 127.0.0.1:18787'));
