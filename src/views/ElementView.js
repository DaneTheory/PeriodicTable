define(function(require, exports, module) {
    var engine        = require('famous/core/Engine');
    var View          = require('famous/core/View');
    var Surface       = require('famous/core/Surface');
    var Transform     = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Modifier      = require('famous/core/Modifier');

    function ElementView() {
        View.apply(this, arguments);





    }

    ElementView.prototype = Object.create(View.prototype);
    ElementView.prototype.constructor = ElementView;

    ElementView.DEFAULT_OPTIONS = {};





    module.exports = ElementView;
});
