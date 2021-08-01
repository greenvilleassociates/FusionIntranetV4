/**
 * Copyright (c) 2013 Web.com Group, Inc. All Rights Reserved.
 * 
 * This is an unpublished work protected by Web.com Group, Inc. as a trade
 * secret, and is not to be used or disclosed except as expressly provided in a
 * written license agreement executed by you and Web.com Group, Inc.
 * 
 * @author Attila Mezei Horvati
 */
webcom.namespace("webcom.log");

/**
 * Logger class
 * 
 * This is a decorator for the well known 'console' object from browsers. If
 * there is no console object defined such as older IE-s, it will just pop up
 * the messages in a JavaScript alert dialog. If there is console then this
 * logger will "decorate" the known console to group automatically messages
 * (http://getfirebug.com/logging) originating from the same method under the
 * method name. If the function is anonymous (closure) and a callerName is not
 * specified it will be printed without grouping.
 * 
 * How to use it:
 * 
 * Include log.js in your file and right after call the init method, like this:
 * 
 * <script type="text/javascript" src="http://.../assets/libs/web/1.0/log.js"></script>
 * <script type="text/javascript">webcom.log.Logger.init();</script>
 * 
 * Then in your code call the specific method: log, info, warn, error, trace
 * with the object you want to print to console and optionally a second argument
 * for the group name you want this to be included in.
 * 
 * console.info(logArg1, logArg2,...);
 * 
 * or
 * 
 * console.info("g_MyGroupName", logArg1, logArg2,...);
 * 
 * You can disable outputting to console/alert dialog by setting
 * webcom.log.Logger.IS_DEBUG_ENABLED = false;
 * 
 * You can disable overriding the console object by setting:
 * webcom.log.Logger.OVERWRITE_CONSOLE = false;
 * 
 * If you disable the overriding, you can call the logger as:
 * 
 * webcom.console.info(myObject);
 * 
 * You can only disable properties before calling the init method. You disable
 * properties like this:
 * 
 * <script type="text/javascript" src="http://.../assets/libs/web/1.0/log.js"></script>
 * <script type="text/javascript"> webcom.log.Logger.IS_DEBUG_ENABLED = false;
 * webcom.log.Logger.init(); </script>
 * 
 */
webcom.log.Logger = {
  IS_DEBUG_ENABLED : true,
  OVERWRITE_CONSOLE : true,
  caller : '',

  setupGroup : function(callee, callerName) {
    var cn = "";
    try {
      cn = (typeof callerName === "string" && callerName.length > 0) ? callerName
          : (callee && callee.caller && callee.caller.name) ? callee.caller.name
              : "";
    } catch (e) {
      // do nothing if accessing strict mode method. No way to find callee
      // unless it was specified.
    }
    try {
      if (cn != this.caller) {
        if (this.caller != '') {
          this.console.groupEnd();
        }
        if (cn != '') {
          this.caller = cn;
          this.console.group(this.caller);
        }
      }
    } catch (e) {
      // no group functionality available for this console
    }
  },

  setParams : function() {
    var args = {
      params : [],
      callerName : ''
    };
    var loggingArguments = arguments[0];
    var len = loggingArguments.length;
    for (var i = 0; i < len; i++) {
      args.params.push(loggingArguments[i]);
    }

    if (len > 1) {
      var fp = args.params[0];
      if (typeof fp === 'string' && /^g_/i.test(fp)) {
        args.callerName = args.params.shift().replace(/^g_/i,'');
      }
    }
    return args;
  },

  initDecoratedConsole : function() {
    var self = this;
    this.console = console;
    webcom.console = {
      log : function() {
        var args = self.setParams(arguments);
        self.setupGroup(arguments.callee, args['callerName']);
        self.console.log.apply(self.console, args['params']);
      },
      info : function() {
        var args = self.setParams(arguments);
        self.setupGroup(arguments.callee, args['callerName']);
        self.console.info.apply(self.console, args['params']);
      },
      debug : function() {
        var args = self.setParams(arguments);
        self.setupGroup(arguments.callee, args['callerName']);
        self.console.debug.apply(self.console, args['params']);
      },
      warn : function() {
        var args = self.setParams(arguments);
        self.setupGroup(arguments.callee, args['callerName']);
        self.console.warn(self.console, args['params']);
      },
      error : function() {
        var args = self.setParams(arguments);
        self.setupGroup(arguments.callee, args['callerName']);
        self.console.error(self.console, args['params']);
      },
      trace : function() {
        var args = self.setParams(arguments);
        self.setupGroup(arguments.callee, args['callerName']);
        self.console.trace.apply(self.console, args['params']);
      }
    }
  },

  initEmptyConsole : function() {
    var e = function(o) {
      return;
    }
    webcom.console = {
      log : e,
      info : e,
      debug : e,
      warn : e,
      error : e,
      trace : e
    }
  },

  initAlertConsole : function() {
    var a = function(str) {
      alert(str);
    }
    webcom.console = {
      log : a,
      info : a,
      debug : a,
      warn : a,
      error : a,
      trace : a
    };

  },

  init : function() {
    if (this.IS_DEBUG_ENABLED == true) {
      if (typeof console === 'undefined') {
        this.initAlertConsole();
      } else {
        this.initDecoratedConsole();
      }
    } else {
      this.initEmptyConsole();
    }

    if (this.OVERWRITE_CONSOLE) {
      console = webcom.console;
    }
  }
}
