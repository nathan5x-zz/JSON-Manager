'use strict';

var Backbone = require('backbone'),
    JSONViewModel = require('../models/JSONViewModel');

/**
 * Creates a collection with JSONViewModel
 *
 * Examples:
 *
 *     var myCollection = require('collection');
 *
 * @module collections/collection
 */

module.exports = Backbone.Collection.extend({
    model: JSONViewModel
});
