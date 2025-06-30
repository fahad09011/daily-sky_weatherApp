let button = document.getElementById("getWeatherBtn");
let location_input = document.getElementById("locationInput");
let city = document.getElementById("city");
let day = document.getElementById("day_date");

let current_weather_description = document.getElementById(
  "weather_description"
);
let current_temprature = document.getElementById("current_temprature");
let feel_temprature = document.getElementById("feels_like_data_value");
let humidity = document.getElementById("humidity_data_value");
let sunrise = document.getElementById("sunrise_data_value");
let sunset = document.getElementById("sunset_data_value");
let visibility = document.getElementById("visibility_data_value");
let wind_speed = document.getElementById("wind_data_value");



// Load default weather for Enniscorthy on page load
window.addEventListener("load", () => {
  let defaultLocation = "Enniscorthy";
  location_input.value = "";
  getlongitude_latitude(defaultLocation);
});



button.addEventListener("click", function () {
  let locat = location_input.value.trim();
    location_input.value = ""; // keep input blank
  if (locat) {
    let location = locat.charAt(0).toUpperCase() + locat.slice(1);
    getlongitude_latitude(location);
  } else {
    Swal.fire("Please enter location!");

  }
});


async function getlongitude_latitude(location) {
  let response = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${location}&appid=7bc0c25860df2de4cf84f847581b2f24`
  );
  let data = await response.json();
  let latitude = "";
  let longitude = "";
  if (data.length > 0) {
    latitude = data[0].lat;
    longitude = data[0].lon;
    getcurrent_weather(latitude, longitude);
    gethourly_weather(latitude, longitude);
    getChart_data(latitude , longitude);
  } else {
     Swal.fire("location not found. Try again!");
  }
}

async function getcurrent_weather(latitude, longitude) {
  let response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=7bc0c25860df2de4cf84f847581b2f24&units=metric`
  );
  let data = await response.json();
  let day_date_format = new Date(data.dt * 1000);
  let day_date = day_date_format.toDateString();
  let sunrise_time_format = new Date(data.sys.sunrise * 1000);
  let sunrise_time = sunrise_time_format.toLocaleTimeString();
  let sunset_time_format = new Date(data.sys.sunset * 1000);
  let sunset_time = sunset_time_format.toLocaleTimeString();
  let visibility_format = data.visibility / 1000;
  //   console.log(data);
  let iconCode = data.weather[0].icon;
  let iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  document.getElementById("weather_icon").src = iconUrl;
  city.innerText = `${data.name} | ${data.sys.country}`;
  day.innerText = day_date;
  current_temprature.innerText = `${data.main.temp.toFixed(1)}°C`;
  feel_temprature.innerText = `${data.main.feels_like.toFixed(1)}°C`;
  humidity.innerText = `${data.main.humidity}%`;
  sunrise.innerText = sunrise_time;
  sunset.innerText = sunset_time;
  visibility.innerText = `${visibility_format.toFixed(1)} km`;
  wind_speed.innerText = `${data.wind.speed} m/s`;
  current_weather_description.innerText = data.weather[0].description;
}

// let icon_url = "../assets/thermomater.png";
let hourly_forcast_container = document.getElementById(
  "hourly_forcast_container"
);
// <--------------------------------------------------->

let temp_icon_src = "./assets/thermomater.png";
let wind_icon_src = "./assets/wind_speed.png";

let hourly_date = document.getElementById("date");
let hourly_time = document.getElementById("time");
let hourly_temprature = document.getElementById("hourly_temprature");
let hourly_wind_speed = document.getElementById("hourly_wind_speed");

async function gethourly_weather(latitude, longitude) {
    hourly_forcast_container.innerHTML = ""; // <-- Add this line

  let response = await fetch(
    `https://pro.openweathermap.org/data/2.5/forecast/hourly?lat=${latitude}&lon=${longitude}&appid=7bc0c25860df2de4cf84f847581b2f24&units=metric`
  );
  let data = await response.json();

  data.list.forEach((forecast) => {
    let date_time_format = forecast.dt_txt;
    let [forecast_date, forecast_time] = date_time_format.split(" ");

    let iconCode = forecast.weather[0].icon;
    let iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    let temp = forecast.main.temp.toFixed(1);
    let wind = forecast.wind.speed.toFixed(1);
    let card = document.createElement("div");
    card.className = "hourly_card";
    card.innerHTML = `
        <p class="date">${forecast_date}</p>
                            <p class="time">${forecast_time}</p>
                            <div class="icon_temp_wind_container">
                                <img class="hourly_weather_icon" src="${iconUrl}" alt="Weather Icon" />
                                <div class="hourly_temprature_container">
                                    <p class="hourly_temprature">
                                    <img src="${temp_icon_src}"  width="30px" height="30px" alt="temprature icon">${temp}°C
                                    </p>
                                    <p class="hourly_wind_speed">
                                        <img src="${wind_icon_src}"  width="30px" height="30px" alt="wind speed icon">
                                        ${wind}m/s
                                    </p>
                                </div>
                            </div>`;
        hourly_forcast_container.appendChild(card);
  });
}

// <----------------------------Chart Section----------------------------------->

async function getChart_data(latitude , longitude) {
  let response = await fetch(`https://api.openweathermap.org/data/2.5/forecast/daily?lat=${latitude}&lon=${longitude}&cnt=7&appid=7bc0c25860df2de4cf84f847581b2f24&units=metric`);
  let data = await response.json();
  let chart_data_points = data.list.map(eachDay => {
  let time = new Date(eachDay.dt * 1000)
  let day_name = time.toLocaleDateString("en-US",{weekday:"long"});
  let max_temp = eachDay.temp.max;   
  let min_temp = eachDay.temp.min;   
  let weather_condition = eachDay.weather[0].main;
  if (weather_condition.includes("Clouds")) weather_condition = "cloudy"; 
   else if(weather_condition.includes("Rain")) weather_condition = "rainy";
  else if(weather_condition.includes("Clear")) weather_condition = "sunny";
else weather_condition = "sunny";
    return  {
      label : day_name,
      y : [min_temp , max_temp],
      name : weather_condition
    };
});
getChart(chart_data_points);
}
let getChart = (dataPoints)=>{
var chart = new CanvasJS.Chart("chartContainer", {            
	title:{
		text: "Weekly Weather Forecast"              
	},
	axisY: {
		suffix: " °C",
		maximum: 60,
		minimum : -10,
		gridThickness: 0
	},
	toolTip:{
		shared: true,
		content: "{name} </br> <strong>Temperature: </strong> </br> Min: {y[0]} °C, Max: {y[1]} °C"
	},
	data: [{
		type: "rangeSplineArea",
		fillOpacity: 0.1,
		color: "#91AAB1",
		indexLabelFormatter: formatter,
		dataPoints: dataPoints
	}]
});
chart.render();

var images = [];    

addImages(chart , dataPoints);

function addImages(chart , dataPoints) {
	for(var i = 0; i < chart.data[0].dataPoints.length; i++){
		var dpsName = chart.data[0].dataPoints[i].name;
		if(dpsName == "cloudy"){
			images.push($("<img>").attr("src", "https://canvasjs.com/wp-content/uploads/images/gallery/gallery-overview/cloudy.png"));
		} else if(dpsName == "rainy"){
		images.push($("<img>").attr("src", "https://canvasjs.com/wp-content/uploads/images/gallery/gallery-overview/rainy.png"));
		} else if(dpsName == "sunny"){
			images.push($("<img>").attr("src", "https://canvasjs.com/wp-content/uploads/images/gallery/gallery-overview/sunny.png"));
		}

	images[i].attr("class", dpsName).appendTo($("#chartContainer>.canvasjs-chart-container"));
	positionImage(images[i], i);
	}
}

function positionImage(image, index) {
	var imageCenter = chart.axisX[0].convertValueToPixel(chart.data[0].dataPoints[index].x);
	var imageTop =  chart.axisY[0].convertValueToPixel(chart.axisY[0].maximum);

	image.width("40px")
	.css({ "left": imageCenter - 20 + "px",
	"position": "absolute","top":imageTop + "px",
	"position": "absolute"});
}

$( window ).resize(function() {
	var cloudyCounter = 0, rainyCounter = 0, sunnyCounter = 0;    
	var imageCenter = 0;
	for(var i=0;i<chart.data[0].dataPoints.length;i++) {
		imageCenter = chart.axisX[0].convertValueToPixel(chart.data[0].dataPoints[i].x) - 20;
		if(chart.data[0].dataPoints[i].name == "cloudy") {					
			$(".cloudy").eq(cloudyCounter++).css({ "left": imageCenter});
		} else if(chart.data[0].dataPoints[i].name == "rainy") {
			$(".rainy").eq(rainyCounter++).css({ "left": imageCenter});  
		} else if(chart.data[0].dataPoints[i].name == "sunny") {
			$(".sunny").eq(sunnyCounter++).css({ "left": imageCenter});  
		}                
	}
});

function formatter(e) { 
	if(e.index === 0 && e.dataPoint.x === 0) {
		return " Min " + e.dataPoint.y[e.index] + "°";
	} else if(e.index == 1 && e.dataPoint.x === 0) {
		return " Max " + e.dataPoint.y[e.index] + "°";
	} else{
		return e.dataPoint.y[e.index] + "°";
	}
} 

}