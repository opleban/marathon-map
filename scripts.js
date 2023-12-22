// https://d3js.org/d3-ease/ v3.0.1 Copyright 2010-2021 Mike Bostock, 2001 Robert Penner
!function(n,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports):"function"==typeof define&&define.amd?define(["exports"],e):e((n="undefined"!=typeof globalThis?globalThis:n||self).d3=n.d3||{})}(this,(function(n){"use strict";function e(n){return((n*=2)<=1?n*n:--n*(2-n)+1)/2}function t(n){return((n*=2)<=1?n*n*n:(n-=2)*n*n+2)/2}var u=function n(e){function t(n){return Math.pow(n,e)}return e=+e,t.exponent=n,t}(3),r=function n(e){function t(n){return 1-Math.pow(1-n,e)}return e=+e,t.exponent=n,t}(3),a=function n(e){function t(n){return((n*=2)<=1?Math.pow(n,e):2-Math.pow(2-n,e))/2}return e=+e,t.exponent=n,t}(3),o=Math.PI,i=o/2;function c(n){return(1-Math.cos(o*n))/2}function s(n){return 1.0009775171065494*(Math.pow(2,-10*n)-.0009765625)}function f(n){return((n*=2)<=1?s(1-n):2-s(n-1))/2}function h(n){return((n*=2)<=1?1-Math.sqrt(1-n*n):Math.sqrt(1-(n-=2)*n)+1)/2}var p=4/11,M=7.5625;function d(n){return(n=+n)<p?M*n*n:n<.7272727272727273?M*(n-=.5454545454545454)*n+.75:n<.9090909090909091?M*(n-=.8181818181818182)*n+.9375:M*(n-=.9545454545454546)*n+.984375}var l=1.70158,I=function n(e){function t(n){return(n=+n)*n*(e*(n-1)+n)}return e=+e,t.overshoot=n,t}(l),O=function n(e){function t(n){return--n*n*((n+1)*e+n)+1}return e=+e,t.overshoot=n,t}(l),x=function n(e){function t(n){return((n*=2)<1?n*n*((e+1)*n-e):(n-=2)*n*((e+1)*n+e)+2)/2}return e=+e,t.overshoot=n,t}(l),v=2*Math.PI,y=function n(e,t){var u=Math.asin(1/(e=Math.max(1,e)))*(t/=v);function r(n){return e*s(- --n)*Math.sin((u-n)/t)}return r.amplitude=function(e){return n(e,t*v)},r.period=function(t){return n(e,t)},r}(1,.3),b=function n(e,t){var u=Math.asin(1/(e=Math.max(1,e)))*(t/=v);function r(n){return 1-e*s(n=+n)*Math.sin((n+u)/t)}return r.amplitude=function(e){return n(e,t*v)},r.period=function(t){return n(e,t)},r}(1,.3),m=function n(e,t){var u=Math.asin(1/(e=Math.max(1,e)))*(t/=v);function r(n){return((n=2*n-1)<0?e*s(-n)*Math.sin((u-n)/t):2-e*s(n)*Math.sin((u+n)/t))/2}return r.amplitude=function(e){return n(e,t*v)},r.period=function(t){return n(e,t)},r}(1,.3);n.easeBack=x,n.easeBackIn=I,n.easeBackInOut=x,n.easeBackOut=O,n.easeBounce=d,n.easeBounceIn=function(n){return 1-d(1-n)},n.easeBounceInOut=function(n){return((n*=2)<=1?1-d(1-n):d(n-1)+1)/2},n.easeBounceOut=d,n.easeCircle=h,n.easeCircleIn=function(n){return 1-Math.sqrt(1-n*n)},n.easeCircleInOut=h,n.easeCircleOut=function(n){return Math.sqrt(1- --n*n)},n.easeCubic=t,n.easeCubicIn=function(n){return n*n*n},n.easeCubicInOut=t,n.easeCubicOut=function(n){return--n*n*n+1},n.easeElastic=b,n.easeElasticIn=y,n.easeElasticInOut=m,n.easeElasticOut=b,n.easeExp=f,n.easeExpIn=function(n){return s(1-+n)},n.easeExpInOut=f,n.easeExpOut=function(n){return 1-s(n)},n.easeLinear=n=>+n,n.easePoly=a,n.easePolyIn=u,n.easePolyInOut=a,n.easePolyOut=r,n.easeQuad=e,n.easeQuadIn=function(n){return n*n},n.easeQuadInOut=e,n.easeQuadOut=function(n){return n*(2-n)},n.easeSin=c,n.easeSinIn=function(n){return 1==+n?1:1-Math.cos(n*i)},n.easeSinInOut=c,n.easeSinOut=function(n){return Math.sin(n*i)},Object.defineProperty(n,"__esModule",{value:!0})}));

mapboxgl.accessToken = 'pk.eyJ1Ijoib3BsZWJhbiIsImEiOiI0VXNzcXFRIn0.uE_om5U3KbYO_Xy-tsSRiQ'

const BEARING_PARAMETER = 1.5;

let animationStopped = false;
let altitudeValue;
let pitchValue;
let letItSnow = true;

const interruptAnimation = () => {
	animationStopped = true
}

const enableAnimation = () => {
	animationStopped = false
}

const getAnimationEnabledState = () => {
	return animationStopped;
}


const fetchGeoJsonData = async (url) => {
	let response = await fetch(url);

	return await (
		response.headers.get('content-type').includes('json')
		? response.json() // this will parse your JSON if the proper content-type header is set!
		: response.text()
		)
}

const addRouteWithModel = (_map, _data, _sourceName, _prettyName, _model) => {
	const addButton = (btnText, btnId) => {
		const newButton = document.createElement('button');
		newButton.textContent = btnText;
		newButton.id = btnId;

		newButton.addEventListener("click", _evt => {
			interruptAnimation();
			showFullRoute(_map, _data).then(() => {
				enableAnimation();
				_model.setCoordsWithZOffset(_data.features[0].geometry.coordinates[0])
			});
			// 
		});

		document.body.appendChild(newButton);
	}

	const addPlayMarker = (markerCoord, markerName) => {

		const _marker = new mapboxgl.Marker({
			color: "#FFFFFF"
		})
		.setLngLat(markerCoord)
		.addTo(_map);

		// Add click handler
		_marker.getElement().addEventListener('click', () => {
			playAnimationsWithModel(_map, _data, _sourceName, _model);
		});
	}

	const addGeoJsonSourceStyleToMap = () => {
		_map.addSource(_sourceName, {
			'type': 'geojson',
			lineMetrics: true,
			'data': _data
		});

		_map.addLayer({
			'id': _sourceName,
			'type': 'line',
	// This property allows you to identify which `slot` in
	// the Mapbox Standard your new layer should be placed in (`bottom`, `middle`, `top`).
			'slot': 'middle',
			'source': _sourceName,
			'paint': {
				"line-color": "rgba(60, 179, 113, 1)",
				"line-width": 6,
				"line-opacity": 1
			},
			'layout': {
				"line-cap": "round",
				"line-join": "round"
			}
		});

		return _map;
	} 

	addGeoJsonSourceStyleToMap();
	addButton(_prettyName, _sourceName);

	// Add marker at start of route;
	const startingCoords = getStartingCoordinates(_data);
	addPlayMarker(startingCoords, _sourceName);
	// makeItSnow(_map, _data, _sourceName);
}

const getStartingCoordinates = (_data) => {
	return _data.features[0].geometry.coordinates[0];
}


const showFullRoute = (_map, routeGeoJSON) => {
	const bounds = turf.bbox(routeGeoJSON);
	return new Promise(async (resolve) => {
		_map.fitBounds(bounds, {
			duration: 3000,
			pitch: 30,
			bearing: 0,
			padding: 120,
		});

		setTimeout(() => {
			resolve()
		}, 100)
	});
}

class HelloWorldControl {
	onAdd(map) {
		this._map = map;
		this._container = document.createElement('div');
		this._container.className = 'mapboxgl-ctrl';

		const topFiller = document.createElement('span');
		topFiller.setAttribute('style', 'width: 20px; display: inline-block');
		this._container.appendChild(topFiller);

		this._tiltUpButton = document.createElement('button')
		this._tiltUpButton.id = 'tilt-up';
		this._tiltUpButton.textContent = '↑';
		this._container.appendChild(this._tiltUpButton);
		this._tiltUpButton.addEventListener('click', () => {
			console.log("tilt up");
			pitchValue = this._map.getPitch() + 5;
			console.log("altitude: ", altitudeValue);
			console.log("pitch: ", pitchValue);
		});

		const brOne = document.createElement('br');
		this._container.appendChild(brOne);

		this._zoomInbutton = document.createElement('button')
		this._zoomInbutton.id = 'zoom-in';
		this._zoomInbutton.textContent = '+';
		this._container.appendChild(this._zoomInbutton);
		this._zoomInbutton.addEventListener('click', () => {
			console.log("zoom in");
			altitudeValue = this._map.getFreeCameraOptions()._position.toAltitude() - 50;
			console.log("altitude: ", altitudeValue);
			console.log("pitch: ", pitchValue);
		});

		const midFiller = document.createElement('span');
		midFiller.setAttribute('style', 'width: 20px; display: inline-block');
		this._container.appendChild(midFiller);

		this._zoomOutbutton = document.createElement('button')
		this._zoomOutbutton.id = 'zoom-out';
		this._zoomOutbutton.textContent = '-';
		this._container.appendChild(this._zoomOutbutton);
		this._zoomOutbutton.addEventListener('click', () => {
			console.log("zoom out");
			altitudeValue = this._map.getFreeCameraOptions()._position.toAltitude() + 50;
			console.log("altitude: ", altitudeValue);
			console.log("pitch: ", pitchValue);
		});

		const brTwo = document.createElement('br');
		this._container.appendChild(brTwo);

		const bottomFiller = document.createElement('span');
		bottomFiller.setAttribute('style', 'width: 20px; display: inline-block');
		this._container.appendChild(bottomFiller);

		this._tiltDownButton = document.createElement('button')
		this._tiltDownButton.id = 'tilt-down';
		this._tiltDownButton.textContent = '↓';
		this._container.appendChild(this._tiltDownButton);
		this._tiltDownButton.addEventListener('click', () => {
			console.log("tilt down");
			pitchValue = this._map.getPitch() - 10;
			console.log("altitude: ", altitudeValue);
			console.log("pitch: ", pitchValue);
		});

		return this._container;
	}

	onRemove() {
		this._container.parentNode.removeChild(this._container);
		this._map = undefined;
	}
}

// amazingly simple, via https://codepen.io/ma77os/pen/OJPVrP
function lerp(start, end, amt) {
	return (1 - amt) * start + amt * end
}

const computeCameraPosition = ( pitch, bearing, targetPosition, altitude, smooth = false) => {
	var bearingInRadian = bearing / 57.29;
	var pitchInRadian = (90 - pitch) / 57.29;

	var lngDiff =
	((altitude / Math.tan(pitchInRadian)) *
		Math.sin(-bearingInRadian)) /
    70000; // ~70km/degree longitude

    var latDiff =
    ((altitude / Math.tan(pitchInRadian)) *
    	Math.cos(-bearingInRadian)) /
    110000 // 110km/degree latitude

    var correctedLng = targetPosition.lng + lngDiff;
    var correctedLat = targetPosition.lat - latDiff;

    const newCameraPosition = {
    	lng: correctedLng,
    	lat: correctedLat
    };

    if (smooth) {
    	if (previousCameraPosition) {
    		const SMOOTH_FACTOR = 0.95
    		newCameraPosition.lng = lerp(newCameraPosition.lng, previousCameraPosition.lng, SMOOTH_FACTOR);
    		newCameraPosition.lat = lerp(newCameraPosition.lat, previousCameraPosition.lat, SMOOTH_FACTOR);
    	}
    }

    previousCameraPosition = newCameraPosition

    return newCameraPosition
}

// const generateUpdatedElephantData = (coords) => {
// 	return {
// 		'type': 'FeatureCollection',
// 		'features': [
// 		{
// 			'type': 'Feature',
// 			'id': 'fc842f12-071f-5537-a665-bace79d0d5b3',
// 			'geometry': {
// 				'coordinates': coords,
// 				'type': 'Point'
// 			},
// 			'properties': {}
// 		}
// 		]
// 	};
// }

const animatePathWithModel = async ({ _map, trackId, duration, path, startBearing, startAltitude, pitch, _model }) => {
	return new Promise(async (resolve) => {


		const pathDistance = turf.lineDistance(path);
		let startTime;

		const frame = async (currentTime) => {
			if (!startTime) startTime = currentTime;
			const animationPhase = (currentTime - startTime) / duration;

			let _altitudeValue = altitudeValue ? altitudeValue : startAltitude;
			let _pitchValue = pitchValue ? pitchValue: pitch;


      // when the duration is complete, resolve the promise and stop iterating
			if (animationPhase > 1 || getAnimationEnabledState()) {
				resolve();
				return;
			}
      // calculate the distance along the path based on the animationPhase
			const alongPath = turf.along(path, pathDistance * animationPhase).geometry
			.coordinates;

			const upcomingPath = turf.along(path, pathDistance * animationPhase + BEARING_PARAMETER).geometry
			.coordinates;

			const lngLat = {
				lng: alongPath[0],
				lat: alongPath[1]
			};

			_map.setPaintProperty(
				trackId,
				"line-gradient",
				[
					"step",
					["line-progress"],
					"red",
					animationPhase,
					"rgba(60, 179, 113, 1)",
					]
				);

			const bearing = turf.bearing(alongPath, upcomingPath);

      // compute corrected camera ground position, so that he leading edge of the path is in view
			var correctedPosition = computeCameraPosition(
				_pitchValue,
				bearing,
				lngLat,
				_altitudeValue,
        		true // smooth
        		);

      // set the pitch and bearing of the camera
			const camera = _map.getFreeCameraOptions();
			camera.setPitchBearing(_pitchValue, bearing);

			let phaseOffset = animationPhase - 0.001 < 0 ? 0 : animationPhase - 0.001;

			const beforePath = turf.along(path, pathDistance * phaseOffset).geometry.coordinates;

			const pathBearing = turf.bearing(beforePath, alongPath);

			const azimuthAngle = turf.bearingToAzimuth(pathBearing);

			if (_model.animated) {
				_model.model.playDefault({duration: 1000, speed: _model.animationSpeed});
			}

			_model.setWithZOffset({coords: alongPath, rotation: 90-azimuthAngle, duration: 50})

      // set the position and altitude of the camera
			camera.position = mapboxgl.MercatorCoordinate.fromLngLat(
				correctedPosition,
				_altitudeValue
				);

      // apply the new camera options
			_map.setFreeCameraOptions(camera);

      // repeat!
			await window.requestAnimationFrame(frame);
		};

		await window.requestAnimationFrame(frame);
	});
}

const flyInAndRotate = async ({
	_map,
	targetLngLat,
	duration,
	startAltitude,
	endAltitude,
	startBearing,
	endBearing,
	startPitch,
	endPitch,
}) => {
	return new Promise(async (resolve) => {
		let start;

		var currentAltitude;
		var currentBearing;
		var currentPitch;

    // the animation frame will run as many times as necessary until the duration has been reached
		const frame = async (time) => {
			if (!start) {
				start = time;
			}

      // otherwise, use the current time to determine how far along in the duration we are
			let animationPhase = (time - start) / duration;

      // because the phase calculation is imprecise, the final zoom can vary
      // if it ended up greater than 1, set it to 1 so that we get the exact endAltitude that was requested
			if (animationPhase > 1) {
				animationPhase = 1;
			}

			currentAltitude = startAltitude + (endAltitude - startAltitude) * d3.easeCubicOut(animationPhase)
      // rotate the camera between startBearing and endBearing
			currentBearing = startBearing + (endBearing - startBearing) * d3.easeCubicOut(animationPhase)

			currentPitch = startPitch + (endPitch - startPitch) * d3.easeCubicOut(animationPhase)

      // compute corrected camera ground position, so the start of the path is always in view
			var correctedPosition = computeCameraPosition(
				currentPitch,
				currentBearing,
				targetLngLat,
				currentAltitude
				);

      // set the pitch and bearing of the camera
			const camera = _map.getFreeCameraOptions();
			camera.setPitchBearing(currentPitch, currentBearing);

      // set the position and altitude of the camera
			camera.position = mapboxgl.MercatorCoordinate.fromLngLat(
				correctedPosition,
				currentAltitude
				);

      // apply the new camera options
			_map.setFreeCameraOptions(camera);

      // when the animationPhase is done, resolve the promise so the parent function can move on to the next step in the sequence
			if (animationPhase === 1) {
				resolve({
					bearing: currentBearing,
					altitude: currentAltitude,
				});

        // return so there are no further iterations of this frame
				return;
			}

			await window.requestAnimationFrame(frame);
		};

		await window.requestAnimationFrame(frame);
	});
};

const playAnimationsWithModel = async (_map, trackGeojson, trackId, _model) => {
	return new Promise(async (resolve) => {
    // // add a geojson source and layer for the linestring to the map
	// 	addPathSourceAndLayer(trackGeojson);

    // get the start of the linestring, to be used for animating a zoom-in from high altitude
		var targetLngLat = {
			lng: trackGeojson.features[0].geometry.coordinates[0][0],
			lat: trackGeojson.features[0].geometry.coordinates[0][1],
		};

	// Get initial bearing based marathon route
		const initialPathPoint = turf.along(trackGeojson.features[0], 0).geometry.coordinates;
		const alongPathPoint = turf.along(trackGeojson.features[0], BEARING_PARAMETER).geometry.coordinates;

		const initialPathBearing = turf.bearing(initialPathPoint, alongPathPoint);

    // animate zooming in to the start point, get the final bearing and altitude for use in the next animation
		const { bearing, altitude } = await flyInAndRotate({
			_map,
			targetLngLat,
			duration: 4000,
			startAltitude: _map.getFreeCameraOptions()._position.toAltitude(),
			endAltitude: 200,
			startBearing: 0,
			endBearing: initialPathBearing,
			startPitch: 40,
			endPitch: 55
		});

    // follow the path while slowly rotating the camera, passing in the camera bearing and altitude from the previous animation
		// _model.playAnimation({animation:0,duration:300000});
		await animatePathWithModel({
			_map,
			trackId,
			duration: 300000,
			path: trackGeojson.features[0],
			startBearing: initialPathBearing,
			startAltitude: altitude,
			pitch: 55,
			_model
		});

    // // get the bounds of the linestring, use fitBounds() to animate to a final view
	// 	const bounds = turf.bbox(trackGeojson);
	// 	_map.fitBounds(bounds, {
	// 		duration: 3000,
	// 		pitch: 30,
	// 		bearing: 0,
	// 		padding: 120,
	// 	});

		setTimeout(() => {
			resolve()
		}, 10000)
	})
};

const playAnimations = async (_map, trackGeojson, _defaultModelRotationValues) => {
	return new Promise(async (resolve) => {
    // // add a geojson source and layer for the linestring to the map
	// 	addPathSourceAndLayer(trackGeojson);

    // get the start of the linestring, to be used for animating a zoom-in from high altitude
		var targetLngLat = {
			lng: trackGeojson.features[0].geometry.coordinates[0][0],
			lat: trackGeojson.features[0].geometry.coordinates[0][1],
		};

	// Get initial bearing based marathon route
		const initialPathPoint = turf.along(trackGeojson.features[0], 0).geometry.coordinates;
		const alongPathPoint = turf.along(trackGeojson.features[0], BEARING_PARAMETER).geometry.coordinates;

		const initialPathBearing = turf.bearing(initialPathPoint, alongPathPoint);

    // animate zooming in to the start point, get the final bearing and altitude for use in the next animation
		const { bearing, altitude } = await flyInAndRotate({
			_map,
			targetLngLat,
			duration: 4000,
			startAltitude: _map.getFreeCameraOptions()._position.toAltitude(),
			endAltitude: 200,
			startBearing: 0,
			endBearing: initialPathBearing,
			startPitch: 40,
			endPitch: 55
		});

    // follow the path while slowly rotating the camera, passing in the camera bearing and altitude from the previous animation
		await animatePath({
			_map,
			duration: 300000,
			path: trackGeojson.features[0],
			startBearing: initialPathBearing,
			startAltitude: altitude,
			pitch: 55,
			_defaultModelRotationValues
		});

		setTimeout(() => {
			resolve()
		}, 10000)
	})
};


const map = new mapboxgl.Map({
	container: 'map', // container ID
	style: 'mapbox://styles/opleban/clpvf0cdm00w601qu2pyq6shp', // style URL
	center: [-74.0578574090154, 40.60240962462245], // starting position [lng, lat]
	zoom: 17, // starting zoom
	pitch: 50,
	bearing: 0.4
});

window.tb = new Threebox(map, map.getCanvas().getContext('webgl'), { defaultLights: true });

map.addControl(new HelloWorldControl());

const addSantaSleighModel = (_map, initialLocation) => {
	map.addSource('mysource', {
		type: 'geojson',
		data: generateUpdatedElephantData(initialLocation)
	});

    // I see that a network request is made to this URL.
	map.addModel('model', '/models/santa_sleigh.glb');

	const defaultModelRotationValues = [0,0,0]

    // No models show up on the map. No errors are thrown. What's missing?
	map.addLayer({
		'id': 'modellayer',
		'type': 'model',
		'source': 'mysource',
		'layout': {
			'model-id': 'model'
		},
		'paint': {
			'model-scale': [ 2.5, 2.5, 2.5],
			'model-type': 'location-indicator',
			'model-rotation': defaultModelRotationValues
		}
	});

	return defaultModelRotationValues;
}

const addDuckModel = (_map, initialLocation) => {
	map.addSource('mysource', {
		type: 'geojson',
		data: generateUpdatedElephantData(initialLocation)
	});

    // I see that a network request is made to this URL.
	map.addModel('model', '/models/Duck.glb');


    // No models show up on the map. No errors are thrown. What's missing?
	const defaultModelRotationValues = [0,0,0];
	map.addLayer({
		'id': 'modellayer',
		'type': 'model',
		'source': 'mysource',
		'layout': {
			'model-id': 'model'
		},
		'paint': {
			'model-scale': [15, 15, 15],
			'model-type': 'location-indicator',
			'model-rotation':  defaultModelRotationValues
		}
	});

	return defaultModelRotationValues;

}

const addCustom3DModelLayer = (_map, modelPath, initialRotation, scale) => {
	map.addLayer({
		id: 'custom-threebox-model',
		type: 'custom',
		renderingMode: '3d',
		onAdd: function (map, mbxContext) {
			const options = {
				obj: modelPath,
				type: 'gltf',
				scale: { x: scale, y: scale, z: scale },
				units: 'meters',
				rotation: initialRotation,
				anchor: 'center'
			};

			tb.loadObj(options, (_model) => {
				model = _model;
				tb.add(model);
			});

			_map.fire('3dmodeladded');
		},

		render: function (gl, matrix) {
			tb.update();
		}
	});
}


class ThreeBoxModel {
	constructor({modelPath, animated, initialRotation, scale, zOffset, animationSpeed}) {
		this.modelPath = modelPath;
		this.animated = animated;
		this.initialRotation = initialRotation;
		this.scale = scale;
		this.zOffset = zOffset;
		this.animationSpeed = animationSpeed;
	}

	addModelLayerToMap(_map) {
		_map.addLayer({
			id: 'custom-threebox-model',
			type: 'custom',
			renderingMode: '3d',
			onAdd: (_map, mbxContext) => {
				console.log(this);
				const options = {
					obj: this.modelPath,
					type: 'gltf',
					scale: { x: this.scale, y: this.scale, z: this.scale },
					units: 'meters',
					rotation: this.initialRotation,
					anchor: 'center'
				};

				console.log(options);

				tb.loadObj(options, (_model) => {
					this.model = _model;
					tb.add(_model);
				});

				_map.fire('3dmodeladded');
			},

			render: function (gl, matrix) {
				tb.update();
			}
		});
	}

	setCoordsWithZOffset(coords) {
		this.model.setCoords([...coords.slice(0,2), this.zOffset]);
	}

	setWithZOffset({coords, rotation, duration}) {
		this.model.set({coords: [...coords.slice(0,2), this.zOffset], rotation, duration})
	}

}

const add3DModel = (_map, initialLocation) => {
	// const defaultModelRotationValues = addDuckModel(_map, initialLocation);
	const defaultModelRotationValues = addSantaSleighModel(_map, initialLocation);
	// const defaultModelRotationValues = addElkModel(_map, initialLocation);

	return defaultModelRotationValues;
}

const getInitialBearing = (_data) => {
	const initialPathPoint = turf.along(_data.features[0], 0).geometry.coordinates;
	const alongPathPoint = turf.along(_data.features[0], 0.005).geometry.coordinates;

	const pathBearing = turf.bearing(initialPathPoint, alongPathPoint);
	return pathBearing;
	
}

// import Stats from 'https://threejs.org/examples/jsm/libs/stats.module.js';
// let stats;

// const animatedModel = new ThreeBoxModel({modelPath:'./models/elk_wip.glb', animated: true, initialRotation: { x: 90, y: -90, z: 0 }, scale: 10, zOffset:-20, animationSpeed: 1});
// const animatedModel = new ThreeBoxModel({modelPath:'./models/runner.glb', animated: true, initialRotation: { x: 90, y: -90, z: 0 }, scale: 40, zOffset:0, animationSpeed: 1});
// const animatedModel = new ThreeBoxModel({modelPath:'./models/drifter_truck.glb', initialRotation: { x: 90, y: 180, z: 0 }, scale: 0.05, zOffset:0, animationSpeed: 1});
// const animatedModel = new ThreeBoxModel({modelPath:'./models/camry.glb', initialRotation: { x: 90, y: -90, z: 0 }, scale: 10, zOffset:0, animationSpeed: 1});
// const animatedModel = new ThreeBoxModel({modelPath:'./models/sonic_runner.glb', animated: true, initialRotation: { x: 90, y: -90, z: 0 }, scale: 10, zOffset:0, animationSpeed: 5});
// const animatedModel = new ThreeBoxModel({modelPath:'./models/santa_sleigh.glb', animated: false, initialRotation: { x: 90, y: 180, z: 0 }, scale: 2, zOffset:0, animationSpeed: 0});
// const animatedModel = new ThreeBoxModel({modelPath:'./models/pig_sleigh.glb', animated: true, initialRotation: { x: 90, y: 180, z: 0 }, scale: 1, zOffset:0, animationSpeed: 1});
// const animatedModel = new ThreeBoxModel({modelPath:'./models/tron_bike.glb', animated: true, initialRotation: { x: 90, y: 90, z: 0 }, scale: 20, zOffset:0, animationSpeed: 1});
const animatedModel = new ThreeBoxModel({modelPath:'./models/santa_claus.glb', animated: false, initialRotation: { x: 90, y: 0, z: 0 }, scale: 20, zOffset:20, animationSpeed: 1});
// const animatedModel = new ThreeBoxModel({modelPath:'./models/donkey_kong_model.glb', animated: true, initialRotation: { x: 90, y: 90, z: 0 }, scale: 20, zOffset:10, animationSpeed: 1});


map.on('style.load', async () => {
	map.setConfigProperty('basemap', 'lightPreset', 'dawn');
	map.setConfigProperty('basemap', 'fog', [0.5,15] );

	// addCustom3DModelLayer(map, './models/runner.glb', { x: 90, y: -90, z: 0 }, 40);
	animatedModel.addModelLayerToMap(map);
	// addCustom3DModelLayer(map, './models/elk_wip.glb', { x: 90, y: -90, z: 0 }, 10);

	// map.addSource('mapbox-dem', {
	// 	'type': 'raster-dem',
	// 	'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
	// 	'tileSize': 512,
	// 	'maxzoom': 14
	// });

	// map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1 })

	// const initialBearing = getInitialBearing(nycData);
	// const azimuthAngle = turf.bearingToAzimuth(initialBearing);

	// map.setPaintProperty("modellayer", "model-rotation", [defaultModelRotationValues[0], defaultModelRotationValues[1], azimuthAngle - 90])
	map.setFog({'range': [0,20]})

	map.on('click', (evt) => {
		console.log("Position: ", evt.lngLat);
	});

});

const SNOW_BUFFER = 0.1

const makeItSnow =(_map, routeData, routeId) => {
	// const minLat = 46.5;
	// const maxLat = 47.25;
	// const minLon = -122;
	// const maxLon = -121.5;

	// console.log(routeData);
	const [minLon, minLat, maxLon, maxLat] = turf.bbox(routeData);

	const points = createPoints({minLon: minLon-SNOW_BUFFER, maxLon: maxLon+SNOW_BUFFER, minLat: minLat-SNOW_BUFFER, maxLat: maxLat+SNOW_BUFFER});

	const snowLayer = ({
		id: 'snow-' + routeId,
		type: 'custom',
		renderingMode: '3d',
  	// method called when the layer is added to the map
  	// https://docs.mapbox.com/mapbox-gl-js/api/#styleimageinterface#onadd
		onAdd: function (map, gl) {
			gl.enable(gl.DEPTH_TEST);

    // link the two shaders into a WebGL program
			this.programInfo = programInfo(gl,vsSource,fsSource);
			this.map = map;

    //texture for particle billboards
			const circleTexture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, circleTexture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, particleCanvas);

			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    //texture for snowflake circle SDF
			this.circleTexture = circleTexture;
    //buffer to hold particle location
			this.buffersTrans = gl.createBuffer();
    //buffer to hold vertices of texture
			this.buffersSquare = gl.createBuffer();

    	},//end onAdd,

    	// method fired on each animation frame
    	// https://docs.mapbox.com/mapbox-gl-js/api/#map.event:render
    	render: renderFunction(points, map) 
    });

	map.addLayer(snowLayer);
	let _frame;
	let _then;

	(function idraw(now) {
		now *= 0.001;
		let deltaTime;
		if (_then) {
			deltaTime = now-_then;
		} else {
			deltaTime = 0;
		}
		_then = now;
		if (letItSnow) {
//update billboard center points (6 * 3)
		for (let i=0; i<numElements; i++) {
			points.points[i].propagate(deltaTime);
			points.tData[i*18+1] = points.points[i].y;
			points.tData[i*18+4] = points.points[i].y;
			points.tData[i*18+7] = points.points[i].y;
			points.tData[i*18] = points.points[i].x;
			points.tData[i*18+3] = points.points[i].x;
			points.tData[i*18+6] = points.points[i].x;
			points.tData[i*18+2] = points.points[i].z;
			points.tData[i*18+5] = points.points[i].z;
			points.tData[i*18+8] = points.points[i].z;
			points.tData[i*18+9] = points.points[i].x;
			points.tData[i*18+10] = points.points[i].y;
			points.tData[i*18+11] = points.points[i].z;

			points.tData[i*18+12] = points.points[i].x;
			points.tData[i*18+13] = points.points[i].y;
			points.tData[i*18+14] = points.points[i].z;

			points.tData[i*18+15] = points.points[i].x;
			points.tData[i*18+16] = points.points[i].y;
			points.tData[i*18+17] = points.points[i].z;
		}

		map.triggerRepaint();

		for (let i=0; i<numElements; i++) {
			points.points[i].resetY();
		}
	}

		//request another frame
		frame = requestAnimationFrame(idraw);
	})();

}

let bringSnow = {}


map.on('3dmodeladded', async (e) => {
	console.log(e);

	let londonData = await fetchGeoJsonData('./routes_geojson/LondonMarathon.geojson')
	let bostonData = await fetchGeoJsonData('./routes_geojson/BostonMarathon.geojson')
	let chicagoData = await fetchGeoJsonData('./routes_geojson/ChicagoMarathon.geojson')
	let tokyoData = await fetchGeoJsonData('./routes_geojson/TokyoMarathon.geojson')
	let berlinData = await fetchGeoJsonData('./routes_geojson/BerlinMarathon.geojson')
	let nycData = await fetchGeoJsonData('./routes_geojson/NYCMarathon.geojson')
	let parisData = await fetchGeoJsonData('./routes_geojson/ParisOlympicsMarathon.geojson')
	let lasVegasData = await fetchGeoJsonData('./routes_geojson/LasVegasMarathon.geojson')
	let miamiMarathonData = await fetchGeoJsonData('./routes_geojson/MiamiMarathon.geojson')
	let sanFranciscoMarathonData = await fetchGeoJsonData('./routes_geojson/SanFranciscoMarathon.geojson')
	let napaValleyMarathonData = await fetchGeoJsonData('./routes_geojson/NapaValleyoMarathon.geojson')

	bringSnow.ToNewYork = () => makeItSnow(map, nycData, 'nyc-marathon')
	bringSnow.ToBerlin = () => makeItSnow(map, berlinData, 'berlin-marathon')
	bringSnow.ToTokyo = () => makeItSnow(map, tokyoData, 'tokyo-marathon')
	bringSnow.ToChicago = () => makeItSnow(map, chicagoData, 'chicago-marathon')
	bringSnow.ToBoston = () => makeItSnow(map, bostonData, 'boston-marathon')
	bringSnow.ToParis = () => makeItSnow(map, parisData, 'paris-marathon')

	const initialBearing = getInitialBearing(nycData);

	const initialNYCCoordinates = nycData.features[0].geometry.coordinates[0];

	animatedModel.setCoordsWithZOffset(initialNYCCoordinates);
	animatedModel.model.setRotation(90 - initialBearing);

	addRouteWithModel(map, londonData, 'london-marathon','TCS London Marathon', animatedModel);
	addRouteWithModel(map, bostonData, 'boston-marathon', 'Boston Marathon', animatedModel);
	addRouteWithModel(map, chicagoData, 'chicago-marathon', 'Chicago Marathon', animatedModel);
	addRouteWithModel(map, tokyoData, 'tokyo-marathon', 'Tokyo Marathon', animatedModel);
	addRouteWithModel(map, berlinData, 'berlin-marathon', 'BMW Berlin Marathon', animatedModel);
	addRouteWithModel(map, nycData, 'nyc-marathon', 'TCS NYC Marathon', animatedModel);
	addRouteWithModel(map, parisData, 'paris-marathon', 'Paris Olympics Marathon', animatedModel);
	addRouteWithModel(map, lasVegasData, 'las-vegas-marathon', 'Las Vegas Rock n Roll Marathon', animatedModel);
	addRouteWithModel(map, miamiMarathonData, 'miami-marathon', 'Miami Marathon', animatedModel);
	addRouteWithModel(map, sanFranciscoMarathonData, 'san-francisco-marathon', 'SF Marathon', animatedModel);
	addRouteWithModel(map, napaValleyMarathonData, 'napa-valley-marathon', 'Napa Valley Marathon', animatedModel);
});


