define(function(require, exports, module) {
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Modifier      = require('famous/core/Modifier');
    var Transitionable = require('famous/transitions/Transitionable');
    var Easing         = require('famous/transitions/Easing');

    function AppView() {
        View.apply(this, arguments);

        this.defaultAngle = Math.PI/3;
        this.size = [300,300];
        this.angle = new Transitionable(this.defaultAngle);
        this.isToggled = false;

        _createBackground.call(this);
        _createBox.call(this);
        _setListener.call(this);

    }

//////////////////////////METHODS//////////////////////////////////////


    AppView.prototype = Object.create(View.prototype);
    AppView.prototype.constructor = AppView;
    AppView.prototype.rotateBox = function() {
      var currentAngle = this.angle.get();

      var targetAngle = this.isToggled ? this.defaultAngle : -this.defaultAngle;
      console.log('currentAngle: ' + currentAngle);
      console.log('targetAngle: ' + targetAngle);

      if (this.angle.isActive()) this.angle.hault();



      this.angle.set(targetAngle, {
        duration: 2000,
        curve: 'easeInOut'
      });

      this.isToggled = !this.isToggled;
    };
  AppView.prototype.flipBox = function(modifier) {
    console.log(modifier);

    //this.box.setProperties({backgroundColor: 'white'});

    var box = this.box;
    modifier.transformFrom(rotateY);

    var angle = 0;
    function rotateY()  {
      if (angle > 1.562) {
        angle = -angle;
        if (box.getProperties().backgroundColor == '#36df6e') {
        box.setProperties({backgroundColor: 'white'});
      } else {
        box.setProperties({backgroundColor: '#36df6e'});
      }
        angle += 0.01;
      } else {
        angle += 0.01;
      }
      return Transform.rotateY(angle);
    }



  }

//////////////////////////OPTIONS//////////////////////////////////////



    AppView.DEFAULT_OPTIONS = {};



//////////////////////////FUNCTIONS//////////////////////////////////////

    function _createBackground() {
      var backgroundSurface = new Surface({
        size: [undefined, undefined],
        properties: {
          backgroundColor: '#333'
        }
      });

      this.add(backgroundSurface);
    }

    function _createBox() {

      // this.boxSurface = new Surface({
      //   size: [200, 200],
      //   properties: {
      //     backgroundColor: '#36df6e'
      //   }
      // });
      //
      // this.boxOrigin = new StateModifier({
      //   origin: [0.5,0.5]
      // });
      //
      // this.boxTransform = new StateModifier({
      //   transform: Transform.translate(0, 0, 0)
      // });
      //
      // this.boxAnimator = new StateModifier();
      //
      // var originNode = this.add(this.boxOrigin);
      // var locationNode = originNode.add(this.boxTransform);
      // locationNode.add(this.boxAnimator).add(this.boxSurface);

      this.box = new Surface({
        size: this.size,
        properties: {
          backgroundColor: '#36df6e'
        }
      });

      var rotationModifier = new Modifier({
        size: this.size,
        origin: [0.5,0.5],
        align: [0.5,0.5],
        transform: function() {
          return Transform.rotateY(this.angle.get());
        }.bind(this)
      });

      var mainNode = this.add(rotationModifier);
      mainNode.add(this.box);

      console.log(this.box.getProperties().backgroundColor);

      this.flipBox(rotationModifier);


    }

    function _setListener() {
      this.box.on('click', function() {

        this.rotateBox();

      }.bind(this));
    }


    module.exports = AppView;
});
