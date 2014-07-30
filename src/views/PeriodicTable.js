define(function(require, exports, module) {
    var Engine        = require('famous/core/Engine')
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Modifier      = require('famous/core/Modifier');
    var RenderNode    = require('famous/core/RenderNode');
    var Quaternion    = require('famous/math/Quaternion');
    var Transitionable = require('famous/transitions/Transitionable');
    var ScrollSync    = require('famous/inputs/ScrollSync');
    var ContainerSurface = require('famous/surfaces/ContainerSurface');
    var TweenTransition   =require('famous/transitions/TweenTransition');
    var Timer           = require('famous/utilities/Timer');
    var GenericSync     = require('famous/inputs/GenericSync');
    var TouchSync       = require('famous/inputs/TouchSync');
    var MouseSync       = require('famous/inputs/MouseSync');
    var ScrollSync      = require('famous/inputs/ScrollSync');
    var PinchSync       = require('famous/inputs/PinchSync');
    var Accumulator     = require('famous/inputs/Accumulator');
    var EventHandler = require('famous/core/EventHandler');
    var EventMapper   = require('famous/events/EventMapper');
    var ModifierChain = require('famous/modifiers/ModifierChain');
    var RenderController = require('famous/views/RenderController');



    function PeriodicTable() {
        View.apply(this, arguments);

        var mainEngine = Engine.createContext();
        mainEngine.setPerspective(1000);

        /****************TABLE VARIABLES*******************/
        var windowHeight = window.innerHeight;
        var windowWidth = window.innerWidth;
        console.log('Window properties: ' + windowWidth + ', ' + windowHeight);



        var elementSize = 50;
        this.elementSize = 50;
        var tableWidth = elementSize * 18.72;
        var tableHeight = elementSize * 10.4;

        Transitionable.registerMethod('tween', TweenTransition);
        var tableYDefault = 0;
        var yTransitionable = new Transitionable(tableYDefault);

        var tableXDefault = 0;
        var xTransitionable = new Transitionable(tableXDefault);

        var tableZDefault = 0;
        var zTransitionable = new Transitionable(tableZDefault);


        var defaultRotationSpeed = 0;
        var xRotationSpeed = new Transitionable(defaultRotationSpeed);


        /****************ANIMATION VARIABLES*******************/
        this.runRandomAnimation = false;
        this.animationTransitionable = new Transitionable(false);
        this.constructed = true;
        this.isColored = false;





        /****************ACCUMULATOR VARIABLES****************/



        var update = 0;
        var x = 0;
        var y = 0;
        var position = [x, y];

        GenericSync.register({
          mouse: MouseSync,
          touch: TouchSync
        });


        //var mouseSync = new MouseSync();
        var accumulator = new Accumulator(position);
        var genericSync = new GenericSync(['mouse', 'touch']);

        Engine.pipe(genericSync);
        genericSync.pipe(accumulator);

        genericSync.on("update", function() {
          update ++;
          var genericPosition = accumulator.get();
          //console.log(mousePosition[0]);
          yTransitionable.set(genericPosition[0] / 150);
          xTransitionable.set(genericPosition[1] / -150);
          //console.log('x & y Rotation: ' + xTransitionable.get() + ', ' + yTransitionable.get())
          var planeRotation = {xRotation: xTransitionable.get(), yRotation: yTransitionable.get()};
          this._eventOutput.emit('planeChanged', planeRotation);

          }.bind(this));

        genericSync.on("end", function(data) {
          xRotationSpeed.set(data.velocity[0]);
        });

        /**********SCROLL SYNC*************/


        var scrollPosition = [0, 0];
        var scrollAccumulator = new Accumulator(scrollPosition);


        var scrollSync = new ScrollSync();
        Engine.pipe(scrollSync);
        scrollSync.pipe(scrollAccumulator);

        scrollSync.on("update", function(data) {
          var scrolled = scrollAccumulator.get();
          //console.log(scrolled[1]);
          zTransitionable.set(scrolled[1]);
          var zDepth = zTransitionable.get();
          this._eventOutput.emit('zChanged', zDepth);
        }.bind(this));

        /**********PINCH SYNC*************/

        var pinchDistance = 0;
        var pinchAccumulator = new Accumulator(pinchDistance);

        var pinchSync = new PinchSync();
        Engine.pipe(pinchSync);
        pinchSync.pipe(pinchAccumulator);

        pinchSync.on("update", function(data) {
          var pinched = pinchAccumulator.get();
          zTransitionable.set(pinched * 2);
          var zDepth = zTransitionable.get();
          this._eventOutput.emit('zChanged', zDepth);

        }.bind(this));



        var quaternion = new Quaternion(1, 0, 0, 0);
        var smallQuaternion = new Quaternion(180, 0, 0, 0);


        var rotationModifier = new Modifier({
          origin: [0.5,0.5]
        });

        rotationModifier.transformFrom(function() {
          return quaternion.getTransform();
        });



        this.translateModifier = new Modifier({
          origin: [0,0],
          align: [0,0],
          transform: function() {
            // return Transform.multiply(Transform.rotateY(yTransitionable.get()), Transform.rotateX(xTransitionable.get()))
            return Transform.multiply(Transform.translate(windowWidth/2,windowHeight/2,zTransitionable.get()), Transform.multiply(Transform.rotateY(yTransitionable.get()), Transform.rotateX(xTransitionable.get())))

          }.bind(this)
        });

        _setPlanePositionListener.call(this);



        var translateNode = mainEngine.add(this.translateModifier);
        translateNode.add(rotationModifier).add(createTable(windowWidth, windowHeight, this, elementSize,elementSize,elementSize, tableWidth, tableHeight, this.options.elementData));

        if (this.runRandomAnimation) {
        Timer.setTimeout(function() {
          startStopDepthAnimation(this.runRandomAnimation);
          this.constructed = false;
        }.bind(this), 500);
      }



        Engine.on('prerender', function() {
          quaternion = quaternion.multiply(smallQuaternion);
        });


        _createViewButton.call(this);


        this.add(mainEngine);




    }

    PeriodicTable.prototype = Object.create(View.prototype);
    PeriodicTable.prototype.constructor = PeriodicTable;


    PeriodicTable.prototype.reconstructTable = function() {

      elementDepthAnimation(false);
      for (var i = 0; i < 120; i ++) {
        resetElementDepth(i);

      }


    };
    PeriodicTable.prototype.constructCube = function() {
      _createCube(this.elementSize);
    }

    PeriodicTable.prototype.scatterTable = function() {
      startStopDepthAnimation(this.runRandomAnimation);

    }
    PeriodicTable.prototype.colorWeight = function() {
      for (var i = 0; i < 120; i ++) {
        colorByWeight(i, this.options.elementData, this.isColored);
      }
      this.isColored = !this.isColored;
    }


    PeriodicTable.prototype.checkPosition = function() {
      //console.log(this.elementSize);
    }





    PeriodicTable.DEFAULT_OPTIONS = {
      elementData: {},
      buttonFontSize: '17px'
    };

    function createTable(windowWidth, windowHeight, content, width, height, depth, tableWidth, tableHeight, elementData) {
      this.table = new RenderNode();


      var context = content;
      var totalWidth = windowWidth;
      var totalHeight = windowHeight;
      var elementNumber = 0;
      this.elementSurfaces = [];
      this.elementBackSurfaces = [];
      this.translateModifiers = [];
      this.planeModifiers = [];
      this.backModifiers = [];
      this.backPlaneModifiers = [];
      this.individualModifiers = [];
      this.individualBackModifiers = [];
      this.modifierChains = [];
      this.backRotationModifiers = [];
      this.breakerModifiers = [];

      this.currentElement;
      this.heldElements = [];

      this.breakerOn = true;

      this.elementDetailViewOn = false;




        function createElement(params){

          var surface = new Surface({
            size: params.size,
            content: params.content,
            classes: params.classes,
            properties: params.properties
          });

          var modifier = new Modifier({
            transform: params.transform
          });

          var individualModifier = new Modifier({});

          var backSurface = new Surface({
            size:params.size,
            classes: params.classes,
            properties: params.properties
          });

          var backModifier = new Modifier({
            transform: params.transformBack
          });

          var backRotationModifier = new Modifier();




          var individualBackModifier = new Modifier({});


          var planeModifier = new Modifier();
          var backPlaneModifier = new Modifier();

          var breakerModifier = new Modifier();
          breakerModifier.setTransform(
            Transform.translate());

          modifierChain = new ModifierChain();

          modifierChain.addModifier(breakerModifier);
          modifierChain.addModifier(modifier);
          modifierChain.addModifier(planeModifier);
          modifierChain.addModifier(individualModifier);

          modifierChain.removeModifier(breakerModifier);



          // var node = this.table.add(modifier);
          // var modifierNode = node.add(planeModifier);
          // var breakerNode = modifierNode.add(individualModifier);
          // breakerNode.add(breakerModifier).add(surface);


          table.add(modifierChain).add(surface);

          var nodeBack = this.table.add(backModifier);
          var modifierBackNode = nodeBack.add(backPlaneModifier);
          var rotationModifierBackNode = modifierBackNode.add(backRotationModifier);
          rotationModifierBackNode.add(individualBackModifier).add(backSurface);

          elementNumber++;


          // surface.on('click', function() {
          //   var name = surface.getContent();
          //
          //   console.log('Current Element: ' + this.currentElement);
          //   if (this.currentElement != undefined && this.currentElement.name != name) {
          //     elementReturn();
          //   }
          //   var elementObject = {elementNumber: params.elementNumber, context: context, name: name, surface: surface, modifier: modifier, individualModifier: individualModifier, backSurface: backSurface, backModifier: backModifier, individualBackModifier: individualBackModifier, planeModifier: planeModifier, params: params.transform, backParams: params.transformBack, modifierChain: modifierChain};
          //   elementClicked(elementObject);
          //   context.checkPosition();
          //   this.currentElement = elementObject;
          // }.bind(this));



          // var x = 0;
          // var y = 0;
          // var position = [x, y];
          //
          // var elementTransitionable = new Transitionable({xPosition: 0, yPosition: 0});
          //
          // var accumulator = new Accumulator(position);
          // var elementSync = new GenericSync(['mouse', 'touch']);
          //
          // surface.pipe(elementSync);
          // elementSync.pipe(accumulator);
          //
          // surface.on('click', function() {
          //   console.log('surface clicked');
          // }.bind(this));
          //
          // surface.on('update', function() {
          //   console.log('surface updated');
          //   var genericPosition = accumulator.get();
          //   elementTransitionable.set([genericPosition[0]/150, genericPosition[1]/150]);
          //   console.log('element listener ' + elementTransitionable);
          //
          //   }.bind(this));
          //
          //   surface.on('end', function() {
          //     console.log('surface end');
          //   }.bind(this));

          // elementSync.on("end", function(data) {
          //   xRotationSpeed.set(data.velocity[0]);
          // });



          this.elementSurfaces.push({surface: surface, properties: params.properties});
          this.elementBackSurfaces.push({surface: backSurface, properties: params.properties});
          this.translateModifiers.push(
            {modifier: modifier, translate: params.transform});
          this.planeModifiers.push(planeModifier);
          this.backModifiers.push({modifier: backModifier, translate: params.transformBack});
          this.backPlaneModifiers.push(backPlaneModifier);
          this.individualModifiers.push(individualModifier);
          this.individualBackModifiers.push(individualBackModifier);
          this.modifierChains.push(modifierChain);
          this.backRotationModifiers.push(backRotationModifier);
          this.breakerModifiers.push(breakerModifier);

          var elementObject = {tableWidth: tableWidth, tableHeight: tableHeight, elementNumber: params.elementNumber, mainParams: params, context: context, name: name, surface: surface, modifier: modifier, individualModifier: individualModifier, backSurface: backSurface, backModifier: backModifier, individualBackModifier: individualBackModifier, planeModifier: planeModifier, params: params.transform, backParams: params.transformBack, modifierChain: modifierChain};
          setElementSurfaceListeners(elementObject)


        };



      var numberRows = 10;
      var numberColumbs = 18;
      var columnNumber = -1;
      var rowNumber = -1;
      var distance = width + 2;
      var notElements = [7,8,9,
                        10,17,18,19,
                        20,21,22,27,28,29,
                        30,31,32,37,
                        40,41,42,47,
                        50,51,52,57,
                        60,61,62,67,
                        70,71,72,77,
                        80,81,82,87,
                        90,91,92,97,
                        100,101,102,107,
                        110,111,112,117,
                        120,127,
                        130,137,
                        140,147,
                        150,157,
                        160,167,
                        177];
      var none = 'rgba(255, 255, 255, 0.54)';
      var hydrogen = 'rgba(102, 102, 102, 0.54)';
      var alkaliMetals = 'rgba(245, 176, 120, 0.54)';
      var alkaliEarthMetals = 'rgba(241, 245, 120, 0.54)';
      var transitionMetals = 'rgba(242, 118, 118, 0.54)';
      var poorMetals = 'rgba(120, 245, 220, 0.54)';
      var otherNonMetals = 'rgba(132, 245, 120, 0.54)';
      var nobleGases = 'rgba(120, 159, 245, 0.54)';
      var lanthanoids = 'rgba(245, 120, 220, 0.54)';
      var actinoids = 'rgba(195, 120, 245, 0.54)';

      var elementColors = {
      'none': 'rgba(255, 255, 255, 0.54)',
      'hydrogen': 'rgba(102, 102, 102, 0.54)',
      'alkaliMetal': 'rgba(245, 176, 120, 0.54)',
      'alkaliEarthMetal': 'rgba(241, 245, 120, 0.54)',
      'transitionMetal': 'rgba(242, 118, 118, 0.54)',
      'poorMetals': 'rgba(120, 245, 220, 0.54)',
      'otherNonMetals': 'rgba(132, 245, 120, 0.54)',
      'nobleGases': 'rgba(120, 159, 245, 0.54)',
      'lanthanoids': 'rgba(245, 120, 220, 0.54)',
      'actinoids': 'rgba(195, 120, 245, 0.54)'
    };

      var elementDataset = elementData;
      var elementNumber = 0;

      for (var i = 0; i < 180; i++) {

        columnNumber++;

        if (i % 10 == 0) {
          columnNumber = -1;
          columnNumber++;
          rowNumber++;
        }

        if (notElements.indexOf(i) > -1) {
          //DONT ADD SURFACE
        } else {
          //ADD ELEMENT
          elementNumber = elementNumber ++;
          var elementColor = elementDataset[elementNumber].type;
          //console.log(elementColor);
          //console.log(elementColors[elementColor]);

          createElement({
            size: [width, height],
            content: elementDataset[elementNumber].abreviation,
            properties: {
              lineHeight: height + 'px',
              textAlign: 'center',
              backgroundColor: elementColors[elementDataset[elementNumber].type],
              fontSize: '20px',
              overflow: 'hidden',
              color: 'white'
            },
            transform: Transform.translate((- tableWidth / 2) + (distance * rowNumber), (- tableHeight / 2) + (distance * columnNumber), 0),
            transformBack: Transform.multiply(Transform.translate((- tableWidth / 2) + (distance * rowNumber), (- tableHeight / 2) + (distance * columnNumber), 0), Transform.multiply(Transform.rotateZ(Math.PI), Transform.rotateX(Math.PI))),
            elementNumber: elementNumber
          });
        }

      }
      return this.table;
    }

    function startStopDepthAnimation(run) {

      for (var i = 0; i < 400; i++) {
        elementDepthAnimation(true);
      }
    }

    function elementDepthAnimation(run) {

      var run = run;

      var elementRandom = Math.floor((Math.random()) * 118);
      var zDepth = Math.floor((Math.random() * -700) + 500);
      var xRandom = Math.floor((Math.random() * -400) + 300);
      var depthDuration = Math.floor((Math.random() * 1500) + 1000);

      if (run) {

      this.planeModifiers[elementRandom].setTransform(
        Transform.translate(0,0,zDepth),
        {
        duration: depthDuration,
        curve: 'easeOut'
      });

      this.planeModifiers[elementRandom].setTransform(
        Transform.translate(xRandom,0,zDepth),
        {
        duration: 1500,
        curve: 'easeOut'
      });

      this.backPlaneModifiers[elementRandom].setTransform(
        Transform.translate(0,0,-zDepth),
        {
        duration: depthDuration,
        curve: 'easeOut'
      });

      this.backPlaneModifiers[elementRandom].setTransform(
        Transform.translate(xRandom,0,-zDepth),
        {
        duration: 1500,
        curve: 'easeOut'
      });
    }

    }

    function resetElementDepth(elementNumber) {
      var elementRandom = elementNumber;

      this.planeModifiers[elementRandom].setTransform(
        Transform.translate(0,0,0),
        {
        duration: 1500,
        curve: 'easeOut'
      });

      this.planeModifiers[elementRandom].setTransform(
        Transform.translate(0,0,0),
        {
        duration: 1500,
        curve: 'easeOut'
      });

      this.backPlaneModifiers[elementRandom].setTransform(
        Transform.translate(0,0,0),
        {
        duration: 1500,
        curve: 'easeOut'
      });

      this.backPlaneModifiers[elementRandom].setTransform(
        Transform.translate(0,0,0),
        {
        duration: 1500,
        curve: 'easeOut'
      });

      this.translateModifiers[elementRandom].modifier.setTransform(this.translateModifiers[elementRandom].translate,
        {
        duration: 1500,
        curve: 'easeOut'
      });

      this.backModifiers[elementRandom].modifier.setTransform(this.backModifiers[elementRandom].translate,
        {
        duration: 1500,
        curve: 'easeOut'
      });

      var opaqueTransitionable = new Transitionable(1);

      this.translateModifiers[elementRandom].modifier.opacityFrom(function() {
        return opaqueTransitionable.get();
      });

      this.backModifiers[elementRandom].modifier.opacityFrom(function() {
        return opaqueTransitionable.get();
      });

      opaqueTransitionable.set(1, {
        method: 'tween',
        curve: 'easeOut',
        duration: 1000
      });

      this.backRotationModifiers[elementRandom].setTransform(Transform.multiply(Transform.rotateX(0), Transform.rotateY(0)), {
        duration: 1500,
        curve: 'easeOut'
      });


      this.individualModifiers[elementRandom].setTransform(
        Transform.translate(0, 0, 0), {
        duration: 1500,
        curve:'easeOut'
      });

      this.individualBackModifiers[elementRandom].setTransform(
        Transform.translate(0, 0, 0), {
        duration: 1500,
        curve:'easeOut'
      });




      this.constructed = true;

    }

    function _createViewButton() {

      this.reconstructButton = new Surface({
        size: [true, true],
        content: 'RECONSTRUCT',
        properties: {
          fontSize: this.options.buttonFontSize,
          padding: '10px',
          fontFamily: 'HelveticaNeue-Light',
          fontWeight: '100'
        }
      });

      this.reconstructButton.addClass('button');

      this.add(this.reconstructButton);

      this.reconstructButton.on('click', function() {
        this.reconstructTable();
      }.bind(this));

      this.createCubeButton = new Surface({
        size: [true, true],
        content: 'CREATE CUBE',
        properties: {
          fontSize: this.options.buttonFontSize,
          padding: '10px',
          marginTop: '50px',
          fontFamily: 'HelveticaNeue-Light',
          fontWeight: '100'
        }
      });

      this.createCubeButton.addClass('button');


      this.add(this.createCubeButton);

      this.createCubeButton.on('click', function() {
        this.constructCube();
      }.bind(this));

      this.randomDepthAnimationButton = new Surface({
        size: [true, true],
        content: 'SCATTER',
        properties: {
          fontSize: this.options.buttonFontSize,
          padding: '10px',
          marginTop: '100px',
          fontFamily: 'HelveticaNeue-Light',
          fontWeight: '100'
        }
      });

      this.randomDepthAnimationButton.addClass('button');


      this.add(this.randomDepthAnimationButton);

      this.randomDepthAnimationButton.on('click', function() {
        this.scatterTable();
      }.bind(this));

      this.colorByWeightButton = new Surface({
        size: [true, true],
        content: 'COLOR WEIGHT',
        properties: {
          fontSize: this.options.buttonFontSize,
          padding: '10px',
          marginTop: '150px',
          fontFamily: 'HelveticaNeue-Light',
          fontWeight: '100'
        }
      });

      this.colorByWeightButton.addClass('button');

      this.add(this.colorByWeightButton);

      this.colorByWeightButton.on('click', function() {
        this.colorWeight();
      }.bind(this));

    }

    function colorByWeight(elementNumber, elementData, isColored) {
      var colored = isColored;
      var elementDataset = elementData;
      var atomicWeight = elementDataset[elementNumber].atomicWeight;

      var calculatedR = Math.round(atomicWeight);
      if (calculatedR > 255) {
        calculatedR = 255;
      }

      var calculatedB = Math.round(atomicWeight);
      if (calculatedB > 255) {
        calculatedB = 255;
      }


      //console.log(this.elementBackSurfaces[elementNumber].surface.getProperties());

      //math math Math
      var weightPercent = atomicWeight / 2.94;
      var rgbaPercent = weightPercent * 1.82;
      var calculatedColor = Math.round((rgbaPercent - 182) * -1);
      console.log(atomicWeight + '   ' + calculatedColor);

      var weightedColor = 'rgba(' + 240 + ', ' + calculatedColor + ', ' + calculatedColor + ', 0.54)';

      if (!colored) {
      this.elementSurfaces[elementNumber].surface.setProperties({backgroundColor: weightedColor});
      this.elementBackSurfaces[elementNumber].surface.setProperties({backgroundColor: weightedColor});
      } else {
      var resetColor = this.elementSurfaces[elementNumber].properties['backgroundColor']
      //console.log('reset color: ' + resetColor);
      this.elementSurfaces[elementNumber].surface.setProperties({backgroundColor: resetColor});
      this.elementBackSurfaces[elementNumber].surface.setProperties({backgroundColor: resetColor});
      }
    }


//////////////////////////////////////INDIVIDUAL ELEMENT INTERACTION///////////////////////////////////////////



    function _setPlanePositionListener() {
      var planeDefaults = [0,0];
      this.planeRotation = new Transitionable(planeDefaults);
      var zDefault = 0;
      this.zDepth = new Transitionable(zDefault);

      this.on('planeChanged', function(rotation) {
        this.planeRotation.set([rotation.xRotation, rotation.yRotation]);
        //console.log(this.planeRotation.get());
      });

      this.on('zChanged', function(zDepth) {
        this.zDepth.set(zDepth);
      });
    }




    function setElementSurfaceListeners(elementObject) {
      //var elementObject = {elementNumber: params.elementNumber, context: context, name: name, surface: surface, modifier: modifier, individualModifier: individualModifier,
      //  backSurface: backSurface, backModifier: backModifier, individualBackModifier: individualBackModifier, planeModifier: planeModifier, params: params.transform,
      //  backParams: params.transformBack, modifierChain: modifierChain};
      //this.elementSurfaces.push({surface: surface, properties: params.properties});
      var context = elementObject.context;
      var i = elementObject.elementNumber;
      var params = elementObject.mainParams;
      var tableDepth = context.zDepth.get();
      var originalX = params.transform[12];
      var originalY = params.transform[13];


      //var currentPlaneDepth = elementObject.context.zDepth.get();



      // console.log(this.elementSurfaces[i].surface);
      // console.log(this.individualModifiers[i]);

      var start = [0,0];
      var elementTouchTransitionable = new Transitionable(start);

      var iniMod = this.individualModifiers[i];
      var iniBackMod = this.individualBackModifiers[i];
      var modifierChain = this.modifierChains[i];
      var breakerModifier = this.breakerModifiers[i];

      // this.individualModifiers[i].transformFrom(rotateY);
      // this.individualBackModifiers[i].transformFrom(rotateY);

      function rotateY() {
        var xyValues = elementTouchTransitionable.get();
        var xValue = xyValues[0] / 10;
        return Transform.rotateY(xValue);
      }


      GenericSync.register({
        mouse : MouseSync,
        touch : TouchSync
      });

      var accumulator = new Accumulator(start);
      var genericSync = new GenericSync(['mouse', 'touch']);

      this.elementSurfaces[i].surface.pipe(genericSync);
      genericSync.pipe(accumulator);

      // elementObject.surface.on('click', function() {
      //   var name = elementObject.name;
      //
      //   console.log('Current Element: ' + this.currentElement);
      //   if (this.currentElement != undefined && this.currentElement.name != name) {
      //     //elementReturn();
      //   }
      //   //elementClicked(elementObject);
      //   this.currentElement = elementObject;
      // }.bind(this));


      genericSync.on("update", function(data) {
        var genericPosition = accumulator.get();
        var xValue = genericPosition[0];
        elementTouchTransitionable.set([genericPosition[0],genericPosition[1]]);
        //console.log('surface update called: ' + elementTouchTransitionable.get());
        //console.log(data.velocity);
        var Vx = data.velocity[0];
        var Vy = data.velocity[1];
        if (Vx > 0.01 && Vx < 1) {
          //iniMod.transformFrom(rotateY);
          //iniBackMod.transformFrom(rotateY);

        }
        if (Vx > 1 || Vx < -1 || Vy > 1 || Vy < -1) {
          //relocateElement(elementObject, i, Vx, Vy);

        }


      });




      genericSync.on('end', function(data) {
        var velocity = data.velocity;
        var xVelocity = velocity[0];
        var yVelocity = velocity[1];


      if (xVelocity > 1 || yVelocity > 1 || xVelocity < -1 || yVelocity < -1) {
            //elementReturn(elementObject, i, xVelocity, yVelocity);
            //modifierChain.removeModifier(breakerModifier);
            unfreezeElement(i);

            relocateElement(elementObject, i, xVelocity, yVelocity);


      } else if (xVelocity > 0.02 && xVelocity < 1) {
        //flipElement(elementObject, i, xVelocity,yVelocity);
        // iniMod.transformFrom(rotateY);
        // iniBackMod.transformFrom(rotateY);
      } else {
        //modifierChain.removeModifier(breakerModifier);
        unfreezeElement(i);
        elementClicked(elementObject);
      }

//         var dupSurface = new Surface({
//           size: params.size,
//           content: params.content,
//           classes: params.classes,
//           properties: params.properties
//         });
//         console.log(context.zDepth.get());
// //transform: Transform.translate((- tableWidth / 2) + (distance * rowNumber), (- tableHeight / 2) + (distance * columnNumber), 0),
//         var depth = context.zDepth.get();
//         console.log(originalX + ', ' + originalY + ', ' + depth);
//
//         var dupModifier = new Modifier({
//           origin: [0.5,0.5],
//           align: [0.5,0.5],
//           transform: Transform.translate(originalX, originalY, depth)
//         });
//
//
//         context.add(dupModifier).add(dupSurface);



        console.log('VELOCITY: ' + velocity);
      });

    }

    function flipElement(elementObject, elementNumber, xVelocity, yVelocity) {

      //console.log(this.individualModifiers[elementNumber].getTransform());


      this.individualModifiers[elementNumber].setTransform(
        Transform.rotateY(Math.PI), {
        duration: 1500,
        curve:'easeOut'
      });

      this.individualBackModifiers[elementNumber].setTransform(
        Transform.translate(Math.PI), {
        duration: 1500,
        curve:'easeOut'
      });

    }

    function freezeElement(elementNumber) {
      //this.modifierChains[elementNumber].addModifier(this.breakerModifiers[elementNumber]);
    }

    function unfreezeElement(elementNumber) {
      //this.modifierChains[elementNumber].removeModifier(this.breakerModifiers[elementNumber]);
    }


    function relocateElement(elementObject, elementNumber, xVelocity, yVelocity) {
      //console.log('relocate element');


      //console.log(this.heldElements.length);
      //console.log(elementObject.tableWidth);
      //console.log(this.elementDetailViewOn);



      var currentPlaneRotation = elementObject.context.planeRotation.get();

      currentX = this.translateModifiers[elementNumber].translate[12];
      currentY = this.translateModifiers[elementNumber].translate[13];

      var flingSensitivity = 100;

      var relocatedX = currentX + (xVelocity * flingSensitivity);
      var relocatedY = currentY + (yVelocity * flingSensitivity);

      var transform = Transform.multiply(Transform.translate(relocatedX, relocatedY, 0), Transform.multiply(Transform.rotateX(-currentPlaneRotation[0]), Transform.rotateY(-currentPlaneRotation[1])));
      //console.log('currentXY: ' + currentX + ', ' + currentY);
      //console.log('relocated values: ' + relocatedX + ', ' + relocatedY);

      var elementToHold = {element: elementObject, relocatedX: relocatedX, relocatedY: relocatedY};
      this.heldElements.push(elementToHold);

      this.individualModifiers[elementNumber].halt();
      this.translateModifiers[elementNumber].modifier.halt();
      this.planeModifiers[elementNumber].halt();


      if (yVelocity < -1 && this.elementDetailViewOn) {
        transform = this.translateModifiers[elementNumber].translate;
        this.elementDetailViewOn = false;
        //console.log('post set boolean' + this.elementDetailViewOn);
      }


      // this.translateModifiers[elementNumber].modifier.setTransform(
      //   transform, {
      //   duration: 1500,
      //   curve: 'easeOut'
      // });
      //
      // this.individualModifiers[elementNumber].setTransform(
      //   Transform.translate(0, 0, 0), {
      //   duration: 1500,
      //   curve:'easeOut'
      // });



      //
      // Timer.setTimeout(function() {
      //   this.breakerModifiers[elementNumber].setTransform(
      //     Transform.translate());
      //
      //   this.breakerModifiers[elementNumber].setTransform(
      //     Transform.translate());
      //
      // }.bind(this), 1500);






      this.planeModifiers[elementNumber].setTransform(
        Transform.translate(0,0,0),
        {
        duration: 1500,
        curve: 'easeOut'
      });
      this.planeModifiers[elementNumber].setTransform(
        Transform.translate(0,0,0),
        {
        duration: 1500,
        curve: 'easeOut'
      });
      this.backPlaneModifiers[elementNumber].setTransform(
        Transform.translate(0,0,0),
        {
        duration: 1500,
        curve: 'easeOut'
      });
      this.backPlaneModifiers[elementNumber].setTransform(
        Transform.translate(0,0,0),
        {
        duration: 1500,
        curve: 'easeOut'
      });

      var translate = this.translateModifiers[elementNumber].translate;
      var originalX = translate[12];
      var originalY = translate[13];

      this.translateModifiers[elementNumber].modifier.setTransform(
        Transform.multiply(Transform.translate(elementObject.tableWidth - 50, relocatedY, 0), Transform.multiply(Transform.rotateX(-currentPlaneRotation[0]), Transform.rotateY(-currentPlaneRotation[1]))), {
        duration: 1500,
        curve: 'easeOut'
      });
      this.backModifiers[elementNumber].modifier.setTransform(
        Transform.multiply(Transform.translate(0,0,0), Transform.multiply(Transform.rotateZ(Math.PI), Transform.rotateX(Math.PI))), {
        duration: 1500,
        curve: 'easeOut'
      });
      this.backRotationModifiers[elementNumber].setTransform(Transform.multiply(Transform.rotateX(currentPlaneRotation[0]), Transform.rotateY(-currentPlaneRotation[1])), {
        duration: 1500,
        curve: 'easeOut'
      });

      this.individualModifiers[elementNumber].setTransform(
        Transform.translate(0, 0, 0), {
        duration: 1500,
        curve:'easeOut'
      });

      this.individualBackModifiers[elementNumber].setTransform(
        Transform.translate(0, 0, 0), {
        duration: 1500,
        curve:'easeOut'
      });


      Timer.setTimeout(function() {
        freezeElement(elementNumber);
      }.bind(this), 1500);

    }

    function elementClicked(elementClicked) {
      //
      //
      var element = elementClicked;
      var elementNumber = element.elementNumber;
      var currentPlaneRotation = element.context.planeRotation.get();

      var zDepth = element.context.zDepth.get();
      //console.log(zDepth);


      //TODO

      var translateValues = this.planeModifiers[elementNumber].getFinalTransform();
      var currentZ = translateValues[14];

      console.log(this.elementDetailViewOn);


      this.planeModifiers[elementNumber].halt();
      this.backPlaneModifiers[elementNumber].halt();

      this.planeModifiers[elementNumber].setTransform(
        Transform.translate(0,0,0),
        {
        duration: 1500,
        curve: 'easeOut'
      });



      this.planeModifiers[elementNumber].setTransform(
        Transform.translate(0,0,0),
        {
        duration: 1500,
        curve: 'easeOut'
      });
      this.planeModifiers[elementNumber].setTransform(
        Transform.translate(0,0,0),
        {
        duration: 1500,
        curve: 'easeOut'
      });
      this.backPlaneModifiers[elementNumber].setTransform(
        Transform.translate(0,0,0),
        {
        duration: 1500,
        curve: 'easeOut'
      });
      this.backPlaneModifiers[elementNumber].setTransform(
        Transform.translate(0,0,0),
        {
        duration: 1500,
        curve: 'easeOut'
      });

      console.log(this.translateModifiers[elementNumber].translate);
      var translate = this.translateModifiers[elementNumber].translate;
      var originalX = translate[12];
      var originalY = translate[13];

      this.translateModifiers[elementNumber].modifier.setTransform(
        Transform.multiply(Transform.translate(0, 0, 0), Transform.multiply(Transform.rotateX(-currentPlaneRotation[0]), Transform.rotateY(-currentPlaneRotation[1]))), {
        duration: 1500,
        curve: 'easeOut'
      });
      this.backModifiers[elementNumber].modifier.setTransform(
        Transform.multiply(Transform.translate(0,0,0), Transform.multiply(Transform.rotateZ(Math.PI), Transform.rotateX(Math.PI))), {
        duration: 1500,
        curve: 'easeOut'
      });
      this.backRotationModifiers[elementNumber].setTransform(Transform.multiply(Transform.rotateX(currentPlaneRotation[0]), Transform.rotateY(-currentPlaneRotation[1])), {
        duration: 1500,
        curve: 'easeOut'
      });


      this.individualModifiers[elementNumber].setTransform(
        Transform.translate(0, 0, 900 - zDepth), {
        duration: 1500,
        curve:'easeOut'
      });

      this.individualBackModifiers[elementNumber].setTransform(
        Transform.translate(0, 0, -900 - zDepth), {
        duration: 1500,
        curve:'easeOut'
      });

      Timer.setTimeout(function() {
        freezeElement(elementNumber);

      }.bind(this), 1500);


      this.elementDetailViewOn = true;
      console.log('post set boolean' + this.elementDetailViewOn);

      console.log('RotatedX: ' + -currentPlaneRotation[0] + ",  " + 'RotatedY: ' + -currentPlaneRotation[1]);

    }




    function elementReturn(elementObject, elementNumber, xVelocity, yVelocity) {

      console.log('elementReturnCalled');

      var currentElementNumber = this.currentElement.elementNumber;
      console.log(currentElementNumber);

      this.translateModifiers[elementNumber].modifier.setTransform(
        this.translateModifiers[elementNumber].translate, {
        duration: 1500,
        curve: 'easeOut'
      });
      this.backModifiers[elementNumber].modifier.setTransform(
        this.backModifiers[elementNumber].translate, {
        duration: 1500,
        curve: 'easeOut'
      });
      this.backRotationModifiers[elementNumber].setTransform(Transform.multiply(Transform.rotateX(0), Transform.rotateY(0)), {
        duration: 1500,
        curve: 'easeOut'
      });


      this.individualModifiers[elementNumber].setTransform(
        Transform.translate(0, 0, 0), {
        duration: 1500,
        curve:'easeOut'
      });

      this.individualBackModifiers[elementNumber].setTransform(
        Transform.translate(0, 0, 0), {
        duration: 1500,
        curve:'easeOut'
      });



      // this.currentElement.modifier.setTransform(
      //   this.currentElement.params,
      //   {
      //   duration: 1500,
      //   curve: 'easeOut'
      // });
      //
      // this.currentElement.backModifier.setTransform(this.currentElement.backParams, {
      //   duration: 1500,
      //   curve: 'easeOut'
      // });

    }


//////////////////////////////////////CUBE CREATION///////////////////////////////////////////
    function _createCube(elementDimentions) {

      var cubeSize = 206;
      var cubeDimensions = 4;
      var elementSelectionLocation = 0;
      var elementsPerSide = 16;
      var elementSize = elementDimentions;
      var columnNumber = -1;
      var rowNumber = -1;
      var distance = elementSize + 2;
      var allElements = [];
      var opacityTransitionable = new Transitionable(1);
      for (var i = 0; i < 120; i++){
        allElements.push(i);
      }
      allElements.sort(function() {
        return Math.random() - 0.5;
      });



      //SET ELEMENTS OPACITY
      var opaqueTransitionable = new Transitionable(0);
      var usedElements = [];
      for (var i = elementSelectionLocation; i < 96; i++) {
        usedElements.push(allElements[i]);
      }

      for (var i = 0; i < usedElements.length; i++) {
        var usedElementNumber = usedElements[i];

        this.translateModifiers[i].modifier.opacityFrom(function() {
          return opaqueTransitionable.get();
        });

        this.backModifiers[i].modifier.opacityFrom(function() {
          return opaqueTransitionable.get();
        });

        opaqueTransitionable.set(1, {
          method: 'tween',
          curve: 'easeOut',
          duration: 1000
        });
      }


      //FRONT
      var frontElements = []
      for (elementSelectionLocation; elementSelectionLocation < 1 * elementsPerSide; elementSelectionLocation++){
        frontElements.push(allElements[elementSelectionLocation]);
      }


      //console.log(frontElements);



      for (var i = 0; i < frontElements.length; i++){
        var elementNumber = frontElements[i];

        columnNumber++;

        if (i % cubeDimensions == 0) {
          columnNumber = -1;
          columnNumber++;
          rowNumber++;
        }



        this.translateModifiers[elementNumber].modifier.setTransform(
          Transform.translate(((-cubeSize / 2) + (elementSize / 2) + (distance * columnNumber)),((-cubeSize / 2) + (elementSize / 2) + (distance * rowNumber)),cubeSize/2),
          {
          duration: 1500,
          curve: 'easeOut'
        });

        this.backModifiers[elementNumber].modifier.setTransform(
          Transform.multiply(Transform.translate(((-cubeSize / 2) + (elementSize / 2) + (distance * columnNumber)),((-cubeSize / 2) + (elementSize / 2) + (distance * rowNumber)),cubeSize/2), Transform.multiply(Transform.rotateZ(Math.PI), Transform.rotateX(Math.PI))),
          {
            duration: 1500,
            curve: 'easeOut'
          });


      }

      //BACK
      var backColumnNumber = -1;
      var backRowNumber = -1;

      var backElements = []
      for (elementSelectionLocation; elementSelectionLocation < 2 * elementsPerSide; elementSelectionLocation++){
        backElements.push(allElements[elementSelectionLocation]);
      }


      //console.log(backElements.length);


      for (var i = 0; i < backElements.length; i++){
        var backElementNumber = backElements[i];

        backColumnNumber++;

        if (i % cubeDimensions == 0) {
          backColumnNumber = -1;
          backColumnNumber++;
          backRowNumber++;
        }



        this.translateModifiers[backElementNumber].modifier.setTransform(
          Transform.multiply(Transform.translate(((-cubeSize / 2) + (elementSize / 2) + (distance * backColumnNumber)),((-cubeSize / 2) + (elementSize / 2) + (distance * backRowNumber)),-cubeSize/2), Transform.multiply(Transform.rotateZ(Math.PI), Transform.rotateX(Math.PI))),
          {
          duration: 1500,
          curve: 'easeOut'
        });

        this.backModifiers[backElementNumber].modifier.setTransform(
          Transform.multiply(Transform.translate(((-cubeSize / 2) + (elementSize / 2) + (distance * backColumnNumber)),((-cubeSize / 2) + (elementSize / 2) + (distance * backRowNumber)),-cubeSize/2), Transform.multiply(Transform.rotateZ(0), Transform.rotateX(0))),
          {
          duration: 1500,
          curve: 'easeOut'
        });

      }

      //LEFT
      var leftColumnNumber = -1;
      var leftRowNumber = -1;

      var leftElements = []
      for (elementSelectionLocation; elementSelectionLocation < 3 * elementsPerSide; elementSelectionLocation++){
        leftElements.push(allElements[elementSelectionLocation]);
      }
      //console.log(leftElements.length);


      for (var i = 0; i < leftElements.length; i++){
        var leftElementNumber = leftElements[i];

        leftColumnNumber++;

        if (i % cubeDimensions == 0) {
          leftColumnNumber = -1;
          leftColumnNumber++;
          leftRowNumber++;
        }

        var xLocation = ((-cubeSize / 2) + (elementSize / 2) + (distance * leftColumnNumber));
        var yLocation = ((-cubeSize / 2) + (elementSize / 2) + (distance * leftRowNumber));

        this.translateModifiers[leftElementNumber].modifier.setTransform(
          Transform.multiply(Transform.translate(cubeSize/2,yLocation,xLocation), Transform.rotateY(Math.PI/2)),
          {
          duration: 1500,
          curve: 'easeOut'
        });

        this.backModifiers[leftElementNumber].modifier.setTransform(
          Transform.multiply(Transform.translate(cubeSize/2,yLocation,xLocation), Transform.rotateY(-Math.PI/2)),
          {
          duration: 1500,
          curve: 'easeOut'
        });

      }

      //RIGHT
      var rightColumnNumber = -1;
      var rightRowNumber = -1;

      var rightElements = []
      for (elementSelectionLocation; elementSelectionLocation < 4 * elementsPerSide; elementSelectionLocation++){
        rightElements.push(allElements[elementSelectionLocation]);
      }
      //console.log(rightElements.length);


      for (var i = 0; i < rightElements.length; i++){
        var rightElementNumber = rightElements[i];

        rightColumnNumber++;

        if (i % cubeDimensions == 0) {
          rightColumnNumber = -1;
          rightColumnNumber++;
          rightRowNumber++;
        }

        var xLocation = ((-cubeSize / 2) + (elementSize / 2) + (distance * rightColumnNumber));
        var yLocation = ((-cubeSize / 2) + (elementSize / 2) + (distance * rightRowNumber));

        this.translateModifiers[rightElementNumber].modifier.setTransform(
          Transform.multiply(Transform.translate(-cubeSize/2,yLocation,xLocation), Transform.rotateY(-Math.PI/2)),
          {
          duration: 1500,
          curve: 'easeOut'
        });

        this.backModifiers[rightElementNumber].modifier.setTransform(
          Transform.multiply(Transform.translate(-cubeSize/2,yLocation,xLocation), Transform.rotateY(Math.PI/2)),
          {
          duration: 1500,
          curve: 'easeOut'
        });

      }


      //TOP
      var topColumnNumber = -1;
      var topRowNumber = -1;

      var topElements = []
      for (elementSelectionLocation; elementSelectionLocation < 5 * elementsPerSide; elementSelectionLocation++){
        topElements.push(allElements[elementSelectionLocation]);
      }


      for (var i = 0; i < topElements.length; i++){
        var topElementNumber = topElements[i];

        topColumnNumber++;

        if (i % cubeDimensions == 0) {
          topColumnNumber = -1;
          topColumnNumber++;
          topRowNumber++;
        }

        var xLocation = ((-cubeSize / 2) + (elementSize / 2) + (distance * topColumnNumber));
        var yLocation = ((-cubeSize / 2) + (elementSize / 2) + (distance * topRowNumber));

        this.translateModifiers[topElementNumber].modifier.setTransform(
          Transform.multiply(Transform.translate(xLocation, -cubeSize/2, yLocation), Transform.rotateX(Math.PI/2)),
          {
          duration: 1500,
          curve: 'easeOut'
        });

        this.backModifiers[topElementNumber].modifier.setTransform(
          Transform.multiply(Transform.translate(xLocation, -cubeSize/2, yLocation), Transform.rotateX(-Math.PI/2)),
          {
          duration: 1500,
          curve: 'easeOut'
        });

      }


      //BOTTOM
      var bottomColumnNumber = -1;
      var bottomRowNumber = -1;

      var bottomElements = []
      for (elementSelectionLocation; elementSelectionLocation < 6 * elementsPerSide; elementSelectionLocation++){
        bottomElements.push(allElements[elementSelectionLocation]);
      }


      for (var i = 0; i < bottomElements.length; i++){
        var bottomElementNumber = bottomElements[i];

        bottomColumnNumber++;

        if (i % cubeDimensions == 0) {
          bottomColumnNumber = -1;
          bottomColumnNumber++;
          bottomRowNumber++;
        }

        var xLocation = ((-cubeSize / 2) + (elementSize / 2) + (distance * bottomColumnNumber));
        var yLocation = ((-cubeSize / 2) + (elementSize / 2) + (distance * bottomRowNumber));

        this.translateModifiers[bottomElementNumber].modifier.setTransform(
          Transform.multiply(Transform.translate(xLocation, cubeSize/2, yLocation), Transform.rotateX(-Math.PI/2)),
          {
          duration: 1500,
          curve: 'easeOut'
        });

        this.backModifiers[bottomElementNumber].modifier.setTransform(
          Transform.multiply(Transform.translate(xLocation, cubeSize/2, yLocation), Transform.rotateX(Math.PI/2)),
          {
          duration: 1500,
          curve: 'easeOut'
        });

      }


      //REMOVE EXTRA ELEMENTS AND ADD TRANSPARENCY
      var extraElements = [];
      for (var i = elementSelectionLocation; i < 120; i++) {
        extraElements.push(allElements[i]);
      }

      for (var i = 0; i < extraElements.length; i++) {
        var extraElementNumber = extraElements[i];

        var xRandom = Math.floor((Math.random() * 2000) - 1600);
        var yRandom = Math.floor((Math.random() * 2000) - 1600);


        this.translateModifiers[extraElementNumber].modifier.setTransform(
          Transform.translate(xRandom,yRandom,0), {
          duration: 2000,
          curve: 'easeOut'
        });

        this.backModifiers[extraElementNumber].modifier.setTransform(
          Transform.translate(xRandom,yRandom,0), {
          duration: 2000,
          curve: 'easeOut'
        });

        this.translateModifiers[extraElementNumber].modifier.opacityFrom(function() {
          return opacityTransitionable.get();
        });

        this.backModifiers[extraElementNumber].modifier.opacityFrom(function() {
          return opacityTransitionable.get();
        });

        opacityTransitionable.set(0, {
          method: 'tween',
          curve: 'easeOut',
          duration: 2000
        });

      }

    }





    module.exports = PeriodicTable;
});
