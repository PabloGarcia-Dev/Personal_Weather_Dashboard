const http = require('http');
const https = require('https');
const urlModule = require('url');

function fetchWithRedirects(targetUrl, headers, callback, maxRedirects = 5) {
    if (maxRedirects === 0) return callback(new Error('Too many redirects'), null, null);
    const parsed = urlModule.parse(targetUrl);
    https.get({ hostname: parsed.hostname, path: parsed.path, headers }, (res) => {
        if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
            return fetchWithRedirects(res.headers.location, headers, callback, maxRedirects - 1);
        }
        let raw = '';
        res.on('data', c => raw += c);
        res.on('end', () => callback(null, res.statusCode, raw));
    }).on('error', err => callback(err, null, null));
}

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    const reqUrl = req.url;
    let targetUrl = '';
    let headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36' };

    if (reqUrl.startsWith('/shuttle')) {
        targetUrl = 'https://ucf.transloc.com/Services/JSONPRelay.svc/GetStopArrivalTimes?apiKey=8882812681&stopIds=54&version=2';

    } else if (reqUrl.startsWith('/parking')) {
        targetUrl = 'https://parking.ucf.edu/wp-json/garage/v2/occupancy';
        headers = {
            ...headers,
            'X-Api-Key':        'ICANTHEARYOUSAYsupercalifragilisticexpialidociousIsALongNameToSay',
            'X-Requested-With': 'XMLHttpRequest',
            'Accept':           'application/json, text/javascript, */*; q=0.01',
            'Referer':          'https://parking.ucf.edu/resources/garage-availability/',
            'Accept-Language':  'en-US,en;q=0.9',
        };

    } else {
        res.writeHead(404);
        return res.end(JSON.stringify({ error: "Route not found." }));
    }

    fetchWithRedirects(targetUrl, headers, (err, statusCode, rawData) => {
        if (err) {
            console.error(`[${reqUrl}] Error:`, err.message);
            res.writeHead(500);
            return res.end(JSON.stringify({ error: err.message }));
        }
        console.log(`[${reqUrl}] Status: ${statusCode} | ${rawData.slice(0, 150)}`);
        if (statusCode < 200 || statusCode >= 300) {
            res.writeHead(500);
            return res.end(JSON.stringify({ error: `API returned ${statusCode}`, body: rawData.slice(0, 200) }));
        }
        res.end(rawData);
    });
});

server.listen(3001, () => console.log('Proxy active at http://localhost:3001'));