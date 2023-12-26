// Load Map
const map = new mapboxgl.Map({
	container: 'map', // container ID
	style: 'mapbox://styles/opleban/clpvf0cdm00w601qu2pyq6shp', // style URL
	center: [-74.0578574090154, 40.60240962462245], // starting position [lng, lat]
	zoom: 17, // starting zoom
	pitch: 50,
	bearing: 0.4
});

window.tb = new Threebox(map, map.getCanvas().getContext('webgl'), { defaultLights: true });

const animationManager = new AnimationManager();

//Load 3D Model
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


// Snow Commands
const snowButtonCallbackFn = (_map, routeData, routeId) => {

	const [minLon, minLat, maxLon, maxLat] = turf.bbox(routeData);

	const points = createPoints({
		minLon: minLon-SNOW_BUFFER, 
		maxLon: maxLon+SNOW_BUFFER, 
		minLat: minLat-SNOW_BUFFER, 
		maxLat: maxLat+SNOW_BUFFER
	});

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

	function idraw(now) { 
		now *= 0.001;
		let deltaTime;
		if (_then) {
			deltaTime = now - _then;
		} else {
			deltaTime = 0;
		}
		_then = now;
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

			_map.triggerRepaint();

			for (let i=0; i<numElements; i++) {
				points.points[i].resetY();
			}

		//request another frame
		frame = requestAnimationFrame(idraw);
	}

	map.addLayer(snowLayer);
	let _frame;
	let _then;

	idraw();

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

const dropDownCallbackFn = ({data, map}) => {
	animationManager.interruptAnimation();
	showFullRoute(map, data).then(() => {
		animationManager.enableAnimation();
		animatedModel.setCoordsWithZOffset(data.features[0].geometry.coordinates[0])
	});
}

const marathonRouteSelection = new MarathonRouteSelection({dropDownCallbackFn, snowButtonCallbackFn});
map.addControl(new MarathonMapControl());
map.addControl(marathonRouteSelection);
// map.addControl(new MarathonTopLeftButton(makeItSnow));
const fetchGeoJsonData = async (url) => {
	let response = await fetch(url);

	return await (
		response.headers.get('content-type').includes('json')
		? response.json() // this will parse your JSON if the proper content-type header is set!
		: response.text()
		)
}

const addRouteWithModel = (_map, _data, _sourceName, _prettyName, _model) => {
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
	marathonRouteSelection.addOption({
		prettyName: _prettyName, 
		value: _sourceName,
		data: _data
	});

	// Add marker at start of route;
	const startingCoords = getStartingCoordinates(_data);
	addPlayMarker(startingCoords, _sourceName);
	// makeItSnow(_map, _data, _sourceName);
}

const getStartingCoordinates = (_data) => {
	return _data.features[0].geometry.coordinates[0];
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
			if (animationPhase > 1 || animationManager.getAnimationEnabledState()) {
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

      // compute corrected camera ground position, so that the leading edge of the path is in view
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

			if (animationManager.getAnimationEnabledState()) {
				resolve({
					bearing: currentBearing,
					altitude: currentAltitude,
				})
				return;
			}

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

map.on('style.load', async () => {
	map.setConfigProperty('basemap', 'lightPreset', 'dawn');
	map.setConfigProperty('basemap', 'fog', [0.5,15] );

	animatedModel.addModelLayerToMap(map);

	// map.addSource('mapbox-dem', {
	// 	'type': 'raster-dem',
	// 	'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
	// 	'tileSize': 512,
	// 	'maxzoom': 14
	// });

	// map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1 })

	map.setFog({'range': [0,20]})

	map.on('click', (evt) => {
		console.log("Position: ", evt.lngLat);
	});
});

map.on('3dmodeladded', async (e) => {

	// Load Marathon Routes
	let londonData = await fetchGeoJsonData('./routes_geojson/LondonMarathon.geojson')
	let bostonData = await fetchGeoJsonData('./routes_geojson/BostonMarathon.geojson')
	let chicagoData = await fetchGeoJsonData('./routes_geojson/ChicagoMarathon.geojson')
	let tokyoData = await fetchGeoJsonData('./routes_geojson/TokyoMarathon.geojson')
	let berlinData = await fetchGeoJsonData('./routes_geojson/BerlinMarathon.geojson')
	let nycData = await fetchGeoJsonData('./routes_geojson/NYCMarathon.geojson')
	let parisData = await fetchGeoJsonData('./routes_geojson/ParisOlympicsMarathon.geojson')
	let lasVegasData = await fetchGeoJsonData('./routes_geojson/LasVegasMarathon.geojson')
	let miamiMarathonData = await fetchGeoJsonData('./routes_geojson/MiamiMarathon.geojson')
	let sanFranciscoMarathonData = await fetchGeoJsonData('./routes_geojson/SFMarathon.geojson')
	let napaValleyMarathonData = await fetchGeoJsonData('./routes_geojson/NapaValleyMarathon.geojson')

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


