// Create 3D model
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
				const options = {
					obj: this.modelPath,
					type: 'gltf',
					scale: { x: this.scale, y: this.scale, z: this.scale },
					units: 'meters',
					rotation: this.initialRotation,
					anchor: 'center'
				};

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
