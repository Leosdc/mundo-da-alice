const https = require('https');

const [token, owner, repo] = process.argv.slice(2);

if (!token || !owner || !repo) {
    console.log('Usage: node clean-deployments.js <token> <owner> <repo>');
    process.exit(1);
}

const headers = {
    'Authorization': `token ${token}`,
    'User-Agent': 'Node.js',
    'Accept': 'application/vnd.github.v3+json'
};

async function request(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            port: 443,
            path,
            method,
            headers
        };

        if (body) {
            options.headers['Content-Type'] = 'application/json';
            options.headers['Content-Length'] = Buffer.byteLength(body);
        }

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 400 && res.statusCode !== 404) {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                } else {
                    resolve(data ? JSON.parse(data) : (res.statusCode === 204 ? null : {}));
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

async function clean() {
    console.log(`🔍 Buscando deployments para ${owner}/${repo}...`);
    try {
        const deployments = await request(`/repos/${owner}/${repo}/deployments`);
        console.log(`Found ${deployments.length} deployments.`);

        for (const dep of deployments) {
            console.log(`⏳ Desativando deployment ${dep.id} (${dep.environment})...`);

            // Set status to inactive
            await request(`/repos/${owner}/${repo}/deployments/${dep.id}/statuses`, 'POST', JSON.stringify({
                state: 'inactive'
            }));

            console.log(`🗑️ Deletando deployment ${dep.id}...`);
            await request(`/repos/${owner}/${repo}/deployments/${dep.id}`, 'DELETE');
        }

        console.log('✨ Limpeza concluída!');
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

clean();
