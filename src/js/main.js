//Foursquare API auth
var CLIENT_ID = "SRSTKKDUOVCGTIYWEDEXYFGPPCFWSE25KA3PIJ3MLR0UFRWK"; //ES6 CONST
var CLIENT_SECRET = "CMTPSXLN4WZL0W2GT2GIYADXUKXFPAUKXDBKFYFXQHASS4KV"; //ES6 CONST
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
		navigator.geolocation.getCurrentPosition(getLatLng, getError, {enableHighAccuracy: true, timeout: 5000});
	} else {
		alert("Geolocation is not supported.");
		//add manual location entry
	}
})();

//RETURNING COORDS AND CALLING SEARCH FUNCTION
function getLatLng(position) {
	userLatitude = position.coords.latitude;
	userLongitude = position.coords.longitude;
	console.log(userLatitude + " " + userLongitude);

	searchForCoffeeShops(userLatitude, userLongitude);
	initMap(userLatitude, userLongitude);
	createUserMarker(userLatitude, userLongitude);
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

//SEARCHES FOR UP TO 10 COFFEE SHOPS WITHIN 1000M RADIUS
function searchForCoffeeShops(lat, lng) {
	var venuesRequested = 10;
	var searchRadius = 1300;  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< VRATITI NA 1000 METARA
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
			addCoffeeShopToList(coffeeShopObj);
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
		content: "<h2>" + coffeeShop.name + "("  + coffeeShop.distance + "m)"+ "</h2>"
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
	var ul = document.getElementById("coffee-shops-list");
	var li = document.createElement("li");

	function coffeeShopPriceExists() {
		if (coffeeShop.price<=4) {
			return "Price: " + "$".repeat(coffeeShop.price);
		} else {
			return "";
		}
	}

	var html =
	'<li id="coffee-shop">' +
		'<img  id="coffee-shop__picture" src=" '+ coffeeShop.picture +' " alt=" '+ coffeeShop.name + ' ">' +
		'<div class="coffee-shop__info">' +
			'<h3 id="coffee-shop__name">' + coffeeShop.name + ' (' + coffeeShop.distance + 'm)</h3>' +
			'<p id="coffee-shop__price">' + coffeeShopPriceExists() +'</p>' +
		'</div>' +
	'</li>';

	li.innerHTML = html;
	ul.appendChild(li);
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
