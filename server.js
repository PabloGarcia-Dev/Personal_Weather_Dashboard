const http = require('http'); // Dashboard talks to this
const https = require('https'); // UCF website talks to this

const server = http.createServer((req, res) => { // Sets up a "listener" that waits for the dashboard to send a request to the server to run the code
    res.setHeader('Access-Control-Allow-Origin', '*'); // Acts as the 'permission slip' that tells the browser that it is okay to send the information (CORS killer)
    res.setHeader('Content-Type', 'application/json'); // Tell the dashboard it's getting info

    let targetUrl = '';

    if(req.url === '/shuttle'){
        targetUrl = 'https://ucf.transloc.com/Services/JSONPRelay.svc/GetStopArrivalTimes?apiKey=8882812681&stopIds=54&version=2';
    }
    else if(req.url === '/parking'){
        targetUrl = 'https://flow.my.ucf.edu/upstream/parking_widget';
    }
    else{
        res.writeHead(404);
        return res.end(JSON.stringify({ error: "Route not found. Use /shuttle or /parking" }));
    }

    https.get(targetUrl, (apiRes) => {
        let body = '';
        apiRes.on('data', chunk => body += chunk); // Adds the chunks together that come from the internet into the 'body' variable
        apiRes.on('end', () => res.end(body)); // Once all of the chunks are recieved, send all those chunks
    }).on('error', (err) => { // Error handling, prevents crashing
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
    });
});

// Places proxxy server in port 3001 and sends a message in console to let us know it's up
server.listen(3001, () => console.log('Master Proxy active at http://localhost:3001'));