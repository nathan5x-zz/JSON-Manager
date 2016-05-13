'use strict';

/**
 * Basic dependency module import.
 * Importing templates.json and underscore.
 */
var templates = require('../templates.json'),
    _ = require('underscore');

/**
 * Template interpolate settings to support Mustaché based templates if any.
 */
_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

/**
 * Creates a TemplateManager for accessing all the templates required for the app
 *
 * Example Usage:
 *
 *     var templateManager = require('./templateManager');
 *     var $viewX = templateManager.mainViewTemplate();
 *
 * @module module/templateManager
 */
module.exports = (function(){
    return {
      mainViewTemplate: _.template(templates.mainViewTemplate)
    };
}());
