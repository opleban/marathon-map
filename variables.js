mapboxgl.accessToken = 'pk.eyJ1Ijoib3BsZWJhbiIsImEiOiI0VXNzcXFRIn0.uE_om5U3KbYO_Xy-tsSRiQ'

const BEARING_PARAMETER = 1.5;
const SNOW_BUFFER = 0.1

let animationStopped = false;
let altitudeValue;
let pitchValue;

class AnimationManager {
	constructor() {
		this.animationInterrupted = false;
	}

	interruptAnimation() {
		this.animationInterrupted = true
	}

	enableAnimation() {
		this.animationInterrupted = false;
	}

	getAnimationEnabledState() {
		return this.animationInterrupted;
	}
}


