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

      public.sync = function() {
        _.initDatas();
        _.initClicks();
      };

      public.getData = function(path, signature, isList, callback) {
        var ref = new Firebase(_.options.app.toString() + path);
        ref.on('value', function(snapshot) {
          if (snapshot.exists()) {
            var data = snapshot.key(),
            obj = snapshot.val(),
            path = snapshot.ref().toString().replace(_.options.app.toString(), '').replace('%3A', ':'),
            collection = {},
            html;
            if (signature in _.templates) {
              if (isList) {
                collection.parent = snapshot.ref().parent().toString().replace(_.options.app.toString(), '').replace('%3A', ':');
                collection.base = _.options.baseRef;
                collection[data] = [];
                for(key in obj) {
                  var newObj = obj[key];
                  newObj.id = key;
                  newObj.path = path + '/' + key;
                  collection[data].push(newObj);
                }
              } else {
                obj.path = path;
                obj.id = data;
              }
              html = _.templates[signature](isList ? collection : obj);
              if (signature in _.dom) {
                _.dom[signature].innerHTML = html;
              }
            }
            if (typeof callback === 'function') {
              callback(true);
            }
          } else {
            if (typeof callback === 'function') {
              callback(false);
            }
          }
        });
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
            }
            _[action](ref,obj, _['on' + capitalizeFirstLetter(action)]);
          }
        });
      };

      _.initDatas = function() {
        var datas = document.querySelectorAll('[fire-data]');
        for (var i = 0; i < datas.length; i++) {
          var el = datas[i],
          sig = createSig();
          _.dom[sig] = el;
          el.setAttribute('template', sig);
          _.templates[sig] = Hbs.compile(el.innerHTML);
          if (el.getAttribute('fire-data') !== '') {
            public.getData(_.options.baseRef + '/' + el.getAttribute('fire-data'), sig, el.getAttribute('fire-list'));
          }
        }
      };

      return public;
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
