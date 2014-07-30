define(function(require, exports, module) {
    var Engine        = require('famous/core/Engine');
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Modifier      = require('famous/core/Modifier');
    var RenderNode    = require('famous/core/RenderNode');


    function ElementView() {
        View.apply(this, arguments);

        var mainEngine = Engine.createContext();
        mainEngine.setPerspective(1000)


        var modifier = new Modifier({
            origin: [0.5,0.5],
            align: [0.5,0.5],
            transform: function() {
              return Transform.multiply(0,0,0), Transform.multiply(Transform.rotateY(this.options.tableYRotation), Transform.rotateX(this.options.tableXRotation))

            }.bind(this)
          });




          _createElement.call(this);








        var mainNode = mainEngine.add(modifier).add(_createElement());

        this.add(mainEngine);

    }

    ElementView.prototype = Object.create(View.prototype);
    ElementView.prototype.constructor = ElementView;

    ElementView.DEFAULT_OPTIONS = {
      tableSize: '',
      tableXRotation: '',
      tableYRotation: '',
      elementSize: '',
      elementXTranslate: '',
      elementYTranslate: ''
    };

    function _createElement() {
      var table = new RenderNode();


      var surface = new Surface({
        size: this.options.elementSize,
        properties: {
          backgrondColor: 'rgba(255, 255, 255, 0.62)'
        }
      });

      var elementModifier = new Modifier({
        transform: Transform.translate(this.options.elementXTranslate, this.options.elementYTranslate, 0)
      });
      table.add(elementModifier).add(surface);

      return table;


    }


    module.exports = ElementView;
});

// NEED!
//
// rotateSurface BY:
// XRotation of table
// YRotation of table
//
//
// X Translate of Element
// Y Translate of Element
