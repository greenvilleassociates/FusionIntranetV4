// used to be in ResourceLoader, since we don't have that in Neo
// we need to handle this here
if( typeof(WebCom) == "undefined" ) {
  var WebCom = {};
}

function WebCom_Util_TemplateUtil() {

  /**
   * Expands the <code>values</code> keys until a primitive value is found. The
   * keys will have the following syntax
   *
   *  Object properties:
   *   topKey.subKey.subSubKey
   *   
   *  Array properties:
   *   topKey.length
   *   topKey[index].subKey
   *   topKey[index].subKey.subSubKey
   *   topKey[index].subKey.length
   *   topKey[index].subKey[index2].subSubKey
   *   topKey[index].subKey.subSubKey.length
   *   topKey[index].subKey.subSubKey[index2]
   *
   * @param value
   * @return expanded values hash
   */
  this.expandKeys = function(/*hash*/ values) {
    var hash = {};

    for (var paramName in values) {
      var value = values[paramName];
      var valueType = typeof(value);
      if ( value instanceof Array) {
        hash[paramName + ".length"] = value.length;
        for (var i=0; i < value.length; i++) {
          var subHash = this.expandKeys(value[i]);
          for (var pName in subHash) {
            hash[paramName + "[" + i + "]." + pName] = subHash[pName];
          }
        }
      } else if (valueType == 'object' && value != null) {
        var subHash = this.expandKeys(value);
        for (var pName in subHash) {
          hash[paramName + "." + pName] = subHash[pName];
        }
      } else if (valueType != 'function') {
        hash[paramName] = value;
      }
    }

    return hash;
  }

  /**
  * Formats <code>template</code> by replacing ${name} with the values from
  * <code>formattingValues</code>. If no corresponding value is found for
  * <i>name</i> then the original ${name} is preserved in the final output
  *
  * @param template the template source
  * @param formattingValues hash holding value for ${name} occurences
  * @param
  * @return formatted templated
  **/
  this.format = function (/*string*/ template, /*hash*/ formattingValues, /*boolean*/ preserveKeys) {
    if (template == null) return null;
    if (formattingValues == null) return template;

    if (!preserveKeys) {
      formattingValues = this.expandKeys(formattingValues);
    }

    for (var paramName in formattingValues) {
      var escapedName = paramName.replace(/\./g, "\\.");
      escapedName = escapedName.replace(/\[/g, "\\[");
      escapedName = escapedName.replace(/\]/g, "\]");

      var pattern = new RegExp('\\${' + escapedName + '}', "g");
      template = template.replace(pattern, formattingValues[paramName]);
    }

    // take care of escape sequences
    template = template.replace(/\\{/, "{");

    return template;
  }
}

// updated to use new webcom's namespace
WebCom.Util = webcom.namespace("WebCom.Util");
WebCom.Util.TemplateUtil = new WebCom_Util_TemplateUtil();

function Alpha_WebCom_Util_QueryString() {
  this.build = function(params) {
    var str = "";
    for (var param in params) {
      str += param + "=" + params[param] + "&";
    }

    return str;
  }
}
// do not expose yet. not ready ...
//WebCom.Util.QueryString = new WebCom_Util_QueryString();

function WebCom_Observable() {

	this.webcomEvents = {};

	this.on = function(/*String*/event, /*Function*/handler, /*Object*/scope) {
    this.webcomEvents[event] = this.webcomEvents[event] || [];
    var registeredHandlers = this.webcomEvents[event];
    var alreadyRegistered = false;
    for (var i=0; i < registeredHandlers.length; i++) {
      var listener = registeredHandlers[i];
      if (listener.handler == handler) {
        alreadyRegistered = true;
        break;
      }
    }

    if (!alreadyRegistered) {
      this.webcomEvents[event].push({"handler": handler, "scope" : scope});
    }
	};

	this.un = function(/*String*/event, /*Function*/handler) {
    var registeredHandlers = this.webcomEvents[event];
		if (!registeredHandlers) return;
    for (var i=0; i < registeredHandlers.length; i++) {
      var listener = registeredHandlers[i];
      if (listener.handler == handler) {
        registeredHandlers.splice(i,1);
        break;
      }
    }
	};

	this.fireEvent = function(/*String*/ event, /*Array*/ args) {
    var registeredHandlers = this.webcomEvents[event];
		if (!registeredHandlers) return;
    for (var i=0; i < registeredHandlers.length; i++) {
      var listener = registeredHandlers[i];
      if (listener.scope) {
        listener.handler.apply(listener.scope, args);
      } else {
        listener.handler(args);
      }
    }
	};

  this.removeAllListeners = function() {
		if (!registeredHandlers) return;
    for (var i=0; i < registeredHandlers.length; i++) {
      var listener = registeredHandlers[i];
      listener.handler = null
      listener.scope = null;
      listener = null;
      registeredHandlers[i] = null;
    }

    registeredHandlers = new Array();
  };
}

WebCom.Observable = WebCom_Observable;

/*
 * Abstraction for for (mostly) headless components. Basic services are provided
 * to load a resources or build a resource URL.
 *
 * @inherits Observable
 */
function WebCom_Components_BasicComponent(/*Library*/ _libraryHandle) {
   WebCom.Observable.apply(this, arguments);
   var libraryHandle = _libraryHandle;

  this.loadResource = function (/*String*/ resourcePath) {
    libraryHandle.loadResource(resourcePath);
  };

  this.getResourceURL = function (/*String*/ resourcePath, /*String*/ resourceType) {
    return libraryHandle.getResourceURL(resourcePath);
  };

  this.getRuntimeName = function () {
    return libraryHandle.getRuntimeName();
  };

  this.destroy = function () {
    this.removeAllListeners();
  };
}

// updated to use new webcom's namespace --iM
WebCom.Components = webcom.namespace("WebCom.Components");
WebCom.Components.BasicComponent = WebCom_Components_BasicComponent;
WebCom.Components.BasicComponent.prototype = new WebCom.Observable();


/*
 * Abstraction for Widget type components that require rendering on page,
 * templating, localization etc.
 *
 * @inherits BasicComponent
 */
function WebCom_Components_Component(/*Library*/ library) {
  WebCom.Components.BasicComponent.apply(this, arguments);

  this.getId = function () {
    return this.id;
  };


  this.toHTML = function (/*RenderMode*/ mode) {
    this.WebCom_CC_MasterTemplate = this.getMasterTemplate(mode);
    var tpl = this.WebCom_CC_MasterTemplate.getMarkupText(this);
    return WebCom.Util.TemplateUtil.format(tpl, this.getFormattingValues()); //where format is implement
  };
  
  this.render = function (/*RenderMode*/ mode, /*Element*/ _target) {
    var  str = this.toHTML(mode);  
    
    var target = _target || document.getElementById(this.id);
    if (target != null) {
      target.innerHTML = str;
      if (this.WebCom_CC_MasterTemplate &&
        typeof(this.WebCom_CC_MasterTemplate.postRender) == 'function') {
        this.WebCom_CC_MasterTemplate.postRender(this.id);
      }
  
      this.fireEvent("renderComplete", [this]);
    }
  };

  // Each component will return their master template
  this.getMasterTemplate = function (/*RenderMode*/ mode) {
    throw new Error("Abstract method called. needs to be overriden !");
  }

  /** Each component will return the formatting template associated with master
   *  template. It might include sub-template values
   */
  this.getFormattingValues = function (/*RenderMode*/ mode) {
    throw new Error("Abstract method called. needs to be overriden !");
  };

  /**
   * Returns a Template reference if a match is found. The match order is:
   *
   * name, layout, mode
   * name, mode
   * name, layout
   * name
   *
   * <code>mode</code> is more specific then <code>layoutName</code>
   *
   * @throws Error if no match is found
   * @return Template reference
   *
   */
  this.getTemplate = function(/*String*/name, /*RenderMode*/ mode, /*String*/ layoutName){
    var template = null;

    try { template = this._getTemplate(name + "_" + layoutName + "_" + mode); } 
    catch (e1) {
      try { template = this._getTemplate(name + "_" + mode); } 
      catch (e2) {
        try { template = this._getTemplate(name + "_" + layoutName); } 
        catch (e3) {
          template = this._getTemplate(name);
        }
      }
    }
    return template;
  };

  this._getTemplate = function (/*String*/ name) {
    var templateInstanceName = this.getRuntimeName().split(".").join("_") + "_Template_" + name;

    var templateLoaded;
    eval ("templateLoaded = typeof " + templateInstanceName + " == 'object';");
    /* TODO: this is not really supported yes as ResourceLoader assumes the document
     * is not closed for writing yet. Will need to make it so it can inject script
     * tags into the DOM in case the document is closed and monitor for updates
     */
    if (!templateLoaded) {
      throw new Error("Sorry " + templateInstanceName + " template needs to be pre-loaded. Dynamic loading not implemented yet!");
      //sample this.loadResource("templates/" + name + ".js");
    }

    var template;
    eval ("template = " + templateInstanceName + ";");

    return template;
  };

  this.getLocalization = function (/*String*/ locale, /*Object*/ hash) {
    if (locale == null) {
      locale = "enus";
    }
    var localeInstanceName = this.getRuntimeName().split(".").join("_") + "_Locale_" + locale;

    var localeLoaded;
    eval ("localeLoaded = typeof " + localeInstanceName + " == 'object';");
    /* TODO: this is not really supported yes as ResourceLoader assumes the document
     * is not closed for writing yet. Will need to make it so it can inject script
     * tags into the DOM in case the document is closed and monitor for updates
     */
    if (!localeInstanceName) {
      throw new Error("Sorry " + localeInstanceName + " locale needs to be pre-loaded. Dynamic loading not implemented yet!");
      //sample this.loadResource("js/resources_"  + locale + ".js");
    }

    var resources;
    eval ("resources = " + localeInstanceName + ";");

    if (hash != null) {
      for (var key in resources) {
        hash[key] = resources[key];
      }
    } else {
      return resources;
    }
  };

  // Optional parts to be filled in ...
  this.show = function () {

  };

  this.hide = function() {

  };
}

// updated to use new webcom's namespace --iM
WebCom.Components = webcom.namespace("WebCom.Components");
WebCom.Components.Component = WebCom_Components_Component;
WebCom.Components.Component.prototype = new WebCom.Components.BasicComponent();

function WebCom_Browser() {
  var ua = navigator.userAgent.toLowerCase();
  this.check = function(r){
      return r.test(ua);
  };
  this.isOpera = this.check(/opera/);
  this.isChrome = this.check(/chrome/);
  this.isWebKit = this.check(/webkit/);
  this.isSafari = !this.isChrome && this.check(/safari/);
  this.isIE = !this.isOpera && this.check(/msie/);
  this.isIE7 = this.isIE && this.check(/msie 7/);
  this.isIE8 = this.isIE && this.check(/msie 8/);
  this.isIE6 = this.isIE && !this.isIE7 && !this.isIE8;
  this.isGecko = !this.isWebKit && this.check(/gecko/);
  this.isWindows = this.check(/windows|win32/);
  this.isMac = this.check(/macintosh|mac os x/);
  this.isLinux = this.check(/linux/);
  this.isSecure = /^https/i.test(window.location.protocol);
}

WebCom.Browser = new WebCom_Browser();
