const http = require('http');
const os = require('os');

function getIpAddresses() {
  const interfaces = os.networkInterfaces();
  return Object.values(interfaces)
    .flat()
    .filter(Boolean)
    .filter(({ internal }) => !internal)
    .map(({ address }) => address);
}

function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  const headers = Object.entries(req.headers)
    .map(([name, value]) => `<li><strong>${esc(name)}:</strong> ${esc(value)}</li>`)
    .join('');

  const html = `<!doctype html>
<html>
<head><meta charset="utf-8"><title>Node test app</title></head>
<body>
  <h1>Node.js test app</h1>
  <dl>
    <dt>Container hostname</dt><dd>${esc(os.hostname())}</dd>
    <dt>Container IP address(es)</dt><dd>${esc(getIpAddresses().join(', ') || 'none')}</dd>
    <dt>HTTP hostname</dt><dd>${esc(req.headers.host || '')}</dd>
    <dt>URI requested</dt><dd>${esc(req.url)}</dd>
  </dl>
  <h2>HTTP request headers</h2>
  <ul>${headers}</ul>
</body>
</html>`;

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
});

const port = Number(process.env.PORT || 8080);
server.listen(port, '0.0.0.0', () => {
  console.log(`Listening on 0.0.0.0:${port}`);
});
