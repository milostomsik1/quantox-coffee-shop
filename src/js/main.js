//Foursquare API auth
var CLIENT_ID = "SRSTKKDUOVCGTIYWEDEXYFGPPCFWSE25KA3PIJ3MLR0UFRWK"; //ES6 const
var CLIENT_SECRET = "CMTPSXLN4WZL0W2GT2GIYADXUKXFPAUKXDBKFYFXQHASS4KV"; //ES6 const

//GEOLOCATION
var userLatitude;
var userLongitude;

(function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(getLatLng, getError, {enableHighAccuracy: true, timeout: 5000});
	} else {
		alert("Geolocation is not supported.");
		//add manual location entry
	}
})();

function getLatLng(position) {
	userLatitude = position.coords.latitude;
	userLongitude = position.coords.longitude;
	console.log(userLatitude + " " + userLongitude);

	searchForCoffeeShops(userLatitude, userLongitude);
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

//FOURSQUARE API
var coffeeShops = [];

//SEARCHES FOR UP TO 10 COFFEE SHOPS WITHIN 1000M RADIUS
function searchForCoffeeShops(lat, lng) {
	var venuesRequested = 10;
	var searchRadius = 1500;
	var searchVenuesURL =	"https://api.foursquare.com/v2/venues/search?" +
									"client_id=" + CLIENT_ID +
									"&client_secret=" + CLIENT_SECRET +
									"&v=20130815" +
									"&ll=" + lat + "," + lng +
									"&intent=browse" +
									"&radius=" + searchRadius +
									"&limit=" + venuesRequested +
									"&query=coffee";

	var ajax = new XMLHttpRequest();
	ajax.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var coffeeShopList = JSON.parse(this.responseText).response.venues;
			console.log(coffeeShopList);
			coffeeShopList.forEach(function(shop, index){
				var id = coffeeShopList[index].id; //passing id to look up venue by ID
				var distance = coffeeShopList[index].location.distance; //passing distance because the VENUE object doesn't contain distance from user
				getCoffeeShopInfo(id, distance);
			});
		}
	};
	ajax.open("GET", searchVenuesURL, true);
	ajax.send();
};

//GETS INFO FOR A SINGLE COFFEE SHOP REFERENCED BY ID
function getCoffeeShopInfo(coffeeShopId, coffeeShopDistance) {
	var ajax = new XMLHttpRequest();
	var venueURL = "https://api.foursquare.com/v2/venues/" +
						coffeeShopId +
						"?client_id=" + CLIENT_ID +
						"&client_secret=" + CLIENT_SECRET +
						"&v=20130815";

	ajax.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var coffeeShop = JSON.parse(this.responseText).response.venue;
			console.log(coffeeShop);
			var coffeeShopOpen = function() {
				if(coffeeShop.hasOwnProperty("hours")) {
					return coffeeShop.hours.isOpen;
				} else {
					return "No hours defined.";
				}
			}
			var coffeeShopPrice = function() {
				if(coffeeShop.hasOwnProperty("price")) {
					return coffeeShop.price.tier;
				} else {
					return 9; // price tiers are from 1 (cheapst) to 4 (most expensive), high value so they appear on end of list when sorted.
				}
			}
			var coffeeShopPicture = coffeeShop.photos.groups["0"].items["0"].prefix + "original" + coffeeShop.photos.groups["0"].items["0"].suffix;
			console.log(coffeeShopPicture);
			coffeeShops.push({
				id : coffeeShop.id,
				name : coffeeShop.name,
				distance : coffeeShopDistance,
				isOpen  : coffeeShopOpen(),
				picture : coffeeShopPicture,
				price : coffeeShopPrice()
			});
			console.log(coffeeShops);
		}
	};
	ajax.open("GET",  venueURL, true);
	ajax.send();
}

setTimeout(function() {
	sortByClosest();
},3000);

//// SORT FUNCTIONS
function sortByClosest() {
	coffeeShops.sort(function(a,b) {
		return a.distance - b.distance;
	});
	console.log(coffeeShops);
}

function sortByCheapest() {
	coffeeShops.sort(function(a,b) {
		return a.price - b.price;
	});
	console.log(coffeeShops);
}
