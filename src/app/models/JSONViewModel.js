'use strict';

var Backbone = require('backbone');

/**
 * Creates a JSONViewModel for rendering JSON View
 * It holds the JSON Tree Structure with Editing Capabilities
 *
 *
 * @module models/JSONViewModel
 */

module.exports = Backbone.Model.extend({
    defaults: {
      json: {}
    }
});
