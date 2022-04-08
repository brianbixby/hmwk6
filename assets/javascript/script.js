"use strict";

var searchFormEl = document.querySelector("#searchForm");

function renderForecast(forecast) {

}

function storeForecast(forecast) {
    localStorage.setItem(`forecast-${forecast.city}`, JSON.stringify(forecast));
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

    var city = document.querySelector("#searchInput").value.trim();
    if (!city) {
        // to do display error message
    } else {
        var storedForecast = JSON.parse(localStorage.getItem(`forecast-${city}`));
        if (storedForecast) {
            if (moment(storedForecast.date).isSame(new Date(), 'day')) {
                console.log("handleSubmit if beg");
                storeForecast(storedForecast);
                renderForecast(storedForecast);
                console.log("handleSubmit if end");
                return;
            } else {
                localStorage.removeItem(`forecast-${city}`);
            }
        }
        console.log("handleSubmit else beg");
        forecastFetch(city);
        console.log("handleSubmit else end");
    }
}

searchFormEl.addEventListener("submit", handleSubmit);
