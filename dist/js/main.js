function getLatLng(e){userLatitude=e.coords.latitude,userLongitude=e.coords.longitude,searchForCoffeeShops(userLatitude,userLongitude),initMap(userLatitude,userLongitude),createUserMarker(userLatitude,userLongitude)}function getError(e){switch(e.code){case e.PERMISSION_DENIED:showErrorModal("Geolocation failed: please allow browser to access your location and refresh the page.");break;case e.POSITION_UNAVAILABLE:showErrorModal("Location information is unavailable.");break;case e.TIMEOUT:showErrorModal("The request to get user location timed out.");break;case e.UNKNOWN_ERROR:showErrorModal("An unknown error occurred.")}}function searchForCoffeeShops(e,o){var t="https://api.foursquare.com/v2/venues/search?client_id="+CLIENT_ID+"&client_secret="+CLIENT_SECRET+"&v=20130815&ll="+e+","+o+"&intent=browse&radius=1000&limit=10&query=coffee",n=new XMLHttpRequest;n.onreadystatechange=function(){if(4==this.readyState&&200==this.status){var e=JSON.parse(this.responseText).response.venues;e.forEach(function(o,t){getCoffeeShopInfo(e[t].id,e[t].location.distance)})}},n.open("GET",t,!0),n.send()}function getCoffeeShopInfo(e,o){var t="https://api.foursquare.com/v2/venues/"+e+"?client_id="+CLIENT_ID+"&client_secret="+CLIENT_SECRET+"&v=20130815",n=new XMLHttpRequest;n.onreadystatechange=function(){if(4==this.readyState&&200==this.status){var e=JSON.parse(this.responseText).response.venue,t=e.photos.groups[0].items[0].prefix+"500x300"+e.photos.groups[0].items[0].suffix,n={id:e.id,name:e.name,distance:o,isOpen:function(){return e.hasOwnProperty("hours")?e.hours.isOpen:"No hours defined."}(),picture:t,price:function(){return e.hasOwnProperty("price")?e.price.tier:9}(),lat:e.location.lat,lng:e.location.lng};coffeeShops.push(n),createShopMarker(n),sortByDistanceAndRenderHTML()}},n.open("GET",t,!0),n.send()}function sortByDistanceAndRenderHTML(){document.getElementById("sort__distance").classList.add("sort__button--active"),document.getElementById("sort__price").classList.remove("sort__button--active"),coffeeShops.sort(function(e,o){return e.distance-o.distance}),document.getElementById("coffee-shops-list").innerHTML="",coffeeShops.forEach(function(e){addCoffeeShopToList(e)})}function sortByPriceAndRenderHTML(){document.getElementById("sort__price").classList.add("sort__button--active"),document.getElementById("sort__distance").classList.remove("sort__button--active"),coffeeShops.sort(function(e,o){return e.price-o.price}),document.getElementById("coffee-shops-list").innerHTML="",coffeeShops.forEach(function(e){addCoffeeShopToList(e)})}function initMap(e,o){map=new google.maps.Map(document.getElementById("google-map"),{zoom:15,streetViewControl:!1,mapTypeControl:!1,center:{lat:e,lng:o}})}function createShopMarker(e){var o=new google.maps.Marker({position:{lat:e.lat,lng:e.lng},map:map,icon:"./assets/coffee-icon.png",title:e.name}),t=new google.maps.InfoWindow({content:"<span>"+e.name+"("+e.distance+"m)</span>"});o.addListener("click",function(){t.open(map,o)}),map.addListener("click",function(){t.close()})}function createUserMarker(e,o){new google.maps.Marker({position:{lat:e,lng:o},map:map,icon:"./assets/user-icon.png"})}function addCoffeeShopToList(e){if(!1!==e.isOpen){var o=document.getElementById("coffee-shops-list"),t=document.createElement("li"),n='<li class="coffee-shop"><img  class="coffee-shop__picture" src=" '+e.picture+' " alt=" '+e.name+' "><div class="coffee-shop__info"><h3 class="coffee-shop__name">'+e.name+" ("+e.distance+'m)</h3><p class="coffee-shop__price">'+function(){return e.price<=4?"Price: "+"$".repeat(e.price)+"<span class='coffee-shop__price--faded'>"+"$".repeat(4-e.price)+"</span>":"No pricing defined."}()+"</p></div></li>";t.innerHTML=n,o.appendChild(t)}}function showErrorModal(e){document.getElementById("modal").style.display="flex",document.getElementById("error-box__description").innerHTML=e}var CLIENT_ID="VXA13GN03RAQNXZSNQV3CKRAHOKGIZWRNTZ2ORXUILJH5ZQ4",CLIENT_SECRET="URM3Y0FARUNZ3JPS5WO0WKQF4XAOX5T5T1TSO3PI5JYMCRFN",userLatitude,userLongitude,map,uluru,coffeeShops=[];!function(){navigator.geolocation?navigator.geolocation.getCurrentPosition(getLatLng,getError,{enableHighAccuracy:!0,timeout:3e4,maximumAge:6e5}):showErrorModal("Geolocation is not supported.")}();