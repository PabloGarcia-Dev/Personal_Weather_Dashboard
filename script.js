/*========================================================== Clock Function ==========================================================*/
function updateClock(){
    const now = new Date(); // Creates a Date object called 'now' to access the date and time

    let hours = now.getHours(); // .padStart() function adds whatever character is specified at the beginning of the string if it doesn't have the required number of characters: in this case 2
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    document.getElementById('time').innerHTML = `
            <span>${hours}:${minutes}:${seconds}</span><span style="font-size: 6rem">${ampm}</span>

    `; // sets the hours, minutes and seconds by updating HTML

    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }; // specifies the actual format for the date
    document.getElementById('date').textContent = now.toLocaleDateString('en-US', options); // using the 'now' object, it sets the date with the specified format and updtaes HTML
}


/*========================================================== Weather Function ==========================================================*/
async function getWeather(){ // async is a keyword that is used when we don't really want a function to activate instantly and is waiting for another condition
    const latitude = 28.586779934551355; // coordinates of where we are
    const longitude = -81.20615364774744;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=precipitation_probability&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`;

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
            51: "Light drizzle",
            53: "Moderate drizzle",
            55: "Dense drizzle",
            61: "Slight rain",
            63: "Moderate rain",
            65: "Heavy rain",
            80: "Slight rain showers",
            95: "Thunderstorm"
        }
        const weatherTips = { // Little messages for the description
            0: "Don't worry, the sky isn't plotting a surprise pool party.",
            1: "The sky has a few clouds, likely just for aesthetic purposes.",
            2: "The sky has a few clouds, likely just for aesthetic purposes.",
            3: "It's gray, moody, and looks like a Victorian novel out there, still good for walking though.",
            45: "Render distance is set to 'Very Low' today...",
            48: "Render distance is set to 'Very Low' today...",
            51: "It's not quite raining, but you'll still end up looking like a wet dog by the time you walk 50 feet. Grab an Umbrella just in case!",
            53: "It's not quite raining, but you'll still end up looking like a wet dog by the time you walk 50 feet. Grab an Umbrella just in case!",
            55: "It's not quite raining, but you'll still end up looking like a wet dog by the time you walk 50 feet. Grab an Umbrella just in case!",
            61: "THE SKY IS LEAKING, GET AN UMBRELLA.",
            63: "THE SKY IS LEAKING, GET AN UMBRELLA.",
            65: "It's Raining cats and dogs out there am I right?..... Grab an Umbrella..",
            80: "The sky is a little indecisive today and taking it out on everyone... grab an umbrella for the road.",
            95: "AAAAAAAAAAAAHHHHHHHHHHHHHHHHHHHHH!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
        }
        const description = weatherCodes[currentWeather.weather_code] || "Unknown condition"; // Description, If unknown pops up, go into URL and see what the current weather code is
        const tips = weatherTips[currentWeather.weather_code] || "I got nothing for yah..."; // After that, add a description to 'weatherTips'
        const currentRainChance = dataRecieved.hourly.precipitation_probability[0] || 'N/A';

        // Injecting HTML for the weather widget
        document.getElementById('weather-widget').innerHTML = `
                <p> Current Weather Stats: </p>
                <div class="current-day-stats">${Math.round(currentWeather.temperature_2m)}°F</div>
                <div class="current-day-stats">High: ${Math.round(dailyWeather.temperature_2m_max[0])}°F</div>
                <div class="current-day-stats">Wind Speed: ${currentWeather.wind_speed_10m} mph</div>
                <div class="current-day-stats">Humidity: ${humidity}%</p>
                <div class="current-day-stats" style="color: #3b82f6;">Hourly Chance of Rain: ${currentRainChance}%</div>
            `;

        // Injecting HTML for the recommendations widget
        document.getElementById('recommendations-widget').innerHTML = `
                <p>Weather Description:</p>
                <p>${description}</p>
                <p>${tips}</p>
        `;

        // Array of day names to map the dates
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        let forecastHTML = `
                <p id="forecast-title">Week at a Glance</p>
        `;

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
        const response = await fetch('http://localhost:3001/shuttle'); // send a request to the proxy server for information
        const data = await response.json(); // Wait for the json file and store it in 'data'

        const route2Data = data.find(item => item.RouteDescription === "Route 2"); // Out of all of the information, search specifically for the Route 2 info

        if(route2Data && route2Data.Times && route2Data.Times.length > 0){ // if the data exists and shuttles are running, keep going!
            const nextEntry = route2Data.Times.find(t => !t.IsDeparted);

            if(nextEntry){ // If nextEntry exists
                const allEntries = route2Data.Times.filter(t => !t.IsDeparted);
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
        // Proxy handles the Puppeteer scrape on the Pi — simple fetch here
        const response = await fetch('http://localhost:3001/parking');
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const data = await response.json();

        // Replace the old garage constants with this updated mapping
        const garages = Array.isArray(data) ? data : [];

        // We need to look inside .location.counts for the name
        const garageA = garages.find(g => g.location?.counts?.location_name === 'Garage A');
        const garageH = garages.find(g => g.name === "Garage H" || g.location?.counts?.location_name === 'Garage H');

        const renderGarage = (garage) => {
            if (!garage) return `<div class="garage-info">Data Pending...</div>`;

            // Extracting data from the nested 'location' and 'counts' objects
            const counts    = garage.location?.counts || {};
            const name      = counts.location_name || 'Garage';
            const total     = counts.total_count || 1000;
            const available = counts.available_count ?? 0;
            const filled    = total - available;
            const percent   = Math.round((filled / total) * 100);

            let statusColor = "var(--text-primary)";
            if (percent > 90) statusColor = "#d62828";
            else if (percent > 75) statusColor = "#f77f00";

            return `
                <div class="garage-info">
                    <span class="garage-name">${name}:</span>
                    <span class="garage-percent" style="color: ${statusColor}">${percent}% Full</span>
                    <p class="spots-left">${available} spots remaining</p>
                </div>
            `;
        };

        document.getElementById('ucf-parking-widget').innerHTML = `
            <p id="parking-title">Campus Parking</p>
            ${renderGarage(garageA)}
            ${renderGarage(garageH)}
        `;
    } catch (error) {
        console.error("Parking Fetch Error:", error);
        document.getElementById('ucf-parking-widget').innerHTML = `
            <p id="parking-title">Campus Parking</p>
            <div class="garage-info" style="margin-top: 1rem;">
                <a href="https://parking.ucf.edu/resources/garage-availability/" 
                   target="_blank"
                   style="font-family: 'DM Serif Display'; font-size: 3.5rem; color: var(--accent); text-decoration: none;">
                   View Live Availability →
                </a>
                <p class="spots-left" style="margin-top: 1rem;">Opens UCF Parking page</p>
            </div>
        `;
    }
}

// Run the functions!
updateClock();
getWeather();
getShuttleData();
getParkingData();

// Updating Function
setInterval(updateClock, 1000);       // Refresh clock every second
setInterval(getWeather, 1800000);     // Refresh weather every 30 minutes
setInterval(getShuttleData, 20000);   // Refresh shuttle every 20 seconds
setInterval(getParkingData, 600000);  // Refresh parking every 10 minutes