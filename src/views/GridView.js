define(function(require, exports, module) {
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Modifier      = require('famous/core/Modifier');
    var Transitionable = require('famous/transitions/Transitionable');
    var Easing         = require('famous/transitions/Easing');


    function GridView() {
        View.apply(this, arguments);


        this.size = [100, 100];
        this.defaultAngle = Math.PI/2;
        this.angle = new Transitionable(this.defaultAngle);

        this.defaultY = 0;
        this.yAngle = new Transitionable(this.defaultY);

        this.firstFaceAngle = Math.PI/3;
        this.firstAngle = new Transitionable(this.firstFaceAngle);

        this.secondFaceAngle = Math.PI/-5;
        this.secondAngle = new Transitionable(this.secondFaceAngle);


        _createBackground.call(this);
        _createGrid.call(this);
        _startAnimation.call(this);

    }

    GridView.prototype = Object.create(View.prototype);
    GridView.prototype.constructor = GridView;


    GridView.DEFAULT_OPTIONS = {};

///////////////////CREATE BACKGROUND//////////////////////////

    function _createBackground() {
      var backgroundSurface = new Surface({
        size: [undefined, undefined],
        properties: {
          backgroundColor: '#333'
        }
      });

      // this.backgroundModifier = new StateModifier({
      //   origin: [0.5,0.5]
      // });

      //this.add(backgroundSurface);
    }

///////////////////CREATE GRID//////////////////////////


    function _createGrid() {

//     var view = new View();
//
//     view.add(new Surface({
//       size: [250,250],
//       properties: {
//         backgroundColor: 'grey'
//       }
//     }));
//
//     var viewModifier = new StateModifier({
//       size: [true,true],
//       origin: [0.5,0.5],
//       align: [0.5,0.5],
//     });
//
//     var viewModX = new Modifier({
//       // size: [300,300],
//       // origin: [0.5,0.5],
//       // align: [0.5,0.5],
//       // transform: function() {
//       //     return Transform.rotateY(this.angle.get());
//       //   }.bind(this),
//     });
//
//     this.viewModY = new Modifier({
//       // size: [true,true],
//       // origin: [0.5,0.5],
//       // align: [0.5,0.5],
//       // transform: function() {
//       //   return Transform.rotateY(this.yAngle.get());
//       // }.bind(this)
//     })
//
//
//
//
//
//
//
//
// /***********************BOX ONE**********GREEN BOX****************/
//
//     var boxOne = new Surface({
//       size: this.size,
//       properties: {
//         backgroundColor: '#4bec6c'
//       }
//     });
//     var boxOneModifier = new StateModifier({
//       origin: [0.5,0.5],
//       align: [0.5,0.5],
//       transform: Transform.translate(0,0,0)
//     });
//     var boxOneY = new Modifier({
//       // transform: function() {
//       //     return Transform.rotateY(this.secondAngle.get());
//       //   }.bind(this)
//     });
//
//
//
//
// /***********************BOX TWO**************RED BOX************/
//
//
//     var boxTwo = new Surface({
//       size: this.size,
//       properties: {
//         backgroundColor: '#e86262'
//       }
//     });
//     var boxTwoModifier = new StateModifier({
//       origin: [0,1],
//       align: [0.5,0.5],
//       transform: Transform.translate(0,0,0)
//
//     });
//     var boxTwoY = new Modifier({
//       // transform: function() {
//       //     return Transform.rotateY(this.firstAngle.get());
//       //   }.bind(this)
//     });
//
//
//
// /***********************BOX THREE**************PURPLE BOX************/
//
//     var boxThree = new Surface({
//       size: this.size,
//       properties: {
//         backgroundColor: '#844bff'
//       }
//     });
//     var boxThreeModifier = new StateModifier({
//       origin: [1,0],
//       align: [0.5,0.5],
//       transform: Transform.translate(0,0,0)
//
//     });
//     var boxThreeZMod = new Modifier({
//       // transform: function() {
//       //     return Transform.rotateZ(this.secondAngle.get());
//       //   }.bind(this)
//     });
//     var boxThreeXMod = new Modifier({
//       // transform: function() {
//       //     return Transform.rotateX(-1.566);
//       //   }.bind(this)
//     });
//
//
// /***********************BOX FOUR***********YELLOW BOX***************/
//
//     var boxFour = new Surface({
//       size: this.size,
//       properties: {
//         backgroundColor: '#fafc76'
//       }
//     });
//     var boxFourModifier = new StateModifier({
//       origin: [0.5,0.5],
//       align: [0.5,0.5],
//       transform: Transform.translate(0,0,0)
//
//     });
//     var boxFourY = new Modifier({
//       // origin: [0.5,1],
//       // align: [0.5,0.5],
//       // transform: function() {
//       //     return Transform.rotateY(this.firstAngle.get());
//       //   }.bind(this)
//     });
//
// /***********************BOX FIVE************BLUE BOX**************/
//
//     var boxFive = new Surface({
//       size: this.size,
//       properties: {
//         backgroundColor: '#79f6ff'
//       }
//     });
//     var boxFiveModifier = new StateModifier({
//       origin: [-1,1],
//       align: [0.5,0.5],
//       transform: Transform.translate(0,0,0)
//
//     });
//     var boxFiveY = new Modifier({
//       // transform: function() {
//       //     return Transform.rotateY(this.firstAngle.get());
//       //   }.bind(this)
//     });
//
//
// /***********************BOX SIX***********PINK BOX***************/
//
//     var boxSix = new Surface({
//       size: this.size,
//       properties: {
//         backgroundColor: '#ff4bf3'
//       }
//     });
//     var boxSixModifier = new StateModifier({
//       origin: [1,2],
//       align: [0.5,0.5],
//       transform: Transform.translate(0,0,0)
//
//     });
//     var boxSixZMod = new Modifier({
//       // transform: function() {
//       //     return Transform.rotateZ(this.secondAngle.get());
//       //   }.bind(this)
//     });
//     var boxSixXMod = new Modifier({
//       // transform: function() {
//       //     return Transform.rotateX(-1.566);
//       //   }.bind(this)
//     });
//
//
//
//
//
//     var boxOneNode = view.add(boxOneModifier);
//     boxOneNode.add(boxOneY).add(boxOne);
//
//
//     var boxTwoNode = view.add(boxTwoModifier);
//     boxTwoNode.add(boxTwoY).add(boxTwo);
//
//
//     var boxThreeNode = view.add(boxThreeModifier);
//     var boxThreeXNode = boxThreeNode.add(boxThreeXMod);
//     boxThreeXNode.add(boxThreeZMod).add(boxThree);
//
//     var boxFourNode = view.add(boxFourModifier);
//     boxFourNode.add(boxFourY).add(boxFour);
//
//     var boxFiveNode = view.add(boxFiveModifier);
//     boxFiveNode.add(boxFiveY).add(boxFive);
//
//     var boxSixNode = view.add(boxSixModifier);
//     var boxSixXNode = boxSixNode.add(boxSixXMod);
//     boxSixXNode.add(boxSixZMod).add(boxSix);
//
//
//     var viewNode = this.add(viewModifier);
//     var viewNodeRotate = this.add(this.viewModY);
//     viewNodeRotate.add(viewModX).add(view);






      var view = new View();

      view.add(new Surface({
        // properties: {
        //   backgroundColor: '#f96f6f'
        // }
      }));

      this.viewModifier = new StateModifier({
        size: this.size,
        origin: [0.5,0.5],
        align: [0.5,0.5],
        //transform: Transform.rotateY(-1.1)

      });

      var greenBox = new Surface({
        size: this.size,
        properties: {
          backgroundColor: "#4eef54"
        }
      });

      var greenBoxModifier = new StateModifier({
        transform: Transform.translate(0,0,-50)
      });

    var blueBox = new Surface({
      size: this.size,
      properties: {
        backgroundColor: "#4ee3f2"
      }
    });

    var blueBoxModifier = new StateModifier({
      transform: Transform.translate(0,0,50)
    });






      view.add(greenBoxModifier).add(greenBox);
      view.add(blueBoxModifier).add(blueBox);

      this.add(this.viewModifier).add(view);



      var view2 = new View();

      view2.add(new Surface({
        // properties: {
        //   backgroundColor: '#f71010'
        // }
      }));

      this.viewModifier2 = new StateModifier({
        size: this.size,
        origin: [0.5,0.5],
        align: [0.5,0.5],
        //transform: Transform.rotateX(1),

      });

      this.viewModifierY = new Modifier({
        size: this.size,
        origin: [0.5,0.5],
        align: [0.5,0.5],
        transform: Transform.rotateY(0.5)
      });

      var yellowBox = new Surface({
        size: this.size,
        properties: {
          backgroundColor: "#eaf760"
        }
      });

      var yellowBoxModifier = new StateModifier({
        transform: Transform.translate(0,0,-50)
      });

    var orangeBox = new Surface({
      size: this.size,
      properties: {
        backgroundColor: "#f4994f"
      }
    });

    var orangeBoxModifier = new StateModifier({
      transform: Transform.translate(0,0,50)
    });



      view2.add(yellowBoxModifier).add(yellowBox);
      view2.add(orangeBoxModifier).add(orangeBox);


      var view2Node = this.add(this.viewModifier2);
      view2Node.add(this.viewModifierY).add(view2);



    //this.add(viewModifier).add(view);

      //
      // /*******************SQUARE ONE******************/
      // var squareOneSurace = new Surface({
      //   size: this.size,
      //   properties: {
      //     backgroundColor: '#ffed76'
      //   }
      // });
      //
      // this.squareOneAnimator = new Modifier();
      //
      //
      // this.squareOneModifier = new Modifier({
      //   size: this.size,
      //   origin: [0.5,1],
      //   transform: function() {
      //     return Transform.rotateY(this.angle.get());
      //
      //   }.bind(this)
      // });
      //
      // var positionNode = this.add(this.squareOneModifier);
      // positionNode.add(this.squareOneAnimator).add(squareOneSurace);
      //
      //
      // /*******************SQUARE ONE******************/
      //
      // var squareTwoSurace = new Surface({
      //   size: this.size,
      //   properties: {
      //     backgroundColor: '#ffae78'
      //   }
      // });
      //
      // this.squareTwoAnimator = new Modifier();
      //
      //
      // this.squareTwoModifier = new Modifier({
      //   size: this.size,
      //   origin: [0.5,1],
      //   transform: function() {
      //     return Transform.rotateY(this.secondAngle.get());
      //
      //   }.bind(this)
      // });
      //
      // var positionNode = this.add(this.squareTwoModifier);
      // positionNode.add(this.squareTwoAnimator).add(squareTwoSurace);
    }

///////////////////ANIMATIONS//////////////////////////

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


        //this.viewModY.transformFrom(rotateY);

        var angle = 0;
        function rotateY()  {

          // return Transform.rotateY(1.5);
          angle += 0.03;
          console.log(angle);
          return Transform.rotateY(angle);
        }



    }






    module.exports = GridView;
});
