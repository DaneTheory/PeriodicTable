define(function(require, exports, module) {
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Modifier      = require('famous/core/Modifier');
    var Transitionable = require('famous/transitions/Transitionable');



    function FlyView() {
        View.apply(this, arguments);

        this.defaultTranslate = 1;
        this.translate = new Transitionable(this.defaultTranslate);


        _createBox.call(this);
    }

    FlyView.prototype = Object.create(View.prototype);
    FlyView.prototype.constructor = FlyView;

    FlyView.DEFAULT_OPTIONS = {};

    function _createBox() {
      var surface = new Surface({
        size: [100,100],
        properties: {
          backgroundColor: '#678be1'
        }
      });



      this.surfaceModifier = new Modifier({
        size: [true,true],
        origin: [0.5,0.5],
        align: [0.5,0.5],
        transform: function() {
          return Transform.scale(this.translate.get(),this.translate.get(),1);
        }.bind(this)
      })

      this.add(this.surfaceModifier).add(surface);
    }

    function _startAnimation() {

        // this.squareOneAnimator.setTransform(Transform.translate(-300,0,0), {
        //   duration: 1000,
        //   curve: 'easeOut'
        // });
        //var targetAngle = 90 * Math.PI/180;

        // this.angle.set(targetAngle, {
        //   duration: 2000,
        //   curve: 'easeInOut'
        // });
        //
        //
        // var znumber = 1;
        // function rotateY()  {
        //
        //   // return Transform.rotateY(1.5);
        //   znumber += 0.03;
        //   console.log(znumber);
        //   return Transform.scale(znumber,znumber,1);
        // }

        this.translate.set(2, {
          duration: 2000,
          curve: 'easeInOut'
        });



    }









    module.exports = FlyView;
});
