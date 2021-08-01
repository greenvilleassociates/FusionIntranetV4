/**
 * Copyright (c) 2013 Web.com Group, Inc. All Rights Reserved.
 * 
 * This is an unpublished work protected by Web.com Group, Inc. as a trade
 * secret, and is not to be used or disclosed except as expressly provided in a
 * written license agreement executed by you and Web.com Group, Inc.
 * 
 * @author Attila Mezei Horvati
 */
var webcom = {
  /**
   * create a namespace. If webcom is the start package it is skipped as we have
   * it already...
   * 
   * @param namespace -
   *          the namespace string we want to create. Such as "webcom.util"
   * @return namespace object - the object created for namespace specified
   */
  namespace : function(namespace) {
    var subPkgNames = namespace.split(".");
    var currentSubPkgObj = this;

  	if (subPkgNames.length > 0) {
      var subPkg = eval(subPkgNames[0]);
      currentSubPkgObj = subPkg ? subPkg : {};
      for (i = 1; i < subPkgNames.length; i++) {
        var subPkgName = subPkgNames[i];

        currentSubPkgObj[subPkgName] = currentSubPkgObj[subPkgName] || {};
        currentSubPkgObj = currentSubPkgObj[subPkgName];
      }
    }
    return currentSubPkgObj;
  },

  /**
   * extend an object
   * 
   * @param base -
   *          base class to extend
   * @param parent -
   *          parent class
   * @param defaults -
   *          any default values that should be applied
   * @return base - the object setup with parent and default values
   */
  extend : function(base, parent, defaults) {
    if (defaults === null || defaults === undefined) {
      defaults = parent;
      parent = {};
    }
    function F() {
    }
    inheritedPrototype = F.prototype = parent.prototype;
    basePrototype = new F();
    basePrototype.constructorMethod = base;
    base.up = inheritedPrototype;
    if (defaults !== null && defaults !== undefined) {
      jQuery.extend(true, basePrototype, defaults);
    }
    base.prototype = basePrototype;
    return base;
  },

  /**
   * Clone an object
   * 
   * @param source -
   *          source object to be cloned
   * @param excluded -
   *          property name or an array of property names to be excluded from
   *          cloning
   * @return c - the clone
   */
  cloneObject : function(source, excluded) {
    // simple clone
    if (typeof source != "object" || source == null) {
      return source;
    }

    var property;
    var isArray = webcom.util.ObjectUtil.isArray(source);
    var clone = isArray ? [] : {};

    function isExcluded(p, e) {
      if (e) {
        if (typeof e == 'string') {
          return p == e;
        } else if (webcom.util.ObjectUtil.isArray(e)) {
          return p == e[0] ? true : isExcluded(p, e.slice(1));
        }
      }
    }
    function add(k, v) {
      if (isArray) {
        clone.push(v);
      }
      else {
        clone[k] = v;
      }
    }
    
    for (property in source) {
      if (isExcluded(property, excluded)) {
        continue;
      }

      var objType = typeof source[property];
      if (/string|number|boolean|null/i.test(objType)) {
        add(property, (/null/i.test(objType)) ? null : source[property]);
      } else {
        add(property, webcom.cloneObject(source[property], excluded));
      }
    }
    return clone;
  },
  /**
   * Moved this function ("class") from Matrix's originial ResourceLoader.js (ref: Library())
   * its functions are used throughout Matrix's core.js and form.js
   */
  library: function (/* [String runtimeName], String packageName, String version, String[] scripts, String[] styles*/) {
      var args = Array.prototype.slice.call(arguments);

      if (args.length == 5) {
        this.runtimeName = args.shift();
        // namespace already exists - took it out --iM
        //WebCom.ResourceLoader.makeNameSpace(this.runtimeName);

        //var libWrapper = new LibraryWrapper(this);
        //var constructorName = parts.join("_");
        //eval(constructorName  + ".prototype = libWrapper;"); //
        //eval(this.runtimeName  + "= new " + constructorName + "();");
      }

      this.packageName = args[0];
      this.version = args[1];
      this.scripts = args[2];
      this.styles = args[3];

      this.getRuntimeName = function () {
        return this.runtimeName;
      }

      this.getPackageName = function () {
        return this.packageName;
      };

      this.getVersion = function () {
        return this.version;
      };

      this.getScripts = function () {
        return this.scripts;
      };

      this.getStyles = function () {
        return this.styles;
      };
  }
};
