const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const PORT = 3456;

const server = http.createServer((req, res) => {
    // TRÈS IMPORTANT : Autorise ton site GitHub à parler à ton PC
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        return res.end();
    }

    if (req.url === '/ping') {
        res.writeHead(200);
        return res.end('ok');
    }

    try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const filePath = url.searchParams.get('path');

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
        // Ignorer les erreurs
    }

    res.writeHead(404);
    res.end('Not Found');
});

server.listen(PORT, () => {
    console.log('\n======================================================');
    console.log(' 🔌 Pont Local FileSearch activé !');
    console.log(' 🌐 Allez sur votre site GitHub pour faire vos recherches.');
    console.log('======================================================\n');
    console.log('Laissez cette fenêtre ouverte.\n');
});
