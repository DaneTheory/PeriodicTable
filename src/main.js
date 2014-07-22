define(function(require, exports, module) {
	var Engine  = require('famous/core/Engine');
	var Surface = require('famous/core/Surface');
	var SequentialLayout = require('famous/views/SequentialLayout');
	var StateModifier = require('famous/modifiers/StateModifier');
	var Modifier      = require('famous/core/Modifier');
	var Transform     = require('famous/core/Transform');




	var AppView = require('views/AppView');
	var GridView = require('views/GridView');
	var FlyView = require('views/FlyView');
	var QuaternionBox = require('views/QuaternionBox');
	var BackgroundView = require('views/BackgroundView');

	var mainContext = Engine.createContext();


	var backgroundView = new BackgroundView();

	//var quaternionBox = new QuaternionBox();


	mainContext.setPerspective(1000);
	mainContext.add(backgroundView);

});
