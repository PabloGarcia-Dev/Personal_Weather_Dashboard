function updateClock(){
  const now = new Date(); // Creates a Date object called 'now' to access the date and time

  const hours = now.getHours().toString().padStart(2, '0'); // .padStart() function adds whatever character is specified at the beginning of the string if it doesn't have the required number of characters: in this case 2
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');

  document.getElementById('time').textContent = `${hours}:${minutes}:${seconds}`; // sets the hours, minutes and seconds by updating HTML

  const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }; // specifies the actual format for the date
  document.getElementById('date').textContent = now.toLocaleDateString('en-US', options); // using the 'now' object, it sets the date with the specified format and updtaes HTML
}

async function getWeather(){ // async is a keyword that is used when we don't really want a function to activate instantly and is waiting for another condition
  const latitude = 28.586779934551355; // coordinates of where we are
  const longitude = -81.20615364774744;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=fahrenheit&daily=temperature_2m_max,temperature_2m_min`;

  try{
    const response = await fetch(url);
    if(!response.ok){
      throw new Error('Network response was not ok'); // If the response is not okay, then through an error out
    }

    const dataRecieved = await response.json(); // parsing the string that we got to an actual javascript object

    const currentWeather = dataRecieved.current_weather;
    const dailyWeather = dataRecieved.daily;

    document.getElementById('weather-widget').innerHTML = `
            <p> Current Weather Stats: </p>
            <div class="current-temp">${Math.round(currentWeather.temperature)}°F</div>
            <div class="forecast">High: ${Math.round(dailyWeather.temperature_2m_max[0])}°</div>
        `;

    // Array of day names to map the dates
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let forecastHTML = "";

    // Loop through the next 5 days (starting at index 1 for tomorrow)
    for(let i = 1; i <= 6; i++){
        const date = new Date(dailyWeather.time[i]);
        const dayName = dayNames[date.getUTCDay()];
        const maxTemp = Math.round(dailyWeather.temperature_2m_max[i]);
        const minTemp = Math.round(dailyWeather.temperature_2m_min[i]);

        // Adding the HTML that will be injected into index.html
        forecastHTML += `
            <div class="forecast-day">
                <span class="day-name">${dayName}</span>
                <span class="day-temp">${maxTemp}° / ${minTemp}°</span>
            </div>
        `;
    }

    document.getElementById('forecast-bar').innerHTML = forecastHTML;
  }
  catch(error){
    console.error("Open-Meteo fetch failed:", error);
  }

}

async function getShuttleData(){
    const targetUrl = "https://ucf.transloc.com/Services/JSONPRelay.svc/GetStopArrivalTimes?apiKey=8882812681&stopIds=54&version=2";
    const proxiedUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl + "&_=" + Date.now())}`;

    try{
        const response = await fetch(proxiedUrl);
        const data = await response.json();

        const route2Data = data.find(item => item.RouteDescription === "Route 2");

        if(route2Data && route2Data.Times && route2Data.Times.length > 0){
            const nextEntry = route2Data.Times.find(t => !t.IsDeparted);

            if(nextEntry){
                const minutesAway = Math.floor(nextEntry.Seconds / 60);
                const displayTime = nextEntry.Seconds > 60 ? `${minutesAway} <span style="font-size: 3rem;">min...</span>` : "Arriving!!!";

                document.getElementById('shuttle-routes').innerHTML = `
                    <p style="font-size: 2.2rem; color: var(--text-secondary); margin-bottom: 1rem;">Route 2 @ Boardwalk</p>
                    <div style="font-size: 8rem; font-family: 'DM Serif Display'; line-height: 1;">
                        ${displayTime}
                    </div>
                `;
            }
            else{
                document.getElementById('shuttle-routes').innerHTML = `
                    <p style="font-size: 2.2rem; color: var(--text-secondary);">Route 2 @ Boardwalk</p>
                    <p style="font-size: 2.5rem; margin-top: 1rem;">Checking for next bus...</p>
                `;
            }
        }
        else{
            document.getElementById('shuttle-routes').innerHTML = `
                <p style="font-size: 2.2rem; color: var(--text-secondary);">Route 2 @ Boardwalk</p>
                <p style="font-size: 2.5rem; margin-top: 1rem;">No active bus</p>
            `;
        }
    }
    catch(error){
        console.error("UCF Shuttle Fetch Error:", error);
    }
}

// Run the functions!
updateClock();
getWeather();
getShuttleData();

// Updating Function
setInterval(updateClock, 1000); // Refresh clock every second (1000 milliseconds)
setInterval(getWeather, 1800000); // Refresh weather every 30 minutes (1800000 milliseconds)
setInterval(getShuttleData, 20000); // Refresh the Route 2 widget every minute (60000 milliseconds)