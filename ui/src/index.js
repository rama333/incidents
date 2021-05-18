import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import L from 'leaflet';
import * as GeoSearch from 'leaflet-geosearch';


var map = L.map('map').setView([55.78879, 49.128685], 8);

const search = new GeoSearch.GeoSearchControl({
    style: 'bar',
    provider: new GeoSearch.OpenStreetMapProvider(),
});
map.addControl(search);

function update () {

    L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);


    fetch(`http://localhost:4000/api/v1/incidents`,{
        method: `GET`
    }).then((res)=>{
        if(res.ok) {
            return res.json();
        }
    }).then((res)=>{

        for (var key in res) {

            L.circle([res[key].latitude, res[key].longitude], 20, {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.5,
            }).addTo(map).bindPopup(res[key].node_name +  " <br>" + res[key].addres + "<br> Услуги (SPD, IPTV, SIP): <br>" + res[key].services);

        }
    })

    updateCall();
}

function updateCall(){
    setTimeout(function(){
        map.remove();
        map = L.map('map').setView([55.78879, 49.128685], 8);
        update();
    }, 60000);
}

update();



// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById('root')
// );

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
