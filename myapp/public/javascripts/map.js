const xhttp = new XMLHttpRequest();
var map = null;

/* eslint-disable no-unused-vars, no-undef */
//CREATING MAP FUNCTION
function crtmap(coords=[56.181932, 15.590525]) {
    map = L.map('map').setView(coords, 18);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {attribution: `&copy; contributors`}).addTo(map);
}

//NOW FLYING TO CURRENT POSITION. !!MIGHT CAUSE ISSUES!!
function success(pos) {
    var crd = pos.coords;

    map.flyTo([crd.latitude, crd.longitude]);
    addYou([crd.latitude, crd.longitude]);
}

// ADD CUSTOMER POSITION
function addYou(pos) {
    //orangeIcon(pos);
    L.marker(pos).addTo(map)
        .bindPopup('Your position.');
}

// CREATE FIRST MAP
function crtMap(dataPack=null) {
    crtmap();
    navigator.geolocation.getCurrentPosition(success);
    if (typeof dataPack === 'object' && dataPack !== null) {
        addBikes(dataPack);
    }
}

//CREATE MAP FOR CURRENT RENTAL
function crtMap2(lat, long, dataPack, bId, cId, tkn) {
    //console.log(`[${lat}, ${long}]`);
    crtmap([lat, long]);
    addStations(dataPack.data);
    var marker = L.marker([lat, long]).addTo(map)
        .bindPopup('Your position.');

    setInterval(_testRunner, 30000, lat, long, marker, bId, cId, tkn);
}

// ADD STATIONS
function addStations(dataPack) {
    var markers = L.markerClusterGroup();
    //console.log(dataPack.data);

    dataPack.forEach(function(item) {
        if (item.type === 'parking') {
            var latLng = L.latLng(item.gps_lat, item.gps_lon);

            markers.addLayer(L.circle(latLng, {
                color: 'blue',
                fillColor: 'blue',
                fillOpacity: 0.5,
                radius: 20,
                description: item.address,
                id: item.stationid
            }).bindPopup(`Station: ${item.stationid}, Adress: ${item.address}`));
        }
    });
    map.addLayer(markers);
}

// ADD BIKES FROM API
function addBikes(dataPack) {
    var id = 0;
    var markers = L.markerClusterGroup();
    //console.log(dataPack.data);

    dataPack.data.forEach(function(item) {
        if (item.status === 'vacant' && item.gps_lat !== null && item.gps_lon !== null) {
            var latLng = L.latLng(item.gps_lat, item.gps_lon);
            var image = `<img class=qr src=/images/${item.image}>`;

            markers.addLayer(L.marker(latLng, {name: item.name,
                description: item.description,
                battery_level: item.battery_level,
                coords: latLng })
                .on('click', bikeClick)
                .bindPopup(`Bike ${id} ${image}`));
            id+=1;
        }
    });
    map.addLayer(markers);
}

// BIKE CLICKED => SEND VALUES
function bikeClick() {
    //console.log(this.options);
    var temp = this.options.coords.toString();
    var temp2 =  this.options.name;

    document.getElementsByClassName('bike_Id')[0].innerHTML = temp2.slice(4);
    document.getElementsByClassName('bikeId')[0].value = temp2.slice(4);
    document.getElementsByClassName('bike_Desc')[0].innerHTML = this.options.description;
    document.getElementsByClassName('bikeDesc')[0].value = this.options.description;
    document.getElementsByClassName('bike_Battery')[0].innerHTML = (
        this.options.battery_level+"/10000");
    document.getElementsByClassName('bikeBattery')[0].value = this.options.battery_level;
    document.getElementsByClassName('bikeCoords')[0].value = temp.slice(7, -1);
    document.getElementById('rentBtn').hidden=false;
}

//UPDATE POSITION OF MARKER WHEN BIKE MOVES
function _testRunner(lat, lng, marker, bId, cId, tkn) {
    const apiAdr = "http://localhost:1337";
    const apiKey = "90301a26-894c-49eb-826d-ae0c2b22a405";

    //console.log(tkn);
    xhttp.onload = function() {
        if (xhttp.readyState === xhttp.DONE) {
            if (xhttp.status === 200) {
                var data = xhttp.responseText;
                var jsonData = JSON.parse(data);

                jsonData.data.forEach(ele => {
                    if (ele.bikeid === bId && ele.gps_lat !== undefined &&
                       ele.gps_lat !== undefined) {
                        if (ele.gps_lat !== null && ele.gps_lat !== null) {
                            marker.setLatLng([ele.gps_lat, ele.gps_lon]).update();
                            map.flyTo([ele.gps_lat, ele.gps_lon]);
                            document.getElementsByClassName('bikeCoords')[0].innerHTML = (
                                [parseFloat(ele.gps_lat).toFixed(6),
                                    parseFloat(ele.gps_lon).toFixed(6)]);
                        } else {
                            console.log("coodinates null.");
                        }
                    } else {
                        if (ele.bikeid === bId) {
                            console.log("Not moving: ", [ele.gps_lat_start, ele.gps_lon_start]);
                        }
                    }
                });
            }
        }
    };
    xhttp.open("GET", `${apiAdr}/v1/auth/customer/${cId}/rented?apiKey=${apiKey}`);
    xhttp.setRequestHeader('x-access-token', tkn);
    xhttp.send();
    //marker.setLatLng([lat2, lng2]).update();
    //tempForTesting += 0.001;
    // /v1/city/{cityid}/bike/{bikeid}/rented
}

/* eslint-enable no-unused-vars, no-undef */
