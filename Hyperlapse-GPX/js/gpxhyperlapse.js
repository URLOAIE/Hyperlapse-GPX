// Be a good client-side citizen and define GpxHyperlapseApp object and locally scoped variables 
var GpxHyperlapseApp = GpxHyperlapseApp || {};

GpxHyperlapseApp.hyperlapse = null;
GpxHyperlapseApp.xmlGpx = "";
GpxHyperlapseApp.isLoaded = false;
GpxHyperlapseApp.Strava_access_token = null;
GpxHyperlapseApp.Strava_athlete = null;
GpxHyperlapseApp.Strava_athlete_id = null;
GpxHyperlapseApp.startPoint = null;
GpxHyperlapseApp.endPoint = null;
GpxHyperlapseApp.wayPoints = new Array();

function dropHandler(event) {
event.preventDefault();
var filelist = event.dataTransfer.files;
if (!filelist) return;
	if (filelist.length > 0) {
		var file = filelist[0];
		var filereader = new FileReader();
		filereader.onloadend = function(){ readerOnLoadEnd(filereader,file); } 

		if(file.name.indexOf(".gpx") > -1)
		{
			filereader.readAsText(file);
		}
		else
		{
			alert("Not a GPX file!");
		}
	}
	return false;
}

function readerOnLoadEnd(filereader, file) {

	var filename = file.name;
	var fileContents = filereader.result;
	GpxHyperlapseApp.xmlGpx = fileContents;
	$("#pano").html("");

	var gpxWayPoints = $(GpxHyperlapseApp.xmlGpx).find('trkpt');

	var i = Math.floor((gpxWayPoints.length - 1) / 8);

	GpxHyperlapseApp.startPoint = new google.maps.LatLng(gpxWayPoints[0].attributes["lat"].value, gpxWayPoints[0].attributes["lon"].value);
	GpxHyperlapseApp.endPoint = new google.maps.LatLng(gpxWayPoints[gpxWayPoints.length - 1].attributes["lat"].value, gpxWayPoints[gpxWayPoints.length - 1].attributes["lon"].value);

	GpxHyperlapseApp.wayPoints = new Array();
	GpxHyperlapseApp.wayPoints.push(new google.maps.LatLng(gpxWayPoints[i].attributes["lat"].value, gpxWayPoints[i].attributes["lon"].value));
	GpxHyperlapseApp.wayPoints.push(new google.maps.LatLng(gpxWayPoints[i * 2].attributes["lat"].value, gpxWayPoints[i * 2].attributes["lon"].value));
	GpxHyperlapseApp.wayPoints.push(new google.maps.LatLng(gpxWayPoints[i * 3].attributes["lat"].value, gpxWayPoints[i * 3].attributes["lon"].value));
	GpxHyperlapseApp.wayPoints.push(new google.maps.LatLng(gpxWayPoints[i * 4].attributes["lat"].value, gpxWayPoints[i * 4].attributes["lon"].value));
	GpxHyperlapseApp.wayPoints.push(new google.maps.LatLng(gpxWayPoints[i * 5].attributes["lat"].value, gpxWayPoints[i * 5].attributes["lon"].value));
	GpxHyperlapseApp.wayPoints.push(new google.maps.LatLng(gpxWayPoints[i * 6].attributes["lat"].value, gpxWayPoints[i * 6].attributes["lon"].value));
	GpxHyperlapseApp.wayPoints.push(new google.maps.LatLng(gpxWayPoints[i * 7].attributes["lat"].value, gpxWayPoints[i * 7].attributes["lon"].value));
	GpxHyperlapseApp.wayPoints.push(new google.maps.LatLng(gpxWayPoints[i * 8].attributes["lat"].value, gpxWayPoints[i * 8].attributes["lon"].value));

	loadHyperlapse();
}

function makeDrop(e) {
    e.preventDefault();
    document.getElementById('dropTarget').style.backgroundColor = "#CCCCCC";
}

function leaveDrop(e) {
	e.preventDefault();
    document.getElementById('dropTarget').style.backgroundColor = "#FFFFFF";
}

function loadHyperlapse()
{

	GpxHyperlapseApp.hyperlapse = new Hyperlapse(document.getElementById('pano'), {
	    lookat: GpxHyperlapseApp.startPoint,
		zoom: 1,
		use_lookat: viewModel.use_lookat(),
		elevation: 100,
		millis: viewModel.millis(),
		max_points: viewModel.max_points()
		
	});

	GpxHyperlapseApp.hyperlapse.onError = function(e) {
		console.log(e);
	};

	GpxHyperlapseApp.hyperlapse.onRouteComplete = function(e) {
		console.log(e);
		GpxHyperlapseApp.hyperlapse.load();
	};

	GpxHyperlapseApp.hyperlapse.onRouteProgress = function(e) {
		//console.log(e);
		$("#loading").css("visibility", "visible");
		$("#loading span").html("Loading " + e.point.location.k + "," + e.point.location.B);
	};
	
	GpxHyperlapseApp.hyperlapse.onLoadProgress = function(e) {
		$("#loading span").html("Loading panorama " + e.position + " of " + viewModel.max_points());
		console.log(e);
	};
	
	GpxHyperlapseApp.hyperlapse.onLoadComplete = function(e) {
		$("iframe#youtube").hide();
		$("#controls").show();
		$("#settings").show();
		$("#loading").css("visibility", "hidden");		
		GpxHyperlapseApp.hyperlapse.play();

	};

	// Google Maps API stuff here...
	var directions_service = new google.maps.DirectionsService();

	var route = {
		request:{
		    origin: GpxHyperlapseApp.startPoint,
		    destination: GpxHyperlapseApp.endPoint,
		    waypoints: [{ location: GpxHyperlapseApp.wayPoints[0] }, { location: GpxHyperlapseApp.wayPoints[1] }, { location: GpxHyperlapseApp.wayPoints[2] }, { location: GpxHyperlapseApp.wayPoints[3] }, { location: GpxHyperlapseApp.wayPoints[4] }, { location: GpxHyperlapseApp.wayPoints[5] }, { location: GpxHyperlapseApp.wayPoints[6] }, { location: GpxHyperlapseApp.wayPoints[7] }],
			travelMode: google.maps.DirectionsTravelMode.DRIVING
		}
	};
	
	directions_service.route(route.request, function(response, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			GpxHyperlapseApp.hyperlapse.generate( {route:response} );
		} else {
			console.log(status);
		}
	});
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
    }
    return "";
}

$(function () {
    
    var CLIENT_ID = 3822;
    var AUTHORIZATION_ENDPOINT = "https://www.strava.com/oauth/authorize";

    var code = getCookie("strava_code");
    if (code) {	
	
 		$.ajax({
		    type: "POST",
		    contentType: "application/json; charset=utf-8",
		    url: "Strava.svc/Auth",
		    data: '{"code": "' + code + '"}',
		    dataType: "json",
		    success: function (response) {
		        GpxHyperlapseApp.StravaAuth = JSON.parse(response.AuthResult);
		        GpxHyperlapseApp.Strava_access_token = GpxHyperlapseApp.StravaAuth.access_token;
		        GpxHyperlapseApp.Strava_athlete = GpxHyperlapseApp.StravaAuth.athlete;
		        GpxHyperlapseApp.Strava_athlete_id = GpxHyperlapseApp.StravaAuth.athlete.id;

		        $('div.authenticatedStrava').show();

		        $('span.user').text(GpxHyperlapseApp.StravaAuth.athlete.firstname);

		        loadActivities();

		    },
		    error: function (message) {
		        alert("error has occured");
		    }
		});
				

    } else {
      $('a.connectStrava').show();

      var authUrl = AUTHORIZATION_ENDPOINT + 
        "?response_type=code" +
        "&client_id="    + CLIENT_ID +
        "&redirect_uri=" + location.protocol + '//' + location.host + "/stravaauth/" +
        "&state=activities&approval_prompt=force";

      $("a.connectStrava").attr("href", authUrl);
    }
  });
  
function loadActivities()
{

    $.getJSON("https://www.strava.com/api/v3/athlete/activities?access_token=" + GpxHyperlapseApp.Strava_access_token + "&per_page=20&callback=?", function (data) {
         
        viewModel.stravaActivities(data);
     
    });
   
}

function loadStravaActivity(id)
{
    $.getJSON("https://www.strava.com/api/v3/activities/" + id + "/streams/latlng?access_token=" + GpxHyperlapseApp.Strava_access_token + "&callback=?&resolution=low", function (data) {

        GpxHyperlapseApp.xmlGpx = data[0];
        $("#pano").html("");

        var i = Math.floor(100 / 8);

         GpxHyperlapseApp.startPoint = new google.maps.LatLng(data[0].data[0][0], data[0].data[0][1]);
        GpxHyperlapseApp.endPoint = new google.maps.LatLng(data[0].data[99][0], data[0].data[99][1]);
        
        GpxHyperlapseApp.wayPoints = new Array();
        GpxHyperlapseApp.wayPoints.push(new google.maps.LatLng(data[0].data[i][0], data[0].data[i][1]));
        GpxHyperlapseApp.wayPoints.push(new google.maps.LatLng(data[0].data[i * 2][0], data[0].data[i * 2][1]));
        GpxHyperlapseApp.wayPoints.push(new google.maps.LatLng(data[0].data[i * 3][0], data[0].data[i * 3][1]));
        GpxHyperlapseApp.wayPoints.push(new google.maps.LatLng(data[0].data[i * 4][0], data[0].data[i * 4][1]));
        GpxHyperlapseApp.wayPoints.push(new google.maps.LatLng(data[0].data[i * 5][0], data[0].data[i * 5][1]));
        GpxHyperlapseApp.wayPoints.push(new google.maps.LatLng(data[0].data[i * 6][0], data[0].data[i * 6][1]));
        GpxHyperlapseApp.wayPoints.push(new google.maps.LatLng(data[0].data[i * 7][0], data[0].data[i * 7][1]));
        GpxHyperlapseApp.wayPoints.push(new google.maps.LatLng(data[0].data[i * 8][0], data[0].data[i * 8][1]));

        loadHyperlapse();
        

    });

}

  
var viewModel = {

	use_lookat: ko.observable(false), 
	millis: ko.observable(100),
	max_points: ko.observable(200),
	stravaActivities: ko.observableArray([]),
	isLoaded : ko.observable(false),
	reloadHyperlapse : function() {
		$("#pano").html("");
		loadHyperlapse();
		GpxHyperlapseApp.isLoaded = false;
		viewModel.isLoaded = false;
	},
	loadStravaHyperlapse : function(activity) {
	    loadStravaActivity(activity.id);
	    // the next line is required to work around a bug in WebKit (Chrome / Safari)
	    location.href = "#";
	    location.href = "#pano";
	},
	pauseHyperlapse : function() {
		GpxHyperlapseApp.hyperlapse.pause();
	},
	playHyperlapse : function() { 
		GpxHyperlapseApp.hyperlapse.play();
	},
	nextHyperlapse : function() { 
		GpxHyperlapseApp.hyperlapse.next();
	},
	prevHyperlapse : function() { 
		GpxHyperlapseApp.hyperlapse.prev();
	}
	
};

function init() {

	var dropTarget = document.getElementById("dropTarget");
	dropTarget.addEventListener("dragenter", makeDrop, false);
	dropTarget.addEventListener("dragover", makeDrop, false);
	dropTarget.addEventListener("dragleave", leaveDrop, false);
	dropTarget.addEventListener("drop", dropHandler, false);

	ko.applyBindings(viewModel);
		 
	viewModel.max_points.subscribe(function(newValue) {
		GpxHyperlapseApp.hyperlapse.max_points = newValue;
	});

	viewModel.millis.subscribe(function(newValue) {
		GpxHyperlapseApp.hyperlapse.millis = newValue;
	});
	
}
	

$(document).ready(function() {
	init();
});

