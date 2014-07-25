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
    var MouseSync       = require('famous/inputs/MouseSync');
    var Accumulator     = require('famous/inputs/Accumulator');


    function PeriodicTable() {
        View.apply(this, arguments);

        var mainEngine = Engine.createContext();
        mainEngine.setPerspective(1000);

        /****************TABLE VARIABLES*******************/
        var elementSize = 50;
        this.elementSize = 50;
        var tableWidth = elementSize * 18.72;
        var tableHeight = elementSize * 10.4;

        Transitionable.registerMethod('tween', TweenTransition);
        var tableYDefault = 0;
        var yTransitionable = new Transitionable(tableYDefault);

        var tableXDefault = 0;
        var xTransitionable = new Transitionable(tableXDefault);

        var defaultRotationSpeed = 0;
        var xRotationSpeed = new Transitionable(defaultRotationSpeed);


        /****************ANIMATION VARIABLES*******************/
        this.runRandomAnimation = false;
        this.animationTransitionable = new Transitionable(false);
        this.constructed = true;
        this.currentElement = '';


        /****************ACCUMULATOR VARIABLES****************/

        var update = 0;
        var x = 0;
        var y = 0;
        var position = [x, y];

        var mouseSync = new MouseSync();
        var accumulator = new Accumulator(position);

        Engine.pipe(mouseSync);
        mouseSync.pipe(accumulator);

        mouseSync.on("update", function() {
          update ++;
          var mousePosition = accumulator.get();
          //console.log(mousePosition[0]);
          yTransitionable.set(mousePosition[0] / 150);
          xTransitionable.set(mousePosition[1] / -150);

          //console.log()
        });

        mouseSync.on("end", function(data) {
          xRotationSpeed.set(data.velocity[0]);
          //smallQuaternion.add(xRotationSpeed.get());
        })



        var quaternion = new Quaternion(1, 0, 0, 0);
        var smallQuaternion = new Quaternion(180, 0, 0.5, 0);


        var rotationModifier = new Modifier({
          origin: [0.5,0.5]
        });

        rotationModifier.transformFrom(function() {
          return quaternion.getTransform();
        });

        var windowHeight = window.innerHeight;
        var windowWidth = window.innerWidth;

        this.translateModifier = new Modifier({
          origin: [0,0],
          align: [0,0],
          transform: function() {
            // return Transform.multiply(Transform.rotateY(yTransitionable.get()), Transform.rotateX(xTransitionable.get()))
            return Transform.multiply(Transform.translate(windowWidth/2,windowHeight/2,0), Transform.multiply(Transform.rotateY(yTransitionable.get()), Transform.rotateX(xTransitionable.get())))

          }.bind(this)
        });




        var translateNode = mainEngine.add(this.translateModifier);
        translateNode.add(rotationModifier).add(createTable(elementSize,elementSize,elementSize, tableWidth, tableHeight, this.options.elementData));

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

    PeriodicTable.DEFAULT_OPTIONS = {
      elementData: {}
    };
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



    function createTable(width, height, depth, tableWidth, tableHeight, elementData) {
      var table = new RenderNode();

      var elementNumber = 0;
      this.elementSurfaces = [];
      this.translateModifiers = [];
      this.planeModifiers = [];
      this.backModifiers = [];
      this.backPlaneModifiers = [];


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

          var backSurface = new Surface({
            size:params.size,
            classes: params.classes,
            properties: params.properties
          });

          var backModifier = new Modifier({
            transform: params.transformBack
          });


          var planeModifier = new Modifier();
          var backPlaneModifier = new Modifier();

          var node = table.add(modifier);
          node.add(planeModifier).add(surface);

          var nodeBack = table.add(backModifier);
          nodeBack.add(backPlaneModifier).add(backSurface);



          elementNumber++;


          surface.on('click', function() {
            var name = surface.getContent();


            if (this.currentElement != null && this.currentElement.name != name) {
              elementReturn();
            }


            elementClicked({name: name, surface: surface, modifier: modifier, backSurface: backSurface, backModifier: backModifier, planeModifier: planeModifier, params: params.transform, backParams: params.transformBack});





            //console.log(this.currentElement);

          }.bind(this));


          this.elementSurfaces.push(surface);
          this.translateModifiers.push(
            {modifier: modifier, translate: params.transform});
          this.planeModifiers.push(planeModifier);
          this.backModifiers.push({modifier: backModifier, translate: params.transformBack});
          this.backPlaneModifiers.push(backPlaneModifier);
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

      var elementAbreviations = ["H","Li","Na","K","","",""];
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

          createElement({
            size: [width, height],
            content: elementDataset[elementNumber].abreviation,
            properties: {
              lineHeight: height + 'px',
              textAlign: 'center',
              backgroundColor: 'rgba(242, 118, 118, 0.54)',
              fontSize: '20px',
              overflow: 'hidden',
              color: 'white'
            },
            transform: Transform.translate((- tableWidth / 2) + (distance * rowNumber), (- tableHeight / 2) + (distance * columnNumber), 0),
            transformBack: Transform.multiply(Transform.translate((- tableWidth / 2) + (distance * rowNumber), (- tableHeight / 2) + (distance * columnNumber), 0), Transform.multiply(Transform.rotateZ(Math.PI), Transform.rotateX(Math.PI)))
          });
        }

      }


      return table;
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

      var opaqueTransitionable = new Transitionable(0);

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


      this.constructed = true;

    }

    function _createViewButton() {

      this.reconstructButton = new Surface({
        size: [true, true],
        content: 'Reconstruct',
        properties: {
          color: 'white',
          fontSize: '20px',
          padding: '10px',
          fontFamily: 'HelveticaNeue-Light',
          fontWeight: '100'
        }
      });

      this.add(this.reconstructButton);

      this.reconstructButton.on('click', function() {
        this.reconstructTable();
      }.bind(this));

      this.createCubeButton = new Surface({
        size: [true, true],
        content: 'Create Cube',
        properties: {
          color: 'white',
          fontSize: '20px',
          padding: '10px',
          marginTop: '50px',
          fontFamily: 'HelveticaNeue-Light',
          fontWeight: '100'
        }
      });

      this.add(this.createCubeButton);

      this.createCubeButton.on('click', function() {
        this.constructCube();
        //_createCube(this.elementSize);
      }.bind(this));

      this.randomDepthAnimationButton = new Surface({
        size: [true, true],
        content: 'Scatter',
        properties: {
          color: 'white',
          fontSize: '20px',
          padding: '10px',
          marginTop: '100px',
          fontFamily: 'HelveticaNeue-Light',
          fontWeight: '100'
        }
      });

      this.add(this.randomDepthAnimationButton);

      this.randomDepthAnimationButton.on('click', function() {
        this.scatterTable();
      }.bind(this));



    }

    function elementClicked(name) {
      //console.log(name);

      var elementName = name;
      this.currentElement = name;


      elementName.modifier.setTransform(Transform.multiply(Transform.translate(0,0,800), Transform.multiply(Transform.rotateZ(-Math.PI), Transform.rotateX(-Math.PI))), {
        duration: 1500,
        curve: 'easeOut'
      });
      elementName.backModifier.setTransform(Transform.multiply(Transform.translate(0,0,800), Transform.multiply(Transform.rotateZ(0), Transform.rotateX(0))), {
        duration: 1500,
        curve: 'easeOut'
      });

    }

    function elementReturn() {
      console.log(this.currentElement);

      this.currentElement.modifier.setTransform(
        this.currentElement.params,
        {
        duration: 1500,
        curve: 'easeOut'
      });

      this.currentElement.backModifier.setTransform(this.currentElement.backParams, {
        duration: 1500,
        curve: 'easeOut'
      });

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


      console.log(frontElements);



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


      console.log(backElements.length);


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
      console.log(leftElements.length);


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
      console.log(rightElements.length);


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
//
      // var backOpacity = new Transitionable(1);
      // for (var i = 0; i < 120; i++){
      //
      //   this.backPlaneModifiers[i].opacityFrom(function() {
      //     return backOpacity.get();
      //   });
      //
      //   backOpacity.set(0, {
      //     method: 'tween',
      //     curve: 'easeOut',
      //     duration: 1000
      //   });
      // }





    }





    module.exports = PeriodicTable;
});
