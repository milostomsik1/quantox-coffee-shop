//Foursquare API auth
var CLIENT_ID = "SRSTKKDUOVCGTIYWEDEXYFGPPCFWSE25KA3PIJ3MLR0UFRWK"; //ES6 const
var CLIENT_SECRET = "CMTPSXLN4WZL0W2GT2GIYADXUKXFPAUKXDBKFYFXQHASS4KV"; //ES6 const

//GEOLOCATION START
// var userLatitude;
// var userLongitude;

(function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(getLatLng, getError, {enableHighAccuracy: true, timeout: 5000});
	} else {
		alert("Geolocation is not supported.");
		//add manual location entry
	}
})();

function getLatLng(position) {
	// userLatitude = position.coords.latitude;
	// userLongitude = position.coords.longitude;
	// console.log(userLatitude + " " + userLongitude);

	getCoffeeShops(position.coords.latitude, position.coords.longitude);
}

function getError(error) {
	switch(error.code) {
		case error.PERMISSION_DENIED:
			alert("User denied the request for Geolocation.");
			break;
		case error.POSITION_UNAVAILABLE:
			alert("Location information is unavailable.");
			break;
		case error.TIMEOUT:
			alert("The request to get user location timed out.");
			break;
		case error.UNKNOWN_ERROR:
			alert("An unknown error occurred.");
			break;
	}
}

//Foursquare Venue Search
function getCoffeeShops(userLatitude, userLongitude) {
	var venuesRequested = 10;
	var foursquareApiUrl =	"https://api.foursquare.com/v2/venues/search?" +
									"client_id=" + CLIENT_ID +
									"&client_secret=" + CLIENT_SECRET +
									"&v=20130815" +
									"&ll=" + userLatitude + "," + userLongitude +
									"&limit=" + venuesRequested +
									"&query=coffee";

	var ajax = new XMLHttpRequest();
	ajax.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			console.log(JSON.parse(this.responseText));
		}
	};
	ajax.open("GET", foursquareApiUrl, true);
	ajax.send();
};
