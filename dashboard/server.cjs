const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');

const PORT = 9000;
const PROJECT_ROOT = path.resolve(__dirname, '..');

let viteProcess = null;
let viteUrl = 'http://localhost:5173';
let logBuffer = [];
let clients = [];

// Initialize starting status logs
logBuffer.push('[System] Portfolio Dev Server Controller initialized.\n');
logBuffer.push('[System] Ready to start dev server.\n');

function broadcast(jsonData) {
  const payload = `data: ${JSON.stringify(jsonData)}\n\n`;
  clients.forEach(c => {
    try {
      c.write(payload);
    } catch (e) {
      // client connection might have broken
    }
  });
}

const server = http.createServer((req, res) => {
  // Serve frontend files
  if (req.url === '/' || req.url === '/index.html') {
    fs.readFile(path.join(__dirname, 'index.html'), 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading dashboard UI: ' + err.message);
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }

  // API: Status and Log streaming (SSE)
  if (req.url === '/api/logs') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    // Send initial status and existing logs buffer
    res.write(`data: ${JSON.stringify({ type: 'status', running: viteProcess !== null, url: viteUrl })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: 'logs', data: logBuffer.join('') })}\n\n`);

    const client = res;
    clients.push(client);

    req.on('close', () => {
      clients = clients.filter(c => c !== client);
    });
    return;
  }

  // API: Start Server
  if (req.url === '/api/start' && req.method === 'POST') {
    if (viteProcess) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Server is already running.' }));
      return;
    }

    const startMsg = `\n[System] Spawning dev server (npm run dev)...\n`;
    logBuffer.push(startMsg);
    broadcast({ type: 'logs', data: startMsg });
    broadcast({ type: 'status', running: true, url: viteUrl });

    // On Windows, spawn npm.cmd with shell enabled
    viteProcess = spawn('npm.cmd', ['run', 'dev'], {
      cwd: PROJECT_ROOT,
      shell: true
    });

    viteProcess.stdout.on('data', (data) => {
      const text = data.toString();
      logBuffer.push(text);
      if (logBuffer.length > 1000) logBuffer.shift();

      // Check if Vite printed its localhost URL
      const match = text.match(/(https?:\/\/localhost:\d+\/?)/i) || text.match(/(https?:\/\/127\.0\.0\.1:\d+\/?)/i);
      if (match) {
        viteUrl = match[1];
        broadcast({ type: 'status', running: true, url: viteUrl });
      }

      broadcast({ type: 'logs', data: text });
    });

    viteProcess.stderr.on('data', (data) => {
      const text = data.toString();
      logBuffer.push(text);
      if (logBuffer.length > 1000) logBuffer.shift();
      broadcast({ type: 'logs', data: text });
    });

    viteProcess.on('close', (code) => {
      viteProcess = null;
      viteUrl = 'http://localhost:5173'; // Reset to default
      broadcast({ type: 'status', running: false });
      const exitMsg = `\n[System] Vite process exited with code ${code}\n`;
      logBuffer.push(exitMsg);
      broadcast({ type: 'logs', data: exitMsg });
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Dev server starting...' }));
    return;
  }

  // API: Stop Server
  if (req.url === '/api/stop' && req.method === 'POST') {
    if (!viteProcess) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Server is not running.' }));
      return;
    }

    const stopMsg = `\n[System] Stopping dev server...\n`;
    logBuffer.push(stopMsg);
    broadcast({ type: 'logs', data: stopMsg });

    // Use taskkill on Windows to clean process tree of cmd/npm/node wrapper
    exec(`taskkill /pid ${viteProcess.pid} /T /F`, (err) => {
      if (err) {
        // Fallback to direct kill if taskkill fails
        if (viteProcess) {
          viteProcess.kill();
        }
      }
      viteProcess = null;
      broadcast({ type: 'status', running: false });
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Dev server stopped.' }));
    });
    return;
  }

  // API: Shutdown Controller
  if (req.url === '/api/shutdown' && req.method === 'POST') {
    const shutdownMsg = `\n[System] Shutting down control panel. Goodbye!\n`;
    logBuffer.push(shutdownMsg);
    broadcast({ type: 'logs', data: shutdownMsg });
    broadcast({ type: 'status', running: false });

    // Stop Vite if running
    if (viteProcess) {
      exec(`taskkill /pid ${viteProcess.pid} /T /F`, () => {
        viteProcess = null;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Controller and Vite stopped.' }));
        setTimeout(() => process.exit(0), 500);
      });
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Controller stopped.' }));
      setTimeout(() => process.exit(0), 500);
    }
    return;
  }

  // Fallback 404
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`======================================================`);
  console.log(`     PORTFOLIO DEVELOPMENT SERVER DASHBOARD`);
  console.log(`======================================================`);
  console.log(`Dashboard is running at: http://localhost:${PORT}`);
  console.log(`Project root path: ${PROJECT_ROOT}`);
  console.log(``);
  console.log(`To shut down the control panel:`);
  console.log(`- Click "Shutdown Control Panel" in the web browser.`);
  console.log(`- Or close this CMD window / press Ctrl+C.`);
  console.log(`======================================================`);
});
