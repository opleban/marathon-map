class MarathonMapControl {
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

class MarathonDropdownSelection {
	constructor({dropDownCallbackFn, snowButtonCallbackFn}) {
		this.dropDownCallbackFn = dropDownCallbackFn;
		this.snowButtonCallbackFn = snowButtonCallbackFn;
		this.dataSources = {};
		this.isItSnowingIn = {};
		this.selected = 'nyc-marathon';
	}

	onAdd(map) {
		this._map = map;
		this._container = document.createElement('div');
		this._container.className = 'mapboxgl-dropdown-ctrl mapboxgl-ctrl';
		this._select = document.createElement('select');

		const defaultOption = document.createElement('option');
		defaultOption.value="none";
		defaultOption.selected = true;
		defaultOption.hidden = true
		defaultOption.disabled = true;
		defaultOption.textContent = "Select a marathon route"

		const emptyOption = document.createElement('option');
		emptyOption.value="none";
		emptyOption.disabled = true;
		this._select.appendChild(defaultOption);
		this._select.appendChild(emptyOption);
		this._select.id = "marathons";
		this._select.name ="marathons";

		this._select.addEventListener('change', (evt) => {
			this.selected = evt.target.value;
			this.dropDownCallbackFn({data: this.dataSources[this.selected], map: this._map});
			
		});

		const snowButton = document.createElement('button');
		snowButton.textContent = "Let it snow!";
		snowButton.addEventListener('click', () => {
			if (this.selected && !this.isItSnowingIn[this.selected]) {
				this.snowButtonCallbackFn(this._map, this.dataSources[this.selected], this.selected);
				this.isItSnowingIn[this.selected] = true;
			}
		});

		this._container.appendChild(this._select);
		this._container.appendChild(snowButton);

		return this._container;
	}

	addOption({prettyName, value, data, model}) {
		const optionItem = document.createElement('option');
		optionItem.textContent = prettyName;
		optionItem.value = value;
		this.dataSources[value] = data;
		this._select.appendChild(optionItem);
	}

	onRemove() {
		this._container.parentNode.removeChild(this._container);
		this._map = undefined;
	}

	getDefaultPosition() {
		return 'top-left'
	}
}
