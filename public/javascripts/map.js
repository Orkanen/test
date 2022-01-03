const xhttp = new XMLHttpRequest();

var map = null;
//CREATING MAP FUNCTION
function crtmap(coords=[56.181932, 15.590525]) {
  map = L.map('map').setView(coords, 18);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution: `&copy; contributors`}).addTo(map);
}

//NOW FLYING TO CURRENT POSITION. !!MIGHT CAUSE ISSUES!!
function success(pos){
    var crd = pos.coords;
    map.flyTo([crd.latitude, crd.longitude]);
    addYou([crd.latitude, crd.longitude]);
}

// ADD CUSTOMER POSITION
function addYou(pos){
    //orangeIcon(pos);
    L.marker(pos).addTo(map)
      .bindPopup('Your position.');
}

// CREATE FIRST MAP
function crtMap(dataPack=null) {
    crtmap();
    navigator.geolocation.getCurrentPosition(success);
    if(typeof dataPack === 'object' && dataPack !== null) {
        addBikes(dataPack);
    }
}

function customer(pos){
    map.flyTo([crd.latitude, crd.longitude]);
    L.marker([crd.latitude, crd.longitude]).addTo(map)
      .bindPopup('Your position.');

    var circle = L.circle([crd.latitude, crd.longitude], {
        color: 'blue',
        fillColor: 'blue',
        fillOpacity: 0.5,
        radius: 50
    }).addTo(map);
}

//CREATE MAP FOR CURRENT RENTAL
function crtMap2(lat, long, dataPack, bId, cId, tkn) {
    //console.log(`[${lat}, ${long}]`);
    crtmap([lat, long]);
    addStations(dataPack.data);
    var marker = L.marker([lat, long]).addTo(map)
      .bindPopup('Your position.');
    setInterval(_testRunner, 6000, lat, long, marker, bId, cId, tkn);
}

// TEST BIKE FUNCTION
function addTempBikes() {
    var bikes = {};
    //var image = "scooter.jpg";
    var qr = "<img class=qr src=/images/qr-code.svg>";

    data = ranBike();
    data.forEach(function(item){
        var id = item[0];
        var latLng = L.latLng(item[1], item[2]);
        bikes[id] = new L.marker(latLng, {id: id, coords:latLng}).addTo(map)
          .on('click', onClick)
          .bindPopup(`Test Bike ${id}. ${qr}`);
    });

    console.log(bikes['1']);
}

// Not used.
function addBikes2(dataPack) {
    var bikes = {};
    var id = 0;
    var markers = L.markerClusterGroup();
    //console.log(dataPack.data);

    dataPack.data.forEach(function(item){
        if(item.status === 'vacant'){
            var latLng = L.latLng(item.gps_lat, item.gps_lon);
            var image = `<img class=qr src=/images/${item.image}>`;

            bikes[id] = new L.marker(latLng, {name: item.name,
               description: item.description,
               battery_level: item.battery_level,
               coords: latLng }).addTo(map)
              .on('click', bikeClick)
              .bindPopup(`Bike ${id} ${image}`)
            id+=1;
        }
    })
    markers.addLayer(bikes);
    map.addLayer(markers);
}

// ADD STATIONS
function addStations(dataPack) {
    var stations = {};
    var id = 0;
    var markers = L.markerClusterGroup();
    //console.log(dataPack.data);

    dataPack.forEach(function(item){
        if(item.type === 'parking'){
            var latLng = L.latLng(item.gps_lat, item.gps_lon);
            markers.addLayer(L.circle(latLng, {
              color: 'blue',
              fillColor: 'blue',
              fillOpacity: 0.5,
              radius: 20,
              description: item.address,
              id: item.stationid
            }).bindPopup(`Station: ${item.stationid}, Adress: ${item.address}`));
            id+=1;
        }
    })
    map.addLayer(markers);
}

// ADD BIKES FROM API
function addBikes(dataPack) {
    var bikes = {};
    var id = 0;
    var markers = L.markerClusterGroup();
    //console.log(dataPack.data);

    dataPack.data.forEach(function(item){
        if(item.status === 'vacant' && item.gps_lat !== null && item.gps_lon !== null){
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
    })
    map.addLayer(markers);
}

var activeClicked = null;

// BIKE CLICKED => SEND VALUES
function bikeClick(e) {
    console.log(this.options);
    var temp = this.options.coords.toString();
    var temp2 =  this.options.name;

    document.getElementsByClassName('bike_Id')[0].innerHTML = temp2.slice(4);
    document.getElementsByClassName('bikeId')[0].value = temp2.slice(4);
    document.getElementsByClassName('bike_Desc')[0].innerHTML = this.options.description;
    document.getElementsByClassName('bikeDesc')[0].value = this.options.description;
    document.getElementsByClassName('bike_Battery')[0].innerHTML = this.options.battery_level+"/10000";
    document.getElementsByClassName('bikeBattery')[0].value = this.options.battery_level;
    document.getElementsByClassName('bikeCoords')[0].value = temp.slice(7, -1);
    document.getElementById('rentBtn').hidden=false;
}


//MADE FOR TESTING BIKES (addTempBikes)
function onClick(e) {
    console.log(this.options);
    activeClicked = this.options.id;
    document.getElementsByClassName('bike_Id')[0].innerHTML = this.options.id;
    document.getElementsByClassName('bikeId')[0].value = this.options.id;
    var temp = this.options.coords.toString();
    document.getElementsByClassName('bike_Coords')[0].innerHTML = temp.slice(7, -1);
    document.getElementsByClassName('bikeCoords')[0].value = temp.slice(7, -1);
    //document.getElementById('bike_Img').innerHTML = "<img src=images/"+this.options.img+">";
    document.getElementById('rentBtn').hidden=false;
    //document.getElementById('bike_Img').innerHTML = "<img class=orange src=images/"+this.options.img+">";
}

//TESTING TO ADD DIFFERENT MARKER FOR USER
function orangeIcon(pos){
    var orangeIcon = L.icon({
        iconUrl: 'images/orangeIcon.png'
    });
    L.marker(pos, {icon: orangeIcon}).addTo(map)
      .bindPopup('Your position.');
}

function rent() {
    console.log("clicked", activeClicked);
}

var start

function timer() {
    start = Date.now();
}

function endRent() {
    var millis = Date.now() - start;
    console.log(`seconds elapsed = ${Math.floor(millis / 1000)}`);
}

function ranBike() {
    var lat = 56.16156;
    var lng = 15.58661;
    var arr = [];

    for (var i = 0; i < 200; i++) {
        arr.push([i, (lat+Math.random() * (0.019 - 0.001)).toFixed(4), (lng+Math.random() * (0.039 - 0.001)).toFixed(4)]);
    }
    return arr;
}

function _testRunner(lat, lng, marker, bId, cId, tkn) {
  const apiAdr = "http://localhost:1337";
  const apiKey = "90301a26-894c-49eb-826d-ae0c2b22a405";
  //console.log(tkn);
  xhttp.onload = function() {
    if (xhttp.readyState === xhttp.DONE) {
        if (xhttp.status === 200) {
            var data = xhttp.responseText;
            var jsonData = JSON.parse(data);
            //console.log(jsonData.data);
            jsonData.data.forEach(ele => {
                if(ele.bikeid === bId && ele.gps_lat !== undefined && ele.gps_lat !== undefined) {
                    if(ele.gps_lat !== null && ele.gps_lat !== null) {
                        //console.log("Updated: ", [ele.gps_lat, ele.gps_lon]);
                        marker.setLatLng([ele.gps_lat, ele.gps_lon]).update();
                        map.flyTo([ele.gps_lat, ele.gps_lon]);
                        document.getElementsByClassName('bikeCoords')[0].innerHTML = [parseFloat(ele.gps_lat).toFixed(6), parseFloat(ele.gps_lon).toFixed(6)];
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
  }
  xhttp.open("GET", `${apiAdr}/v1/auth/customer/${cId}/rented?apiKey=${apiKey}`);
  xhttp.setRequestHeader('x-access-token', tkn);
  xhttp.send();
  //marker.setLatLng([lat2, lng2]).update();
  //tempForTesting += 0.001;
  // /v1/city/{cityid}/bike/{bikeid}/rented

}
