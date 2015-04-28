/*!
 * Localytics HTML5/JavaScript Library
 * Copyright (C) 2014 Char Software Inc., DBA Localytics
 * 
 * This code is provided under the Localytics Modified BSD License.
 * A copy of this license is available at
 * http://www.localytics.com/docs/opensourceinfo/#license-documentation
 * 
 * Please visit www.localytics.com for more information.
 */

/*!
Cookies Wrapper

Copyright (c) 2013 ScottHamper

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

var LocalyticsSession = function (appKey, options) {
  options = options ? options : {};
  var namespace = (options.namespace == null) ? "" : options.namespace + "_";
  return (function (window, undefined) {
    var CALLBACK_METHOD = 'window.__localytics_callbacks__["' + namespace + '"]';
    var LIB_VERSION = "web_2.2";
    var MAX_UPLOAD_LENGTH = 64000;
    var PUBLIC_METHODS = ['open', 'tagScreen', 'tagEvent', 'setCustomDimension', 'setIdentifier', 'setCustomerEmail',
                          'setCustomerId', 'setCustomerName'];

    // User-customizable configuration variables
    var sessionTimeoutSeconds = 60 * 30;
    var uploadTimeoutSeconds = 5;
    var logger = false;
    var appVersion;
    
    // Max number of custom dimensions allowed:
    var maxCustomDimensions = 10;

    // Global object that gets returned, ie 'localyticsSession'
    var ref = {};

    // Constants used for storage buckets
    var INSTALL_UUID              = "__ll_" + namespace + "iu";
    var EVENT_STORE               = "__ll_" + namespace + "es";
    var CURRENT_HEADER            = "__ll_" + namespace + "ch";
    var DEVICE_BIRTH_TIME         = "__ll_" + namespace + "pa";
    var CURRENT_SESSION_UUID      = "__ll_" + namespace + "csu";
    var CURRENT_SESSION_OPEN_TIME = "__ll_" + namespace + "cst";
    var CURRENT_SESSION_INDEX     = "__ll_" + namespace + "csi";
    var CURRENT_SEQUENCE_INDEX    = "__ll_" + namespace + "csq";
    var LAST_OPEN_TIME            = "__ll_" + namespace + "lot";
    var LAST_CLOSE_TIME           = "__ll_" + namespace + "lct";
    var SCREEN_FLOWS              = "__ll_" + namespace + "fl";
    var CUSTOM_DIMENSIONS         = "__ll_" + namespace + "cd";
    var IDENTIFIERS               = "__ll_" + namespace + "ids";

    var LOCALYTICS_CONSTANTS = [
      INSTALL_UUID,
      EVENT_STORE,
      CURRENT_HEADER,
      DEVICE_BIRTH_TIME,
      CURRENT_SESSION_UUID,
      CURRENT_SESSION_OPEN_TIME,
      CURRENT_SESSION_INDEX,
      CURRENT_SEQUENCE_INDEX,
      LAST_CLOSE_TIME,
      SCREEN_FLOWS,
      CUSTOM_DIMENSIONS,
      IDENTIFIERS
    ];

    var SCRIPT_LOADED_PATTERN = /loaded|complete/;

    var hasInitialized = false;

    // Memory storage, declared here for scope across helper methods
    var installUUID;
    var eventStore;
    var deviceBirthTime;
    var currentSessionUUID;
    var currentSessionOpenTime;
    var currentSessionIndex;
    var currentSequenceIndex;
    var lastCloseTime;
    var lastOpenTimeSeconds;
    var screenFlows;
    var customDimensions;
    var identifiers;
    var pendingUpload;
    var uploadTime;
    var uploadQueue;

    var Cookies = function (key, value, options) {
        return arguments.length === 1 ?
            Cookies.get(key) : Cookies.set(key, value, options);
    };

    // Allows for setter injection in unit tests
    Cookies._document = document;
    Cookies._navigator = navigator;

    Cookies.defaults = {
        path: '/',
        expires: 360 * 5
    };

    Cookies.get = function (key) {
        if (Cookies._cachedDocumentCookie !== Cookies._document.cookie) {
            Cookies._renewCache();
        }

        return Cookies._cache[key];
    };

    Cookies.set = function (key, value, options) {
        options = Cookies._getExtendedOptions(options);
        options.expires = Cookies._getExpiresDate(value === undefined ? -1 : options.expires);

        Cookies._document.cookie = Cookies._generateCookieString(key, value, options);

        return Cookies;
    };

    Cookies.expire = function (key, options) {
        return Cookies.set(key, undefined, options);
    };

    Cookies._getExtendedOptions = function (options) {
        return {
            path: options && options.path || Cookies.defaults.path,
            domain: options && options.domain || Cookies.defaults.domain,
            expires: options && options.expires || Cookies.defaults.expires,
            secure: options && options.secure !== undefined ?  options.secure : Cookies.defaults.secure
        };
    };

    Cookies._isValidDate = function (date) {
        return Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime());
    };

    Cookies._getExpiresDate = function (expires, now) {
        now = now || new Date();
        switch (typeof expires) {
            case 'number': expires = new Date(now.getTime() + expires * 1000 * 24 * 60 * 60); break;
            case 'string': expires = new Date(expires); break;
        }

        if (expires && !Cookies._isValidDate(expires)) {
            throw new Error('`expires` parameter cannot be converted to a valid Date instance');
        }

        return expires;
    };

    Cookies._generateCookieString = function (key, value, options) {
        key = encodeURIComponent(key);
        value = (value + '').replace(/[^!#$&-+\--:<-\[\]-~]/g, encodeURIComponent);
        var m = document.location.hostname.match(/[a-z0-9][a-z0-9\-]+\.[a-z\.]{2,6}$/i), d=m ? m[0] : '';
        options = options || {};

        var cookieString = key + '=' + value;
        cookieString += options.path ? ';path=' + options.path : '';  
        cookieString += d ? ';domain=.' + d : '';
        cookieString += options.expires ? ';expires=' + options.expires.toUTCString() : '';
        cookieString += options.secure ? ';secure' : '';

        return cookieString;
    };

    Cookies._getCookieObjectFromString = function (documentCookie) {
        var cookieObject = {};
        var cookiesArray = documentCookie ? documentCookie.split('; ') : [];

        for (var i = 0; i < cookiesArray.length; i++) {
            var cookieKvp = Cookies._getKeyValuePairFromCookieString(cookiesArray[i]);

            if (cookieObject[cookieKvp.key] === undefined) {
                cookieObject[cookieKvp.key] = cookieKvp.value;
            }
        }

        return cookieObject;
    };

    Cookies._getKeyValuePairFromCookieString = function (cookieString) {
        // "=" is a valid character in a cookie value according to RFC6265, so cannot `split('=')`
        var separatorIndex = cookieString.indexOf('=');

        // IE omits the "=" when the cookie value is an empty string
        separatorIndex = separatorIndex < 0 ? cookieString.length : separatorIndex;

        return {
            key: decodeURIComponent(cookieString.substr(0, separatorIndex)),
            value: decodeURIComponent(cookieString.substr(separatorIndex + 1))
        };
    };

    Cookies._renewCache = function () {
        Cookies._cache = Cookies._getCookieObjectFromString(Cookies._document.cookie);
        Cookies._cachedDocumentCookie = Cookies._document.cookie;
    };

    Cookies._areEnabled = function () {
        return Cookies.set('localytics.js', 1).get('localytics.js') === '1';
    };

    Cookies.enabled = Cookies._areEnabled();

    // AMD support
    if (typeof define === 'function' && define.amd) {
        define(function () { return Cookies; });
    // CommonJS and Node.js module support.
    } else if (typeof exports !== 'undefined') {
        // Support Node.js specific `module.exports` (which can be a function)
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = Cookies;
        }
        // But always support CommonJS module 1.1.1 spec (`exports` cannot be a function)
        exports.Cookies = Cookies;
    } else {
        window.Cookies = Cookies;
    }

    var emptyFn = function (o) { return; }
    var logFn = (function () {
      return (typeof console !== "undefined" && typeof console.log !== "undefined") ? function (o) { console.log(o); } : emptyFn;
    }());
    var log = emptyFn;

    // Add ability to switch logging on the fly
    ref._switchLogger = function (on) {
      log = on ? logFn : emptyFn;
    };

    // TODO: Wrap this
    var userAgent = navigator.userAgent;

    var hasWinJS = (function () {
      return typeof WinJS !== 'undefined' && typeof WinJS.xhr === 'function';
    }());

    ref._getStore = function (key) {
      value = Cookies.get(key);
      log("Reading from store: " + key + ": " + value);
      if (value)
        value = JSON.parse(value);

      return value;
    };

    ref._writeStore = function (key, o) {
      log("Writing to store: " + key + " : " + o);
      Cookies.set(key, JSON.stringify(o));
    };

    var appendToStore = function (o) {
      if (!eventStore) {
        eventStore = [];
      }
      eventStore.push(o);
    };

    var winJSXHRSend = function (jsonData) {
      var url = ref.__url__ + "api/v2/applications/" + encodeURIComponent(appKey) + "/uploads";
      WinJS.xhr({
        url: url,
        type: "POST",
        data: jsonData,
        headers: {
          "Content-Type": "application/json",
          "x-upload-time": generateClientTime(),
          "User-Agent": userAgent
        }
      }).done(callbackFn, callbackFn);
    };

/*
    var XHRSend = function (jsonData) {
      var url = ref.__url__ + "api/v2/applications/" + encodeURIComponent(appKey) + "/uploads";
      var http = new XMLHttpRequest();
      http.open("POST", url, true);
      http.setRequestHeader('Content-type', 'application/json');
      http.setRequestHeader("x-upload-time", generateClientTime());
      http.onreadystatechange = callbackFn;
      http.send(jsonData);
    };
*/

    var jsonpSend = function (jsonData) {
      var script = document.createElement("script"),
        head = document.head || document.getElementsByTagName("head")[0] || document.documentElement,
        src = ref.__url__ + "api/v2/applications/" + encodeURIComponent(appKey) + "/uploads?callback=" + CALLBACK_METHOD + "&client_date=" + generateClientTime() + "&data=" + encodeURIComponent(jsonData);

      log("Uploading blob: \n" + jsonData);
      log("Request length: " + src.length);
      if (src.length > MAX_UPLOAD_LENGTH) {
        log("Upload length exceeds maximum supported length.  Deleting data without uploading.");
        ref.clearPendingUpload(false);
        return;
      }
      script.async = "async";
      script.src = src;
      script.onload = function () {
        if (!script.readyState || SCRIPT_LOADED_PATTERN.test(script.readyState)) {
          log("Unloading script tag from header");
          script.onload = null;
          if (head && script.parentNode) {
            head.removeChild(script);
          }
          script = undefined;
        }
      };
      head.insertBefore(script, head.firstChild);
    };

    ref._send = (function () {
      if (hasWinJS) {
        return function (jsonData) {
          winJSXHRSend(jsonData);
        }
      } else {
        return function (jsonData) {
          jsonpSend(jsonData);
        }
      }
    }());

    var generateCurrentStorageSize = function () {
      var i,
        len,
        sum = 0,
        store;
      for (i = 0, len = LOCALYTICS_CONSTANTS.length; i < len; i += 1) {
        store = ref._getStore(LOCALYTICS_CONSTANTS[i], false);
        if (store && store.length) {
          sum += store.length;
        }
      }
      return sum;
    };

    var generateUUID = function () {
      // TODO: This method does not generate real UUIDs to spec
      // see: http://www.rfc-archive.org/getrfc.php?rfc=4122 section 4.4
      var s4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      };
      return (s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4());
    };

    var generateClientTime = function () {
      return (new Date()).getTime() / 1000 | 0;
    };

    var generateClientTimeInMillis = function () {
      return (new Date()).getTime();
    };

    var generateFalse = function () {
      return false;
    };

    var generateArray = function () {
      return [];
    };

    var generateString = function () {
      return "";
    };

    var generateZero = function () {
      return 0;
    };

    var generateAssociativeArray = function () {
        return {};
    };

    /**
     * Wrapper for accessing properties, from persistent storage if necessary
     * @param property Property to be checked before reading from disk.  Note that
     * unless this an object that gets passed by reference, it must be set
     * outside.
     *
     * EG: <pre>prop = getOrCreateProperty(prop, k, g, 0)</pre>
     * @param key Key for storing the object to disk
     * @param generator Function which generates a new property if necessary
     * @param clear Truthiness of value provides override for generating a new property
     */
    ref._getOrCreateProperty = function (property, key, generator, clear) {
      if (clear) {
        property = generator();
        ref._writeStore(key, property);
      } else if (property == null) {
        property = ref._getStore(key, true);
        if (!property) {
          property = generator();
          ref._writeStore(key, property);
        }
      }
      return property;
    };
    
    var getIdentifiers = function () {
        identifiers = ref._getOrCreateProperty(identifiers, IDENTIFIERS, generateAssociativeArray, false);
        return identifiers;
    };

    var getInstallUUID = function () {
      installUUID = ref._getOrCreateProperty(installUUID, INSTALL_UUID, generateUUID, false);
      return installUUID;
    };

    var getCurrentSessionUUID = function (clear) {
      currentSessionUUID = ref._getOrCreateProperty(currentSessionUUID, CURRENT_SESSION_UUID, generateUUID, clear);
      return currentSessionUUID;
    };

    var getCurrentSessionOpenTime = function (clear) {
      currentSessionOpenTime = ref._getOrCreateProperty(currentSessionOpenTime, CURRENT_SESSION_OPEN_TIME, generateClientTime, clear);
      return currentSessionOpenTime;
    };

    var getBirthDate = function () {
      deviceBirthTime = ref._getOrCreateProperty(deviceBirthTime, DEVICE_BIRTH_TIME, generateClientTime, false);
      return deviceBirthTime;
    };

    ref._getSessionIndex = function () {
      currentSessionIndex = ref._getOrCreateProperty(currentSessionIndex, CURRENT_SESSION_INDEX, generateZero, false);
      return currentSessionIndex;
    };

    var incrementCurrentSessionIndex = function () {
      ref._getSessionIndex();
      currentSessionIndex += 1;
      ref._writeStore(CURRENT_SESSION_INDEX, currentSessionIndex);
      return currentSessionIndex;
    };

    var getAndIncrementSequenceNum = function () {
      currentSequenceIndex = ref._getOrCreateProperty(currentSequenceIndex, CURRENT_SEQUENCE_INDEX, generateZero, false);
      currentSequenceIndex += 1;
      ref._writeStore(CURRENT_SEQUENCE_INDEX, currentSequenceIndex);
      return currentSequenceIndex;
    };
    
    ref._generateHeader = function () {
      log("Generating a new header");

      var language = (navigator.language || navigator.userLanguage || '').toUpperCase();
      var devicePlatform = navigator.platform, // TODO: iPad displays iPad, not iOS, etc
        deviceMake = navigator.vendor, // Only valid for iOS devices
        deviceModel = navigator.platform, // TODO: No version number included
        header = {
          "dt": "h",
          "pa": getBirthDate(),
          "seq": getAndIncrementSequenceNum(),
          "u": generateUUID()
        },
        attrs = {
          "dt": "a",
          "au": appKey,
          "iu": getInstallUUID(),
          "lv": LIB_VERSION
        };

      if (appVersion) {
        attrs.av = appVersion;
      }

      // RANDY TODO: This should be handled by server
      if (deviceModel) {
        attrs.dmo = deviceModel;
      }

      // RANDY TODO: This should be handled by server
      if (language) {
        attrs.dll = language;
      }

      // RANDY TODO: This should be handled by server
      if (deviceMake) {
        attrs.dma = deviceMake;
      }

      header.attrs = attrs;
      
      var identifiers = getIdentifiers();
      if (!isMapEmpty(identifiers))
          header.ids = identifiers;
      
      return header;
    };

    var getHeader = function () {
      return ref._generateHeader();
    };

    ref._markNewClose = function () {
      if (ref._getStore(LAST_OPEN_TIME, true) == null) 
      {
        return;
      }
      lastCloseTime = generateClientTimeInMillis();
      return ref._writeStore(LAST_CLOSE_TIME, lastCloseTime);
    };

    var generateClose = function () {
      lastCloseTime = ref._getOrCreateProperty(lastCloseTime, LAST_CLOSE_TIME, generateClientTimeInMillis, false);
      var closeTime = (lastCloseTime / 1000) | 0;
      var openTime = getCurrentSessionOpenTime();
      var sessionLength = closeTime - openTime;
      var closeJSON = {
        "dt": "c",
        "u": generateUUID(),
        "ss": openTime,
        "su": getCurrentSessionUUID(),
        "ct": closeTime,
        "ctl": sessionLength,
        "cta": sessionLength
      };

      screenFlows = ref._getOrCreateProperty(screenFlows, SCREEN_FLOWS, generateArray, false);
      if (screenFlows.length > 0) {
        closeJSON.fl = screenFlows
      }

      addCustomDimensionsToEvent(closeJSON, ref._getOrCreateProperty(customDimensions, CUSTOM_DIMENSIONS, generateArray, false));

      return closeJSON;
    };

    var finalizeClose = function () {
      if (lastCloseTime === 0) return;

      log("Finalizing close with last polled close");
      appendToStore(generateClose());
      screenFlows = [];
      ref._writeStore(SCREEN_FLOWS, screenFlows);
    };

    ref._finalizeClose = finalizeClose;

    /**
     * Set LocalyticsApplication UUID and default options
     * @param app_uuid UUID received through the Localytics Web Interface
     * @param options Options hash containing additional configuration defaults
     */
    var init = function (options) {
      if (!(Cookies.enabled && typeof JSON === 'object' && typeof JSON.parse === 'function'))
      {
        log("Browser capabilities not supported. Localytics not initialized.");
        return;
      }

      uploadQueue = [];

      if (options.uploadTimeoutSeconds) {
        uploadTimeoutSeconds = options.uploadTimeoutSeconds;
      }

      if (options.appVersion) {
        appVersion = "" + options.appVersion;
      } 
      if (options.sessionTimeoutSeconds != null) {
        if (!options.sessionTimeoutSeconds) {
          sessionTimeoutSeconds = 0;
        } else {
          sessionTimeoutSeconds = +options.sessionTimeoutSeconds;
        }
      } 

      if (options.logger != null) {
        logger = !!options.logger;
      }

      ref._switchLogger(logger);
      window.onbeforeunload = function(){ ref.upload(); }

      // Write callback to global scope if necessary
      if (!hasWinJS) {
        // This should mirror CALLBACK_METHOD
        window.__localytics_callbacks__ = window.__localytics_callbacks__ || {};
        window.__localytics_callbacks__[namespace] = callbackFn;
      }

      hasInitialized = true;
      log("LocalyticsSession successfully initialized");
    };

    var addCustomDimensionsToEvent = function (event, customDimensionList) {
      if (!customDimensionList) {
        return;
      }

      for (var i = 0; i < maxCustomDimensions; i += 1) {
        if (customDimensionList[i]) {
          event["c" + i] = "" + customDimensionList[i];
        }
      }
    };

    /**
     * Helper to determine if an object is an array
     */
    var isArray = Array.isArray || function (obj) {
      return Object.prototype.toString.call(obj) === "[object Array]";
    };

    /**
     * Opens the Localytics session.  This must be called before
     */
    ref._open = function () {
      lastCloseTime = ref._getStore(LAST_CLOSE_TIME, true) || 0;
      if ((generateClientTimeInMillis() - lastCloseTime) < (1000 * sessionTimeoutSeconds)) {
        log("Open called within timeout, resuming last session.");
        ref.close();
      } 
      else {
        finalizeClose();
        incrementCurrentSessionIndex();

        var sessionOpenTimeSeconds = getCurrentSessionOpenTime(true);
        var openObject = {
          "dt": "s",
          "ct": sessionOpenTimeSeconds,
          "u": getCurrentSessionUUID(true),
          "nth": ref._getSessionIndex(),
          "mc": getURLParameter("utm_campaign"),
          "mm": getURLParameter("utm_medium"),
          "ms": getURLParameter("utm_source")
        };

        lastOpenTimeSeconds = lastOpenTimeSeconds || ref._getStore(LAST_OPEN_TIME, true) || 0;
        if (lastOpenTimeSeconds && lastOpenTimeSeconds != 0) {
          var timeSinceLastOpen = sessionOpenTimeSeconds - lastOpenTimeSeconds;
          if (timeSinceLastOpen >= 1) {
            openObject['sl'] = Math.round(timeSinceLastOpen);
          }
        }
        lastOpenTimeSeconds = ref._writeStore(LAST_OPEN_TIME, sessionOpenTimeSeconds)

        addCustomDimensionsToEvent(openObject, ref._getOrCreateProperty(customDimensions, CUSTOM_DIMENSIONS, generateAssociativeArray, false));
        appendToStore(openObject);
        log("Appended open tag to event store");

        ref.close();
      }
    };

    /**
     * Allows a session to tag a particular event as having occured and optionally records some attributes associated 
     * with this event. This should not be called inside a loop. It should not be used to record personally identifiable 
     * information and it is best to define all your event names rather than generate them programatically. Custom dimensions 
     * can also be passed so they can be created or updated. Note that this method coerces eventName and the attributes' 
     * values to strings. Customer value increases (CLV) are optional. It's highly recommended that the 
     * value you're increasing is in the lowest possible unit. If you are interested in exact dollars, you might include the 
     * decimal place value such as $2.99 but the integer value that is be passed to Localytics would be 299, not 2.99. If the 
     * cents do not matter, feel free to use actual or rounded whole dollar values.
     * @param eventName Name of the event
     * @param attributes (Optional) A single-level object/hash/dictionary of key-value
     *        pairs. All values will be coerced to strings
     * @param customerValueIncrease (Optional) Numeric value, E.G. 5 for $5.00. Integer expected
     */
    ref._tagEvent = function (eventName, attributes, customerValueIncrease) {
      if (isNaN(customerValueIncrease)) {
        customerValueIncrease = 0;
      } else if ((parseFloat(customerValueIncrease) != parseInt(customerValueIncrease))){
        log("WARNING: Customer value increase passed as floating point number.");
      }
      var s, ea;
      var eventObject = {
        "dt": "e",
        "ct": generateClientTime(), 
        "u": generateUUID(),
        "su": getCurrentSessionUUID(),
        "n": "" + eventName
      };

      if (customerValueIncrease !== 0)
        eventObject["v"] = customerValueIncrease;

      if (attributes) {
        ea = {};
        for (s in attributes) {
          if (attributes.hasOwnProperty(s)) {
            ea[s] = "" + attributes[s];
          }
        }
        eventObject.attrs = ea;
      }

      addCustomDimensionsToEvent(eventObject, ref._getOrCreateProperty(customDimensions, CUSTOM_DIMENSIONS, generateAssociativeArray, false));
      appendToStore(eventObject);
      log("Tagged event: '" + eventName + "' with attributes (JSON): '" + JSON.stringify(ea) + "'");
    };

    ref._tagScreen = function (screenName) {
      screenFlows = ref._getOrCreateProperty(screenFlows, SCREEN_FLOWS, generateArray, false);
      var len = screenFlows.length || 0;
      var name = "" + screenName;
      if (screenFlows[len - 1] !== name) {
        screenFlows.push(name);
        ref._writeStore(SCREEN_FLOWS, screenFlows);
      }
    };


    /**
     * Initiates an upload of any stored Localytics data using this session's API
     * key. The upload uses the JSONP method, which temporarily inserts a script
     * tag into the header in order to make the request and parse the JSON response.
     */
    ref.upload = function () {
      ref.queueEventsForUpload();
      ref.processNextUpload();
    };

    ref.queueEventsForUpload = function () {
      if (eventStore && eventStore.length > 0) {
        var uploadObjects = eventStore.splice(0);
        var blob = "";
        var i;
        var len;
        uploadObjects.unshift(getHeader());
        for (i = 0, len = uploadObjects.length; i < len; i += 1) {
          blob += JSON.stringify(uploadObjects[i]) + '\n';
        }

        log("Adding new upload to queue");
        uploadQueue.push(blob);
        eventStore = null;
      }      
    }

    ref.processNextUpload = function () {
      if (uploadQueue && uploadQueue.length > 0) {
        // Is there an upload running?
        if (uploadTime != null) {
          // Has the upload timed out? 
          if ((generateClientTimeInMillis() - uploadTime) > (uploadTimeoutSeconds * 1000)) {
            log("Upload timed out, returning to queue");
            self.clearPendingUpload(true);
          }
          else {
            log("Upload in progress, waiting for it to finish");
            return;
          }
        } 

        pendingUpload = uploadQueue.shift();
        ref._send(pendingUpload);
        uploadTime = generateClientTimeInMillis();
      }
    }

    ref.clearPendingUpload = function (retry) {
      if (retry) {
        uploadQueue.unshift(pendingUpload);
      }

      pendingUpload = null;
    };

    /**
     Sets the value of a custom dimension. Custom dimensions are dimensions
     which contain user defined data unlike the predefined dimensions such as carrier, model, and country.
     Once a value for a custom dimension is set, the device it was set on will continue to upload that value
     until the value is changed. To clear a value pass nil as the value.
     The proper use of custom dimensions involves defining a dimension with less than ten distinct possible
     values and assigning it to one of the four available custom dimensions. Once assigned this definition should
     never be changed without changing the App Key otherwise old installs of the application will pollute new data.
     */
    ref._setCustomDimension = function(i, value) {
      if (isNaN(i) || i < 0 || i >= maxCustomDimensions) {
        log("Custom dimension index must be a number between 0 and " + maxCustomDimensions - 1);
        return;
      }

      customDimensions = ref._getOrCreateProperty(customDimensions, CUSTOM_DIMENSIONS, generateArray, false);
      customDimensions[i] = value;
      ref._writeStore(CUSTOM_DIMENSIONS, customDimensions);
    }

    var callbackFn = function (response) {
      // Response is either JSONP w/ a response_code property or an XHR object
      var rc = +(response.response_code || response.status);
      uploadTime = null;
      log("Callback called with response:");
      if (rc) {
        log("Response code: " + rc);
        if (rc === 202 || rc === 200) {
          // 4. On success, clear uploaded blobs
          log("Upload succeeded, clearing uploaded items.");
          ref.clearPendingUpload(false);
          ref.processNextUpload();
        } else if (rc >= 400 && rc > 500) {
          log("Response was 4XX, clearing items");
          ref.clearPendingUpload(false);
          ref.processNextUpload();
        } else if (response.message) {
          log("Upload failed with message:");
          log(response.message);
          ref.clearPendingUpload(true);
        }
      }
    };

    ref.close = function () {
      ref._markNewClose();
    };

    /**
     * Helper to determine if map is empty or not 
     */
    var isMapEmpty = function (map) {
        for (var key in map) {
            if (map.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    };

    /**
     * Helper to get parameter value from the URL
     */
    var getURLParameter = function (param)
    {
      var url = window.location.search.substring(1);
      var params = url.split('&');
      for (var i = 0; i < params.length; i++) 
      {
        var nameAndValue = params[i].split('=');
        if (nameAndValue[0] == param) 
        {
          return decodeURIComponent(nameAndValue[1]);
        }
      }
    }

    /**
     * Instantiates or gets latest identifiers map from storage, then
     * adds passed key value pair to identifiers map
     */
    var setInternalIdentifier = function (identifierName, identifierValue) {
        var identifiers = getIdentifiers();
        identifiers[identifierName += ""] = identifierValue += "";
        ref._writeStore(IDENTIFIERS, identifiers);
        log("Setting identifier: " + identifierName + " to " + identifierValue);
    };

    /**
     * Instantiates or gets latest identifiers map from storage, then
     * deletes passed key value pair from identifiers map
     */
    var deleteIdentifier = function (identifierName) {
        var identifiers = getIdentifiers();
        delete identifiers[identifierName += ""];
        ref._writeStore(IDENTIFIERS, identifiers);
        log("Deleting value for key:" + identifierName);
    };
    
    /**
     * Creates identifier for given name/value pair.  
     * @param identifierName Name of the identifier
     * @param identifierValue Value for identifier, a string or number 
     * is expected. If null or an empty string are passed, or param is 
     * empty, given identifier will be deleted.
     */
    ref._setIdentifier = function (identifierName, identifierValue) {
        if (identifierName == null || identifierName.length === 0)
            return;
        if (identifierValue == null || identifierValue.length === 0)
            deleteIdentifier(identifierName);
        else 
            setInternalIdentifier(identifierName, identifierValue);
    };

    ref._setCustomerName = function (customerName) {
        ref.setIdentifier("customer_name", customerName);
    };

    ref._setCustomerId = function (customerId) {
        ref.setIdentifier("customer_id", customerId);
    };

    ref._setCustomerEmail = function (customerEmail) {
        ref.setIdentifier("customer_email", customerEmail);
    };

    ref.__url__ = "//webanalytics.localytics.com/";

    var fallBackToSafe = function (fnName, e) {
      console.log("> Call to Localytics client library failed");
      console.log("> localyticsSession." + fnName + " failed");
      console.log("> " + e);
      console.log(e);
      for (var fnName in PUBLIC_METHODS) {
        ref[fnName] = emptyFn;
      }
    };

    // Public Methods
    (function () {
      var i, fnName, len = PUBLIC_METHODS.length;

      for (i = 0; i < len; i++) {
        fnName = PUBLIC_METHODS[i];

        ref[fnName] = (function (fn) {

          return function () {
            try {
              if (!hasInitialized) return;
              log("PUBLIC METHOD CALLED: " + fn);

              if (fn === 'tagEvent' || fn === 'tagScreen')
              {
                ref['_open']();
              } 
              ref['_' + fn].apply(ref, arguments);
              ref['upload']();
            } catch (e) {
              fallBackToSafe(fn, e);
            }
          };
        })(fnName);
      }
      init(options);

    })();

    return ref;
  }(window));
};
