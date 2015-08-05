(function(window,document,Hbs) {

  function Fireside() {

      var public        = {},
          _             = {};

      var defaults = {
        app             : createRoot(),
        baseRef         : ''
      };

      _.dom             = {};
      _.templates       = {};

      // Create options by extending defaults with the passed in arugments
      if (arguments[0] && typeof arguments[0] === "object") {
        _.options = extendDefaults(defaults, arguments[0]);
      } else {
        _.options = defaults;
      }

      public.rootRef = _.options.app;

      public.setBase = function(base) {
        _.options.baseRef = base;
      };

      // public.baseRef = _.options.app.child(_.options.baseRef);

      public.sync = function(callback) {
        _.initClicks();
        _.initDatas(function() {
          callback();
        });
      };

      public.getData = function(path, signature, isList, callback, element) {
        var error = false;
        var ref = new Firebase(_.options.app.toString() + path);
        var data = {};
        ref.on('value', function(snapshot) {
          var parent = snapshot.ref().parent().toString().replace(_.options.app.toString(), '').replace('%3A', ':'),
          base = _.options.baseRef;
          if (snapshot.exists()) {
            data = processSnapShot(snapshot,isList);
            data.__parent = parent;
            data.__base = base;
            injectData(data);
            var extends = element.querySelectorAll('[fire-extend]');
            if (extends.length) {
              for (var i = 0; i < extends.length; i++) {
                var extend = extends[i].getAttribute('fire-extend'),
                    list = extends[i].hasAttribute('fire-list');
                 createChain(extends[i]).on(createOn(extends[i]), function(snapshot) {
                  if (snapshot.exists()) {
                    var extendData = processSnapShot(snapshot,list);
                    for (var key in extendData) {
                      if (extendData.hasOwnProperty(key)) {
                        data[key] = extendData[key];
                      }
                    }
                  }
                  if (i === extends.length - 1) {
                    if (typeof callback === 'function') {
                      injectData(data);
                      callback(error);
                    }
                  }
                });
              }
            } else {
              injectData(data);
            }
          } else {
              error = true;
          }
          if (typeof callback === 'function') {
            injectData(data);
            callback(error);
          }
        });

        function createOn(element) {
          return element.hasAttribute('fire-on') ? element.getAttribute('fire-on') : 'value';
        }

        function createChain(element) {
          var ref = _.options.app.child(_.options.baseRef + '/' + element.getAttribute('fire-extend'));
          if (element.hasAttribute('fire-order-by-child')) {
            ref = ref.orderByChild(element.getAttribute('fire-order-by-child'));
          }
          if (element.hasAttribute('fire-equal-to')) {
            ref = ref.equalTo(element.getAttribute('fire-equal-to'));
          }
          return ref;
        }

        function processSnapShot(snapshot,list) {
          var snapshotKey = snapshot.key(),
          data = snapshot.val(),
          path = snapshot.ref().toString().replace(_.options.app.toString(), '').replace('%3A', ':');
          if (list) {
            var collection = {};
            collection[snapshotKey] = [];
            for(key in data) {
              var newObj = data[key];
              newObj.__id = key;
              newObj.__path = path + '/' + key;
              collection[snapshotKey].push(newObj);
            }
            data = collection;
          } else {
            data.__path = path;
            data.__id = snapshotKey;
          }
          return data;
        }

        function injectData(data) {
          var html;
          if (signature in _.templates) {
            html = _.templates[signature](data);
          }
          if (signature in _.dom) {
            _.dom[signature].innerHTML = html;
          }
        }
      };

      _.onPush = function(error) {
        if (error) {
          alert('Boooo');
        }
      };

      _.onUpdate = function(error) {
        if (error) {
          alert('Boooo');
        }
      };

      _.push = function(ref,obj,callback) {
        _.options.app.child(_.options.baseRef + '/' + ref).push(obj,callback);
      }

      _.update = function(ref,obj,callback) {
        _.options.app.child(ref).update(obj,callback);
      }

      _.initClicks = function() {
        document.body.addEventListener('click', function(e) {
          if (e.target.hasAttribute('fire-on-click')) {
            e.preventDefault();
            var directions = e.target.getAttribute('fire-on-click').split(' '),
                action = directions[0],
                ref = directions[1],
                obj = {},
                fields = document.querySelectorAll('[name^="' + ref + '/"]'),
                _j,_len1;
            for (_j = 0, _len1 = fields.length; _j < _len1; _j++) {
              var field = fields[_j],
                  value = field.type === 'checkbox' ? field.checked : field.value,
                  path = field.getAttribute('name').replace(ref + '/', '').split('/');
              assign(obj,path,value);
              field.type === 'checkbox' ? field.checked = false : field.value = '';
            }
            _[action](ref,obj, _['on' + capitalizeFirstLetter(action)]);
          }
        });
      };

      _.initDatas = function(callback) {
        var datas = document.querySelectorAll('[fire-data]');
        for (var i = 0; i < datas.length; i++) {
          var el = datas[i];
          var sig = createSig();
          _.dom[sig] = el;
          el.setAttribute('template', sig);
          _.templates[sig] = Hbs.compile(el.innerHTML);
          if (el.getAttribute('fire-data') !== '') {
            public.getData(_.options.baseRef + '/' + el.getAttribute('fire-data'), sig, el.getAttribute('fire-list'), callback, el);
          }
        }
      };

      return public;
  }

  function createTemplate(element) {

  }

  function createRoot() {
    return new Firebase("https://" + document.querySelector('[fire-app]').getAttribute('fire-app') + ".firebaseio.com/");
  }

  function createSig() {
    return '_s' + Math.floor( Math.random() * 1000000 ) + '_';
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function extendDefaults(source, properties) {
    var property;
    for (property in properties) {
      if (properties.hasOwnProperty(property)) {
        source[property] = properties[property];
      }
    }
    return source;
  }

  function assign(obj, keyPath, value) {
    var _i,lastKey;
    lastKey = keyPath.length - 1;
    for (_i = 0; _i < lastKey; _i++) {
      var key = keyPath[_i];
      if (!(key in obj)) {
        obj[key] = {};
      }
      obj = obj[key];
    }
    obj[keyPath[lastKey]] = value;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = fireside;
  }

  window.Fireside = Fireside;

})(window,document,Handlebars);
