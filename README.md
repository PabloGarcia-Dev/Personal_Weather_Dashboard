# 🖥️ Personal Dashboard — Raspberry Pi 5 Kiosk

A full-stack living room kiosk dashboard running 24/7 on a Raspberry Pi 5. Displays real-time weather, UCF shuttle arrivals, system health stats, and more — all served from a custom Node.js backend and rendered in a fullscreen Chromium kiosk with no keyboard required.

---

## Features

- **Live Weather** — current conditions, 7-day forecast, and a solar tracker showing sunrise/sunset via Open-Meteo API
- **UCF Shuttle Tracker** — real-time Route 2 arrival times at the Boardwalk stop, with press-urgency alerts
- **System Monitor** — CPU load, RAM usage, temperature (°F), disk usage, throttle status, WiFi signal, and local IP — all pulled from the Pi's hardware in real time
- **MTG Commander Life Counter** — supports 1–10 players, press-and-hold life buttons, commander damage tracking, and randomized defeat messages
- **Day/Night Theme** — automatically switches between light and dark themes based on actual sunrise/sunset times, with audio cues
- **Hamburger Side Menu** — slide-out navigation between the dashboard, MTG counter, and system monitor
- **Auto-retry on WiFi drop** — widgets automatically refresh when internet connectivity is restored

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla JavaScript, HTML, CSS |
| Backend | Node.js (raw HTTP server) |
| Process Manager | PM2 |
| Deployment | Raspberry Pi 5, Chromium Kiosk Mode |
| Weather API | Open-Meteo (free, no key required) |
| Shuttle API | UCF TransLoc |
| System Stats | `vcgencmd`, Node.js `os` module |

---

## Project Structure

```
Personal_Weather_Dashboard/
├── index.html          # Main dashboard page
├── script.js           # Dashboard logic — weather, shuttle, parking, clock
├── style.css           # Dashboard styles
├── server.js           # Node.js proxy server — all API routes + static file serving
├── magicCounter.html   # MTG Commander life counter
├── magicScript.js      # MTG counter logic
├── magicStyle.css      # MTG counter styles
├── system.html         # Pi system monitor page
├── systemScript.js     # System monitor logic
├── systemStyle.css     # System monitor styles
├── images/             # Icons and background images
└── audio/              # Day/night theme audio cues
```

---

## Setup & Deployment

This project is designed to run on a Raspberry Pi 5 as a fullscreen kiosk with no keyboard.

### Prerequisites
- Raspberry Pi 5 running Raspberry Pi OS (Bookworm)
- Node.js 20+
- PM2

### Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Transfer Files
From your computer, run inside the project folder:
```bash
scp -r Personal_Weather_Dashboard/ pi@<PI_IP_ADDRESS>:/home/pi/
```

### Start the Server
```bash
cd /home/pi/Personal_Weather_Dashboard
pm2 start server.js --name "dashboard"
pm2 save
pm2 startup systemd
```

### Kiosk Mode (Auto-launch on Boot)
```bash
mkdir -p /home/pi/.config/autostart
nano /home/pi/.config/autostart/kiosk.desktop
```

Paste:
```ini
[Desktop Entry]
Type=Application
Name=Kiosk
Exec=bash -c "sleep 15 && chromium --noerrdialogs --disable-infobars --kiosk --disable-restore-session-state --no-first-run http://localhost:3001/index.html"
```

### Access from Any Device on the Network
```
http://<PI_IP_ADDRESS>:3001/index.html
```

---

## Server Routes

| Route | Description |
|---|---|
| `GET /` | Serves `index.html` |
| `GET /weather` | Proxies Open-Meteo weather API |
| `GET /shuttle` | Proxies UCF TransLoc shuttle API |
| `GET /system` | Returns Pi hardware stats (CPU, RAM, temp, disk, throttle, IP) |
| Static files | All `.html`, `.css`, `.js`, `.png`, `.jpg`, `.mp3` files served directly |

---

## Known Limitations

> **UCF Parking Widget** — No longer functional. UCF updated their parking API to require authentication in mid-2026, making it inaccessible from an anonymous server-side request. The UCF Shuttle widget is unaffected and still works correctly.
>
> This limitation, along with a desire to adopt modern frameworks, is the primary motivation for V2.

---

## Authors

Built by **Alexander Grigalashvili** and **Pablo Garcia**

---

<img width="2560" height="1439" alt="image" src="https://github.com/user-attachments/assets/c04bff01-76fa-4863-9b29-28cef00d5615" />

---

> **V2 in progress** — A rebuilt version using React, Vite, Tailwind CSS, Express, and Socket.io is currently in development. V2 will also include a laundry machine monitor and AdGuard Home stats widget.
