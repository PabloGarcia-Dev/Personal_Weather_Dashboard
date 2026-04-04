const http = require('http');
const https = require('https');
const os = require('os');
const { exec } = require('child_process');

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    let targetUrl = '';

    if (req.url === '/shuttle') {
        targetUrl = 'https://ucf.transloc.com/Services/JSONPRelay.svc/GetStopArrivalTimes?apiKey=8882812681&stopIds=54&version=2';
    } else if (req.url === '/parking') {
        targetUrl = 'https://flow.my.ucf.edu/upstream/parking_widget';
    } else if (req.url === '/system') {

        // Get local IP address (first non-internal IPv4)
        const nets = os.networkInterfaces();
        let localIP = 'N/A';
        for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
                if (net.family === 'IPv4' && !net.internal) {
                    localIP = net.address;
                    break;
                }
            }
            if (localIP !== 'N/A') break;
        }

        // Run all exec commands in parallel using a counter
        let results = {};
        let pending = 3;

        const done = () => {
            if (--pending === 0) {
                const stats = {
                    cpu: Math.round(os.loadavg()[0] * 100 / os.cpus().length),
                    ramUsed: Math.round((os.totalmem() - os.freemem()) / 1024 / 1024),
                    ramTotal: Math.round(os.totalmem() / 1024 / 1024),
                    temp: results.temp || 'N/A',
                    uptime: Math.round(os.uptime() / 3600) + ' hours',
                    disk: results.disk || 'N/A',
                    throttled: results.throttled || 'N/A',
                    ip: localIP
                };
                res.end(JSON.stringify(stats));
            }
        };

        // CPU Temperature
        exec('vcgencmd measure_temp', (err, stdout) => {
            results.temp = stdout ? stdout.replace('temp=', '').replace("'C\n", '').trim() : 'N/A';
            done();
        });

        // Disk Usage — parses "df -h /" output for used/total/percent
        exec("df -h / | awk 'NR==2 {print $2, $3, $5}'", (err, stdout) => {
            if (stdout) {
                const parts = stdout.trim().split(' ');
                results.disk = { total: parts[0], used: parts[1], percent: parts[2] };
            } else {
                results.disk = { total: 'N/A', used: 'N/A', percent: 'N/A' };
            }
            done();
        });

        // Throttle Status — 0x0 means healthy, anything else means trouble
        // Bit flags: 0=under-voltage, 1=freq-capped, 2=throttled, 16=under-voltage occurred, etc.
        exec('vcgencmd get_throttled', (err, stdout) => {
            if (stdout) {
                const raw = stdout.replace('throttled=', '').trim();
                const val = parseInt(raw, 16);

                if (val === 0) {
                    results.throttled = { status: 'HEALTHY', code: raw, detail: 'No issues detected' };
                } else {
                    const flags = [];
                    if (val & 0x1)  flags.push('Under-voltage!');
                    if (val & 0x2)  flags.push('Freq capped');
                    if (val & 0x4)  flags.push('Throttled!');
                    if (val & 0x10000) flags.push('Under-voltage occurred');
                    if (val & 0x20000) flags.push('Freq cap occurred');
                    if (val & 0x40000) flags.push('Throttle occurred');
                    results.throttled = { status: 'WARNING', code: raw, detail: flags.join(', ') };
                }
            } else {
                results.throttled = { status: 'N/A', code: 'N/A', detail: 'vcgencmd unavailable' };
            }
            done();
        });

        return; // Don't fall through to https.get()

    } else {
        res.writeHead(404);
        return res.end(JSON.stringify({ error: 'Route not found. Use /shuttle, /parking, or /system' }));
    }

    // Only /shuttle and /parking reach this point
    https.get(targetUrl, (apiRes) => {
        let body = '';
        apiRes.on('data', chunk => body += chunk);
        apiRes.on('end', () => res.end(body));
    }).on('error', (err) => {
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
    });
});

server.listen(3001, () => console.log('Master Proxy active at http://localhost:3001'));