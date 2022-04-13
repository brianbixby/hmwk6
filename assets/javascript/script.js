"use strict";

var searchFormEl = document.querySelector("#searchForm");
var recentSearchesContainerEl = document.querySelector("#recentSearchesContainer");
var searches = [];

var convertKtoF = k => parseFloat(Number(k) * 9 / 5 - 459.67).toFixed(2);

function renderForecast(data) {
	var forecastEl = document.querySelector("#forecast");
	forecastEl.innerHTML = "";

	var h2El = document.createElement("h2");
	var imgEl = document.createElement("img");
	var p1El = document.createElement("p");
	var p2El = document.createElement("p");
	var p3El = document.createElement("p");
	var p4El = document.createElement("p");
	var spanEl = document.createElement("span");

	h2El.textContent = `${data.forecast[0][1]} ${moment(data.forecast[0][0]).format("M/D/YYYY")}`;
	imgEl.setAttribute("src", `http://openweathermap.org/img/w/${data.forecast[0][2]}.png`);
	imgEl.setAttribute("alt", "forecast icon");
	p1El.textContent = `Temp: ${convertKtoF(data.forecast[0][3])} °F`;
	p2El.textContent = `Wind: ${data.forecast[0][4]} MPH`;
	p3El.textContent = `Humidity: ${data.forecast[0][5]} %`;
	p4El.textContent = "UV Index: ";
	spanEl.textContent = data.forecast[0][6];

	p4El.appendChild(spanEl);
	forecastEl.appendChild(h2El);
	forecastEl.appendChild(imgEl);
	forecastEl.appendChild(p1El);
	forecastEl.appendChild(p2El);
	forecastEl.appendChild(p3El);
	forecastEl.appendChild(p4El);

	var forecast5DayEl = document.querySelector("#forecast5Day");
	forecast5DayEl.innerHTML = '<h4>5-Day Forecast:</h4>';

	for (let i = 1; i < data.forecast.length; i++) {
		let div = document.createElement("div");
		let h5 = document.createElement("h5");
		let img = document.createElement("img");
		let p1 = document.createElement("p");
		let p2 = document.createElement("p");
		let p3 = document.createElement("p");

		div.setAttribute("class", "card");
		img.setAttribute("src", `http://openweathermap.org/img/w/${data.forecast[i][1]}.png`);
		img.setAttribute("alt", "forecast icon");

		h5.textContent = `${moment(data.forecast[i][0]).format("M/D/YYYY")}`;
		p1.textContent = `Temp: ${convertKtoF(data.forecast[i][2])} °F`;
		p2.textContent = `Wind: ${data.forecast[i][3]} MPH`;
		p3.textContent = `Humidity: ${data.forecast[i][4]} %`;

		div.appendChild(h5);
		div.appendChild(img);
		div.appendChild(p1);
		div.appendChild(p2);
		div.appendChild(p3);
		forecast5DayEl.appendChild(div);
	}

	// update searches,
	if (searches.length) {
		for (let i = 0; i < searches.length; i++) {
			if (searches[i] == data.forecast[0][1].toLowerCase()) {
				searches.splice(i, 1);
				searches.push(data.forecast[0][1].toLowerCase());
				renderSearches();
				return;
			} else if (i == 8) {
				searches.splice(0, 1);
				searches.push(data.forecast[0][1].toLowerCase());
				renderSearches();
			} else if (i == searches.length - 1) {
				searches.push(data.forecast[0][1].toLowerCase());
				renderSearches();
			}
		}
	} else {
		searches.push(data.forecast[0][1].toLowerCase());
		renderSearches();
	}

}

function renderSearches() {
	recentSearchesContainerEl.innerHTML = "";

	for (let i = 0; i < searches.length; i++) {
		let buttonEl = document.createElement("button");
		buttonEl.setAttribute("data-city", searches[i].toLowerCase());
		buttonEl.setAttribute("class", "recentSearchButton");
		buttonEl.textContent = searches[i][0].toUpperCase() + searches[i].slice(1);
		recentSearchesContainerEl.appendChild(buttonEl);
	}
	localStorage.setItem("searches", JSON.stringify(searches));
}

function init() {
	var storedSearches = JSON.parse(localStorage.getItem("searches"));

	if (storedSearches !== null) {
		searches = storedSearches;
		renderSearches();
		searchHelper(storedSearches[storedSearches.length - 1]);
	}
}

function storeForecast(forecast) {
	localStorage.setItem(`forecast-${forecast.city.toLowerCase()}`, JSON.stringify(forecast));
}

function forecastFetch(city) {
	var data = { city: null, date: null, forecast: [] };
	let forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city},us&appid=1b9775196b0ee2a34b1770325a87f87a`;
	fetch(forecastURL)
		.then(res => res.ok ? res.json() : Promise.reject(res))
		.then(res => {
			for (let i = 0; i <= 39; i += 8) {
				if (i === 0) {
					data.city = res.city.name;
					data.date = res.list[i].dt_txt;
					data.forecast.push([res.list[i].dt_txt, res.city.name, res.list[i].weather[0].icon, res.list[i].main.temp, res.list[i].wind.speed, res.list[i].main.humidity]);
				} else {
					data.forecast.push([res.list[i].dt_txt, res.list[i].weather[0].icon, res.list[i].main.temp, res.list[i].wind.speed, res.list[i].main.humidity]);
					if (i == 32) i--;
				}
			}
			let uviURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${res.city.coord.lat}&lon=${res.city.coord.lat}&exclude=current,minutely,hourly,alerts&appid=1b9775196b0ee2a34b1770325a87f87a`;
			return fetch(uviURL);
		})
		.then(res => res.ok ? res.json() : Promise.reject(res))
		.then(res => {
			data.forecast[0].push(res.daily[0].uvi);
			storeForecast(data);
			renderForecast(data);
		})
		.catch(err => {
			// to do handle error
			console.log("err: ", err);
		});
}

function searchHelper(city) {
	var storedForecast = JSON.parse(localStorage.getItem(`forecast-${city}`));
	if (storedForecast) {
		if (moment(storedForecast.date).isSame(new Date(), 'day')) {
			renderForecast(storedForecast);
			return;
		} else {
			localStorage.removeItem(`forecast-${city}`);
		}
	}
	forecastFetch(city);
}

function handleSubmit(event) {
	event.preventDefault();

	var city = document.querySelector("#searchInput").value.trim().toLowerCase();
	if (!city) {
		// to do display error message
	} else {
		searchHelper(city);
	}
}

searchFormEl.addEventListener("submit", handleSubmit);

recentSearchesContainerEl.addEventListener("click", function (event) {
	var el = event.target;
	if (el.matches("button")) {
		var city = el.getAttribute("data-city");
		searchHelper(city);
	}
});

init();