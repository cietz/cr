// ==========================================
// CLASH ROYALE API PROXY SERVER
// Contorna restrições de CORS para chamadas da API
// ==========================================

const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 3001;
const API_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjU5ZTRhM2ZkLTZlYTMtNDI1ZC04OWExLWE5Yjc4NjIyYTIxZSIsImlhdCI6MTc2NjUwNjg0Mywic3ViIjoiZGV2ZWxvcGVyLzY0NzlkNmNlLTRjZDEtN2U0Ni0wYjY4LTNkYjE2Mzg5MDY3ZCIsInNjb3BlcyI6WyJyb3lhbGUiXSwibGltaXRzIjpbeyJ0aWVyIjoiZGV2ZWxvcGVyL3NpbHZlciIsInR5cGUiOiJ0aHJvdHRsaW5nIn0seyJjaWRycyI6WyIyMDEuMTgyLjEyMi4xMSJdLCJ0eXBlIjoiY2xpZW50In1dfQ.Dw4OjRnlFN2Z85YL02XofoadgbsUQ1rDjB0JgeLxJTUfndWcYvTyov0r0Doj5IraIh9lggp9QFyieep2BB1SxA';

const server = http.createServer((req, res) => {
  // Headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Responde preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  
  // Rota: GET /player?tag=XXXXX
  if (parsedUrl.pathname === '/player' && req.method === 'GET') {
    let playerTag = parsedUrl.query.tag;
    
    if (!playerTag) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Player tag is required' }));
      return;
    }

    // Remove # se presente e codifica para URL
    playerTag = playerTag.replace('#', '');
    const encodedTag = encodeURIComponent('#' + playerTag);

    const options = {
      hostname: 'api.clashroyale.com',
      path: `/v1/players/${encodedTag}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Accept': 'application/json'
      }
    };

    console.log(`[API] Buscando jogador: #${playerTag}`);

    const apiReq = https.request(options, (apiRes) => {
      let data = '';
      
      apiRes.on('data', chunk => {
        data += chunk;
      });
      
      apiRes.on('end', () => {
        res.writeHead(apiRes.statusCode, { 'Content-Type': 'application/json' });
        res.end(data);
        
        if (apiRes.statusCode === 200) {
          const player = JSON.parse(data);
          console.log(`[API] Jogador encontrado: ${player.name} (${player.tag})`);
        } else {
          console.log(`[API] Erro: ${apiRes.statusCode}`);
        }
      });
    });

    apiReq.on('error', (error) => {
      console.error('[API] Erro na requisição:', error.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to fetch player data', details: error.message }));
    });

    apiReq.end();
    return;
  }

  // Rota padrão - 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║   🏆 CLASH ROYALE API PROXY                       ║
║   Servidor rodando em http://localhost:${PORT}       ║
║                                                   ║
║   Uso: GET /player?tag=XXXXX                      ║
║   Exemplo: http://localhost:${PORT}/player?tag=2ABC  ║
╚═══════════════════════════════════════════════════╝
  `);
});
