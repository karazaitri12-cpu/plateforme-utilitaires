const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os'); 

const PORT = 3456;

const server = http.createServer((req, res) => {
    
    // 🛡️ CORRECTION SÉCURITÉ (PNA) : La poignée de main parfaite pour GitHub Pages
    // Au lieu de dire "*", on renvoie exactement l'adresse du site qui nous appelle
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Request-Private-Network');
    res.setHeader('Access-Control-Allow-Private-Network', 'true');

    // Réponse immédiate pour la vérification de sécurité (Preflight Chrome)
    if (req.method === 'OPTIONS') {
        res.writeHead(204); // 204 (No Content) est le code standard pour OPTIONS
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

// IMPORTANT : On force l'écoute sur 127.0.0.1
server.listen(PORT, '127.0.0.1', () => {
    console.log('\n======================================================');
    console.log(' 🔌 Moteur de recherche Copernic activé !');
    console.log(` 👤 Utilisateur détecté : ${os.userInfo().username}`);
    console.log(' 🔓 Sécurité PNA : Désactivée (Liaison GitHub Parfaite)');
    console.log(' 🌐 Allez sur votre site Web pour faire vos recherches.');
    console.log('======================================================\n');
    console.log('Laissez cette fenêtre noire ouverte pour que le site fonctionne.\n');
});
