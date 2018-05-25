/**
	Mike Chambers
	https://github.com/mikechambers
	http://www.mikechambers.com

	Released under an MIT License
	Copyright Mike Chambers 2018
**/

import mesh from "../lib/mesh.js"
import PCircle from "./pcircle.js"
import {downloadSVG} from "../lib/datautils.js"
import * as utils from "../lib/utils.js"
import Vector from "../lib/vector.js"
import Color from "../lib/color.js"
import {randomColorPallete, getColorPallete} from "../lib/colorpallete.js"
import {randomInt} from "../lib/math.js"
import Gradient from "../lib/gradient.js"
import {loadPixelDataFromPath} from "../lib/pixeldata.js"

/************ CONFIG **************/

let colorSource = {
	PALLETE:"PALLETE",
	GRADIENT:"GRADIENT",
	FILL:"FILL"
};

let config = {
	/**** required for mesh lib ******/

	//name of container that generated canvas will be created in
	PARENT_ID:"canvas_container",

	//app name, used for saving files
	APP_NAME: window.location.pathname.replace(/\//gi, ""),

	//Dimensions that canvas will be rendered at
	RENDER_HEIGHT:1080,//1600,
	RENDER_WIDTH:1080,//2560,

	//Max dimension canvas will be display at on page
	//note, exact dimension will depend on RENDER_HEIGHT / width and
	//ratio to these properties.
	//Canvas display will be scaled to maintain aspect ratio
	MAX_DISPLAY_HEIGHT:640,
	MAX_DISPLAY_WIDTH:640,

	//background color of html page
	BACKGROUND_COLOR:"#FFFFFF",

	//background color for display and offscreen canvas
	CANVAS_BACKGROUND_COLOR:"#FFFFFF",

	//whether a single frame is rendered, or draw is called based on FPS setting
	ANIMATE:true,
	FPS:60,

	//Where video of canvas is recorded
	RECORD_VIDEO:true,

	//whether canvas should be cleared prior to each call to draw
	CLEAR_CANVAS:true,

	/*********** APP Specific Settings ************/

	RADIUS:4,
	CIRCLE_BOUNDS_PADDING:8,
	STROKE_COLOR:"#000000",
	FILL_COLOR:"#FFFFFF",
	COLOR_SOURCE:colorSource.PALLETE,// PALLETE, GRADIENT, FILL
	STROKE_SIZE:8,
	DRAW_BY_DEFAULT:true, //hit d key to toggle whether frames are rendered
	INIT_AFTER_COMPLETE:false,
	DOWNLOAD_PNG_ON_COMPLETE:true,
	TEMPLATE:"mask.gif",
};

/************** GLOBAL VARIABLES ************/

let ctx;
let bounds;
let circles;

let pAmount;
let pallete;

let pixels;
let _doDraw;
let _completed;
let _completedCaptured;

let gradient;

let originalPixels = [];

/*************** CODE ******************/

const init = function(canvas) {

	ctx = canvas.context;
	bounds = canvas.bounds;

	pixels = [...originalPixels];
	_completed = false;
	_completedCaptured = false;
	_doDraw = config.DRAW_BY_DEFAULT;

	mesh.setPaused(false);

	if(config.COLOR_SOURCE == colorSource.PALLETE) {
		pallete = randomColorPallete();
	} else if(config.COLOR_SOURCE == colorSource.GRADIENT){
		gradient = Gradient.random();
		gradient.create();
	}

	circles = [];

	utils.shuffleArray(pixels);

	pAmount = 1;
}

const draw = function(canvas, frameCount) {

	if(!(frameCount % 60)) {
		let total = originalPixels.length;
		let current = pixels.length;
		let per = 100 - Math.round((current/total) * 100);
		console.log(`${per}%`, pixels.length, circles.length);
	}

	let count = 40;

	if(circles.length > 300) {
		count = 1000;
	}

	let points = getRandomPoints(count);

	for(let p of points) {

		let found = false;
		for(let i = 0; i < circles.length; i++) {
			let c = circles[i];
			//todo: change function to also take a circle

			//todo: we could change this to see if the new circle will overlap with an
			//existing one, but then that requires we create a circle instance first

			if(utils.circleContainsPoint(c.center, (c.radius + config.RADIUS / 2 +
					config.STROKE_SIZE), p)) {
				found = true;
			}
		}

		if(!found) {
			let c = new PCircle(p, config.RADIUS);
			c.boundsPadding = config.CIRCLE_BOUNDS_PADDING;
			c.strokeColor = Color.fromHex(config.STROKE_COLOR);
			c.strokeSize = config.STROKE_SIZE;

			c.fillColor = getColor(p);
			circles.push(c);
		}
	}

	for(let c of circles) {
		c.checkCollisions(bounds, circles);
		c.grow();

		if(_doDraw) {
			c.draw(ctx);
		}
	}

	if(_completed & !_completedCaptured) {
		if(config.DOWNLOAD_PNG_ON_COMPLETE) {
			mesh.downloadPng();
		}

		_completedCaptured = true;

		if(config.INIT_AFTER_COMPLETE) {
			init(canvas);
		}
	}
}

const getColor = function(point) {

	let c;
	switch(config.COLOR_SOURCE) {
		case colorSource.PALLETE:
			c = pallete.getNextColor();
			break;
		case colorSource.GRADIENT:
			c = gradient.getColor(point);
		 	break;
		case colorSource.FILL:
			c = Color.fromHex(config.FILL_COLOR);
			break;
		default:
			console.log(`Warning: config.COLOR_SOURCE not recgonized : ${config.COLOR_SOURCE}`);
	}

	return c;
}

const getRandomPoints = function(count) {
	if(pixels.length == 0) {
		console.log("render complete");
		mesh.setPaused(true);
		_doDraw = true;
		_completed = true;
		return [];
	}

	if(pixels.length < count) {
		count = pixels.length;
	}

	//remove from the end of the array
	return pixels.splice(-count, count);
}

const createSVG = function() {
	let svg = `<?xml version="1.0" standalone="no"?>\n
		<svg width="${config.RENDER_WIDTH}" height="${config.RENDER_HEIGHT}"
		version="1.1" xmlns="http://www.w3.org/2000/svg">\n`

	svg = svg + `<rect x="0" y="0" width="${config.RENDER_WIDTH}"
				height="${config.RENDER_HEIGHT}"
				fill="${config.BACKGROUND_COLOR}"/>`;

		for(let c of circles) {
			svg = svg + c.toSVG();
		}

	svg = svg + "</svg>";

	return svg;
}

const onKeyUp = function(event) {
	if(event.key === "s") {
		let svg = createSVG();
		downloadSVG(svg, config.APP_NAME);
	} else if (event.key === "d") {
		_doDraw = !_doDraw;
	}
}

window.onload = function(){

	loadPixelDataFromPath(
		config.TEMPLATE,
		function(pd) {
			originalPixels = pd.mask(function(color) {
				return (color.r == 255 && color.g == 255 && color.b == 255);
			});
			console.log(pixels);
			mesh.init(config, init, draw);
		},
		false
	);

	window.addEventListener("keyup", onKeyUp);
}
