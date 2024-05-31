import $ from 'jquery';
import { Loader } from "@googlemaps/js-api-loader"

declare let global: any;
global.jQuery = $;
 
//Setup search events
$("#Search").on("click", doSearch);
$("#City").on("keypress", (e) => { if(e.key == 'Enter') doSearch()});

//key saving
$("#saveKeys").on('click', () => {
	localStorage.setItem('weatherApiKey', $('#weatherKey').val() as string);
	localStorage.setItem('googleApiKey', $('#googleKey').val() as string);
});
$("#clearKeys").on('click', () => {
	localStorage.removeItem('weatherApiKey');
	localStorage.removeItem('googleApiKey');
});

if(localStorage.getItem('weatherApiKey') != null && localStorage.getItem('googleApiKey') != null){
	$('#weatherKey').val(localStorage.getItem('weatherApiKey') as string);
	$('#googleKey').val(localStorage.getItem('googleApiKey') as string);
}



//Create google maps loader
const loader = new Loader({
	apiKey: $('#googleKey').val() as string,
	version: "weekly"
});

const dirTable: {min: number, max: number, direction: string}[] = [
	{ min: 0, max: 23, direction: 'North' },
	{ min: 337, max: 360, direction: 'North' },
	{ min: 24, max: 68, direction: 'North-East' },
	{ min: 69, max: 113, direction: 'East' },
	{ min: 114, max: 158, direction: 'South-East' },
	{ min: 159, max: 203, direction: 'South' },
	{ min: 204, max: 248, direction: 'South-West' },
	{ min: 249, max: 293, direction: 'West' },
	{ min: 294, max: 336, direction: 'North-West' },
];

//transform: rotate(-45deg);
async function doSearch() {
	let city: string = $("#City").val() as string;
	let lang: string = 'EN';
	let units: string = 'metric';
	const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&lang=${lang}&appid=${$('#weatherKey').val() as string}`);
	const json = await response.json();
	
	$('#CurrDisplay').text('Currently displaying: ' + json['name'] + ', ' + json['sys']['country']);

	$("#weatherIcon").attr("src", `https://openweathermap.org/img/wn/${json['weather'][0]['icon']}@4x.png`);
	$("#WDescription").text(json['weather'][0]['description']);
	$("#WVisibility").text("Visibility: " + (json['visibility'] as number == 10000 ? "10+" : json['visibility'] / 1000) + " km");

	$("#Temp").text(json['main']['temp']+'°C');
	$("#Feels").text('Feels like: ' + json['main']['feels_like'] + '°C');
	$("#Pressure").text('Pressure: ' + json['main']['pressure'] + ' hPa');
	$("#Humidity").text('Humidity: ' + json['main']['humidity'] + '%');
	
	let windDir: string = '';
	dirTable.forEach((dir) => {
		if(json['wind']['deg']>= dir['min'] && json['wind']['deg'] <= dir['max']) {
			windDir = dir['direction'];
		}
	});
	$("#WindDir").text(windDir);


	let offsetDeg: number = json['wind']['deg'] - 45;
	if (offsetDeg < 0) offsetDeg = 360 + offsetDeg;
	else if (offsetDeg > 360) offsetDeg = offsetDeg - 360;
	$('#WindIcon').css({transform: `rotate(${offsetDeg}deg)`});

	$("#WindSpeed").text('Wind Speed: ' + json['wind']['speed'] + ' m/s');

	let sunriseText = new Date(json['sys']['sunrise'] * 1000).toTimeString();

	let sunsetText = new Date(json['sys']['sunset'] * 1000).toTimeString();

	$("#Sunrise").text('Sunrise: ' + sunriseText.slice(0, sunriseText.indexOf('(')));
	$("#Sunset").text('Sunset: ' + sunsetText.slice(0, sunsetText.indexOf('(')));

	loader.load().then(async () => {
		const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
		new Map($("#googleMap")[0] as HTMLElement, {
		center: { lat: json['coord']['lat'], lng: json['coord']['lon'] },
		zoom: 12,
		});
	});
}

$('#City').val('London');
doSearch();