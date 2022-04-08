"use strict";

var searchFormEl = document.querySelector("#searchForm");


var convertKtoF = k => parseFloat(Number(k) * 9 / 5 - 459.67).toFixed(2);

function renderForecast(data) {
    var cityDateTodayEl = document.querySelector("#cityDateToday");
    var iconTodayEl = document.querySelector("#iconToday");
    var tempTodayEl = document.querySelector("#tempToday");
    var windTodayEl = document.querySelector("#windToday");
    var humidityTodayEl = document.querySelector("#humidityToday");
    var uviTodayEl = document.querySelector("#uviToday");

    cityDateTodayEl.textContent = `${data.forecast[0][1]} ${moment(data.forecast[0][0]).format("M/D/YYYY")}`;
    iconTodayEl.setAttribute("src", `http://openweathermap.org/img/w/${data.forecast[0][2]}.png`);
    tempTodayEl.textContent = `Temp: ${convertKtoF(data.forecast[0][3])} °F`;
    windTodayEl.textContent = `Wind: ${data.forecast[0][4]} MPH`;
    humidityTodayEl.textContent = `Humidity: ${data.forecast[0][5]} %`;
    uviTodayEl.textContent = `UV Index: ${data.forecast[0][6]}`;

    var forecast5DayEl = document.querySelector("#forecast5Day");
    forecast5DayEl.innerHTML = '';
    for (let i = 1; i < data.forecast.length; i++) {
        let div = document.createElement("div");
        let h6 = document.createElement("h6");
        let img = document.createElement("img");
        let p1 = document.createElement("p1");
        let p2 = document.createElement("p2");
        let p3 = document.createElement("p3");

        div.setAttribute("class", "card");
        img.setAttribute("src", `http://openweathermap.org/img/w/${data.forecast[i][1]}.png`);
        img.setAttribute("alt", "forecast icon");

        h6.textContent = `${moment(data.forecast[i][0]).format("M/D/YYYY")}`;
        p1.textContent = `Temp: ${convertKtoF(data.forecast[i][2])} °F`;
        p2.textContent = `Wind: ${data.forecast[i][3]} MPH`;
        p3.textContent = `Humidity: ${data.forecast[i][4]} %`;

        div.appendChild(h6);
        div.appendChild(img);
        div.appendChild(p1);
        div.appendChild(p2);
        div.appendChild(p3);
        forecast5DayEl.appendChild(div);
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
            console.log("err: ", err);
            // if (err.status === 404)
            //     return alert('404 Error: City not found please try again with a vaid city name. Ex. Seattle');
            // alert(`${err.status} Error: ${err.message}`);
            // if (res.status == 404) {
            // } else {
            //     return res.json();
            // }
        });
}


// 1b9775196b0ee2a34b1770325a87f87a

function handleSubmit(event) {
    event.preventDefault();

    var city = document.querySelector("#searchInput").value.trim().toLowerCase();
    if (!city) {
        // to do display error message
    } else {
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
}

searchFormEl.addEventListener("submit", handleSubmit);
