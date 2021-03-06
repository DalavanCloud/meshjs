/**
	Mike Chambers
	https://github.com/mikechambers
	http://www.mikechambers.com

	Released under an MIT License
	Copyright Mike Chambers 2018
**/

import meshjs from "../../lib/mesh.js";
import Rectangle from "../../lib/geometry/rectangle.js";
import { loadPixelDataFromPathWithBounds } from "../../lib/data/pixeldata.js";

/************ CONFIG **************/

const config = {
  //Dimensions that canvas will be rendered at
  RENDER_HEIGHT: 640,
  RENDER_WIDTH: 1080,

  //Max dimension canvas will be display at on page
  //note, exact dimension will depend on RENDER_HEIGHT / width and
  //ratio to these properties.
  //Canvas display will be scaled to maintain aspect ratio
  MAX_DISPLAY_HEIGHT: 640,
  MAX_DISPLAY_WIDTH: 640,

  //background color of html page
  BACKGROUND_COLOR: "#DDDDDD",

  //background color for display and offscreen canvas
  CANVAS_BACKGROUND_COLOR: "#FF0000",

  //whether a single frame is rendered, or draw is called based on FPS setting
  ANIMATE: false,
  FPS: 60,

  //Where video of canvas is recorded
  CAPTURE_VIDEO: false,

  //whether canvas should be cleared prior to each call to draw
  CLEAR_CANVAS: false,

  /*********** APP Specific Settings ************/
  TEMPLATE: "mask.gif"
};

/************** GLOBAL VARIABLES ************/

let bounds;
let _pd;

/*************** CODE ******************/

const init = function(context) {
  bounds = meshjs.bounds;
};

const draw = function(context, frameCount) {
  context.putImageData(_pd.imageData, 0, 0);
};

window.onload = function() {
  loadPixelDataFromPathWithBounds(
    config.TEMPLATE,
    function(pd, img) {
      _pd = pd;
      meshjs.init(config, init, draw);
    },
    new Rectangle(0, 0, config.RENDER_WIDTH, config.RENDER_HEIGHT)
  );
};
