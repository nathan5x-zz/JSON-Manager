'use strict';

/**
 * Basic dependency module import.
 * Importing jQuery and backbone.
 */
var $ = require('jquery');
var Backbone = require('backbone');

/**
 * Assigning jQuery reference for performing jQuery operations inside Backbone objects
 */
Backbone.$ = $;

/**
 * Custom dependency module import for GameView
 * Importing custom modules.
 */
var MainViewModel = require('./models/MainViewModel');
var MainView = require('./views/module/main');

/**
 * Creates the main view model for rendering Main View with this model object
 */
var mainViewModel = new MainViewModel({

});

var currentView = null;

/**
 * Global DOM 'wrapper' for inserting all the DOM elementts
 */
var $wrapper = $('.wrapper');

/**
 * Creates Backbone Router for initial main view rendering and deep linking with History API
 *
 * Example Usage:
 *
 *     var Router = require('./router'),
 *         router = new Router();
 *
 * @module app/router
 */
module.exports = Backbone.Router.extend({
    /**
     *   To set the default URL matching patterns
     *
     *   @property routes
     *
    **/
    routes: {
        '': 'default',
        'index': 'default'
    },
    /**
     * Initialize the default setting and starts the History
     *
     * @method initialize
     *
     * @return {undefined}
     **/
    initialize: function() {
        Backbone.history.start();
    },
    /**
     * Creates and assigns the default view
     *
     * @method initialize
     *
     * @return {undefined}
     **/
    default: function() {
        if (currentView) {
          currentView.dispose();
        }

        currentView = new MainView({model: mainViewModel });
        $wrapper.append(currentView.render().el);
        enableTreeInteraction();
    }
});

/** Helper method to enable tree expand and collapse **/
function enableTreeInteraction() {
  $('.jn-json-tree li:has(ul)').addClass('parent-list').find(' > span').attr('title', 'Collapse');

  $('.jn-json-tree li.parent-list > span.data-item').on('click', function(e) {
      var children = $(this).parent('li.parent-list').find(' > ul > li');
      if (children.is(":visible")) {
        children.hide('fast');
        $(this).attr('title', 'Expand').find(' > i').addClass('glyphicon-plus-sign').removeClass('glyphicon-minus-sign');
      } else {
        children.show('fast');
        $(this).attr('title', 'Collapse').find(' > i').addClass('glyphicon-minus-sign').removeClass('glyphicon-plus-sign');
      }
      e.stopPropagation();
  });
}
