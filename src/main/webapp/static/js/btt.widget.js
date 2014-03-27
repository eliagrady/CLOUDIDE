var speed = 1;
var speedBase = 2; // controls the speed of the scroll
var iter = 0;
function scrollToTop() {

	Wix.scrollBy(0, -speed);
	speed = Math.ceil(Math.pow(speedBase, iter));
	iter += 0.5;
	if (speed < 50000) {
		console.log(speed);
		var delay = setTimeout(scrollToTop, 10);
	}
	else {
		speed = 1;
		iter = 0;
	}
}