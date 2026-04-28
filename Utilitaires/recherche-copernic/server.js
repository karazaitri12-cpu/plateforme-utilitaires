const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const PORT = 3456;

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Servir la page HTML principale
    if (req.url === '/' || req.url === '/index.html') {
        const htmlPath = path.join(__dirname, 'index.html');
        fs.readFile(htmlPath, (err, data) => {
            if (err) {
                res.writeHead(404);
                return res.end('Page non trouvée');
            }
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            return res.end(data);
        });
        return;
    }
    
    if (req.url === '/ping') {
        res.writeHead(200);
        return res.end('ok');
    }

    try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const filePath = url.searchParams.get('path');

        if (url.pathname === '/open' && filePath) {
            const cmd = process.platform === 'win32' 
                ? `start "" "${filePath}"` 
                : `xdg-open "${filePath}"`;
            exec(cmd);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ ok: true }));
        }

        if (url.pathname === '/explore' && filePath) {
            const cmd = process.platform === 'win32' 
                ? `explorer /select, "${filePath}"` 
                : `xdg-open "${path.dirname(filePath)}"`;
            exec(cmd);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ ok: true }));
        }

        if (url.pathname === '/delete' && filePath) {
            fs.unlink(filePath, (err) => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                if (err) {
                    return res.end(JSON.stringify({ ok: false, error: err.message }));
                }
                return res.end(JSON.stringify({ ok: true }));
            });
            return;
        }

    } catch (e) {
        // Ignorer les erreurs
    }

    res.writeHead(404);
    res.end('Page non trouvée');
});

server.listen(PORT, () => {
    console.log('\n========================================');
    console.log('   🔍 FileSearch — Serveur démarré     ');
    console.log(`   http://localhost:${PORT}            `);
    console.log('========================================\n');
    console.log('✅ Laissez cette fenêtre ouverte\n');
});
