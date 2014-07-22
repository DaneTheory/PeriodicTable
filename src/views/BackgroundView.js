define(function(require, exports, module) {
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');

    var PeriodicTable = require('views/PeriodicTable');
    var ElementData = require('data/ElementData');

    function BackgroundView() {
        View.apply(this, arguments);

        _createBackground.call(this);
        _createPeriodicTable.call(this);
    }

    BackgroundView.prototype = Object.create(View.prototype);
    BackgroundView.prototype.constructor = BackgroundView;

    BackgroundView.DEFAULT_OPTIONS = {};


    function _createBackground() {
      var backgroundSurface = new Surface({
        size: [undefined, undefined],
        properties: {
          backgroundColor: '#333'
        }
      });

      this.add(backgroundSurface);
    }

    function _createPeriodicTable() {
      var periodicTable = new PeriodicTable({ elementData: ElementData });
      this.add(PeriodicTable);
    }

    module.exports = BackgroundView;
});
