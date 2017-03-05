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

// --------------------- button to expand input form
$('#expand-btn').on('click', function(e){
	e.preventDefault;

	$('#input-form').toggle();
})

// --------------------- button to add new place to the map
$('#input-form').on('submit', function(e) {
	e.preventDefault();
	
	// get input from #whichPlace
	var whichPlace = $('#whichPlace').val();
	$('#whichPlace').val('');
	console.log(whichPlace);
	
	// get input from #whereIsIt 
	var whereIsItText = $('#whereIsIt').val(); // how to check that format is correct? TRY val <= 90 && val >= -90 and $.isNumeric(whereIsIt) --------------------
	var whereIsIt = whereIsItText.split(', ');
	whereIsIt[0] = Number(whereIsIt[0]); 
	whereIsIt[1] = Number(whereIsIt[1]);
	console.log('coordinates of new place ' + whereIsIt);
	$('#whereIsIt').val('');
	//console.log(whereIsIt);
	
	// get input from whatIsIt - radio input
	var whatIsIt;
	if ($('input[name=optradio]:checked').val() === 'Food&Drinks') {
		whatIsIt = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
	} else if ($('input[name=optradio]:checked').val() === 'Fun') {
		whatIsIt = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
	} else {
		whatIsIt = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
	}
	//var whatIsIt = $('input[name=optradio]:checked').val();
	$('input[name=optradio]').prop('checked', false);
	//console.log('whatIsIt = ' + whatIsIt);
	
	// get input from #tellMeMore
	var tellMeMore = $('#tellMeMore').val();
	$('#tellMeMore').val('');
	
	// save information in Firebase
	// create section for places in db
	var placeReference = database.ref('places');
	placeReference.push({
		placeName: whichPlace,
		coordinates: whereIsIt,
		placeType: whatIsIt,
		description: tellMeMore
	});
	
	// call initMap to refresh map with new data. doesn't seem to be needed.
	//initMap();

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

	// var marker = new google.maps.Marker({
	// 	position: {lat: 47.607753, lng: -122.335462},
	// 	map: map
	// });

// ------------------------- from API documentation
// https://developers.google.com/maps/documentation/javascript/custom-markers

// function to add pins to map
	function addMarker(feature) {
	console.log(feature.placesId);
	//console.log('feature.typeOfPlace = ' + feature.typeOfPlace);
		var contentString = '<div id="content">'+
	    		'<div id="siteNotice">'+
	    		'</div>'+
		    	'<h1 class="firstHeading">'+feature.name+'</h1>'+  //titel goes here
		    	'<div id="bodyContent" id="' + feature.placesId + '">'+  //can I have 2 IDs in one element? --------------
		    		'<p>'+feature.description+'</p>'+   // description goes here
		    		'<button class="btn btn-default delete">Delete</button>'
		    	'</div>'+
	    	'</div>';
			var infowindow = new google.maps.InfoWindow({
	    		content: contentString,
	    		maxWidth: 200
	  	});
		var marker = new google.maps.Marker({
			position: {lat: feature.position[0], lng: feature.position[1]},
			map: map,
			icon: feature.typeOfPlace
			//title: feature.placeName // seems unnecessary
		});
		//eventlistener to display information when pin is clicked
		marker.addListener('click', function() {
			// infowindow.setContent('this is a string');
			infowindow.close(); // how to close other open infowindows? ----------------------
	     	infowindow.open(map, this);
	  	 });
	}

	// test
    // use reference to database to listen for changes in places data
	database.ref('places').on('value', function (results) {  //Firebase database works in real time.
	    // Get all places stored in the results we received back from Firebase
	    var allPlaces = results.val();

		// for loop goes through database and calls addMarker() to add pins to map
		for (var item in allPlaces) {
		// Create an object literal with the data we'll pass to addMarker function
			var all = {
				position: allPlaces[item].coordinates,
				name: allPlaces[item].placeName,
				description: allPlaces[item].description,
				typeOfPlace: allPlaces[item].placeType,
				placesId: item
			};

			addMarker(all);
		}
	});
};

$('.delete').on('click', function (e) {  // something doesn't work ----------------
  // Get the ID for the place to delete
  var id = $(e.target).parent('id');
  // find places whose objectId is equal to the id we're searching with
  var placeReference = database.ref('places/' + id);
  // Use remove method to remove the place from the database
  placeReference.remove();
});