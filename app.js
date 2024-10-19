const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

// Serve the index.html on the root route
app.get("/", function (req, res) {
    console.log("Serving the main page");
    res.render("index", {
        temperature: "16",     // Default temperature
        cityname2: "City",      // Default city name
        kindOfdesc: "Unknown",      // Default description
        kindOfhumid: "Unknown",     // Default humidity
        kindOfvisible: "Unknown",   // Default visibility
        kindOfwind: "Unknown",       // Default wind speed
        error: null // Ensure error is defined as null
    });
});
// Handle form-based city weather search
app.post("/", function (req, res) {
    const query = req.body.cityName;
    if (!query) {
        return res.render("index", {
            temperature: "16",  // Default temperature
            cityname2: "City",  // Default city name
            kindOfdesc: "Unknown", // Default description
            kindOfhumid: "Unknown", // Default humidity
            kindOfvisible: "Unknown", // Default visibility
            kindOfwind: "Unknown", // Default wind speed
            error: "Please enter a city name." // Error message
        });
    }
    
    const key = "ab978e66951335b149a770707df18cb7";
    const units = "metric";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${key}&units=${units}`;

    https.get(url, function (response) {
        // Check for unsuccessful response status
        if (response.statusCode !== 200) {
            return res.render("index", {
                temperature: "16",  // Default temperature
                cityname2: "City",  // Default city name
                kindOfdesc: "Unknown", // Default description
                kindOfhumid: "Unknown", // Default humidity
                kindOfvisible: "Unknown", // Default visibility
                kindOfwind: "Unknown", // Default wind speed
                error: "Could not find weather data for that city." // Error message for invalid city
            });
        }

        response.on("data", function (data) {
            const weatherData = JSON.parse(data);
            const desc = weatherData.weather[0].description;
            const _temp = weatherData.main.temp;
            const humid = weatherData.main.humidity;
            const wind = weatherData.wind.speed;
            const visible = weatherData.visibility;
            const icn = weatherData.weather[0].icon;
            const imageURL = `http://openweathermap.org/img/wn/${icn}@2x.png`;

            // Render the page with the weather data
            res.render('index', {
                temperature: Math.round(_temp),
                cityname2: query,
                kindOfdesc: desc,
                kindOfhumid: humid,
                kindOfvisible: (visible / 1000),
                kindOfwind: wind,
                error: null // Clear error when valid query is submitted
            });
        });
    }).on("error", function(e) {
        console.error("Got error: " + e.message);
        res.render("index", {
            temperature: "16",  // Default temperature
            cityname2: "City",  // Default city name
            kindOfdesc: "Unknown", // Default description
            kindOfhumid: "Unknown", // Default humidity
            kindOfvisible: "Unknown", // Default visibility
            kindOfwind: "Unknown", // Default wind speed
            error: "An error occurred while fetching weather data." // Generic error message
        });
    });
});


// Handle weather by location (coordinates)
app.get("/weather-by-coordinates", function (req, res) {
    const lat = req.query.lat;
    const lon = req.query.lon;
    const key = "ab978e66951335b149a770707df18cb7";
    const units = "metric";
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=${units}`;

    https.get(url, function (response) {
        response.on("data", function (data) {
            const weatherData = JSON.parse(data);
            const desc = weatherData.weather[0].description;
            const _temp = weatherData.main.temp;
            const humid = weatherData.main.humidity;
            const wind = weatherData.wind.speed;
            const visible = weatherData.visibility;
            const city = weatherData.name;

            // Send the weather data as JSON for client-side handling
            res.json({
                temperature: Math.round(_temp),
                cityname2: city,
                kindOfdesc: desc,
                kindOfhumid: humid,
                kindOfvisible: (visible / 1000),
                kindOfwind: wind
            });
        });
    });
});

app.listen(3000, function () {
    console.log("Server started at port 3000");
});
