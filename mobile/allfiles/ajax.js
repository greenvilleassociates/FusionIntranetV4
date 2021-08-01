/**
 * Copyright (c) 2013 Web.com Group, Inc. All Rights Reserved.
 * 
 * This is an unpublished work protected by Web.com Group, Inc. as a trade secret, and is not to be used or disclosed except as expressly
 * provided in a written license agreement executed by you and Web.com Group, Inc.
 * 
 * @author Attila Mezei Horvati
 */
webcom.namespace("webcom.ajax");

webcom.ajax.WebService = function(options) {
  this.queue = {};
  if (options && !options.url) {
    throw "Invalid WebService. Please specify url!";
  }

  this.defaults = {
    url : '',
    contentType : "application/json",
    dataType : "json",
    actionType : "POST",
    ttl : 250,
    onSuccess : function() {
    },
    onError : function() {
    }
  };
  this.options = $.extend({}, this.defaults, options);
};

webcom.extend(webcom.ajax.WebService, {
  resetQueue : function() {
    return {
      content : '',
      timeout : 0,
      callbacks : []
    };
  },

  /**
   * 
   * @param id
   * @param content
   * @param callback
   * @returns
   */
  timedCall : function(id, content, callback) {
    var t = this;
    //console.log("Set timed call for page", id);
    if (!this.queue[id]) {
      this.queue[id] = t.resetQueue();
    } else {
      //console.log("clear timeout for", this.queue[id].timeout);
      clearTimeout(this.queue[id].timeout);
    }
    var timeout = setTimeout(function() {
      //console.log("time to execute", id, t.queue[id]);
      t.executeCall(id, t.queue[id]);
    }, t.options.ttl);
    this.queue[id].timeout = timeout;
    this.queue[id].content = content;
    this.queue[id].callbacks.push((typeof callback === "function") ? callback : function() { /* do nothing */
    });
  },

  /**
   * 
   */
  executeCall : function(id, callObject) {
    var t = this;
    function executeCallbacks(result) {
      //console.log('execute callbacks:', callObject);
      var queue = callObject.callbacks;
      var len = queue.length;
      //console.log('Queue length', len);
      for (var i = 0; i < len; i++) {
        //console.log(queue[i].toString());
        queue[i]({
          success : result
        });
      }
    }
    function clearQueue() {
      //console.log('clear queue for:', id, t.queue[id]);
      t.queue[id] = t.resetQueue();
      //console.log('cleaned queue for:', id, t.queue[id]);
    }

    // we just take the last element from the array and save it's content
    // as that is the latest and greatest
    var content = callObject.content;
    if (content) {
      if (typeof (typeof content === "function")) {
        var callParams = content(id);
        if (callParams.isExecuteCancelled) {
          console.log('no need to save:' + id);
          executeCallbacks(true);
          clearQueue();
          return;
        }
        content = callParams.content;
      }
    }
    console.log('save:' + id);

    $.ajax({
      url : t.options.url,
      cache : false,
      contentType : t.options.contentType,
      dataType : t.options.dataType,
      type : t.options.actionType,
      data : content,
      success : function(data) {
        // global handler
        t.options.onSuccess(data);
        executeCallbacks(true);
        clearQueue();
      },
      error : function(jqXHR, textStatus, errorThrown) {
        // global handler
        t.options.onError(jqXHR, textStatus, errorThrown);
        executeCallbacks(false);
        clearQueue();
      }
    });
  }
});
