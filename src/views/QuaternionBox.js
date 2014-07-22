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


    function QuaternionBox() {
        View.apply(this, arguments);

        var mainEngine = Engine.createContext();

        var scrollSync = new ScrollSync();
        Engine.pipe(scrollSync);




        this.defaultScrollDelta = 0;
        var scrollDelta = new Transitionable(this.defaultScrollDelta);





        var quaternion = new Quaternion(1, 0.5, 0.5, 0);
        var smallQuaternion = new Quaternion(50, 1, 1, 1);

        var rotationModifier = new Modifier({
          origin: [0.5, 0.5]
        });

        rotationModifier.transformFrom(function() {
          return quaternion.getTransform();
        });

        var translateModifier = new Modifier();





        var mainEngineNode = mainEngine.add(translateModifier);
        mainEngineNode.add(rotationModifier).add(createBox(200,200,200));

        Engine.on('prerender', function() {
          quaternion = quaternion.multiply(smallQuaternion);
        });

        this.add(mainEngineNode);

        translateModifier.setTransform(Transform.translate(-300,0,scrollDelta.get()), {
          duration: 1000,
          curve: 'easeOut'
        });


    //       Engine.on('click', function() {
    //     var x = (Math.random() * 2) - 1;
    //     var y = (Math.random() * 2) - 1;
    //     var z = (Math.random() * 2) - 1;
    //     smallQuaternion = new Quaternion(185, x, y, z);
    // });

        scrollSync.on("start", function() {
        });

        scrollSync.on("update", function(data) {
          scrollDelta.set(data.delta);
          console.log(scrollDelta.get());
        });

        scrollSync.on("end", function() {
        });


    }

    QuaternionBox.prototype = Object.create(View.prototype);
    QuaternionBox.prototype.constructor = QuaternionBox;

    QuaternionBox.DEFAULT_OPTIONS = {};



    function createBox(width, height, depth) {
      var box = new RenderNode();

        function createSide(params){
          var surface = new Surface({
            size: params.size,
            content: params.content,
            classes: params.classes,
            properties: params.properties
          });

          var modifier = new Modifier({
            transform: params.transform
          });

          box.add(modifier).add(surface);
        };

      //FRONT ...RED
      createSide({
        size: [width, height],
        content: 'FRONT',
        properties: {
          lineHeight: height + 'px',
          textAlign: 'center',
          backgroundColor: '#ef7474',
          fontSize: '18px',
          overflow: 'hidden',
          color: 'white'
        },
        transform: Transform.translate(0,0, depth / 2)
      });

      //BACK ...GREEN
      createSide({
        size: [width, height],
        content: 'BACK',
        properties: {
          lineHeight: height + 'px',
          textAlign: 'center',
          backgroundColor: '#64f55e',
          fontSize: '18px',
          overflow: 'hidden',
          color: 'white'
        },
        transform: Transform.multiply(Transform.translate(0,0, - depth / 2), Transform.multiply(Transform.rotateZ(Math.PI), Transform.rotateX(Math.PI)))
      });

      //TOP....YELLOW
      createSide({
        size: [width, depth],
        content: 'TOP',
        properties: {
          lineHeight: depth + 'px',
          textAlign: 'center',
          backgroundColor: '#fff367',
          fontSize: '18px',
          overflow: 'hidden',
          color: 'white'
        },
        transform: Transform.multiply(Transform.translate(0, -height / 2, 0), Transform.rotateX(Math.PI/2))
      });

      //BOTTOM ... PURPLE
      createSide({
        size: [width, depth],
        content: 'BOTTOM',
        properties: {
          lineHeight: depth + 'px',
          textAlign: 'center',
          backgroundColor: '#b587f6',
          fontSize: '18px',
          overflow: 'hidden',
          color: 'white'
        },
        transform: Transform.multiply(Transform.translate(0, height / 2, 0), Transform.multiply(Transform.rotateX(-Math.PI/2), Transform.rotateZ(Math.PI)))
      });

      //LEFT ... ORANGE
      createSide({
        size: [width, height],
        content: 'LEFT',
        properties: {
          lineHeight: height + 'px',
          textAlign: 'center',
          backgroundColor: '#ffaa4f',
          fontSize: '18px',
          overflow: 'hidden',
          color: 'white'
        },
        transform: Transform.multiply(Transform.translate(-width / 2, 0,0), Transform.rotateY(-Math.PI/2))
      });

      //RIGHT ...
      createSide({
        size: [width, height],
        content: 'RIGHT',
        properties: {
          lineHeight: height + 'px',
          textAlign: 'center',
          backgroundColor: '#2dd5ff',
          fontSize: '18px',
          overflow: 'hidden',
          color: 'white'
        },
        transform: Transform.multiply(Transform.translate(width / 2, 0,0), Transform.rotateY(Math.PI/2))
      });

      return box;
    }








    module.exports = QuaternionBox;
});
