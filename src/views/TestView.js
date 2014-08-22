define(function(require, exports, module) {
    var Engine        = require('famous/core/Engine')
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Modifier      = require('famous/core/Modifier');
    var ModifierChain = require('famous/modifiers/ModifierChain');
    var RenderController = require('famous/views/RenderController');
    var GenericSync     = require('famous/inputs/GenericSync');
    var TouchSync       = require('famous/inputs/TouchSync');
    var MouseSync       = require('famous/inputs/MouseSync');
    var ScrollSync      = require('famous/inputs/ScrollSync');
    var PinchSync       = require('famous/inputs/PinchSync');
    var Accumulator     = require('famous/inputs/Accumulator');
    var Transitionable = require('famous/transitions/Transitionable');
    var Timer           = require('famous/utilities/Timer');
    var TweenTransition = require('famous/transitions/TweenTransition');
    var RenderNode    = require('famous/core/RenderNode');
    var Easing          = require('famous/transitions/Easing');
    var d3              = require('http://d3js.org/d3.v3.min.js');





    function TestView() {
        View.apply(this, arguments);

        this.elementSize = 120;
        this.elementWidth = this.elementSize;
        this.elementHeight = this.elementWidth * 1.25;
        this.tableWidth = this.elementWidth * 18.72;
        this.tableHeight = this.elementHeight * 10.4;
        this.windowHeight = window.innerHeight;
        this.windowWidth = window.innerWidth;
        console.log(this.windowWidth +', ' + this.windowHeight);


        this.inViewElements = [];
        this.isFliped = [];


        var mainEngine = Engine.createContext();
        mainEngine.setPerspective(1000);

        Transitionable.registerMethod('tween', TweenTransition);
        this.yTransitionable = new Transitionable(0);
        this.xTransitionable = new Transitionable(0);
        this.zTransitionable = new Transitionable(-1500);

        var position = [0,0];

        GenericSync.register({
          mouse: MouseSync,
          touch: TouchSync
        });

        var accumulator = new Accumulator(position);
        var genericSync = new GenericSync(['mouse', 'touch']);

        Engine.pipe(genericSync);
        genericSync.pipe(accumulator);

        genericSync.on('update', function() {
          var genericPosition = accumulator.get();

          this._eventOutput.emit('planeChanged', genericPosition);
        }.bind(this));

        var scrollAccumulator = new Accumulator([0,-1500]);

        var scrollSync = new ScrollSync();
        Engine.pipe(scrollSync);
        scrollSync.pipe(scrollAccumulator);

        scrollSync.on('update', function(data) {
          var scrolled = scrollAccumulator.get();
          this._eventOutput.emit('planeZChanged', scrolled[1]);
        }.bind(this));


        var pinchAccumulator = new Accumulator(0);
        var pinchSync = new PinchSync();
        Engine.pipe(pinchSync);
        pinchSync.pipe(pinchAccumulator);

        pinchSync.on('update', function(data) {
          var pinched = pinchAccumulator.get() * 2;
          this._eventOutput.emit('planeZChanged', pinched);
        }.bind(this));



        _setPlaneListener.call(this);
        _setPageButtons.call(this);
        mainEngine.add(_createElements.call(this));

        this.add(mainEngine);

    }

    TestView.prototype = Object.create(View.prototype);
    TestView.prototype.constructor = TestView;

    TestView.DEFAULT_OPTIONS = {
      elementData: {},
      animationDuration: 1500,
      transition: {
        method: 'tween',
        curve: 'easeInOut',
        duration: 1500
        }
    };



    function _createElements() {

      var context = this;
      var table = new RenderNode();
      context.elementElements = [];

            var elementNumber = 0;
            var columnNumber = -1;
            var rowNumber = -1;
            var distanceWidth = context.elementWidth + context.elementWidth / 25;
            var distanceHeight = context.elementHeight + context.elementHeight / 25;
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





      for (var i = 0; i < 180; i++) {

        columnNumber++;

        if (i % 10 == 0) {
          columnNumber = -1;
          columnNumber ++;
          rowNumber++;
        }

        if (notElements.indexOf(i) > -1) {
          //DONT ADD SURFACE
        } else {
          //ADD ELEMENT
          elementNumber = elementNumber ++;
            //*****************ADD ELEMENT FACE*************************//
                  var elementSurface = new Surface({
                    size: [context.elementWidth,context.elementHeight],
                    content: context.options.elementData[elementNumber].abreviation,
                    properties: {
                      lineHeight: context.elementHeight + 'px',
                      textAlign: 'center',
                      //backgroundColor: elementColors[context.options.elementData[elementNumber].type],
                      fontSize: context.elementWidth / 3 + 'px',
                      overflow: 'hidden',
                      color: 'white',
                      fontFamily: 'Roboto, sans-serif',
                      fontWeight: 100
                    }
                  });

                  elementSurface.addClass('periodicElement');

                  var individualRotation = new Modifier();
                  var originalTranslate = Transform.translate((-context.tableWidth/2)+(distanceWidth * rowNumber), (-context.tableHeight/2)+(distanceHeight*columnNumber),0);
                  var positionModifier = new Modifier({
                    align: [0.5,0.5],
                    transform: originalTranslate
                  });
                  var tableConnection = new Modifier({
                    origin: [0.5,0.5],
                  });
                  var flatConnection = new Modifier({
                    origin: [0.5,0.5]
                  });



                  var modifierChain = new ModifierChain();

                  modifierChain.addModifier(individualRotation);
                  modifierChain.addModifier(positionModifier);
                  modifierChain.addModifier(tableConnection);

                  tableConnection.transformFrom(function() {
                      return Transform.multiply(Transform.translate(0,0,context.zTransitionable.get()), Transform.multiply(Transform.rotateY(context.yTransitionable.get()), Transform.rotateX(context.xTransitionable.get())))
                  });


                  flatConnection.transformFrom(function() {
                      return Transform.multiply(Transform.translate(0,0,context.zTransitionable.get()), Transform.multiply(Transform.rotateY(context.yTransitionable.get()), Transform.rotateX(context.xTransitionable.get())))
                  });


            //****************ADD ELEMENT BACK*********************************//



                  // var contentTemplate = function() {
                  //   return "<div>" + context.options.elementData[elementNumber].number + "</div>" +
                  //          "<div>" + context.options.elementData[elementNumber].name + "</div>" +
                  //          "<div>" + context.options.elementData[elementNumber].atomicWeight + "</div>" +
                  //          "<div>" + context.options.elementData[elementNumber].type + "</div>" +
                  //          "<div><img src=\'" + context.options.elementData[elementNumber].icon + "\' alt=\'element diagram\' height=\'75\'></div>";
                  // };

                  var contentTemplate = function() {
                    return  "<div>" + context.options.elementData[elementNumber].number + "</div>" +
                            "<div>" + context.options.elementData[elementNumber].name + "</div>" +
                            "<div>" + context.options.elementData[elementNumber].atomicWeight + "</div>" +
                            "<div>" + context.options.elementData[elementNumber].type + "</div>" +
                            "<div class=\'" + "element" + elementNumber + "\'></div>";
                  }



                  var elementBackSurface = new Surface({
                    size: [context.elementWidth,context.elementHeight],
                    content: contentTemplate(),
                    properties: {
                      textAlign: 'center',
                      lineHeight: context.elementHeight / 8 + 'px',
                      // backgroundColor: elementColors[context.options.elementData[elementNumber].type],
                      color: 'white',
                      fontSize: context.elementWidth / 10 + 'px',
                      overflow: 'hidden',
                      fontFamily: 'Roboto, sans-serif',
                      fontWeight: 100
                    }
                  });

                  elementBackSurface.addClass('periodicElement');

                  var individualBackRotation = new Modifier({
                    transform: Transform.rotateY(Math.PI)
                  });
                  var positionBackModifier = new Modifier({
                      align: [0.5,0.5],
                      transform: originalTranslate
                  });
                  var tableBackConnection = new Modifier({
                    origin: [0.5,0.5]
                  });
                  var flatBackConnection = new Modifier({
                    origin: [0.5,0.5]
                  });

                  var modifierBackChain = new ModifierChain();
                  modifierBackChain.addModifier(individualBackRotation);
                  modifierBackChain.addModifier(positionBackModifier);
                  modifierBackChain.addModifier(tableBackConnection);

                  tableBackConnection.transformFrom(function() {
                      return Transform.multiply(Transform.translate(0,0,context.zTransitionable.get()), Transform.multiply(Transform.rotateY(context.yTransitionable.get()), Transform.rotateX(context.xTransitionable.get())))
                  });

                  flatBackConnection.transformFrom(function() {
                      return Transform.multiply(Transform.translate(0,0,context.zTransitionable.get()), Transform.multiply(Transform.rotateY(context.yTransitionable.get()), Transform.rotateX(context.xTransitionable.get())))
                  });


                  context.elementElements.push({surface:        elementSurface,
                                                original:       originalTranslate,
                                                modifierChain:  modifierChain,
                                                position:       positionModifier,
                                                table:          tableConnection,
                                                flat:           flatConnection,
                                                individual:     individualRotation,
                                                backSurface:    elementBackSurface,
                                                modifierBackChain: modifierBackChain,
                                                individualBack: individualBackRotation,
                                                positionBack:   positionBackModifier,
                                                tableBack:      tableBackConnection,
                                                flatBack:       flatBackConnection});


                  setElementSurfaceListener(context, elementNumber);

                  table.add(modifierChain).add(elementSurface);
                  table.add(modifierBackChain).add(elementBackSurface);

                  elementNumber++


        }

      }

      return table;

    }


    function setElementSurfaceListener(context, i) {


      //////////////////////////////////////////////////////////////////////////////////////FLING LISTENERS:::::

      var accumulator = new Accumulator([0,0]);
      var sync = new GenericSync(['mouse', 'touch']);

      context.elementElements[i].surface.pipe(sync);
      context.elementElements[i].backSurface.pipe(sync);
      sync.pipe(accumulator);


      var inTable = function(data) {
        var velocity = data.velocity;
        if (velocity[0] > 1){

          translateRightFromTable(velocity);

          sync.removeListener('end', inTable);
          sync.on('end', inHolding);

        } else if (velocity[0] < 0.1 && velocity [0] > -0.1) {

          context.inViewElements.push(i);
          enlargeElementFromTable();




          sync.removeListener('end', inTable);
          sync.on('end', inView);
        } else if (velocity[0] > 0.1 && velocity[0] < 1 || velocity[0] > -1 && velocity[0] < -0.1) {

          if (context.isFliped.indexOf(i) > -1) {
            reFlipElement(velocity);
          } else {
            flipElement(velocity);
          }
        }
      }

      var inHolding = function(data) {
        var velocity = data.velocity;
        if (velocity[0] < -1) {

          attachElement(velocity);
          //translateIntoTable(velocity);

          sync.removeListener('end', inHolding);
          sync.on('end', inTable);

        } else if (velocity[0] < 0.1 && velocity [0] > -0.1) {

          context.inViewElements.push(i);
          enlargeElementFromHolding();

          sync.removeListener('end', inHolding);
          sync.on('end', inView);
        } else if (velocity[0] > 0.1 && velocity[0] < 1 || velocity[0] > -1 && velocity[0] < -0.1) {

          if (context.isFliped.indexOf(i) > -1) {
            reFlipElement(velocity);
          } else {
            flipElement(velocity);
          }
        }
      }

      var inView = function(data) {
        var velocity = data.velocity;
        if (velocity[0] > 1) {

          for (var int = context.inViewElements.length - 1; int >= 0; int--) {
            if(context.inViewElements[int] === i) {
              context.inViewElements.splice(int, 1);
            }
          }
          translateRightFromInView(velocity);

          sync.removeListener('end', inView);
          sync.on('end', inHolding);




        }  else if (velocity[0] < 0.1 && velocity [0] > -0.1 || velocity[1] < -1) {
          for (var int = context.inViewElements.length - 1; int >= 0; int--) {
            if(context.inViewElements[int] === i) {
              context.inViewElements.splice(int, 1);
            }
          }


          //attachElement(velocity);
          unenlargeElement();

          sync.removeListener('end', inView);
          sync.on('end', inTable);
        } else if (velocity[0] > 0.1 && velocity[0] < 1 || velocity[0] > -1 && velocity[0] < -0.1) {

          if (context.isFliped.indexOf(i) > -1) {
            reFlipElement(velocity);
          } else {
            flipElement(velocity);
          }
        }
      }


      sync.on('end', inTable);

      function flipElement(velocity) {

        var individualYTransitionable = new Transitionable(0);
        var individualYBackTransitionable = new Transitionable(-Math.PI);
        var flipDirection = Math.PI;
        if (velocity[0] < 0) {
          flipDirection = -Math.PI;
          individualYBackTransitionable.set(Math.PI);
        }

        context.elementElements[i].individual.transformFrom(function() {
          return Transform.rotateY(individualYTransitionable.get())
        });

        context.elementElements[i].individualBack.transformFrom(function() {
          return Transform.rotateY(individualYBackTransitionable.get())
        });


        var transition = {
          method: 'tween',
          duration: 4000,
          curve: Easing.outElastic
        };

        individualYTransitionable.set(flipDirection, transition);
        individualYBackTransitionable.set(0, transition);

        addSvg();

        context.isFliped.push(i);
      }

      function reFlipElement(velocity) {
        var individualYTransitionable = new Transitionable(Math.PI);
        var individualYBackTransitionable = new Transitionable(0);
        flipDirection = -Math.PI;
        if(velocity[0] > 0) {
          flipDirection = Math.PI;
          individualYTransitionable.set(-Math.PI);
        }
        context.elementElements[i].individual.transformFrom(function() {
          return Transform.rotateY(individualYTransitionable.get())
        });

        context.elementElements[i].individualBack.transformFrom(function() {
          return Transform.rotateY(individualYBackTransitionable.get())
        });

        var transition = {
          method: 'tween',
          duration: 4000,
          curve: Easing.outElastic
        };

        individualYTransitionable.set(0, transition);
        individualYBackTransitionable.set(flipDirection, transition);

        for (var int = context.isFliped.length - 1; int >= 0; int--) {
          if(context.isFliped[int] === i) {
            context.isFliped.splice(int, 1);
          }
        }
      }

      function addSvg() {
        var lanthanum = [2,	8, 18, 18,	9, 2];
        var heighMulti = 3;
        var dividerHeight = 6;


        var width = 110;
        var height = width * 1.25;

        var element = '.element' + i;

        var svg = d3.select(element).append("svg").attr("width", width).attr("height", height);
        var newSVG = svg.selectAll("rect").data(lanthanum).enter().append("rect")
          .attr("x", function(d,i) {
          return (width*0.65) + i * dividerHeight;
        }).attr("y", function(d, i) {
          return -width/2 + (-d*heighMulti/2);
        }).attr("width", 5)
        .attr("height", function(d) {
          return 0;
        })
        .attr("fill", function(d) {
          return "rgb(0,"+(d*20)+","+(d*10)+")";
        })
        .attr("transform", "rotate(90 0 0) skewX(45)")
      .transition()
        .duration(2000)
        .ease(Math.sqrt)
        .attr("height", function(d) {
          return d * heighMulti;
        });


      }


      function detachElement(velocity) {
        var flatXTransitionable = new Transitionable(context.xTransitionable.get());
        var flatYTransitionable = new Transitionable(context.yTransitionable.get());
        var flatZTransitionable = new Transitionable(context.zTransitionable.get());
        var flatX = new Transitionable(0);
        var flatY = new Transitionable(0);

        var originalX = context.elementElements[i].original[12];

        context.elementElements[i].modifierChain.removeModifier(context.elementElements[i].table);
        context.elementElements[i].modifierChain.addModifier(context.elementElements[i].flat);

        context.elementElements[i].modifierBackChain.removeModifier(context.elementElements[i].tableBack);
        context.elementElements[i].modifierBackChain.addModifier(context.elementElements[i].flatBack);


        context.elementElements[i].flat.transformFrom(function() {
          return Transform.multiply(Transform.translate(flatX.get(),flatY.get(),flatZTransitionable.get()), Transform.multiply(Transform.rotateY(flatYTransitionable.get()), Transform.rotateX(flatXTransitionable.get())))
        });


        context.elementElements[i].flatBack.transformFrom(function() {
          return Transform.multiply(Transform.translate(flatX.get(),flatY.get(),flatZTransitionable.get()), Transform.multiply(Transform.rotateY(flatYTransitionable.get()), Transform.rotateX(flatXTransitionable.get())))
        });

        var duration = 5000 / velocity[0];

        var transition = {
          method: 'tween',
          duration: duration,
          curve: 'easeOut'
        };

        flatYTransitionable.set(0, transition);
        flatXTransitionable.set(0, transition);
        flatZTransitionable.set(-6000, transition);

        flatX.set(-originalX + (context.windowWidth * 3.3), transition);
        flatY.set(velocity[1] * 1000, transition);


      }

      function attachElement(velocity) {
        var flatTransform = context.elementElements[i].flat.getFinalTransform();
        var detachedX = new Transitionable(flatTransform[12]);
        var detachedY = new Transitionable(flatTransform[13]);
        var detachedZ = new Transitionable(flatTransform[14]);


        var tableYTransitionable = new Transitionable(0);
        var tableXTransitionable = new Transitionable(0);

        context.elementElements[i].flat.transformFrom(function() {
          return Transform.multiply(Transform.translate(detachedX.get(),detachedY.get(),detachedZ.get()), Transform.multiply(Transform.rotateY(tableYTransitionable.get()), Transform.rotateX(tableXTransitionable.get())))
        });

        context.elementElements[i].flatBack.transformFrom(function() {
          return Transform.multiply(Transform.translate(detachedX.get(),detachedY.get(),detachedZ.get()), Transform.multiply(Transform.rotateY(tableYTransitionable.get()), Transform.rotateX(tableXTransitionable.get())))
        });

        var duration = 5000 / -velocity[0];

        var transition = {
          method: 'tween',
          duration: duration,
          curve: 'easeOut'
        };

        tableYTransitionable.set(context.yTransitionable.get(), transition);
        tableXTransitionable.set(context.xTransitionable.get(), transition);

        detachedX.set(0, transition);
        detachedY.set(0, transition);
        detachedZ.set(context.zTransitionable.get(), transition);





        Timer.setTimeout(function() {
          context.elementElements[i].modifierChain.addModifier(context.elementElements[i].table);
          context.elementElements[i].modifierChain.removeModifier(context.elementElements[i].flat);

          context.elementElements[i].modifierBackChain.addModifier(context.elementElements[i].tableBack);
          context.elementElements[i].modifierBackChain.removeModifier(context.elementElements[i].flatBack);
        }.bind(this), duration);
      }

      function translateRightFromTable(velocity) {

        var flatXTransitionable = new Transitionable(context.xTransitionable.get());
        var flatYTransitionable = new Transitionable(context.yTransitionable.get());
        var flatZTransitionable = new Transitionable(context.zTransitionable.get());
        var flatX = new Transitionable(0);
        var flatY = new Transitionable(0);



        var originalX = context.elementElements[i].original[12];

        context.elementElements[i].modifierChain.removeModifier(context.elementElements[i].table);
        context.elementElements[i].modifierChain.addModifier(context.elementElements[i].flat);

        context.elementElements[i].modifierBackChain.removeModifier(context.elementElements[i].tableBack);
        context.elementElements[i].modifierBackChain.addModifier(context.elementElements[i].flatBack);


        context.elementElements[i].flat.transformFrom(function() {
          return Transform.multiply(Transform.translate(flatX.get(),flatY.get(),flatZTransitionable.get()), Transform.multiply(Transform.rotateY(flatYTransitionable.get()), Transform.rotateX(flatXTransitionable.get())))
        });


        context.elementElements[i].flatBack.transformFrom(function() {
          return Transform.multiply(Transform.translate(flatX.get(),flatY.get(),flatZTransitionable.get()), Transform.multiply(Transform.rotateY(flatYTransitionable.get()), Transform.rotateX(flatXTransitionable.get())))
        });

        var duration = 5000 / velocity[0];

        var transition = {
          method: 'tween',
          duration: duration,
          curve: 'easeOut'
        };


        flatYTransitionable.set(0, transition);
        flatXTransitionable.set(0, transition);
        flatZTransitionable.set(-1500, transition);

        flatX.set(-originalX + (context.windowWidth * 1.2), transition);
        flatY.set(velocity[1] * 1000, transition);



      }

      function translateRightFromInView(velocity) {
        var flatXTransitionable = new Transitionable(0);
        var flatYTransitionable = new Transitionable(0);
        var flatZTransitionable = new Transitionable(700);

        var originalX = context.elementElements[i].original[12];
        var originalY = context.elementElements[i].original[13];

        var flatX = new Transitionable(-originalX);
        var flatY = new Transitionable(-originalY);

        var originalX = context.elementElements[i].original[12];
        var originalY = context.elementElements[i].original[13];


        context.elementElements[i].flat.transformFrom(function() {
          return Transform.multiply(Transform.translate(flatX.get(),flatY.get(),flatZTransitionable.get()), Transform.multiply(Transform.rotateY(flatYTransitionable.get()), Transform.rotateX(flatXTransitionable.get())))
        });


        context.elementElements[i].flatBack.transformFrom(function() {
          return Transform.multiply(Transform.translate(flatX.get(),flatY.get(),flatZTransitionable.get()), Transform.multiply(Transform.rotateY(flatYTransitionable.get()), Transform.rotateX(flatXTransitionable.get())))
        });

        var duration = 5000 / velocity[0];

        var transition = {
          method: 'tween',
          duration: duration,
          curve: 'easeOut'
        };

        context.elementElements[i].position.setTransform(context.elementElements[i].original, {
          duration: duration,
          curve: 'easeOut'
        });
        context.elementElements[i].positionBack.setTransform(context.elementElements[i].original, {
          duration: duration,
          curve: 'easeOut'
        });

        flatYTransitionable.set(0, transition);
        flatXTransitionable.set(0, transition);
        flatZTransitionable.set(-1500, transition);

        flatX.set(-originalX + (context.windowWidth * 1.2), transition);
        flatY.set(velocity[1] * 1000, transition);
      }

      function translateIntoTable(velocity) {

        context.elementElements[i].position.setTransform(context.elementElements[i].original, {
          duration: 1500,
          curve: 'easeOut'
        });
        context.elementElements[i].positionBack.setTransform(context.elementElements[i].original, {
          duration: 1500,
          curve: 'easeOut'
        });
      }

      function enlargeElementFromTable() {



          var flatXTransitionable = new Transitionable(context.xTransitionable.get());
          var flatYTransitionable = new Transitionable(context.yTransitionable.get());
          var flatZTransitionable = new Transitionable(context.zTransitionable.get());
          var flatX = new Transitionable(0);
          var flatY = new Transitionable(0);


          var originalX = context.elementElements[i].original[12];
          var originalY = context.elementElements[i].original[13];

          context.elementElements[i].modifierChain.removeModifier(context.elementElements[i].table);
          context.elementElements[i].modifierChain.addModifier(context.elementElements[i].flat);

          context.elementElements[i].modifierBackChain.removeModifier(context.elementElements[i].tableBack);
          context.elementElements[i].modifierBackChain.addModifier(context.elementElements[i].flatBack);


          context.elementElements[i].flat.transformFrom(function() {
            return Transform.multiply(Transform.translate(flatX.get(),flatY.get(),flatZTransitionable.get()), Transform.multiply(Transform.rotateY(flatYTransitionable.get()), Transform.rotateX(flatXTransitionable.get())))
          });


          context.elementElements[i].flatBack.transformFrom(function() {
            return Transform.multiply(Transform.translate(flatX.get(),flatY.get(),flatZTransitionable.get()), Transform.multiply(Transform.rotateY(flatYTransitionable.get()), Transform.rotateX(flatXTransitionable.get())))
          });

          //var duration = 5000 / velocity[0];

          var transition = {
            method: 'tween',
            duration: 1500,
            curve: 'easeOut'
          };



          flatYTransitionable.set(0, transition);
          flatXTransitionable.set(0, transition);
          flatZTransitionable.set(700, transition);

          flatX.set(-originalX, transition);
          flatY.set(-originalY, transition);

          Timer.setTimeout(function() {
            //addHQElement();

          }.bind(this), 1500);

        scoochElements();
      }

      function enlargeElementFromHolding() {
        var flatXTransitionable = new Transitionable(0);
        var flatYTransitionable = new Transitionable(0);

        var current = context.elementElements[i].flat.getTransform();
        var currentX = current[12];
        var currentY = current[13];
        var currentZ = current[14];

        var flatZTransitionable = new Transitionable(currentZ);
        var flatX = new Transitionable(currentX);
        var flatY = new Transitionable(currentY);

        var originalX = context.elementElements[i].original[12];
        var originalY = context.elementElements[i].original[13];

        context.elementElements[i].flat.transformFrom(function() {
          return Transform.multiply(Transform.translate(flatX.get(),flatY.get(),flatZTransitionable.get()), Transform.multiply(Transform.rotateY(flatYTransitionable.get()), Transform.rotateX(flatXTransitionable.get())))
        });


        context.elementElements[i].flatBack.transformFrom(function() {
          return Transform.multiply(Transform.translate(flatX.get(),flatY.get(),flatZTransitionable.get()), Transform.multiply(Transform.rotateY(flatYTransitionable.get()), Transform.rotateX(flatXTransitionable.get())))
        });

        var transition = {
          method: 'tween',
          duration: 1500,
          curve: 'easeOut'
        };

        flatYTransitionable.set(0, transition);
        flatXTransitionable.set(0, transition);
        flatZTransitionable.set(700, transition);

        flatX.set(-originalX, transition);
        flatY.set(-originalY, transition);

        scoochElements();
      }

      function addHQElement() {
        var hqWidth = context.elementWidth*3.3;
        var hqHeight = hqWidth * 1.25;

        var hqSurface = new Surface({
          size: [hqWidth,hqHeight],
          content: 'H',
          properties: {
            lineHeight: hqHeight + 'px',
            textAlign: 'center',
            fontSize: hqWidth / 3 + 'px',
            overflow: 'hidden',
            color: 'white',
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 100
          }
        });

        hqSurface.addClass('hqPeriodicElement');

        var hqModifier = new Modifier({
          origin: [0.5,0.5],
          align: [0.5,0.5],
          transform: Transform.translate(0,0,1000)
        });

        context.add(hqModifier).add(hqSurface);
      }

      function scoochElements() {


        for (var int = 0; int < context.inViewElements.length; int++) {

          var elementNumber = context.inViewElements[int];

          context.elementElements[elementNumber].position.halt();
          context.elementElements[elementNumber].positionBack.halt();



          var inViewX = context.elementElements[elementNumber].original[12];
          var inViewY = context.elementElements[elementNumber].original[13];

          //console.log(elementNumber + ': ' + context.elementElements[elementNumber].flat.getTransform() + ' inViewX&Y: ' + inViewX + ', ' + inViewY);
          var halfElement = -context.elementWidth / 2 - context.elementWidth *.03;
          var x = (halfElement * (context.inViewElements.length - 1)) + (-halfElement * 2 * int);
          var newX = inViewX + x;
          console.log(halfElement + ', ' + newX);



            context.elementElements[elementNumber].position.setTransform(Transform.translate(newX,inViewY,0), {
              duration: 1500,
              curve: 'easeOut'
            });
            context.elementElements[elementNumber].positionBack.setTransform(Transform.translate(newX,inViewY,0), {
              duration: 1500,
              curve: 'easeOut'
            });



        }
      }

      function unenlargeElement() {
        var flatXTransitionable = new Transitionable(0);
        var flatYTransitionable = new Transitionable(0);
        var flatZTransitionable = new Transitionable(700);


        var originalX = context.elementElements[i].original[12];
        var originalY = context.elementElements[i].original[13];

        var flatX = new Transitionable(-originalX);
        var flatY = new Transitionable(-originalY);


        var originalX = context.elementElements[i].original[12];
        var originalY = context.elementElements[i].original[13];

        context.elementElements[i].flat.transformFrom(function() {
          return Transform.multiply(Transform.translate(flatX.get(),flatY.get(),flatZTransitionable.get()), Transform.multiply(Transform.rotateY(flatYTransitionable.get()), Transform.rotateX(flatXTransitionable.get())))
        });


        context.elementElements[i].flatBack.transformFrom(function() {
          return Transform.multiply(Transform.translate(flatX.get(),flatY.get(),flatZTransitionable.get()), Transform.multiply(Transform.rotateY(flatYTransitionable.get()), Transform.rotateX(flatXTransitionable.get())))
        });

        var transition = {
          method: 'tween',
          duration: 1500,
          curve: 'easeOut'
        };

        context.elementElements[i].position.setTransform(context.elementElements[i].original, {
          duration: 1500,
          curve: 'easeOut'
        });
        context.elementElements[i].positionBack.setTransform(context.elementElements[i].original, {
          duration: 1500,
          curve: 'easeOut'
        });

        flatYTransitionable.set(context.yTransitionable.get(), transition);
        flatXTransitionable.set(context.xTransitionable.get(), transition);
        flatZTransitionable.set(context.zTransitionable.get(), transition);

        flatX.set(0, transition);
        flatY.set(0, transition);

        Timer.setTimeout(function() {
          context.elementElements[i].modifierChain.addModifier(context.elementElements[i].table);
          context.elementElements[i].modifierChain.removeModifier(context.elementElements[i].flat);

          context.elementElements[i].modifierBackChain.addModifier(context.elementElements[i].tableBack);
          context.elementElements[i].modifierBackChain.removeModifier(context.elementElements[i].flatBack);
        }.bind(this), 1500);
      }

    }



    function _setPlaneListener() {
      this.on('planeChanged', function(genericPosition) {
        this.yTransitionable.set(genericPosition[0]/150);
        this.xTransitionable.set(-genericPosition[1]/150);
      });

      this.on('planeZChanged', function(scroll) {
        this.zTransitionable.set(scroll);
      });
    }

    function _setPageButtons() {
      var context = this;

      var surface = new Surface({
        size: [true, true],
        content: 'ANIMATE',
        properties: {
          color: 'white',
          fontFamily: 'Roboto, sans-serif',
          fontWeight: 100,
        }
      });

      surface.on('click', function() {
        elementAnimation(context);
      }.bind(this));

      this.add(surface);
    }

    function elementAnimation(context) {
      for (var i = 0; i < 500; i ++) {

        var elementRandom = Math.floor((Math.random()) * 118);
        console.log(context.elementElements[elementRandom].original);


        var zDepth = Math.floor(Math.random()*2000) + 1;
        zDepth *= Math.floor(Math.random()*2) == 1 ? 1 : -1;

        var xRandom = Math.floor(Math.random()*context.tableWidth) + 1;
        xRandom *= Math.floor(Math.random()*2) == 1 ? 1 : -1;

        var yRandom = Math.floor(Math.random()*context.tableHeight) + 1;
        yRandom *= Math.floor(Math.random()*2) == 1 ? 1 : -1;

        var depthDuration = Math.floor((Math.random() * 3000) + 2000);



        context.elementElements[elementRandom].position.setTransform(Transform.translate(xRandom,yRandom,zDepth), {
          duration: depthDuration,
          curve: 'easeOut'
          });
        context.elementElements[elementRandom].positionBack.setTransform(Transform.translate(xRandom,yRandom,zDepth), {
          duration: depthDuration,
          curve: 'easeOut'
          });

      }
    }










    module.exports = TestView;
});
