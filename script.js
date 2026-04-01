const daylightSound = new Audio('audio/Luffy_Theme.mp3'); 
const nightfallSound = new Audio('audio/Zoro_Theme.mp3');

let hasPlayedDaySound = false;
let hasPlayedNightSound = false;

/*========================================================== Clock Function ==========================================================*/
function updateClock(){
    const now = new Date(); // Creates a Date object called 'now' to access the date and time

    let hours = now.getHours(); // .padStart() function adds whatever character is specified at the beginning of the string if it doesn't have the required number of characters: in this case 2
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    document.getElementById('time').innerHTML = `
            <span>${hours.toString().padStart(2, '0')}:${minutes}:${seconds}</span><span style="font-size: 6rem">${ampm}</span>

    `; // sets the hours, minutes and seconds by updating HTML

    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }; // specifies the actual format for the date
    document.getElementById('date').textContent = now.toLocaleDateString('en-US', options); // using the 'now' object, it sets the date with the specified format and updtaes HTML

    // Logic for Night Time theme
    const root = document.documentElement;
    
    if((hours >= 6 && ampm == "PM") || (hours <= 7 && ampm == "AM")){
        root.style.setProperty('--bg', '#0D0D0B');
        root.style.setProperty('--text-primary', '#E0DFD5');
        root.style.setProperty('--text-secondary', '#63635E');
        root.style.setProperty('--widget-bg', '#1A1A18');
        root.style.setProperty('--widget-border', 'rgba(255, 255, 255, 0.05)');
        root.style.setProperty('--accent', '#501f1f');

        // Play sound ONLY when entering Night mode for the first time
        if(!hasPlayedNightSound){
            nightfallSound.play().catch(e => console.log("Audio blocked: Needs user interaction"));
            hasPlayedNightSound = true;
            hasPlayedDaySound = false; // load the Day sound for tomorrow morning
        }
    }
    else{
        root.style.setProperty('--bg', '#F5F2EC');
        root.style.setProperty('--text-primary', '#1A1A18');
        root.style.setProperty('--text-secondary', '#8A8880');
        root.style.setProperty('--widget-bg', '#FFFFFF');
        root.style.setProperty('--widget-border', 'rgba(0, 0, 0, 0.07)');
        root.style.setProperty('--accent', '#d7fffe');

        // Play sound ONLY when entering Day mode for the first time
        if(!hasPlayedDaySound){
            // Check if it's NOT the very first second of the script loading
            daylightSound.play().catch(e => console.log("Audio blocked: Needs user interaction"));
            hasPlayedDaySound = true;
            hasPlayedNightSound = false; // load the Night sound for tonight
        }
    }
}


/*========================================================== Weather Function ==========================================================*/
async function getWeather(){ // async is a keyword that is used when we don't really want a function to activate instantly and is waiting for another condition
    const latitude = 28.586779934551355; // coordinates of where we are
    const longitude = -81.20615364774744;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=precipitation_probability&daily=sunrise,sunset,temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`;
    // URL for reference: https://api.open-meteo.com/v1/forecast?latitude=28.586779934551355&longitude=-81.20615364774744&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=precipitation_probability&daily=sunrise,sunset,temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto


    try{
        const response = await fetch(url);
        if(!response.ok){
            throw new Error('Network response was not ok'); // If the response is not okay, then through an error out
        }

        const dataRecieved = await response.json(); // parsing the string that we got to an actual javascript object

        const currentWeather = dataRecieved.current; // Current Weather
        const humidity = dataRecieved.current ? dataRecieved.current.relative_humidity_2m : "N/A"; // Humidity level
        const dailyWeather = dataRecieved.daily; // For Forecast
        const weatherCodes = { // Translating weather codes that Open-Meteo sends
            0: "Clear sky",
            1: "Mainly clear",
            2: "Partly cloudy",
            3: "Overcast",
            45: "Fog",
            48: "Depositing rime fog",
            51: "Light drizzle: Take Umbrella",
            53: "Moderate drizzle: Take Umbrella",
            55: "Dense drizzle: Take Umbrella",
            61: "Slight rain: Take Umbrella",
            63: "Moderate rain: Take Umbrella",
            65: "Heavy rain: Take Umbrella",
            80: "Slight rain showers: Take Umbrella",
            95: "Thunderstorm: Take Umbrella"
        }
        const description = weatherCodes[currentWeather.weather_code] || "Unknown condition"; // Description, If unknown pops up, go into URL and see what the current weather code is
        const currentRainChance = dataRecieved.hourly.precipitation_probability[0];

        // Injecting HTML for the weather widget
        document.getElementById('weather-widget').innerHTML = `
            <div class="weather-header">
                <p>Current Conditions</p>
            </div>
            <div class="weather-main">
                <div class="main-temp">${Math.round(currentWeather.temperature_2m)}°</div>
                <div class="main-desc">
                    <span class="condition-text">${description}</span>
                    <span class="high-low">High: ${Math.round(dailyWeather.temperature_2m_max[0])}° • Low: ${Math.round(dailyWeather.temperature_2m_min[0])}°</span>
                </div>
            </div>
            <div class="weather-grid">
                <div class="stat-item">
                    <span class="stat-label">Wind</span>
                    <span class="stat-value">${currentWeather.wind_speed_10m} <small>mph</small></span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Humidity</span>
                    <span class="stat-value">${humidity}%</span>
                </div>
                <div class="stat-item rain-prob">
                    <span class="stat-label">Rain</span>
                    <span class="stat-value">${currentRainChance}%</span>
                </div>
            </div>
        `;

        updateSolarTracker(dataRecieved);

        // Array of day names to map the dates
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        let forecastHTML = ``;

        // Loop through the next 6 days (starting at index 1 for tomorrow)
        for(let i = 1; i <= 6; i++){
            const date = new Date(dailyWeather.time[i] + 'T00:00');
            const dayName = dayNames[date.getDay()];
            const dayNumber = date.getDate();
            const maxTemp = Math.round(dailyWeather.temperature_2m_max[i]);
            const minTemp = Math.round(dailyWeather.temperature_2m_min[i]);
            const rainChance = dailyWeather.precipitation_probability_max[i];

            // Adding the HTML that will be injected into index.html
            forecastHTML += `
                <div class="forecast-day">
                    <span class="day-name">${dayName} ${dayNumber}</span>
                    <span class="day-temp">${maxTemp}° / ${minTemp}°F</span>
                    <span class="day-rain">Chance of Rain: ${rainChance}%</span>
                </div>
            `;
        }

        // Injecting the HTML onto the forecast bar
        document.getElementById('forecast-bar').innerHTML = forecastHTML;
    }
    catch(error){
        console.error("Open-Meteo fetch failed:", error);
    }
}


/*========================================================== Shuttle Function ==========================================================*/
async function getShuttleData(){
    try{
        const response = await fetch('http://localhost:3001/shuttle'); // send a request to the proxxy server for information
        const data = await response.json(); // Wait for the json file and store it in 'data'

        const route2Data = data.find(item => item.RouteDescription === "Route 2"); // Out of all of the information, search specifically for the Route 2 info

        // A valid entry must not be departed AND have a positive, reasonable arrival time (under 2 hours)
        const isValidEntry = (t) => !t.IsDeparted && t.Seconds > 0 && t.Seconds < 7200;

        if(route2Data && route2Data.Times && route2Data.Times.length > 0){ // if the data exists and shuttles are running, keep going!
            const nextEntry = route2Data.Times.find(t => isValidEntry(t));

            if(nextEntry){ // If nextEntry exists
                const allEntries = route2Data.Times.filter(t => isValidEntry(t));
                const secondEntry = allEntries[1]; // second bus if it exists

                const getDisplayTime = (entry) => {
                    const minutesAway = Math.floor(entry.Seconds / 60); // Convert seconds to minutes
                    if (entry.Seconds <= 120) return `Shuttle is Arriving!🚨`;
                    else if (entry.Seconds <= 300) return `Get Ready, Shuttle arrives in ${minutesAway} min`;
                    else return `Shuttle is ${minutesAway} min away...`;
                };

                // If the second entry exists, display it's information, else don't display anything
                const secondBusHTML = secondEntry ? `
                    <div id="next-shuttle">
                        Next: ${getDisplayTime(secondEntry)}
                    </div>
                ` : '';

                // Injecting the HTML into the shuttle-routes-widget
                document.getElementById('shuttle-routes-widget').innerHTML = `
                    <p>Route 2 @ Boardwalk Stop</p>
                    <div>
                        ${getDisplayTime(nextEntry)}
                    </div>
                    ${secondBusHTML}
                `;
            }
            // If nextEntry doesn't exist
            else{
                document.getElementById('shuttle-routes-widget').innerHTML = `
                    <p>Route 2 @ Boardwalk Stop</p>
                    <p style="margin-top: 1rem;">Checking for next bus...</p>
                `;
            }
        }
        // If there are no bus routes active
        else{
            document.getElementById('shuttle-routes-widget').innerHTML = `
                <p>Route 2 @ Boardwalk Stop</p>
                <p style="margin-top: 1rem;">No active shuttle routes</p>
            `;
        }
    }
    catch(error){
        console.error("UCF Shuttle Fetch Error:", error);
    }
}


/*========================================================== Parking Function ==========================================================*/
async function getParkingData() {
    try {
        const response = await fetch("http://localhost:3001/parking");
        const data = await response.json();

        // Wanted Parking garages
        const targetGarages = ["Garage A", "Garage B", "Garage C", "Garage D", "Garage H", "Garage I"];

        const renderGarage = (item) => {
            if (!item || !item.location || !item.location.counts) return '';
            
            const stats = item.location.counts;
            const name = item.location.name;
            const occupied = stats.occupied;
            const total = stats.total;
            const available = stats.available;
            
            const percent = Math.round((occupied / total) * 100);
            
            let statusColor = "var(--text-primary)";
            if (percent > 90) statusColor = "#d62828"; 
            else if (percent > 75) statusColor = "#f77f00"; 

            return `
                <div class="garage-info" style="text-align: center;">
                    <span class="garage-name">${name}</span>
                    <span class="garage-percent" style="color: ${statusColor}">${percent}% Full</span>
                    <p class="spots-left">${available} spots remaining</p>
                </div>
            `;
        };

        // Using .map() to find each specific garage from the list
        const mostGaragesHTML = targetGarages.map(garageName => {
            // Find the object in the API data where the location name matches our list
            const garageData = data.find(item => item.location.name === garageName);
            return renderGarage(garageData);
        }).join(''); // Combine the array of HTML strings into one long string

        document.getElementById('ucf-parking-widget').innerHTML = `
            <p id="parking-title">Main Campus Parking</p>
            <div id="parking-list">
                ${mostGaragesHTML}
            </div>
        `;
    } catch (error) {
        console.error("Parking Fetch Error:", error);
        document.getElementById('ucf-parking-widget').innerHTML = "Failed to load parking data.";
    }
}


/*========================================================== Solar Tracker ==========================================================*/
function updateSolarTracker(data){
    const existingSolar = document.querySelector('.solar-container');
    if(existingSolar){
        existingSolar.remove();
    }
    
    const now = new Date();
    const sunrise = new Date(data.daily.sunrise[0]);
    const sunset = new Date(data.daily.sunset[0]);
    
    // Calculate total daylight minutes and minutes passed since sunrise
    const totalDaylight = (sunset - sunrise) / (1000 * 60);
    const minutesPassed = (now - sunrise) / (1000 * 60);
    
    // Calculate percentage (clamped between 0 and 100)
    let percent = Math.min(Math.max((minutesPassed / totalDaylight) * 100, 0), 100);
    
    // If it's night time, we'll show a "Night" state
    const isNight = now < sunrise || now > sunset;
    const sunIcon = isNight ? '🌙' : '☀️';
    const statusText = isNight ? "Moonlight" : "Daylight";

    document.getElementById('weather-widget').innerHTML += `
        <div class="solar-container">
            <div class="solar-labels">
                <span>${sunrise.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                <span class="solar-status">${statusText}</span>
                <span>${sunset.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <div class="solar-track">
                <div class="solar-progress" style="width: ${percent}%"></div>
                <div class="sun-marker" style="left: ${percent}%">${sunIcon}</div>
            </div>
        </div>
    `;
}

// Run the functions!
updateClock();
getWeather();
getShuttleData();
getParkingData();

// Updating Function
setInterval(updateClock, 1000); // Refresh clock every second
setInterval(getWeather, 1800000); // Refresh weather every 30 minutes
setInterval(getShuttleData, 20000); // Refresh Route 2 every 20 seconds
setInterval(getParkingData, 300000); // Refresh Parking every 5 minutes