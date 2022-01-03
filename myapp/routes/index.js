var express = require('express');
var router = express.Router();
var request = require('request');
var axios = require('axios');

var apiAdr = "http://localhost:1337";
var apiKey = "90301a26-894c-49eb-826d-ae0c2b22a405";
var token = null;
var email = null;
var city = null;
var userId = null;

serverUp();

// GET LOGIN PAGE
router.get('/', function(req, res, next) {
  var title = "Home";
  res.render('index', { title: title});
});

// GET REGISTER PAGE
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Register'});
});

//REGISTER CALL
router.post('/register', function(req, res) {
  //console.log(req.body.cityid);
  axios({
    method: 'post',
    url: `${apiAdr}/v1/auth/customer?apiKey=${apiKey}`,
    data: {
      email: req.body.username,
      password: req.body.password,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      cityid: req.body.cityid
    }
  })
  .then(response => {
      //console.log(response.data);
      res.redirect('/');
  })
  .catch(error => {
      //console.log(error.response);
      if(error.response !== undefined) {
          res.render('register', {msg: error.response.data.errors.message});
      } else {
          res.render('register', {msg: "Server down!"});
      }
  });
});

//LOGIN CALL
router.post('/', function(req, res) {
  //console.log(req.body.username);
  var temp = JSON.stringify({email: req.body.email})
  axios({
    method: 'post',
    url: `${apiAdr}/v1/auth/customer/login?apiKey=${apiKey}`,
    data: {
      email: req.body.username,
      password: req.body.password
    }
  })
  .then(response => {
      //console.log(response.data.data.id);
      token = response.data.data.token;
      email = response.data.data.user;
      userId = response.data.data.id;
      getUser(response.data.data.id).then(response => {
        city = response;
        res.redirect('/map')});
  })
  .catch(error => {
      //console.log(error);
      if(error.response !== undefined) {
          res.render('index', {msg: error.response.data.errors.title});
      } else {
          res.render('index', {msg: "Server down!"});
      }
  });
});


//BIKE RENTAL MAP
router.get('/map', function(req, res, next) {
  console.log("mapcall"+city);
  if(token != null) {
      request(`${apiAdr}/v1/city/${city}/bike?apiKey=${apiKey}`, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var data = JSON.parse(body);
          res.render('map', {
            title: 'test',
            bikeId: 'Click Bike',
            bikeCoords: '',
            bikeBattery: '',
            dataPack: data
          });
        } else {
          console.log('Api not available');
          res.render('index');
        }
      })
  } else {
      res.redirect('/');
  }
});


//RENTAL CALL START
router.post('/map', function(req, res) {
  if(token != null) {
    console.log(req.body.bikeId);
    axios({
      method: 'post',
      headers: {
          "x-access-token": token
      },
      url: `${apiAdr}/v1/travel/bike/${req.body.bikeId}?apiKey=${apiKey}`
    })
    .then(response => {
        rentQueue();
        //console.log(token);
        stations(city).then(response => {
            res.render('rental', {
              title: req.body.bikeId,
              bId: req.body.bikeId,
              cId: userId,
              tkn: token,
              bCrd: req.body.bikeCoords,
              usr: email,
              dataPack: response
            });
        });
    })
    .catch(error => {
        if(error.response !== undefined) {
            res.render('index', {msg: error.response.data.errors.title});
        } else {
            res.render('index', {msg: "Server down!"});
        }
    });
  }
});

//RENTAL CALL END
router.post('/rental', function(req, res) {
  if(token != null) {
    //console.log(req.body);
    axios({
      method: 'delete',
      headers: {
          "x-access-token": token
      },
      url: `${apiAdr}/v1/travel/bike/${req.body.bikeId}?apiKey=${apiKey}`
    })
    .then(response => {
        console.log(response.data.data);
        res.redirect('/');
    })
    .catch(error => {
        if(error.response !== undefined) {
            res.render('index', {msg: error.response.data.errors.title});
        } else {
            res.render('index', {msg: "Server down!"});
        }
    });

  } else {
      res.redirect('/');
  }
});

// USE CITYID FROM USER TO GET STATIONS FOR ACTIVE RENTAL
async function stations(cityId){
  var result = await axios({
    method: 'get',
    headers: {
        "x-access-token": token
    },
    url: `${apiAdr}/v1/city/${cityId}/station?apiKey=${apiKey}`
  })
  .then(response => {
      //console.log(response.data);
      return response.data;
      //return response.data.data.cityid;
  })
  .catch(error => {
      console.log("Error requesting user.");
      //return "Error requesting user.";
  });
  return result;
}

// GET CITY ID FROM USER AFTER LOGIN
async function getUser(userId){
  var result = await axios({
    method: 'get',
    headers: {
        "x-access-token": token
    },
    url: `${apiAdr}/v1/auth/customer/${userId}?apiKey=${apiKey}`
  })
  .then(response => {
      //console.log(response.data.data.cityid);
      return response.data.data.cityid;
      //return response.data.data.cityid;
  })
  .catch(error => {
      console.log("Error requesting user.");
      //return "Error requesting user.";
  });
  return result;
}

// CHECK IF SERVER IS UP AND AVAILABLE OTHERWISE USE DOCKERSERVER
function serverUp(){
  request(`${apiAdr}/v1/city?apiKey=${apiKey}`, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        apiAdr = "http://localhost:1337";
        console.log("Server is up");
      } else {
        apiAdr = "server:1337";
        console.log("Server down");
    }
  })
}

//UPDATE RENT QUEUE IN ORDER TO RETURN BIKE
function rentQueue(){
  axios({
    method: 'get',
    headers: {
        "x-access-token": token
    },
    url: `${apiAdr}/v1/travel/rented?apiKey=${apiKey}`
  })
  .then(response => {
      console.log(response.data);
  })
  .catch(error => {
      console.log(error.response);
  });
}

module.exports = router;
