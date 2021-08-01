/**
 * Copyright (c) 2013 Web.com Group, Inc. All Rights Reserved.
 * 
 * This is an unpublished work protected by Web.com Group, Inc. as a trade
 * secret, and is not to be used or disclosed except as expressly provided in a
 * written license agreement executed by you and Web.com Group, Inc.
 * 
 * @author David Dalcu
 * @classDescription This file is the main module of neo, shared between the builder and published websites
 */

{
  var webcomApp;
  var neo = webcom.namespace("neo");
  if(typeof builderSettings != 'undefined'){
    if (builderSettings.isBuilder) { //Todo, replace this with something like, isEditMode
        //Builder mode, we load all needed modules
        webcomApp = angular.module("webcomApp", ['kendo.directives', 'neoPublishModalModule', 'neoSiteBackupModalModule', 'ui.sortable', 'colorpicker.module']).config(function($sceProvider) {
          $sceProvider.enabled(false);
        }).controller("NeoMainController", function($scope){
          $scope.isActiveView = function(viewId) {
            return neo.activeView.id == viewId;
          }
        });
    } else {
      //Published page mode, we load no modules
      webcomApp = angular.module("webcomApp", ['kendo.directives']);   	
    }
  } else {
    //Published page mode, we load no modules
    webcomApp = angular.module("webcomApp", ['kendo.directives']);
  }
  
  webcomApp.plugins = [],
  webcomApp.registerPlugin = function(pluginClass) {
    webcomApp.plugins.push(pluginClass);
  },
  webcomApp.enableAllPlugins = function() {
    var pluginsInfo = "";
    for(var i=0;i<webcomApp.plugins.length;i++) {
      var plugin = webcomApp.plugins[i];
      if (typeof plugin.enableAllElements === 'function') {
        plugin.enableAllElements();
        pluginsInfo += plugin.name + ", ";
      }
    }
    //console.log('webcomApp.js, Enabled Plugins : ', pluginsInfo);
  },
  webcomApp.enableByElement = function($el) {
    console.log('Enable Plugin By Element', $el);
    for(var i=0;i<webcomApp.plugins.length;i++) {
      var plugin = webcomApp.plugins[i];
      if (typeof plugin.enableAllElements === 'function' && $el.hasClass(plugin.cssClass)) {
        plugin.enableElement($el);
        return;
      }
    }
  }
  
  $(document).ready(function(){
    if(typeof builderSettings != 'undefined'){
      if(!builderSettings.isBuilder) {
        webcomApp.enableAllPlugins();
      }
    }else{
      webcomApp.enableAllPlugins();
    }
  });
}
