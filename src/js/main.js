let offlineMode = false;
let positionArray = [];
let locationRetrieved = false;

$( document ).ready(function() {
  getLocation();
});

$('.pizza-button').on('click', function() {
  if (!locationRetrieved) return;
  $('#pizza-container').addClass('pizza-spin');
  $('.pizza-button').html('Finding Pizza');
  fetch(`https://api.foursquare.com/v2/venues/search?ll=${positionArray[0]},${positionArray[1]}&client_id=KAKRJKH45UMDES3SUEMEJYHZOBANXSGK1XRMHHNROGGLXCPF&client_secret=LPO0YOEHQ0NOGJPCPWZQSRQWGY1SE4I4SCO22DSEVSH0W0E4&v=20161105&query=pizza&radius=10000&limit=5`).then(function(response) {
    return response.json();
  }).then(function(data) {
     window.setTimeout(function() {
       $('#pizza-container').removeClass('pizza-spin');
       $('.pizza-button').html('Find me a pizza');
     }, 3800);
     $('#pizza-locations').html('');
     let venues = data.response.venues;
     venues.sort(function(a, b){
         return a.location.distance-b.location.distance
     })

     venues.map(x => {
       let address = "";
       x.location.formattedAddress.map(x => address += x + ", ");
       address = address.substring(0, address.length - 2);
       $('#pizza-locations').append(`<div class='location'><div class="location-name">${x.name} - ${x.location.distance} metres away</div><div>${address}</div></div>`);
     });
     storeInIDB(venues);
  }).catch(function(error) {
    showOfflineState();
   });
});

let showOfflineState = () => {
  document.getElementById('title').innerHTML = "<span id='offline'>Offline (Distances may be inaccurate)</span> - Pizza Finder";
  offlineMode = true;

  console.log('There has been a problem with your fetch operation: ');
  var dbPromise = idb.open('pizza-locations', 1, function(upgradeDb) { });

  dbPromise.then(db => {
    return db.transaction('locations').objectStore('locations').getAll();
  }).then(function(allObjs){
      window.setTimeout(function() {
        $('#pizza-container').removeClass('pizza-spin');
        $('.pizza-button').html('Unable to determine location');
      }, 3800);
      allObjs[0].locations.map(x => {
        let address = "";
        x.location.formattedAddress.map(x => address += x + ", ");
        address = address.substring(0, address.length - 2);
        $('#pizza-locations').append(`<div class='location'><div class="location-name">${x.name} - ${x.location.distance} metres away</div><div>${address}</div></div>`);
      });
    });
}

let getLocation = () => {
    // if no network condition, show cached results
    window.setTimeout(function() {
      if (positionArray.length < 2) {
        showOfflineState();
        $('.pizza-button').html('Unable to determine location');
      }
    }, 5000);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}

let showPosition = (position) => {
    positionArray.push(position.coords.latitude);
    positionArray.push(position.coords.longitude);
    locationRetrieved = true;
    $('.pizza-button').html('Find me a Pizza');
}

var storeInIDB = (venues) => {
  var dbPromise = idb.open('pizza-locations', 1, function(upgradeDb) {
        upgradeDb.createObjectStore('locations', { keyPath: 'name' });
  });

  dbPromise.then(function(db) {
    var tx = db.transaction('locations', 'readwrite');
    var locations = tx.objectStore('locations');

    locations.put({
      name: `1`,
      locations: venues
    });

    return tx.complete;
  }).then(function() {
    console.log('locations added');
  });
}
