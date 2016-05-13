'use strict';

/**
* Basic dependency module import.
* Importing jQuery and underscore.
*/
var $             = require('jquery');
var _             = require('underscore');
var jsonMarkupGen = require('json-markup');
var jsonFormatter = require('format-json');

/**
* Custom dependency module import for JSON Editor View
* Importing custom modules.
*/
var BaseView        = require('../_extend/baseView');
var templateManager = require('./templateManager');

/**
* Creates a JSON Editor view with all the interactive functionality.
*
* Example Usage:
*
*     var jsonEditorView = new JSONEditorView({model: jsonViewModel});
*     jsonEditorView.render().el // Returns the HTML element of JSON Editor View
*
* @module module/json-editor
*/
module.exports = BaseView.extend({
  /**
  *   'id' attribute for the JSON View Element
  *
  *   @property id
  *
  **/
  id: 'jsonEditor',
  /**
  *   css class name for the JSON view element.
  *
  *   @property className
  *
  **/
  className: 'jn-json-tree active',
  /**
  *   Declaring events for JSON View
  *
  *   @property events
  *
  **/
  events: {

  },
  /**
  * Initialize the default setting and evend biding.
  *
  * @method initialize
  *
  * @param {Object} options JS object to initial settings.
  * @return {undefined}
  **/
  initialize: function(options) {
      _.bindAll(this, "constructJSONView");
      _.bindAll(this, "addEditingOptions");
      _.bindAll(this, "activateEditableField");
      _.bindAll(this, "deactivateEditableField");
      _.bindAll(this, "addNewData");
      _.bindAll(this, "updateNewJSONData");
      _.bindAll(this, "updateJSONData");
      _.bindAll(this, "render");
      this.parent = options.parent;
      this.model.on("change", this.render);
  },
  /**
  * Holds all the helper elements and properties
  *
  * @property helpers
  *
  **/
  helpers: {
    $parentDom : $("<ul> </ul>"),
    $newElementsContainer: {},
    $currentEditableElement: {},
    $processingElement: {},
    processingPath: "",
    arrayChildCount: 0,
    nameText: ""
  },
  /**
  * Renders the JSON Editor view with tree structure and editing capabilities.
  *
  * @method render
  *
  * @return {Object} this Returns the view object with all the functionalities.
  **/
  render: function() {
    this.$el.prepend(this.helpers.$parentDom);
    this.constructJSONView(this.model.get('json'), this.$el, this.helpers.$parentDom);
    return this;
  },
  /**
  * Construct the JSON View with the default setting and evend biding.
  * It recursively parses the entire JSON data and generates the Tree view
  * with type and path data set properties.
  *
  * @method constructJSONView
  *
  * @param {Object} data JS object to render initial JSON Editor view
  * @param {jQuery_Object} $el JS object to access root element.
  * @param {jQuery_Object} parentDom jQuery object to access previous added element.
  *
  * @return {undefined}
  **/
  constructJSONView: function(data, $el, $parentDom) {

      /* Parse the data objectr recursively to construct JSON Editor View
       * Generates the DOM elements based on the data
       */
      for (var key in data) {
        var _currentObj = data[key];

        /** Data type while parsing JSON data */
        var _dataType = $.type(_currentObj);
        var _path = "";
        var $li = {};

        if(!$.isEmptyObject($parentDom.data())) {
          _path = $parentDom.data('path');
        }

        /** Creates the path while parsing the JSON Data */
        _path = _path +":" + key;

        /** Creates a DOM Elements based on the type of the
          * JSON Data. Different types create certain DOM elements
          */
        switch (_dataType) {
          case "string":
          case "number":
              $li = $("<li data-type='string' data-path='"+ _path +"'> </li>");
              $li.text(key+": ");

              /** Adding input field for editing capabilities */
              var $editableField = $("<input type='text' class='val-noneditable' value='"+ _currentObj.toString()+"' disabled='disabled'>");
                  $editableField.css('width', _currentObj.toString().length * 8 + 'px');
                  $li.append($editableField);
                  this.addEditingOptions($li);
                  $parentDom.append($li);
          break;

          case "array":
              var arrayDataLen = _currentObj.length;

              var $arrayDOM = $("<li data-type='array' data-path='"+ _path +"'> - array &#91; &#93;</li>");
                  $arrayDOM.prepend("<span class='data-item'><i class='glyphicon glyphicon-minus-sign'></i>  "+ key + "</span>");

              var $arrayDataDOM = $("<ul> </ul>");
                  this.addEditingOptions($arrayDOM);

              for(var i=0;i<arrayDataLen;i++){
                    var arrayDataValue = _currentObj[i].toString();
                        $li = $("<li data-type='array-item'> </li>");
                        $li.text(i+" : ");

                    /** Adding input field for editing capabilities */
                    var $editableField = $("<input type='text' class='val-noneditable' value='"+ arrayDataValue+"' disabled='disabled'>");
                        $editableField.css('width', arrayDataValue.length * 8 + 'px');
                        $li.append($editableField);

                    this.addEditingOptions($li);
                    $arrayDataDOM.append($li);
              }

              $arrayDOM.append($arrayDataDOM);
              $parentDom.append($arrayDOM);
          break;

          case "object":
              var $objectDOM = $("<ul data-path='"+ _path +"'> </ul>");
                  $li = $("<li data-type='object' data-path='"+ _path +"'> - object &#123; &#125; </li>");

                  $li.prepend("<span class='data-item'><i class='glyphicon glyphicon-minus-sign'></i>  "+ key + "</span>");

                  this.addEditingOptions($li);
                  $li.append($objectDOM);
                  $parentDom.append($li);

                  /** Performs recursive calling incase of an 'object' type in order to create sub properties*/
                  this.constructJSONView(_currentObj, $el, $objectDOM);
          break;
        }
      }
  },
  /**
  * Creates Editing Options - like Add, Edit, Delete buttons.
  *
  * @method addEditingOptions
  *
  * @param {jQuery_Object} $dom jQuery object to add editing options
  *
  * @return {undefined}
  **/
  addEditingOptions: function($dom) {

    var _editor = this;
    var type = $dom.data('type');

    /* Creates jQuery referenes for editing buttons*/
    var addBtn = $("<button type='button' class='btn btn-default'></button>").append($("<i> </i>").addClass("glyphicon glyphicon-plus-sign"));
  	var deleteBtn = $("<button type='button' class='btn btn-default'></button>").append($("<i> </i>").addClass("glyphicon glyphicon-remove-sign"));
    var editBtn = $("<button type='button' class='btn btn-default'></button>").append($("<i> </i>").addClass("glyphicon glyphicon-edit"));

    /* Add event handler to perform add operations*/
    addBtn.click(function(e){
        _editor.deactivateEditableField();
        _editor.helpers.$processingElement = $(this).parent().closest('li');

        /** To avoid editing other elements while editing / adding is already in place */
        _editor.$el.removeClass('active');
        _editor.addNewData();
    });

    /* Delete event handdler to perform delete operations */
    deleteBtn.click(function(e){
    		_editor.deactivateEditableField();

        /* Acquiring JSON paths based on data type (different DOM element structure)*/
        switch(type) {
          case "string":
              _editor.helpers.processingPath = $(this).parent().closest("li").data('path');
              break;
          case "object":
          case "array":
          case "array-item":
              _editor.helpers.processingPath = $(this).parent().closest(".parent-list").data('path');
              break;
        }

        /* Create processingElement - the DOM element to be removed upon deletion*/
        _editor.helpers.$processingElement = $(this).parent().closest('li');

        var arrayItemIdex = 0;

        if(type === "array-item") {
          var $liItem = $(this).parent().closest('li');

          /* Find an index of the array item (LI) element with respect to its parent */
              arrayItemIdex =  $liItem.parent().find("li").index($liItem);
        }

        _editor.deleteJSONData(type, arrayItemIdex);

        _editor.helpers.$processingElement.remove();
        _editor.helpers.$processingElement = {};
    });

  	/* Edit event handdler to perform Edit operations */
    editBtn.click(function(e){

        _editor.deactivateEditableField();
        _editor.$el.removeClass('active');

        /* Acquiring JSON path based on data type (different DOM element structure)*/
        if(type === 'string') {
            _editor.helpers.processingPath = $(this).parent().closest("li").data('path');
        } else {
            _editor.helpers.processingPath = $(this).parent().closest(".parent-list").data('path');
        }

        /* Create $currentEditableElement - the DOM element to be edited for updation*/
        _editor.helpers.$currentEditableElement = $(this).parent().closest("li").find("input[type='text']");
        _editor.helpers.nameText = $(this).parent().closest("li").text();
        _editor.activateEditableField();

        _editor.helpers.$currentEditableElement.keydown(function(e){
            /* Update Json data if  Enter or Return key is pressed */
          	if(e.keyCode === 13) {
            	$(this).removeClass('val-editable');
  	          $(this).prop('disabled', true);

              var _value = $(this).val();
                  _editor.updateJSONData(_editor.helpers.nameText, _value, type);

              _editor.$el.addClass('active');
            }
        });

        _editor.helpers.$currentEditableElement.focusout(function(e){
          	$(this).removeClass('val-editable');
	          $(this).prop('disabled', true);
            _editor.$el.addClass('active');
        });
    });

    var btnGroup = $("<div class='btn-group pull-right'> </div>");

    /* Add editing options according to the data type. */
    switch(type) {
      case "string":
      case "array-item":
          btnGroup.append(editBtn);
          btnGroup.append(deleteBtn);
          break;

      case "object":
          btnGroup.append(addBtn);
          btnGroup.append(deleteBtn);
          break;

      case "array":
          btnGroup.append(addBtn);
          btnGroup.append(deleteBtn);
          break;
    }

    $dom.append(btnGroup);
    return;
  },
  /**
  * Deactivates editable field when necessary
  *
  * @method deactivateEditableField
  *
  * @return {undefined}
  **/
  deactivateEditableField: function() {
      if(!$.isPlainObject(this.helpers.$currentEditableElement)) {
          this.helpers.$currentEditableElement.removeClass('val-editable');
          this.helpers.$currentEditableElement.prop('disabled', true);
      }
  },
  /**
  * Activates editable field when necessary
  *
  * @method activateEditableField
  *
  * @return {undefined}
  **/
  activateEditableField: function(){
      if(!$.isPlainObject(this.helpers.$currentEditableElement)) {
          this.helpers.$currentEditableElement.addClass('val-editable');
          this.helpers.$currentEditableElement.prop('disabled', false);
         // this.helpers.$currentEditableElement.css('width', this.helpers.$currentEditableElement.val().length * 8 +'px');
      }
  },
  /**
  * Add DOM elements to provide creation functionality
  *
  * @method addNewData
  *
  * @return {undefined}
  **/
  addNewData: function() {

      var _editor = this;
    	var _dataType = this.helpers.$processingElement.data('type');

      this.helpers.processingPath = this.helpers.$processingElement.data('path');
     	this.helpers.$newElementsContainer = $("<li data-type='string' data-path=''> </li>");

      var $nameField = $("<input type='text' id='name-field' placeholder='name'></input>");
      var $valueField = $("<input type='text' id='value-field' placeholder='value'></input>");

      /* Save and Cancel button to enable updating JSON */
      var $saveButton = $("<button type='button' class='btn btn-default btn-save'></button>").append($("<i> </i>").addClass("glyphicon glyphicon-ok-sign"));
      var $cancelButton = $("<button type='button' class='btn btn-default btn-cancel'></button>").append($("<i> </i>").addClass("glyphicon glyphicon-remove-sign"));

      /* Acquire the existing child count to index the array element */
      if(_dataType === 'array') {
      	 this.helpers.arrayChildCount = _editor.helpers.$processingElement.find('> ul > li').length;
     	   this.helpers.$newElementsContainer.text(_editor.helpers.arrayChildCount + " : ");
      } else {
      	 this.helpers.$newElementsContainer.text(" : ");
         this.helpers.$newElementsContainer.prepend($nameField);
      }

      this.helpers.$newElementsContainer.append($valueField);
      this.helpers.$newElementsContainer.append($saveButton);
      this.helpers.$newElementsContainer.append($cancelButton);

      if(_dataType === 'array') {
          this.helpers.$processingElement.find('> ul').append(_editor.helpers.$newElementsContainer);
      } else {
          this.helpers.$processingElement.find('> ul').prepend(_editor.helpers.$newElementsContainer);
      }

      /* Save button click handler to perform commit operations on JSON data based on new values */
      $saveButton.click(function(){
          var _name;
          var _dataType = _editor.helpers.$processingElement.data('type');
          var _value = _editor.helpers.$newElementsContainer.find('#value-field').val();

          if(_dataType === 'array') {
          		_name = _editor.helpers.arrayChildCount;
          } else {
          		_name = _editor.helpers.$newElementsContainer.find('#name-field').val();
          }

          /* Do not perform save operations of any one of the values are empty*/
        	if(_name.length === 0 || _value.length === 0) {
          		window.alert("Can't add empty name / value property.");
              return;
          }

        	var $li = $("<li data-type='string' data-path=''> </li>");
  				    $li.text(_name+": ");

          var $editableField = $("<input type='text' class='val-noneditable' value='"+_value+"' disabled='disabled'>");
              $li.append($editableField);

              /* Add the editing options of newly created elements*/
              _editor.addEditingOptions($li);

              _editor.helpers.$newElementsContainer.remove();
              _editor.helpers.$newElementsContainer = {};

            if(_dataType === 'object') {
                _editor.helpers.$processingElement.find('> ul').prepend($li);
            } else {
            	 _editor.helpers.$processingElement.find('> ul').append($li);
            }

            _editor.updateNewJSONData(_name, _value, _dataType);
            _editor.$el.addClass('active');
      });

      /* Cancel button click handler to perform DOM removal */
      $cancelButton.click(function(){
      	_editor.helpers.$newElementsContainer.remove();
        _editor.$el.addClass('active');
      });
  },
  /**
  * Creates new data object on the JSON model
  *
  * @method updateNewJSONData
  *
  * @param {String} name property name on the JSON data
  * @param {String} value value of the JSON data object
  * @param {String} type type of the data to be added
  *
  * @return {undefined}
  **/
  updateNewJSONData: function(name, value, type){
      var jsonPath = this.helpers.processingPath.replace(new RegExp(":", 'g'), ".");

      /*  Data object to be updated */
      var targetJSON = eval("this.model.get('json')" + jsonPath);

      if(type === "object") {
        targetJSON[name] = value;
      } else {
        targetJSON.push(value);
      }

      this.parent.trigger("jsonUpdated");

      /*  Renders the JSON Viewer with newly created JSON structure */
      this.parent.$el.find("#jsonViewerSection > div").html(jsonMarkupGen(this.model.get('json')));

      /*  Adds the resulted JSON model to download option */
      this.addToDownload();
  },
  /**
  * Updates an existing data object on the JSON model
  *
  * @method updateJSONData
  *
  * @param {String} name property name on the JSON data
  * @param {String} value value of the JSON data object
  * @param {String} type type of the data to be added
  *
  * @return {undefined}
  **/
  updateJSONData: function(name, value, type){
     var jsonPath = this.helpers.processingPath.split(":");
     jsonPath.shift();

     if(type === 'string') {
        jsonPath.pop();
     }

     jsonPath = jsonPath.join(".");

     /*  Data object to be updated */
     var targetJSON;

     if($.isEmptyObject(jsonPath)) {
        /* In case of root object or empty object*/
        targetJSON = this.model.get('json');
     } else {
        targetJSON = eval("this.model.get('json')." + jsonPath);
     }

     name = name.replace(/ /g,"");
     name = name.substring(0, name.length - 1);

     targetJSON[name] = value;
     this.parent.trigger("jsonUpdated");

     /*  Renders the JSON Viewer with newly created JSON structure */
     this.parent.$el.find("#jsonViewerSection > div").html(jsonMarkupGen(this.model.get('json')));

     /*  Adds the resulted JSON model to download option */
     this.addToDownload();
   },
   /**
   * Construct the JSON View with the default setting and evend biding.
   *
   * @method deleteJSONData
   *
   * @param {String} type Type of the data object to be deleted
   * @param {Number} index Index of the array element to be deleted
   * @return {undefined}
   **/
   deleteJSONData :function(type, index){
      var jsonPath = this.helpers.processingPath.replace(new RegExp(":", 'g'), ".");

      /*  Array item has to be deleted differently */
      if(type !== "array-item") {
          eval("delete this.model.get('json')" + jsonPath);
      } else {
          eval("delete this.model.get('json')" + jsonPath+".splice("+index+", 1)");
      }
      this.parent.trigger("jsonUpdated");

      /*  Renders the JSON Viewer with newly created JSON structure */
      this.parent.$el.find("#jsonViewerSection > div").html(jsonMarkupGen(this.model.get('json')));

      /*  Adds the resulted JSON model to download option */
      this.addToDownload();
    },
    /**
    * Updates the Anchor link MIME data with newly created JSON structure
    *
    * @method addToDownload
    *
    * @return {undefined}
    **/
    addToDownload: function(){
      /*  Adds the resulted JSON model to download option */
      var data = "data:text/json;charset=utf-8," + encodeURIComponent(jsonFormatter.plain(this.model.get('json')));

      this.parent.$el.find("#downloadButton").attr("href",data);
    }

});
