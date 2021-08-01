/**
 * Copyright (c) 2013 Web.com Group, Inc. All Rights Reserved.
 * 
 * This is an unpublished work protected by Web.com Group, Inc. as a trade secret, and is not to be used or disclosed except as expressly provided in a written license agreement executed by you and
 * Web.com Group, Inc.
 * 
 * @author Fernando Gabrieli
 */

var GooglePlus = {
  STATE_INITIALIZING : 1,
  STATE_INITIALIZED : 2,
  callbacks : [],
  /**
   * Initialize GooglePlus API asynchronously.
   * 
   * @param {Object}
   *            options - windowOnLoad: boolean if true it will load the API after the page has been completely rendered.
   */
  initialize : function(options) {
    if (typeof GooglePlus.state == 'undefined') {
      GooglePlus.state = GooglePlus.STATE_INITIALIZING;

      var initializeLib = function() {
        window.___gcfg = {
          parsetags : 'explicit'
        };

        window.onLoadGooglePlus = function() {
          GooglePlus.state = GooglePlus.STATE_INITIALIZED;

          $.each(GooglePlus.callbacks, function(i, callback) {
            callback();
          });

          // We don't need the callbacks anymore.
          GooglePlus.callbacks = [];
        };

        (function() {
          var po = document.createElement('script');
          po.type = 'text/javascript';
          po.async = true;
          po.src = '//apis.google.com/js/plusone.js?onload=onLoadGooglePlus';
          var s = document.getElementsByTagName('script')[0];
          s.parentNode.insertBefore(po, s);
        })();
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
   * All callbacks registered with ready will fire when the API is loaded.
   * 
   * @param {Function
   *            Object} callback
   */
  ready : function(callback) {
    var addCallback = false;

    if (typeof GooglePlus.state != 'undefined') {
      if (GooglePlus.state == GooglePlus.STATE_INITIALIZING) {
        addCallback = true;
      } else if (GooglePlus.state == GooglePlus.STATE_INITIALIZED) {
        callback();
      }
    } else {
      addCallback = true;
    }

    if (addCallback == true) {
      GooglePlus.callbacks.push(callback);
    }
  },
  /**
   * Render the social buttons.
   * 
   * @param {String}
   *            either 'plus' or 'plusone'.
   * @param {DOM
   *            Element} optional button container (please note that it is always the container, not the element itself)
   */
  go : function(api, element) {
    GooglePlus.ready(function() {
      (typeof element != 'undefined' ? gapi[api].go(element) : gapi[api].go());
    });
  }
};