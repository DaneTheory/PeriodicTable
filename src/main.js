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
	var PeriodicTable = require('views/PeriodicTable');
	var ElementData = require('data/ElementData');
	var TestView 		= require('views/TestView');
	var d3Integration	= require('views/d3Integration');




	var mainContext = Engine.createContext();
	//mainContext.setPerspective(1000);



	//var backgroundView = new BackgroundView();

	//var quaternionBox = new QuaternionBox();

	// var periodicTable = new PeriodicTable({
	// 	elementData: ElementData
	// });

	var testView = new TestView({
		elementData: ElementData
	});


		// var d3int = new d3Integration();


	//mainContext.add(backgroundView);





	mainContext.add(testView);

});
