const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os'); 

const PORT = 3456;

const server = http.createServer((req, res) => {
    // SÉCURITÉ : Autorise GitHub à parler au PC
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        return res.end();
    }

    try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const filePath = url.searchParams.get('path');

        if (url.pathname === '/default-root') {
            const defaultRoot = path.join(os.homedir(), 'Documents');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ root: defaultRoot }));
        }

        if (url.pathname === '/open' && filePath) {
            const cmd = process.platform === 'win32' ? `start "" "${filePath}"` : `xdg-open "${filePath}"`;
            exec(cmd);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ ok: true }));
        }

        if (url.pathname === '/explore' && filePath) {
            const cmd = process.platform === 'win32' ? `explorer /select,"${filePath}"` : `xdg-open "${path.dirname(filePath)}"`;
            exec(cmd);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ ok: true }));
        }

        if (url.pathname === '/delete' && filePath) {
            fs.unlink(filePath, (err) => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                if (err) return res.end(JSON.stringify({ ok: false, error: err.message }));
                return res.end(JSON.stringify({ ok: true }));
            });
            return;
        }
    } catch (e) {
        // Ignorer les requêtes mal formées
    }

    res.writeHead(404);
    res.end('Not Found');
});

// IMPORTANT : On force l'écoute sur 127.0.0.1 pour être en phase avec le site web
server.listen(PORT, '127.0.0.1', () => {
    console.log('\n======================================================');
    console.log(' 🔌 Moteur de recherche Copernic activé !');
    console.log(` 👤 Utilisateur détecté : ${os.userInfo().username}`);
    console.log(' 🌐 Allez sur votre site Web pour faire vos recherches.');
    console.log('======================================================\n');
    console.log('Laissez cette fenêtre ouverte.\n');
});
