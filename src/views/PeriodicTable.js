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
        var tableWidth = elementSize * 18.72;
        var tableHeight = elementSize * 10.4;

        Transitionable.registerMethod('tween', TweenTransition);
        var tableYDefault = 0;
        var yTransitionable = new Transitionable(tableYDefault);

        var tableXDefault = 0;
        var xTransitionable = new Transitionable(tableXDefault);


        /****************ANIMATION VARIABLES*******************/
        this.runRandomAnimation = true;


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
          console.log(mousePosition[0]);
          yTransitionable.set(mousePosition[0] / 150);
          xTransitionable.set(mousePosition[1] / -150);

          //console.log()
        })



        var quaternion = new Quaternion(1, 0, 0, 0);
        var smallQuaternion = new Quaternion(180, 0, 0, 0);


        var rotationModifier = new Modifier({
          origin: [0.5,0.5]
        });

        rotationModifier.transformFrom(function() {
          return quaternion.getTransform();
        });

        this.translateModifier = new Modifier({
          origin: [0.5,0.5],
          transform: function() {
            return Transform.multiply(Transform.rotateY(yTransitionable.get()), Transform.rotateX(xTransitionable.get()))
          }.bind(this)
        });




        var translateNode = mainEngine.add(rotationModifier);
        translateNode.add(this.translateModifier).add(createTable(elementSize,elementSize,elementSize, tableWidth, tableHeight, this.options.elementData));

        Timer.setTimeout(function() {
          for (var i = 0; i < 500; i++) {
            if (this.runRandomAnimation) {
            elementDepthAnimation();
            }
          }
        }.bind(this), 500);



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
    PeriodicTable.prototype.viewFrontButton = function() {

      console.log(this.yTransitionable.get());

      var transition = {
        method: 'tween',
        curve: 'easeInOut',
        duration: '1500'
      };

      var yRotation = this.yTransitionable.get();
      this.yTransitionable.set(!yRotation, transition);
    };



    function createTable(width, height, depth, tableWidth, tableHeight, elementData) {
      var table = new RenderNode();

      var elementNumber = 0;
      this.translateModifiers = [];
      this.planeModifiers = [];
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
          })


          var planeModifier = new Modifier();
          var backPlaneModifier = new Modifier();

          var node = table.add(modifier);
          node.add(planeModifier).add(surface);

          var nodeBack = table.add(backModifier);
          nodeBack.add(backPlaneModifier).add(backSurface);



          elementNumber++;




          this.translateModifiers.push(
            {modifier: modifier, translate: params.transform});
          this.planeModifiers.push(planeModifier);
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



    function elementDepthAnimation() {

      var elementRandom = Math.floor((Math.random()) * 118);
      var zDepth = Math.floor((Math.random() * -600) + 600);
      var xRandom = Math.floor((Math.random() * -400) + 300);

      this.planeModifiers[elementRandom].setTransform(
        Transform.translate(0,0,zDepth),
        {
        duration: 1500,
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
        duration: 1500,
        curve: 'easeOut'
      });

      this.backPlaneModifiers[elementRandom].setTransform(
        Transform.translate(xRandom,0,-zDepth),
        {
        duration: 1500,
        curve: 'easeOut'
      });
    }

    function _createViewButton() {

      this.frontButton = new Surface({
        size: [true, true],
        content: 'Front',
        properties: {
          color: 'white',
          fontSize: '20px',
          padding: '10px',
          fontFamily: 'HelveticaNeue-Light',
          fontWeight: '100'
        }
      });

      this.add(this.frontButton);

      this.frontButton.on('click', function() {
        this.viewFrontButton();
      }.bind(this));

    }





    module.exports = PeriodicTable;
});
