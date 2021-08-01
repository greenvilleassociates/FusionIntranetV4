/**
 * Copyright (c) 2013 Web.com Group, Inc. All Rights Reserved.
 * 
 * This is an unpublished work protected by Web.com Group, Inc. as a trade secret, and is not to be used or disclosed except as expressly provided in a written license agreement executed by you and
 * Web.com Group, Inc.
 * 
 * @author Fernando Gabrieli
 */

var FacebookSdk = {
  STATE_INITIALIZING : 1,
  STATE_INITIALIZED : 2,
  callbacks : [],
  /**
   * Initialize the Facebook SDK asynchronously.
   * 
   * @param {Object} options
   *    - windowOnLoad: boolean if true it will load the sdk after the page has been completely rendered.
   */
  initialize : function(options) {
    if (typeof FacebookSdk.state == 'undefined') {
      FacebookSdk.state = FacebookSdk.STATE_INITIALIZING;

      var initializeLib = function() {
        $('<div id="fb-root">').prependTo('body');

        window.fbAsyncInit = function() {
          FacebookSdk.state = FacebookSdk.STATE_INITIALIZED;

          $.each(FacebookSdk.callbacks, function(i, callback) {
            callback();
          });
          
          // We don't need the callbacks anymore.
          FacebookSdk.callbacks = [];
        };

        (function(d, s, id) {
          var js, fjs = d.getElementsByTagName(s)[0];
          if (d.getElementById(id))
            return;
          js = d.createElement(s);
          js.id = id;
          js.async = true;
          js.src = "//connect.facebook.net/en_US/all.js#xfbml=1";
          fjs.parentNode.insertBefore(js, fjs);
        }(document, "script", "facebook-jssdk"));
      };

      // By default load on $(document).ready()
      var loadWhenDocumentIsReady = true;

      if (typeof options != 'undefined') {
        if (typeof options.windowOnLoad != 'undefined') {
          if (options.windowOnLoad == true) {
            loadWhenDocumentIsReady = false;
            
            if (document.readyState == 'complete') {
              initializeLib();
            } else {
              $(window).bind('load', function() {
                initializeLib();
              });
            }
          }
        }
      }

      if (loadWhenDocumentIsReady == true) {
        $(document).ready(function() {
          initializeLib();
        });
      }
    }
  },
  /**
   * All callbacks registered with ready will fire when the SDK is loaded.
   * 
   * @param {Function
   *            Object} callback
   */
  ready : function(callback) {
    var addCallback = false;

    if (typeof FacebookSdk.state != 'undefined') {
      if (FacebookSdk.state == FacebookSdk.STATE_INITIALIZING) {
        addCallback = true;
      } else if (FacebookSdk.state == FacebookSdk.STATE_INITIALIZED) {
        callback();
      }
    } else {
      addCallback = true;
    }

    if (addCallback == true) {
      FacebookSdk.callbacks.push(callback);
    }
  },
  /**
   * Wrapper to FB.XFBML.parse() which ensures the Sdk has been loaded before.
   * 
   * @param {DOM Element} optional element to parse or empty to parse the entire document.
   */
  parse : function(element) {
    FacebookSdk.ready(function() {
      (typeof element != 'undefined') ? FB.XFBML.parse(element) : FB.XFBML.parse();
    });
  }
};
