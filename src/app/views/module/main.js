'use strict';

/**
 * Basic dependency module import.
 * Importing underscore.
 */
var _  = require('underscore');

/**
 * Custom dependency module import for MainView
 * Importing custom modules.
 */
var templateManager = require('./templateManager');
var source = require('../source.json');
var BaseView = require('../_extend/baseView');
var JSONVEditorView = require('./json-editor');
var JSONViewModel = require('../../models/JSONViewModel');

/**
 * Creates a Main JSON view with all the interactive functionality.
 *
 * Example Usage:
 *
 *     var mainView = new MainView({model: mainViewModel});
 *     mainView.render().el // Returns the HTML element of Main View
 *
 * @module module/main
 */
module.exports = BaseView.extend({
    /**
     *   css class name for the main view element.
     *
     *   @property className
     *
    **/
    className: 'module',
    /**
     *   Declaring events for main view
     *
     *   @property events
     *
    **/
    events: {

    },
    /**
     *   HTML Template for main view rendering
     *
     *   @property template
     *
    **/
    template: templateManager.mainViewTemplate,
    /**
     * Initialize the default setting and evend biding.
     * It binds all the View methods to current main view (this)
     *
     * @method initialize
     *
     * @param {Object} options JS object to initial settings.
     * @return {undefined}
     **/
    initialize: function(options) {
        this.on("jsonUpdated", this.generateAndShowJSON);
    },
    /**
     * Renders the main view UI based on the
     *
     * @method render
     *
     * @return {Object} this Returns the view object with all the functionalities.
     **/
    render: function() {
      var jsonEditorViewModel = new JSONViewModel({
          json: source
      });

      this.editorView = new JSONVEditorView({model: jsonEditorViewModel, parent: this});
      this.$el.html(this.template());
      this.$el.find('#jsonEditorSection').append(this.editorView.render().el);
      return this;
    },
    /**
     * Generates JSON output
     *
     * @method generateAndShowJSON
     *
     * @return {undefined}
     **/
    generateAndShowJSON: function(data){
      console.log(jsonFormatter.plain(data));
    }
});
