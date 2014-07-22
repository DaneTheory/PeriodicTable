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


    function PeriodicTable() {
        View.apply(this, arguments);

        var mainEngine = Engine.createContext();

        var elementSize = 50;
        var tableWidth = 936;
        var tableHeight = 520;

        var quaternion = new Quaternion(1, 0, 0, 0);
        var smallQuaternion = new Quaternion(180, 0, 0, 0);

        var rotationModifier = new Modifier({
          origin: [0.5, 0.5]
        });

        rotationModifier.transformFrom(function() {
          return quaternion.getTransform();
        });

        mainEngine.add(rotationModifier).add(createTable(elementSize,elementSize,elementSize, tableWidth, tableHeight, this.options.elementData));

        Engine.on('prerender', function() {
          quaternion = quaternion.multiply(smallQuaternion);
        });


        this.add(mainEngine);

    }

    PeriodicTable.prototype = Object.create(View.prototype);
    PeriodicTable.prototype.constructor = PeriodicTable;

    PeriodicTable.DEFAULT_OPTIONS = {
      elementData: {}
    };



    function createTable(width, height, depth, tableWidth, tableHeight, elementData) {
      var table = new RenderNode();

      var elementNumber = 0;


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

          table.add(modifier).add(surface);
          elementNumber++;
          //console.log(elementNumber);
        };

      //H ...RED
      // createElement({
      //   size: [width, height],
      //   content: 'H',
      //   properties: {
      //     lineHeight: height + 'px',
      //     textAlign: 'center',
      //     backgroundColor: '#ef7474',
      //     fontSize: '20px',
      //     overflow: 'hidden',
      //     color: 'white'
      //   },
      //   transform: Transform.translate(- tableWidth / 2,- tableHeight / 2, 0)
      // });

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
              backgroundColor: '#ef7474',
              fontSize: '20px',
              overflow: 'hidden',
              color: 'white'
            },
            transform: Transform.translate((- tableWidth / 2) + (distance * rowNumber), (- tableHeight / 2) + (distance * columnNumber), 0)
          });
        }







      }


      // //BACK ...GREEN
      // createSide({
      //   size: [width, height],
      //   content: 'BACK',
      //   properties: {
      //     lineHeight: height + 'px',
      //     textAlign: 'center',
      //     backgroundColor: '#64f55e',
      //     fontSize: '18px',
      //     overflow: 'hidden',
      //     color: 'white'
      //   },
      //   transform: Transform.multiply(Transform.translate(0,0, - depth / 2), Transform.multiply(Transform.rotateZ(Math.PI), Transform.rotateX(Math.PI)))
      // });
      //
      // //TOP....YELLOW
      // createSide({
      //   size: [width, depth],
      //   content: 'TOP',
      //   properties: {
      //     lineHeight: depth + 'px',
      //     textAlign: 'center',
      //     backgroundColor: '#fff367',
      //     fontSize: '18px',
      //     overflow: 'hidden',
      //     color: 'white'
      //   },
      //   transform: Transform.multiply(Transform.translate(0, -height / 2, 0), Transform.rotateX(Math.PI/2))
      // });
      //
      // //BOTTOM ... PURPLE
      // createSide({
      //   size: [width, depth],
      //   content: 'BOTTOM',
      //   properties: {
      //     lineHeight: depth + 'px',
      //     textAlign: 'center',
      //     backgroundColor: '#b587f6',
      //     fontSize: '18px',
      //     overflow: 'hidden',
      //     color: 'white'
      //   },
      //   transform: Transform.multiply(Transform.translate(0, height / 2, 0), Transform.multiply(Transform.rotateX(-Math.PI/2), Transform.rotateZ(Math.PI)))
      // });
      //
      // //LEFT ... ORANGE
      // createSide({
      //   size: [width, height],
      //   content: 'LEFT',
      //   properties: {
      //     lineHeight: height + 'px',
      //     textAlign: 'center',
      //     backgroundColor: '#ffaa4f',
      //     fontSize: '18px',
      //     overflow: 'hidden',
      //     color: 'white'
      //   },
      //   transform: Transform.multiply(Transform.translate(-width / 2, 0,0), Transform.rotateY(-Math.PI/2))
      // });
      //
      // //RIGHT ...
      // createSide({
      //   size: [width, height],
      //   content: 'RIGHT',
      //   properties: {
      //     lineHeight: height + 'px',
      //     textAlign: 'center',
      //     backgroundColor: '#2dd5ff',
      //     fontSize: '18px',
      //     overflow: 'hidden',
      //     color: 'white'
      //   },
      //   transform: Transform.multiply(Transform.translate(width / 2, 0,0), Transform.rotateY(Math.PI/2))
      // });

      return table;
    }








    module.exports = PeriodicTable;
});
