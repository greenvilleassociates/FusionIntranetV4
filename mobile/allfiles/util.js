/**
 * Copyright (c) 2013 Web.com Group, Inc. All Rights Reserved.
 * 
 * This is an unpublished work protected by Web.com Group, Inc. as a trade
 * secret, and is not to be used or disclosed except as expressly provided in a
 * written license agreement executed by you and Web.com Group, Inc.
 * 
 * @author Attila Mezei Horvati
 */
webcom.namespace("webcom.util");

webcom.util.isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
// Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
webcom.util.isFirefox = typeof InstallTrigger !== 'undefined'; // Firefox
// 1.0+
webcom.util.isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
// At least Safari 3+: "[object HTMLElementConstructor]"
webcom.util.isChrome = !!window.chrome && !webcom.util.isOpera; // Chrome
// 1+
webcom.util.isIE = /* @cc_on!@ */false || document.documentMode; // At least
// IE6
webcom.util.BrowserUtil = {
  getIEVersion : function() {
    if (webcom.util.isIE) {
      var agent = navigator.userAgent;
      var reg = /MSIE\s?(\d+)(?:\.(\d+))?/i;
      var matches = agent.match(reg);
      if (matches != null) {
        return {
          major : matches[1],
          minor : matches[2]
        };
      }
    }
    return {
      major : "-1",
      minor : "-1"
    };
  },

  isIE10 : function() {
    var ieVersion = webcom.util.BrowserUtil.getIEVersion();
    return ieVersion.major == 10;
  },

  // returns a computed CSS style object
  // for the given DOM element
  getComputedStyle : function(dom) {
    var style;
    var returns = {};
    // FireFox and Chrome way
    if (window.getComputedStyle) {
      style = window.getComputedStyle(dom, null);
      for (var i = 0, l = style.length; i < l; i++) {
        var prop = style[i];
        var val = style.getPropertyValue(prop);
        returns[prop] = val;
      }
      return returns;
    }
    // IE and Opera way
    if (dom.currentStyle) {
      style = dom.currentStyle;
      for ( var prop in style) {
        returns[prop] = style[prop];
      }
      return returns;
    }
    // Style from style attribute
    if (style = dom.style) {
      for ( var prop in style) {
        if (typeof style[prop] != 'function') {
          returns[prop] = style[prop];
        }
      }
      return returns;
    }
    return returns;
  }
};

webcom.util.StringUtil = {
  isEmpty : function(str) {
    return (!str || str.length == 0);
  },

  /**
   * Method to return the text inside html tags
   */
  stripHtml : function(html) {
    var tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText;
  },

  /**
   * Method to check if a lower case search term is found in a lower case search
   * string
   */
  has : function(str, searchTerm) {
    var s = str.toLowerCase();
    var st = searchTerm.toLowerCase();
    return (s.indexOf(st) > -1);
  },

  /**
   * Method to switch a map into one or multiple lines of text: Format is:
   * key1=value1\n key2=value2 ...
   */
  mapToStr : function(map) {
    var str = "";
    if (typeof map == "object" && map != null) {
      for (var i = 0; i < map.length; i++) {
        str += map[i]['keyField'] + "=" + map[i]['valueField'] + "\n";
      }
    }
    return str;
  },

  /**
   * Method to switch one or multiple lines of text into a map. Format is:
   * key1=value1\n key2=value2 ...
   */
  strToMap : function(str) {
    var map = [];
    if (str && typeof str == 'string') {
      var s = str.split('\n');
      for (var i = 0; i < s.length; i++) {
        var kv = s[i].split('=');
        if (kv[0] && kv[0].length > 0) {
          map.push({
            keyField : kv[0],
            valueField : kv[1] ? kv[1] : "null"
          });
        }
      }
    }
    return map;
  },

  /**
   * Capitalize a string.
   * 
   * @param {String}
   * @return {String} capitalized
   */
  capitalize : function(str) {
    return str.replace(/[a-zA-Z]/, function(firstLetter) {
      return firstLetter.toUpperCase();
    });
  },

  /**
   * Makes a string snake-case (usful for links, URLs etc)
   * 
   * @param {String}
   *          str
   * @return {String}
   */
  snakify : function(str) {
    return !str ? "" : str.replace(/[^a-z|A-Z|0-9]/g, "-").replace(/(\-+)/g, "-").replace(/\-$/, '').toLowerCase();
  },

  /**
   * Returns the file-name from a URL used for images mostly
   */
  getFileName : function(str) {
    if (str)
      return str.split("/").pop();
    return str;
  },

  getNonEmptyValue : function(value, defaultValue) {
    return (typeof value !== "string" || value == "") ? defaultValue : value;
  },
  
  isValidFileName: function(fileName){
    var pattern = new RegExp(/^[a-zA-Z0-9-_]+$/);
    return pattern.test(fileName);
  },

  isValidMetaString: function(fileName){
    var pattern = new RegExp(/[<|>|"]/);
    return !pattern.test(fileName);
  }
};

webcom.util.ObjectUtil = {
  /**
   * Returns THE FIRST element from an array of objects, based on a specific `key`'s value
   *
   * @param arr - Array 
   *                the array of objects
   * @param key - String
   *                the key we will compare against
   * @param val - Varies
   *                the value of the key we need (uses strict comparison `===`!)
   *
   * @return Object or `null`
   */
  findInMap: function(arr, key, val) {
    if (arr && arr.length) {
      for (var i = 0, len=arr.length; i < len; i++) {
        if (arr[i][key] === val) return arr[i];
      }
    }
    
    return null;
  },

  /**
   * check if element is an array
   * 
   * @param e -
   *          element to check if array
   * @return true if array, false otherwise
   */
  isArray : function(e) {
    return (e && typeof e === 'object' && e instanceof Array);
  },

  /**
   * Check if an object is empty.
   * 
   * @param e
   *          object to check if empty.
   */
  isEmpty : function(e) {
    return (typeof e != 'object' ? true : (Object.keys(e).length == 0));
  },

  /**
   * check if an object has a certain property
   */
  hasProperty: function(o, p) {
    return typeof (o[p]) != 'undefined';
  },

  /**
   * Check if map objects are the same (no methods expected)
   */
  areEqual : function(o1, o2) {
    var p;

    for (p in o1) {
      if (!this.hasProperty(o2, p)) {
        return false;
      }
    }
    for (p in o2) {
      if (!this.hasProperty(o1, p)) {
        return false;
      }
    }

    // check for values
    for (p in o1) {
      switch (typeof (o1[p])) {
      case 'object':
        var isO1Valid = (o1[p] != null);
        var isO2Valid = (o2[p] != null);
        if (isO1Valid != isO2Valid) {
          return false;
        } else if (isO1Valid && !webcom.util.ObjectUtil.areEqual(o1[p], o2[p])) {
          return false;
        }
        break;

      case 'function':
        throw new Error("Incorrect use", "Can't compare real objects, only maps of values!");
        break;

      default:
        if (o1[p] != o2[p]) {
          return false;
        }
      }
    }

    return true;
  }
};

/**
 * webcom Timer Utility class
 */
webcom.util.timerUtil = {
  /**
   * Creates and returns a new debounced version of the passed function which
   * will postpone its execution until after `delay` milliseconds have elapsed
   * since the last time it was invoked.
   * 
   * based on http://remysharp.com/2010/07/21/throttling-function-calls/
   * 
   * @param fn -
   *          the function
   * @param delay -
   *          the delay in milliseconds
   * 
   * @return debounced function
   */
  debounce : function(fn, delay) {
    var timer = null;
    return function() {
      var context = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function() {
        fn.apply(context, args);
      }, delay);
    };
  },

  timer : null,
  dalcuBounce : function(fn, delay) {
    clearTimeout(webcom.util.timerUtil.timer);

    webcom.util.timerUtil.timer = setTimeout(function() {
      fn();
    }, delay);

  }
};

/**
 * Usage
 * 
 * Register event to be called somewhere in your code
 * webcom.util.Events.register('AssetManagerOnRefresh', 'replaceImageActive',
 * overrideAssetClick);
 * 
 * Unregister the event if you do not need it called anymore
 * webcom.util.Events.unRegister('replaceImageActive');
 * 
 * Call events when the time is right for(var i=0;i<webcom.util.Events.get('AssetManagerOnRefresh').length;i++) {
 * webcom.util.Events.get('AssetManagerOnRefresh')[i].callback(); }
 */
webcom.util.Events = {
  events : [],

  /**
   * Register neo.Event
   * 
   * @param {string}
   *          groupName ex: ClassNameOnAction or AssetManagerOnUpload
   * @param {string}
   *          callBackName ex: EventName or onReplaceImage, this is passed for
   *          the purpose of being able to remove it later
   * @returns {void}
   */
  register : function(group, name, callback) {
    // console.log('Registering event: ', group + " :: " + name);
    this.events.push({
      group : group,
      name : name,
      callback : callback
    });
  },

  /**
   * Unregister event from stack
   * 
   * @param {string}
   *          name of callbackname that was registered
   * @returns {void}
   */
  unRegister : function(name) {
    for (var i = 0; i < this.events.length; i++) {
      if (name == this.events[i].name) {
        this.events.splice(i, 1);
      }
    }
  },

  /**
   * Get events for specified group
   * 
   * @param {string}
   *          groupName ex: ClassNameOnAction or AssetManagerOnUpload
   * @returns {Array} array of events
   */
  getByGroup : function(group) {
    var registeredEvents = [];

    for (var i = 0; i < this.events.length; i++) {
      if (group == this.events[i].group) {
        registeredEvents.push(this.events[i]);
      }
    }

    return registeredEvents;
  },

  /**
   * Get event by eventNam (not group)
   * 
   * @param {string}
   *          groupName ex: ClassNameOnAction or AssetManagerOnUpload
   * @returns {Array} array of events
   */
  getByName : function(name) {
    var registeredEvents = [];

    for (var i = 0; i < this.events.length; i++) {
      if (name == this.events[i].name) {
        registeredEvents.push(this.events[i]);
      }
    }

    return registeredEvents;
  },

  /**
   * Automatically call all events for the specified groupName
   * 
   * @param {string}
   *          groupName ex: ClassNameOnAction or AssetManagerOnUpload
   * @param {object}
   *          vars ex: {my:'var',scope: this}
   * @returns {void}
   */
  fireEvent : function(groupName, vars) {
    var evtHandlers = webcom.util.Events.getByGroup(groupName);
    for (var i = 0; i < evtHandlers.length; i++) {
      // console.debug('EXECUTING', groupName/*,
      // webcom.util.Events.getByGroup(groupName)[i].callback*/);
      evtHandlers[i].callback(vars);
    }
  }
};

/**
 * It's just a wrapper for the ResumableJS lib we use for file uploads.
 * http://resumablejs.com/
 */
webcom.util.FileUploader = {
  /**
   * @param {object}
   *          configuration object sent directly to Resumable
   */
  init : function(config) {
    return new Resumable(config);
  }
};

webcom.util.Number = {
  /**
   * Convert a number from decimal to hexadecimal.
   * 
   * @param {String}
   *          decimal number
   */
  decimalToHex : function(x) {
    if (typeof x != 'number') {
      x = parseFloat(x);
    }

    return x.toString(16);
  }
};

webcom.util.Color = {
  /**
   * Detect if it is a valid HEX color.
   * 
   * @param {String}
   *          color
   * @returns {Boolean}
   */
  isHex : function(color) {
    return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color);
  },

  /**
   * Detect if a color is using the RGB model.
   * 
   * @param color
   *          {String}
   * @returns boolean
   */
  isRgb : function(color) {
    var rgbRegex = /(^rgb\((\d+),\s*(\d+),\s*(\d+)\)$)|(^rgba\((\d+),\s*(\d+),\s*(\d+)(,\s*\d+(\.\d+)?)*\)$)/i;

    return rgbRegex.test(color);
  },

  /**
   * Convert a named color (x11) to hex value
   * 
   * @param color
   *          {String} like red, blue, green
   * @returns {String} like #"ff0000"
   */
  nameToHex : function(color) {
    var colorNames = {
      "aliceblue" : "#f0f8ff",
      "antiquewhite" : "#faebd7",
      "aqua" : "#00ffff",
      "aquamarine" : "#7fffd4",
      "azure" : "#f0ffff",
      "beige" : "#f5f5dc",
      "bisque" : "#ffe4c4",
      "black" : "#000000",
      "blanchedalmond" : "#ffebcd",
      "blue" : "#0000ff",
      "blueviolet" : "#8a2be2",
      "brown" : "#a52a2a",
      "burlywood" : "#deb887",
      "cadetblue" : "#5f9ea0",
      "chartreuse" : "#7fff00",
      "chocolate" : "#d2691e",
      "coral" : "#ff7f50",
      "cornflowerblue" : "#6495ed",
      "cornsilk" : "#fff8dc",
      "crimson" : "#dc143c",
      "cyan" : "#00ffff",
      "darkblue" : "#00008b",
      "darkcyan" : "#008b8b",
      "darkgoldenrod" : "#b8860b",
      "darkgray" : "#a9a9a9",
      "darkgreen" : "#006400",
      "darkkhaki" : "#bdb76b",
      "darkmagenta" : "#8b008b",
      "darkolivegreen" : "#556b2f",
      "darkorange" : "#ff8c00",
      "darkorchid" : "#9932cc",
      "darkred" : "#8b0000",
      "darksalmon" : "#e9967a",
      "darkseagreen" : "#8fbc8f",
      "darkslateblue" : "#483d8b",
      "darkslategray" : "#2f4f4f",
      "darkturquoise" : "#00ced1",
      "darkviolet" : "#9400d3",
      "deeppink" : "#ff1493",
      "deepskyblue" : "#00bfff",
      "dimgray" : "#696969",
      "dodgerblue" : "#1e90ff",
      "firebrick" : "#b22222",
      "floralwhite" : "#fffaf0",
      "forestgreen" : "#228b22",
      "fuchsia" : "#ff00ff",
      "gainsboro" : "#dcdcdc",
      "ghostwhite" : "#f8f8ff",
      "gold" : "#ffd700",
      "goldenrod" : "#daa520",
      "gray" : "#808080",
      "green" : "#008000",
      "greenyellow" : "#adff2f",
      "honeydew" : "#f0fff0",
      "hotpink" : "#ff69b4",
      "indianred " : "#cd5c5c",
      "indigo" : "#4b0082",
      "ivory" : "#fffff0",
      "khaki" : "#f0e68c",
      "lavender" : "#e6e6fa",
      "lavenderblush" : "#fff0f5",
      "lawngreen" : "#7cfc00",
      "lemonchiffon" : "#fffacd",
      "lightblue" : "#add8e6",
      "lightcoral" : "#f08080",
      "lightcyan" : "#e0ffff",
      "lightgoldenrodyellow" : "#fafad2",
      "lightgrey" : "#d3d3d3",
      "lightgreen" : "#90ee90",
      "lightpink" : "#ffb6c1",
      "lightsalmon" : "#ffa07a",
      "lightseagreen" : "#20b2aa",
      "lightskyblue" : "#87cefa",
      "lightslategray" : "#778899",
      "lightsteelblue" : "#b0c4de",
      "lightyellow" : "#ffffe0",
      "lime" : "#00ff00",
      "limegreen" : "#32cd32",
      "linen" : "#faf0e6",
      "magenta" : "#ff00ff",
      "maroon" : "#800000",
      "mediumaquamarine" : "#66cdaa",
      "mediumblue" : "#0000cd",
      "mediumorchid" : "#ba55d3",
      "mediumpurple" : "#9370d8",
      "mediumseagreen" : "#3cb371",
      "mediumslateblue" : "#7b68ee",
      "mediumspringgreen" : "#00fa9a",
      "mediumturquoise" : "#48d1cc",
      "mediumvioletred" : "#c71585",
      "midnightblue" : "#191970",
      "mintcream" : "#f5fffa",
      "mistyrose" : "#ffe4e1",
      "moccasin" : "#ffe4b5",
      "navajowhite" : "#ffdead",
      "navy" : "#000080",
      "oldlace" : "#fdf5e6",
      "olive" : "#808000",
      "olivedrab" : "#6b8e23",
      "orange" : "#ffa500",
      "orangered" : "#ff4500",
      "orchid" : "#da70d6",
      "palegoldenrod" : "#eee8aa",
      "palegreen" : "#98fb98",
      "paleturquoise" : "#afeeee",
      "palevioletred" : "#d87093",
      "papayawhip" : "#ffefd5",
      "peachpuff" : "#ffdab9",
      "peru" : "#cd853f",
      "pink" : "#ffc0cb",
      "plum" : "#dda0dd",
      "powderblue" : "#b0e0e6",
      "purple" : "#800080",
      "red" : "#ff0000",
      "rosybrown" : "#bc8f8f",
      "royalblue" : "#4169e1",
      "saddlebrown" : "#8b4513",
      "salmon" : "#fa8072",
      "sandybrown" : "#f4a460",
      "seagreen" : "#2e8b57",
      "seashell" : "#fff5ee",
      "sienna" : "#a0522d",
      "silver" : "#c0c0c0",
      "skyblue" : "#87ceeb",
      "slateblue" : "#6a5acd",
      "slategray" : "#708090",
      "snow" : "#fffafa",
      "springgreen" : "#00ff7f",
      "steelblue" : "#4682b4",
      "tan" : "#d2b48c",
      "teal" : "#008080",
      "thistle" : "#d8bfd8",
      "tomato" : "#ff6347",
      "turquoise" : "#40e0d0",
      "violet" : "#ee82ee",
      "wheat" : "#f5deb3",
      "white" : "#ffffff",
      "whitesmoke" : "#f5f5f5",
      "yellow" : "#ffff00",
      "yellowgreen" : "#9acd32"
    };

    if (typeof colorNames[color.toLowerCase()] != 'undefined') {
      return colorNames[color.toLowerCase()];
    } else {
      return color;
    }
  },

  /**
   * Convert a color from RGB to hex.
   * 
   * @param rgb
   *          {String} like rgb(a, b, c)
   * @returns {String}
   */
  rgbToHex : function(rgbColor) {
    function colorToHex(rgbPart) {
      return ('0' + webcom.util.Number.decimalToHex(rgbPart)).slice(-2);
    }

    var rgbRegex = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/i;
    var rgb = rgbRegex.exec(rgbColor);
    if (rgb != null) {
      color = "#" + colorToHex(rgb[1]) + colorToHex(rgb[2]) + colorToHex(rgb[3]);
    } else {
      var rgbaRegex = /^rgba\((\d+),\s*(\d+),\s*(\d+)(,\s*\d+(\.\d+)?)*\)$/i;
      rgb = rgbaRegex.exec(rgbColor);
      if (rgb != null) {
        color = "#" + colorToHex(rgb[1]) + colorToHex(rgb[2]) + colorToHex(rgb[3]);
      } else {
        color = rgbColor;
      }
    }

    return color;
  },

  /**
   * Convert an hexadecimal color to the RGB model.
   * 
   * @param hex
   *          {String} with hex color
   * @param {String}
   *          optional opacity for a RGBA color
   * @returns {String} with rgb color or null if it fails
   */
  hexToRgb : function(hex, opacity) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    var rgbColor;
    if (result != null) {
      if (typeof opacity == 'undefined') { // RGB color
        rgbColor = 'rgb(' + parseInt(result[1], 16) + ', ' + parseInt(result[2], 16) + ', ' + parseInt(result[3], 16) + ')';
      } else { // RGBA (with alpha)
        // If the opacity is valid
        if (parseFloat(opacity) >= 0 && parseFloat(opacity) <= 1) {
          rgbColor = 'rgba(' + parseInt(result[1], 16) + ', ' + parseInt(result[2], 16) + ', ' + parseInt(result[3], 16) + ', ' + opacity + ')';
        } else {
          // Opacity value is invalid
          rgbColor = null;

          console.log('util.js, hexToRgb(): opacity value is invalid. It must between 0 and 1, received value=', opacity);
        }
      }
    } else {
      // Failed parsing the hex color
      rgbColor = null;

      console.log('util.js, hexToRgb(): failed parsing the hex value, received value=', hex);
    }
    
    return rgbColor;
  },
  
  /**
   * Parse a RGB color and return an object.
   * 
   * @param String with rgb color
   * @returns Object
   */
  parseRgb : function(rgbColor) {
    var parsed = {};
    if (this.isRgb(rgbColor)) {
      var rgb = rgbColor.replace(/^rgba?\(|\s+|\)$/g,'').split(',');
      var hasAlpha = (typeof rgb[3] != 'undefined');
      parsed = {
        r : parseInt(rgb[0]),
        g : parseInt(rgb[1]),
        b : parseInt(rgb[2]),
        a : hasAlpha ? parseFloat(rgb[3]) : 1
      };
    } else {
      // Return empty object {}
      console.log('util.js, parseRgb() invalid rgbColor supplied: ', rgbColor);
    }
    
    return parsed;
  }
};

webcom.util.DateFormat = {
  /*
   * Update date to a desired format @param d - Date object @param format -
   * desired date format, 'st' - aka Short Time of format h:mm meridian. This is
   * the default format if no format param is set 'neoeditdate' - aka Neo
   * required edit date display of format MMM dd at h:mm meridian
   * 
   * new desired date format may be added in future
   */
  format : function(d, format) {
    var str;

    if (typeof format == 'undefined' || !format) {
      format = "st";
    }
    switch (format) {
    case "st":
      str = (d.getHours() > 12 ? (d.getHours() - 12) : d.getHours()) + ":" + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes() + (d.getHours() > 12 ? "PM" : "AM");
      break;
    case "neoeditdate":
      var month = new Array(12);
      month[0] = "Jan";
      month[1] = "Feb";
      month[2] = "Mar";
      month[3] = "Apr";
      month[4] = "May";
      month[5] = "Jun";
      month[6] = "Jul";
      month[7] = "Aug";
      month[8] = "Sep";
      month[9] = "Oct";
      month[10] = "Nov";
      month[11] = "Dec";

      str = month[d.getUTCMonth()] + " " + d.getDate() + " at " + (d.getHours() > 12 ? (d.getHours() - 12) : d.getHours()) + ":" + (d.getMinutes() < 10 ? '0' : '')
          + d.getMinutes() + (d.getHours() > 12 ? "PM" : "AM");
      break;
    default:

    }
    return str;
  },
  
  /* 
   * Adds PM/AM depending on the passed date parameter.
   */
  
  formatTime: function(date) {
    var time = "";
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = "AM";
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    if (hours == 12) {
      hours = 12;
      ampm = " PM";
    } else if (hours == 0) {
      hours = 12;
      ampm = " AM";
    } else if (hours > 12) {
      hours = hours - 12;
      ampm = " PM";
    } else {
      ampm = " AM";
    }
    time = " " + hours + ":" + minutes + ampm + "";
    
    return time;      
  }

};

if (typeof $ != "undefined") {
  /**
   * triggers a scrollbar on the selector NOTE: we are using slimScroll for now
   * 
   * @param settingsObj -
   *          an object that gets passed in directly to the helper if object
   *          property `update` truthy, triggers an update
   * @return self - so can be chained with other jQuery function
   */
  $.fn.neoScroll = function(settingsObj) {
    var t = this;
    // slim doesn't support destroy so I had to make one
    if (settingsObj.destroy) {
      $(t.selector).parent().find(".slimScrollBar").remove();
      $(t.selector).parent().find(".slimScrollRail").remove();

      if ($(t.selector).parent().hasClass("slimScrollDiv")) {
        $(t.selector).parent().replaceWith($(t.selector));
      }
    } else if (settingsObj.update) {
      $(t.selector).slimScroll();
    } else {
      var defaultObj = {
        color : "#BDBEC0",
        alwaysVisible : true,
        width : "100%",
        size : "6px"
      };
      $(t.selector).slimScroll($.extend(settingsObj, defaultObj));
    }
    return this;
  };
} else {
  console.warn("NEO Warning: You need jQuery ($) to access custom Neo DOM helpers!");
}

webcom.util.getHash = function(string) {
  var hash = 0, i, chr, len;
  if (string.length == 0)
    return hash;
  for (i = 0, len = string.length; i < len; i++) {
    chr = string.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

webcom.util.getDocHeight = function() {
  var D = document;
  return Math.max(Math.max(D.body.scrollHeight, D.documentElement.scrollHeight), Math.max(D.body.offsetHeight, D.documentElement.offsetHeight), Math.max(D.body.clientHeight,
      D.documentElement.clientHeight));
};


webcom.util.GenericModal = {
  MODALID: "#neo-generic-modal",
  isClicksBound: false,
  /**
   * @param header String - header message of the modal
   * @param msg String - the message that displays in the modal's body
   */
  showModal: function(header, msg) {
    webcom.util.GenericModal.showConfirm(header, msg, null);
  },

  hideModal: function() {
    document.querySelector(this.MODALID).querySelector(".modal-x").click();
  },

  /**
   * A simple dialog that displays the loading image 
   * @param header String - header message of the modal
   * @param msg String - the message that displays in the modal's body
   */
  showWaitModal: function(header, msg) {
    var $modal = document.querySelector(this.MODALID);

    webcom.util.GenericModal.showConfirm(header, msg, {
      openCallback: function() {
        $modal.querySelector(".modal-button-wrapper").style.display = "none";
        $modal.querySelector(".wait-image").style.display = "block";
      },
      closeCallback: function() {
        var t = setTimeout(function() {
          $modal.querySelector(".modal-button-wrapper").style.display = "block";
          $modal.querySelector(".wait-image").style.display = "none";
        }, 500);
      }
    });
  },


  /**
   * @param header String - header message of the modal
   * @param msg String - the message that displays in the modal's body
   * @param options Object - used for `ok` and `cancel` callbacks for now 
   */
  showConfirm: function(header, msg, options) {
    var MODAL_ID = "#neo-generic-modal";
    var MODAL_CLOSE_CLASS = ".modal-close";
    var MODAL_CLOSE_X_CLASS = ".modal-x";
    var MODAL_OK_CLASS = ".modal-ok";
    var MODAL_HEADER_CLASS = ".modal-top";
    var MODAL_MESSAGE_CLASS = ".confirm-message";
    var MODAL_SHOW_CLASS = "modal-show";

    var $modal = document.querySelector(MODAL_ID);
    var $cancel = $modal.querySelector(MODAL_CLOSE_CLASS);
    var $ok = $modal.querySelector(MODAL_OK_CLASS);
    var $x = $modal.querySelector(MODAL_CLOSE_X_CLASS);
    var $messageHeader = $modal.querySelector(MODAL_HEADER_CLASS);
    var $messageBody = $modal.querySelector(MODAL_MESSAGE_CLASS);

    var hasOkCallback = typeof options != "undefined" && options && typeof options.okCallback == "function";
    var hasCancelCallback = typeof options != "undefined" && options && typeof options.cancelCallback == "function";
    var hasOpenCallback = typeof options != "undefined" && options && typeof options.openCallback == "function";
    var hasCloseCallback = typeof options != "undefined" && options && typeof options.closeCallback == "function";

    var closeModal = function() {
      if (hasCloseCallback) {
        options.closeCallback();
      }

      $modal.classList.remove(MODAL_SHOW_CLASS);
    }

    var cancelModal = function() {
      if(hasCancelCallback) {
        options.cancelCallback();
      }
      closeModal();
    }

    $cancel.removeEventListener("click", cancelModal);
    $x.removeEventListener("click", cancelModal);
    $cancel.addEventListener("click", cancelModal);
    $x.addEventListener("click", cancelModal);

    var okListener = function() {
      if(hasOkCallback) {
        options.okCallback();
      }
      closeModal();
    }

    $ok.removeEventListener("click", okListener);
    $ok.addEventListener("click", okListener);

    $cancel.style.display = hasOkCallback ? "inline-block" : "none";
    
    $messageHeader.innerHTML = header || "";
    $messageBody.innerHTML = msg || "";

    if (hasOpenCallback) {
      options.openCallback();
    }

    $modal.classList.add(MODAL_SHOW_CLASS);
  }
};

webcom.util.setCookie = function(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
};

webcom.util.getCookie = function(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
};
