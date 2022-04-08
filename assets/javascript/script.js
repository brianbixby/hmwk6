"use strict";

var searchFormEl = document.querySelector("#searchForm");
console.log("success");



function weatherFetchRequest(city) {
    let url = `https://api.openweathermap.org/data/2.5/forecast?q=${city},us&appid=1b9775196b0ee2a34b1770325a87f87a`;
    fetch(url)
        .then(res => {
            if (res.status == 404) {

            } else {
                return res.json();
            }
        })
        .then(res => {
            let response = [];
            console.log("res: ", res);
            console.log(res.list[0]);
            for (let i = 0; i <= 39; i += 8) {
                if (i === 0) {
                    response.push([res.list[i].dt_txt, res.city.name, res.list[i].weather[0].icon, res.list[i].main.temp, res.list[i].wind.speed, res.list[i].main.humidity]);
                } else {
                    response.push([res.list[i].dt_txt, res.list[i].weather[0].icon, res.list[i].main.temp, res.list[i].wind.speed, res.list[i].main.humidity]);
                    if (i == 32) i--;
                }
            }
            localStorage.weatherAppToken = JSON.stringify(response);
            localStorage.weatherAppCity = city;
            localStorage.timestamp = new Date().getTime() + 480000;

            let uviURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${res.city.coord.lat}&lon=${res.city.coord.lat}&exclude=current,minutely,hourly,alerts&appid=1b9775196b0ee2a34b1770325a87f87a`;
            fetch(uviURL)
                .then(res => res.json())
                .then(data => {
                    console.log("data: ", data);
                    response[0].push(data.daily[0].uvi);
                    console.log("response ", response)
                })
        })
        .catch(err => {
            if (err.status === 404)
                return alert('404 Error: City not found please try again with a vaid city name. Ex. Seattle');
            alert(`${err.status} Error: ${err.message}`);
        });
}


// 1b9775196b0ee2a34b1770325a87f87a

function handleSubmit(event) {
    event.preventDefault();
    var city = document.querySelector("#searchInput").value;
    console.log("city ", city);
    weatherFetchRequest(city);
}

searchFormEl.addEventListener("submit", handleSubmit);
