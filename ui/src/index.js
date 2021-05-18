import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import L from 'leaflet';
import * as GeoSearch from 'leaflet-geosearch';

var map = L.map('map').setView([55.78879, 49.128685], 8);
let arr = new Array();

var rad = 1500;
var sem = true;


const search = new GeoSearch.GeoSearchControl({
    style: 'bar',
    provider: new GeoSearch.OpenStreetMapProvider(),
});
map.addControl(search);

var myZoom = {
    start:  map.getZoom(),
    end: map.getZoom()
};

map.on('zoomstart', function(e) {
    try {
        if (sem) {
            myZoom.start = map.getZoom();
        }
    } catch (e) {
        console.log(e)
    }

});

map.on('zoomend', function(e) {

    try {
        if (sem) {
            //console.log(map.getZoom());
            for (var i = 0; i < arr.length; i++) {

                if (map.getZoom() <= 8) {
                    arr[i].setRadius(1500);
                    rad = 1500;
                    continue
                }

                if (map.getZoom() > 8 && map.getZoom() < 10) {
                    arr[i].setRadius(800);
                    rad = 1000;
                    continue
                }

                if (map.getZoom() > 10 && map.getZoom() < 12) {
                    arr[i].setRadius(300);
                    rad = 500;
                    continue
                }

                if (map.getZoom() > 12 && map.getZoom() < 14) {
                    arr[i].setRadius(200);
                    rad = 300;
                    continue
                }

                if (map.getZoom() > 14) {
                    arr[i].setRadius(30);
                    rad = 30;
                    continue
                }
            }
        }
    } catch (e) {
        console.log(e)
    }
});



function update () {

    L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1
    }).addTo(map);


    fetch(`http://192.168.143.179:4000/api/v1/incidents`,{
        method: `GET`
    }).then((res)=>{
        if(res.ok) {
            return res.json();
        }
    }).then((res)=>{


        for (var key in res) {

            console.log(rad);

           var circle = L.circle([res[key].latitude, res[key].longitude], 1500, {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.5,
            }).addTo(map).bindPopup(res[key].node_name +  " <br>" + res[key].addres + "<br> Услуги (SPD, IPTV, SIP): <br>" + res[key].services);

           arr.push(circle);

        }
    })

    updateCall();
}

function updateCall(){

    try {

        setTimeout(function () {

            window.location.reload();

        }, 60000);

    } catch (e) {
        console.log(e)
    }

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
