define(function(require, exports, module) {
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Modifier      = require('famous/core/Modifier');

    var d3            = require('http://d3js.org/d3.v3.min.js')

    function d3Integration() {
        View.apply(this, arguments);

        _createSurface.call(this);

    }

    d3Integration.prototype = Object.create(View.prototype);
    d3Integration.prototype.constructor = d3Integration;

    d3Integration.DEFAULT_OPTIONS = {};


    function _createSurface() {


      var contentTemplate = function() {
        return "<div class=\'svg\'></div>";
      };

      var surface = new Surface({
        size: [500,500*1.25],
        content: contentTemplate(),
        properties: {
          backgroundColor: 'rgba(242, 94, 94, 0.95)',
          color: 'white',
          textAlign: 'center'
        }
      });

      surface.addClass('surface');

      var modifier = new Modifier({
        origin: [0.5,0.5],
        align: [0.5,0.5]
      });

      surface.on('click', function(){
        addSvg();
      }.bind(this));

      this.add(modifier).add(surface);
    }

    function addSvg() {
      var lanthanum = [2,	8, 18, 18,	9, 2];
      var lanthanumElectron = '1s22s22p63s23p63d104s24p64d105s25p65d16s2'
      var heighMulti = 10;
      var dividerHeight = 30;


      var width = 500;
      var height = width * 1.25;

      var svg = d3.select(".svg").append("svg").attr("width", width).attr("height", height);
      var newSVG = svg.selectAll("rect").data(lanthanum).enter().append("rect")
        .attr("x", function(d,i) {
        return (width*1.25) + i * dividerHeight;
      }).attr("y", function(d, i) {
        return -width/2 + (-d*heighMulti/2);
      }).attr("width", 20)
      .attr("height", function(d) {
        return 0;
      })
      .attr("fill", function(d) {
        return "rgb(0,"+(d*20)+","+(d*10)+")";
      })
      .attr("transform", "rotate(90 0 0) skewX(45)")
    .transition()
      .duration(1000)
      .ease(Math.sqrt)
      .attr("height", function(d) {
        return d * heighMulti;
      });


    }


    module.exports = d3Integration;
});
