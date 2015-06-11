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
	var PeriodicTable = require('views/PeriodicTable');
	var ElementData = require('data/ElementData');
	var TestView 		= require('views/TestView');




	var mainContext = Engine.createContext();

//*************************

	// comment in and out the various view and add them to mainContext.
	// Each is different.
	// quaternion box was a learning process about 3d animations
	// periodictable was the first table and has the most features
	// testview is the second periodic table that was redone to be able to take elements out of
	// the tables plane so you could individually look at elements without them following the rotation and movement
	// of the elements still in the table

//*******************************

	// var quaternionBox = new QuaternionBox();

	// var periodicTable = new PeriodicTable({
	// 	elementData: ElementData
	// });

	var testView = new TestView({
		elementData: ElementData
	});






	mainContext.add(testView);

});
