const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = 3456;

const server = http.createServer((req, res) => {
  // CORS pour autoriser les requêtes depuis GitHub Pages
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Gestion des requêtes OPTIONS (preflight CORS)
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // Health check
  if (req.url === '/ping') {
    res.writeHead(200);
    return res.end('ok');
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const filePath = url.searchParams.get('path');

    // Ouvrir un fichier avec l'application par défaut
    if (url.pathname === '/open' && filePath) {
      const cmd = process.platform === 'win32'
        ? `start "" "${filePath}"`
        : process.platform === 'darwin'
          ? `open "${filePath}"`
          : `xdg-open "${filePath}"`;
      
      exec(cmd, (err) => {
        if (err) console.error('Erreur open:', err);
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ok: true }));
    }

    // Ouvrir l'explorateur sur le dossier contenant le fichier
    if (url.pathname === '/explore' && filePath) {
      const dir = path.dirname(filePath);
      const cmd = process.platform === 'win32'
        ? `explorer /select,"${filePath}"`
        : process.platform === 'darwin'
          ? `open "${dir}"`
          : `xdg-open "${dir}"`;
      
      exec(cmd, (err) => {
        if (err) console.error('Erreur explore:', err);
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ok: true }));
    }

    // Supprimer un fichier (avec confirmation côté client recommandée)
    if (url.pathname === '/delete' && filePath) {
      fs.unlink(filePath, (err) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        if (err) {
          console.error('Erreur delete:', err);
          return res.end(JSON.stringify({ ok: false, error: err.message }));
        }
        return res.end(JSON.stringify({ ok: true }));
      });
      return;
    }

  } catch (e) {
    // Ignorer les erreurs de parsing d'URL
    console.error('Erreur URL:', e.message);
  }

  // Route non trouvée
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('\n' + '='.repeat(50));
  console.log('   🔍 Recherche Copernic — Serveur local');
  console.log('   Port : http://127.0.0.1:' + PORT);
  console.log('   URL frontend : http://localhost:' + PORT + '/index.html');
  console.log('='.repeat(50) + '\n');
  console.log('✓ Serveur prêt. Laissez cette fenêtre ouverte.');
  console.log('✗ Appuyez sur Ctrl+C pour arrêter le serveur.\n');
});

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur...');
  server.close(() => {
    console.log('✓ Serveur arrêté.');
    process.exit(0);
  });
});