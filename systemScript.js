async function updateStats() {
    try {
        const res = await fetch('http://localhost:3001/system');
        const data = await res.json();
        
        document.getElementById('cpu-val').innerText = `${data.cpu}%`;
        document.getElementById('cpu-fill').style.width = `${data.cpu}%`;
        
        document.getElementById('ram-val').innerText = `${data.ramUsed}MB`;
        document.getElementById('ram-fill').style.width = `${Math.min((data.ramUsed / data.ramTotal) * 100, 100)}%`;
        
        document.getElementById('temp-val').innerText = `${data.temp}°C`;
        document.getElementById('uptime-val').innerText = data.uptime;

        if (data.disk && data.disk.percent !== 'N/A') {
            const diskPercent = parseInt(data.disk.percent);
            document.getElementById('disk-val').innerText = data.disk.percent;
            document.getElementById('disk-fill').style.width = data.disk.percent;
            document.getElementById('disk-detail').innerText = `${data.disk.used} USED / ${data.disk.total} TOTAL`;

            if (diskPercent >= 90) {
                document.getElementById('disk-fill').classList.remove('fill-orange');
                document.getElementById('disk-fill').classList.add('fill-red');
            }
        }

        if (data.throttled && data.throttled.status !== 'N/A') {
            const isHealthy = data.throttled.status === 'HEALTHY';
            const throttleEl = document.getElementById('throttle-val');
            throttleEl.innerText = data.throttled.status;
            throttleEl.classList.add(isHealthy ? 'status-healthy' : 'status-warning');
            document.getElementById('throttle-card').classList.toggle('card-warning', !isHealthy);
            document.getElementById('throttle-code').innerText = `CODE: ${data.throttled.code}`;
            document.getElementById('throttle-detail').innerText = data.throttled.detail;
        }

        document.getElementById('ip-val').innerText = data.ip;

    } catch (e) { 
        console.error("Connection to Node.js backend failed.");
        ['cpu-val','ram-val','temp-val','uptime-val','disk-val','throttle-val','ip-val']
            .forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.add('status-offline');
            });
    }
}
setInterval(updateStats, 2000);
updateStats();