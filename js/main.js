// --------------------- set up Firebase data base
console.log('start');
// Initialize Firebase
var config = {
	apiKey: "AIzaSyCd3B6_Qm9pG-6CIBu7FQ1TPC-9gK-w6ik",
	authDomain: "places-a81be.firebaseapp.com",
	databaseURL: "https://places-a81be.firebaseio.com",
	storageBucket: "places-a81be.appspot.com",
	// messagingSenderId: "1071722193639"
};

firebase.initializeApp(config);

// Connect to Database
var database = firebase.database();

// --------------------- button to add new place to the map
$('#input-form').on('submit', function(e) {
	e.preventDefault();
	
	// get input from #whichPlace
	var whichPlace = $('#whichPlace').val();
	$('#whichPlace').val('');
	console.log(whichPlace);
	
	// get input from #whereIsIt
	var whereIsIt = $('#whereIsIt').val();
	$('#whereIsIt').val('');
	console.log(whereIsIt);
	
	// get input from whatIsIt - radio input
	var whatIsIt = $('input[name=optradio]:checked').val();
	$('input[name=optradio]:checked').val('');
	console.log(whatIsIt);
	
	// get input from #tellMeMore
	var tellMeMore = $('#tellMeMore').val();
	$('#tellMeMore').val('');
	
	// save information in Firebase
	// create section for places in db
	var placeReference = database.ref('places');
	placeReference.push({
		placeName: whichPlace,
		coordinates: whereIsIt,  // places.coords throws an error. Why?
		placeType: whatIsIt,
		description: tellMeMore
	});
	
	// call initMap to refresh map with new data
	initMap();

	// pat on the back
	console.log('success');
});


// --------------------- map and pins
function initMap() {

	var styles = [
		{
			stylers: [
				{hue: '#193341'},
				{saturation: -20}
			]
		}, {
			featureType: 'road',
			elementType: 'geometry',
			stylers: [
				{lightness: 100},
				{visibility: 'simplified'}
			]
		}, {
			featureType: 'road',
			elementType: 'labels',
			stylers: [
				{visibility: 'off'}
			]
		}
	];

	var map = new google.maps.Map(document.getElementById('map'), {
	    center: {lat: 47.607, lng: -122.335},  //47.607753, -122.335462
	    zoom: 2,
	    zoomControl: true,
	  	mapTypeControl: true,
	  	scaleControl: true,
	  	streetViewControl: true,
	  	rotateControl: true,
	  	fullscreenControl: true,
	  	scrollwheel: false,
	  	styles: styles
	});

	var placesArray = [];
    // this is what it should look like - how do I display information when marker is clicked?
	// {
	//   position: new google.maps.LatLng(-33.91721, 151.22630),
	//   name
	//   description
	//   typeOfPlace
	// }
// ------------------------- from API documentation
// https://developers.google.com/maps/documentation/javascript/custom-markers
	function addMarker(feature) {
		var marker = new google.maps.Marker({
		position: placesArray.position, // 'position' from array 'placesArray'
		map: map
		});
	}

    // use reference to database to listen for changes in places data
	database.ref('places').on('value', function (results) {  //Firebase database works in real time.
	    // Get all places stored in the results we received back from Firebase
	    var allPlaces = results.val();

		// for loop goes through database and adds all places to placesArray
		for (var item in allPlaces) {
		// Create an object literal with the data we'll pass to Handlebars
			var all = {
				position: allPlaces[item].coordinates,
				name: allPlaces[item].placeName,
				description: allPlaces[item].description,
				typeOfPlace: allPlaces[item].placeType,
				placesId: item
			};    
			// push newly created element to array of places
			placesArray.push(all)
		}

	    // for loop goes through placesArray and adds markers to map
	    for (var i = 0, feature; feature = placesArray[i]; i++) { // I don't understand this!
	    	addMarker(feature);
		}
	});

	// var marker = new google.maps.Marker({
	// 	position: {lat: 47.607753, lng: -122.335462},
	// 	map: map
	// });
};