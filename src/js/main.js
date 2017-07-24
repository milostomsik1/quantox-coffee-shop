//Foursquare API auth
var CLIENT_ID = "3DG1ROMCV35ATTHJNEUPDYFTFCSFN52DCTKMDLFLS5ZDAJVC"; //ES6 CONST
var CLIENT_SECRET = "WVS2J45N3P1IWEGDFZHVPZXOBELB5XR1VHNZQZ2KMAQVHRQO"; //ES6 CONST
// var GOOGLE_MAPS_API_KEY = "AIzaSyA4L_QGX6E5Kb2ggRi_B0ijnBUTBSGSx4g" //ES6 CONST

//VARS
var userLatitude;
var userLongitude;
var map;
var uluru;
var coffeeShops = [];


//GEOLOCATION API

//RUNS GEOLOCATION ON LOAD
(function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(getLatLng, getError, {enableHighAccuracy:true, timeout:30000, maximumAge:600000}); //30sec timeout, 10min age
	} else {
		showErrorModal("Geolocation is not supported.");
	}
})();

//RETURNING COORDS AND CALLING SEARCH FUNCTION
function getLatLng(position) {
	userLatitude = position.coords.latitude;
	userLongitude = position.coords.longitude;

	searchForCoffeeShops(userLatitude, userLongitude);
	initMap(userLatitude, userLongitude);
	createUserMarker(userLatitude, userLongitude);
}

function getError(error) {
	switch(error.code) {
		case error.PERMISSION_DENIED:
			showErrorModal("Geolocation failed: please allow browser to access your location and refresh the page.");
			break;
		case error.POSITION_UNAVAILABLE:
			showErrorModal("Location information is unavailable.");
			break;
		case error.TIMEOUT:
			showErrorModal("The request to get user location timed out.");
			break;
		case error.UNKNOWN_ERROR:
			showErrorModal("An unknown error occurred.");
			break;
	}
}

//FOURSQUARE API

//SEARCHES FOR UP TO 10 COFFEE SHOPS WITHIN 1000M RADIUS
function searchForCoffeeShops(lat, lng) {
	var venuesRequested = 10;
	var searchRadius = 9999;  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< VRATITI NA 1000 METARA
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
			var coffeeShopPicture = coffeeShop.photos.groups["0"].items["0"].prefix + "500x300" + coffeeShop.photos.groups["0"].items["0"].suffix;

			var coffeeShopObj = {
				id : coffeeShop.id,
				name : coffeeShop.name,
				distance : coffeeShopDistance,
				isOpen  : coffeeShopOpen(),
				picture : coffeeShopPicture,
				price : coffeeShopPrice(),
				lat : coffeeShop.location.lat,
				lng : coffeeShop.location.lng
			}
			coffeeShops.push(coffeeShopObj);
			// addCoffeeShopToList(coffeeShopObj);
			sortByDistance();
			document.getElementById("coffee-shops-list").innerHTML = "";
			coffeeShops.forEach(function(shop){
				addCoffeeShopToList(shop);
			});
			createShopMarker(coffeeShopObj);
		}
	};
	ajax.open("GET",  venueURL, true);
	ajax.send();
}

//// SORT FUNCTIONS
function sortByDistance() {
	coffeeShops.sort(function(a,b) {
		return a.distance - b.distance;
	});
}

function sortByPrice() {
	coffeeShops.sort(function(a,b) {
		return a.price - b.price;
	});
}


//GOOGLE MAPS API
function initMap(userLatitude, userLongitude) {
	map = new google.maps.Map(document.getElementById('google-map'), {
		zoom:  15,
		streetViewControl: false,
		mapTypeControl: false,
		// scrollwheel: false,
		center: {lat: userLatitude, lng: userLongitude}
	});

}
function createShopMarker(coffeeShop) {
	var marker = new google.maps.Marker({
		position: {lat: coffeeShop.lat, lng: coffeeShop.lng},
		map: map,
		icon: "./assets/coffee-icon.png",
		title: coffeeShop.name
	});
	var popupInfo = new google.maps.InfoWindow({
		content: "<span>" + coffeeShop.name + "("  + coffeeShop.distance + "m)"+ "</span>"
	});
	marker.addListener("click", function() {
		popupInfo.open(map, marker);
	});
	map.addListener("click", function() {
		popupInfo.close();
	});
}
function createUserMarker(userLat, userLng) {
	var marker = new google.maps.Marker({
		position: {lat: userLat, lng: userLng},
		map: map,
		icon: "./assets/user-icon.png",
	});
}


//RENDERING HTML ITEMS
function addCoffeeShopToList (coffeeShop) {
	if(coffeeShop.isOpen !== false) { //renders shops that are either open or dont have defined working hours (possibly open)
		var ul = document.getElementById("coffee-shops-list");
		var li = document.createElement("li");

		function coffeeShopPriceExists() {
			if (coffeeShop.price<=4) {
				return "Price: " + "$".repeat(coffeeShop.price) + "<span class='coffee-shop__price--faded'>" + "$".repeat(4-coffeeShop.price) + "</span>";
			} else {
				return "No pricing defined.";
			}
		}

		var html =
		'<li class="coffee-shop">' +
			'<img  class="coffee-shop__picture" src=" '+ coffeeShop.picture +' " alt=" '+ coffeeShop.name + ' ">' +
			'<div class="coffee-shop__info">' +
				'<h3 class="coffee-shop__name">' + coffeeShop.name + ' (' + coffeeShop.distance + 'm)</h3>' +
				'<p class="coffee-shop__price">' + coffeeShopPriceExists() +'</p>' +
			'</div>' +
		'</li>';

		li.innerHTML = html;
		ul.appendChild(li);
	}
}

//SET ACTIVE CLASS AND SORT  <<< ADD DYNAMIC CODE HERE
document.getElementById("sort__distance").addEventListener("click", function() {
	document.getElementById("sort__distance").classList.add('sort__button--active');
	document.getElementById("sort__price").classList.remove('sort__button--active');
	sortByDistance();
	document.getElementById("coffee-shops-list").innerHTML = "";
	coffeeShops.forEach(function(shop){
		addCoffeeShopToList(shop);
	});

});
document.getElementById("sort__price").addEventListener("click", function() {
	document.getElementById("sort__price").classList.add('sort__button--active');
	document.getElementById("sort__distance").classList.remove('sort__button--active');
	sortByPrice();
	document.getElementById("coffee-shops-list").innerHTML = "";
	coffeeShops.forEach(function(shop){
		addCoffeeShopToList(shop);
	});
});


//MODAL ERROR MESSAGE
function showErrorModal (error) {
	document.getElementById("modal").style.display = "flex";
	document.getElementById("error-box__description").innerHTML = error;
}
