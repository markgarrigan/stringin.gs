(function() {
  var fire = new Fireside();
  var User = {};
  var app = {
    auth : function() {
  		return fire.rootRef.getAuth();
  	},
  	oAuthLogin : function(options) {
  		app.showLoading();
  		fire.rootRef.authWithOAuthRedirect(options.oauth, function(error, authData) {
  			if (error) {
  				console.log("Login Failed!", error);
  			}
  		});
  	},
    initHistory : function(options) {
  		app.showLoading();
  		fire.rootRef.onAuth(function(authData) {
  			if (authData) {
  				app.checkForAccount(authData).then(function() {
            fire.setBase('users/' + authData.uid);
            fire.sync(function() {
              app.pushHistory(options);
            });
  				}).fail(function(data) {
  					$('.panel.error.createAccount').addClass('visible').scrollTop(0).find('p').text(data);
  				});
  			} else {
  				$('.panel.visible').removeClass('visible');
  				$('.panel.login').addClass('visible').scrollTop(0);
  			}
  		});
  	},
    checkForAccount : function(authData) {
  		var $d = $.Deferred();
  		fire.rootRef.child('users').child(authData.uid).once('value', function(snapshot){
  			if (snapshot.exists()) {
  				User = snapshot.val();
  				$d.resolve();
  			} else {
  				app.createNewAccount(authData).then(function(data) {
  					User = data;
  					$d.resolve();
  				}).fail(function(data) {
  					$d.reject(data);
  				});
  			}
  		});
  		return $d.promise();
  	},
  	createNewAccount : function(authData) {
  		var user = {},
  		$d = $.Deferred();
  		if (authData) {
  			user.provider = authData.provider;
  			user.name = getName(authData);
  			user.id = authData.uid;
  			fire.rootRef.child('users').child(authData.uid).set(user, onComplete);
  		}
  		return $d.promise();
  		function getName(authData) {
  			switch(authData.provider) {
  				case 'password':
  				return authData.password.email.replace(/@.*/, '');
  				case 'twitter':
  				return authData.twitter.displayName;
  				case 'facebook':
  				return authData.facebook.displayName;
  				case 'google':
  				return authData.google.displayName;
  			}
  		}
  		function onComplete(error) {
  			if (error) {
  				$d.reject('Could not create new account.');
  			} else {
  				$d.resolve(user);
  			}
  		}
  	},
    pushHistory : function(options) {
      History.options.disableSuid = true;
      if(!History.getState().data.state) {
        History.pushState({state:options.initial}, 'Stringin.gs', '');
      } else {
        app.statechange();
      }
    },
    statechange : function() {
  		$('.panel.visible').removeClass('visible');
  		var panel = History.getState().data.state,
  		$panel = $('.panel' + panel);
      if ($panel.hasClass('checkFirst') && $panel.attr('fire-data') === '') {
        panel = '.home';
      }
  		$('.panel' + panel).addClass('visible').scrollTop(0);
  	},
    toggleContent : function(options) {
  		$('.app-content').toggleClass('moved');
  		$('.app-nav').toggleClass('visible');
  	},
  	moveContent : function(options) {
  		var content = $('.app-content');
  		if (!content.hasClass('moved')) {
  			content.addClass('moved');
  			$('.app-nav').addClass('visible');
  		}
  	},
  	moveContentBack : function(options) {
  		var content = $('.app-content'),
  		move = function() {
  			content.removeClass('moved');
  			$('.app-nav').removeClass('visible');
  		};
  		if (app.touch() || options.force === true) {
  			move();
  			return true;
  		}
  	},
  	showLoading : function() {
  		$('.panel.loading').addClass('visible').scrollTop(0);
  	},
  	showPanel : function(options) {
  		if (!User) {
  			$('.panel.visible').removeClass('visible');
  			$('.panel.login').addClass('visible').scrollTop(0);
  		} else {
  			History.pushState({state:options.panel}, 'Stringin.gs | ' + options.panel, options.panel);
  		}
  	},
  	hidePanel : function(options) {
  		History.back();
  	},
    quickSearch : function(options) {
      var items = $(options.results + '.results').children(),
          query = options.value.split(' ').join('');
      if (query.length > 0) {
        app.showResults(options);
        for (var i = 0; i < items.length; i++) {
          $(items[i]).toggleClass('hide', !find(query, items[i]));
        }
        if (items.length == items.filter(function() {return $(this).hasClass('hide');}).length) {
          app.hideResults(options,true);
        }
      } else {
        items.children().removeClass('hide');
        app.hideResults(options,true);
      }
      function find(query, el) {
        var found = true;
        if (el.textContent.toLowerCase().split(' ').join('').indexOf(query.toLowerCase()) === -1) {
          found = false;
        }
        return found;
      }
    },
    positionResults : function(options) {
      var results = $(options.results + '.results');
      if (results.hasClass('gonzo')) {
        var halfWinHeight = window.outerHeight/2,
    		formRow = options.element.parent(),
    		formRowTop = formRow.offset().top,
    		formRowBottom = formRowTop + formRow.outerHeight(true),
    		resultsTop = 0,
    		resultsBottom = Number(results.css('bottom').replace('px', ''));
    		if (formRowBottom < halfWinHeight) {
    			resultsTop = Math.ceil(formRowBottom);
    		} else {
    			resultsBottom = Math.floor(window.outerHeight - formRowTop) + 2;
    		}
    		$(options.results + '.results').css({
    			top : resultsTop,
    			bottom : resultsBottom
    		});
      }
  	},
  	showResults : function(options) {
  		options.element.parents('form').addClass('no-scroll');
  		$(options.results + '.results').removeClass('gonzo').data('input', options.element);
  	},
  	hideResults : function(options,now) {
  		now = typeof now !== 'undefined' ? now : false;
  		var hR = function() {
  			options.element.parents('form').removeClass('no-scroll');
  			$(options.results + '.results').addClass('gonzo').data('input', '');
  		};
  		if (now) {
  			hR();
  		} else {
  			app.wait(200).then(function() {
  				hR();
  			});
  		}
  	},
    getData : function(options) {
      if (!options.now) { app.showLoading(); }
      var $d = $.Deferred(),
          $panel = $(options.target ? options.target : '.panel' + options.panel);
      $panel.attr('fire-data', options.url);
      fire.getData(options.url, $panel.attr('template'), $panel.attr('fire-list'), function(data) {
        if (data) {
          $d.resolve();
        } else {
          $d.resolve();
        }
      }, $panel[0]);
      return $d.promise();
    },
    showTab : function(options) {
  		options.element.addClass('selected').siblings().removeClass('selected');
  		options.element.parents('.tabview').find('.tab' + options.tab).addClass('show').siblings().removeClass('show');
  	},
    buildDropper : function(options) {
      if (!options.el.hasAttribute('readonly')) {
        options.element.dateDropper(dateDropperOptions);
        // options.element.blur().focus();
      }
    },
  	setSlider : function(options) {
  		$('[data-input="' + options.slider + '"]').val(options.value).slider('refresh');
  	},
  	makeValue : function(options) {
  		options.element.parent().prev('input').val(options.element.text());
  	},
    touch : function() {
  		return !$('html').hasClass('no-touch');
  	},
    logout : function() {
  		User = false;
  		fire.rootRef.unauth();
  	},
  	waitHide : function(options) {
  		app.wait(5000).then(function() {
  			options.element.fadeOut();
  		});
  	},
  	wait : function(time) {
  		return $.Deferred(function(dfd) {
  			setTimeout(dfd.resolve, time);
  		});
  	},
  	methods : function(names) {
  		return names.split(',');
  	},
  	log : function(obj) {
  		if (window.console) {
  			console.log(obj);
  		}
  	}
  };
  var Queue = function(methods,options) {
  	if (methods.length) {
  		$.when(app[methods[0]](options)).then(function() {
  			methods.splice(0,1);
  			Queue(methods,options);
  		});
  	}
  };

  Handlebars.registerHelper('year', function(value) {
    return moment(value, 'MM/DD/YYYY').format('YYYY');
  });

  Handlebars.registerHelper('count', function(things) {
    return things.length;
  });

  Handlebars.registerHelper('stringings_count_by', function(stringings,by,options) {
    var things = 0;
    for (var i = 0; i < stringings.length; i++) {
      if (stringings[i].date >= moment().startOf(by).format('MM/DD/YYYY') && stringings[i].date <= moment().endOf(by).format('MM/DD/YYYY')) {
        things += 1;
      }
    }
    return things;
  });

  Handlebars.registerHelper('stringings_today', function(stringings,options) {
    ret = '';
    for (var i = 0; i < stringings.length; i++) {
      if (stringings[i].date === moment().format('MM/DD/YYYY')) {
        ret += '<p>' + stringings[i].customer + '</p>';
      }
    }
    return ret;
  });

  Handlebars.registerHelper('stringings_this_week', function(stringings,options) {
    var ret = '<table class="data bottom bars flat">';
    var week = {
      total:0,
      days : [
        {day:'S',stringings:0,percentage:0},
        {day:'M',stringings:0,percentage:0},
        {day:'T',stringings:0,percentage:0},
        {day:'W',stringings:0,percentage:0},
        {day:'R',stringings:0,percentage:0},
        {day:'F',stringings:0,percentage:0},
        {day:'S',stringings:0,percentage:0}
      ]
    };
    for(var d=0, b=7; d<b; d++) {
      for (var s = 0; s < stringings.length; s++) {
        if (stringings[s].date === moment().startOf('week').add(d,'days').format('MM/DD/YYYY')) {
          week.days[d].stringings += 1;
        }
      }
      week.total += week.days[d].stringings;
    }
    for(var i=0, l=7; i<l; i++) {
      week.days[i].percentage = (week.days[i].stringings / week.total)*100;
      ret += '<tr><td>'+ week.days[i].day +'</td><td><span><span style="width:'+ week.days[i].percentage +'%;"></span></span></td><td>'+ week.days[i].stringings +'</td></tr>';
    }
    return ret + '</table>';
  });

  Handlebars.registerHelper('stringings_this_month', function(stringings,options) {
    var ret = '';
    var month = {
      total:0,
      days : []
    };
    var day=1;
    while (day <= Number(moment().endOf('month').format('DD'))) {
      month.days[day - 1] = {
        'day': day,
        'stringings': 0,
        'percentage':0
      }
      day++;
    }
    for(var d=0, b=month.days.length; d<b; d++) {
      for (var s = 0; s < stringings.length; s++) {
        if (stringings[s].date === moment().startOf('month').add(d,'days').format('MM/DD/YYYY')) {
          month.days[d].stringings += 1;
        }
      }
      month.total += month.days[d].stringings;
    }
    for(var i=0, l=month.days.length; i<l; i++) {
      month.days[i].percentage = (month.days[i].stringings / month.total)*100;
      ret += '<div><span>'+ month.days[i].day +'</span><span><span style="height: '+ month.days[i].percentage +'%"></span></span><span>'+ month.days[i].stringings +'</span></div>';
    }
    return ret;
  });

  if ('addEventListener' in document) {
    document.addEventListener('DOMContentLoaded', function() {
      FastClick.attach(document.body);
    }, false);
  }

	$('.slider').slider({
		create: function() {
			$('[name="' + $(this).data('input') + '"]').val(this.value);
		}
	}).on('change', function() {
		$('[name="' + $(this).data('input') + '"]').val(this.value);
	});

	$('.ui-slider-handle').mousedown(function(e) {
		e.stopPropagation();
	});

  var dateDropperOptions = {
    color: '#008FF5',
    borderRadius: 0
  };

  $( ".datedropper" ).dateDropper(dateDropperOptions);

	Mousetrap.bind('s', function() { $('[data-key=s]').click(); });
	Mousetrap.bind('c', function() { $('[data-key=c]').click(); });
	Mousetrap.bind('r', function() { $('[data-key=r]').click(); });
	Mousetrap.bind('e', function() { $('[data-key=e]').click(); });
	Mousetrap.bind('a', function() { $('[data-key=a]').click(); });
	Mousetrap.bind('b', function() { $('[data-key=b]').click(); });
	Mousetrap.bind('h', function() { $('[data-key=h]').click(); });
	Mousetrap.bind('n', function() { $('[data-key=n]').click(); });
	Mousetrap.bind('t', function() { $('[data-key=t]').click(); });
	Mousetrap.bind('esc', function() { app.hidePanel(); });

  // Bind to StateChange Event
  History.Adapter.bind(window,'statechange',function(){ // Note: We are using statechange instead of popstate
		app.statechange();
  });

	$('[data-on-load]').each(function() {
		var $this = $(this);
		var data = $this.data();
		var options = $.extend({el : this, element : $this, value : $this.val()},data,data.options);
		var methods = app.methods(data.onLoad);
		Queue(methods,options);
	});

  $('body').on('mouseenter', '[data-on-mouseenter]', function(e) {
    var $this = $(this);
    var data = $this.data();
    var options = $.extend({el : this, element : $this},data,data.options);
    var methods = app.methods(data.onMouseenter);
    Queue(methods,options);
  });

  $('body').on('mouseleave', '[data-on-mouseleave]', function(e) {
    var $this = $(this);
    var data = $this.data();
    var options = $.extend({el : this, element : $this},data,data.options);
    var methods = app.methods(data.onMouseleave);
    Queue(methods,options);
  });

  $('body').on('mouseover', '[data-on-mouseover]', function(e) {
    var $this = $(this);
    var data = $this.data();
    var options = $.extend({el : this, element : $this},data,data.options);
    var methods = app.methods(data.onMouseover);
    Queue(methods,options);
  });

  $('body').on('click', '[data-click]', function(e) {
  	var $this = $(this);
  	var data = $this.data();
  	var options = $.extend({el : this, element : $this},data,data.options);
  	var methods = app.methods(data.click);
  	Queue(methods,options);
  });

  $('body').on('click', '[data-on-click]', function(e) {
  	e.stopPropagation();
  	e.preventDefault();
  	var $this = $(this);
  	var data = $this.data();
  	var options = $.extend({el : this, element : $this},data,data.options);
  	var methods = app.methods(data.onClick);
  	Queue(methods,options);
  });

  $('body').on('keydown', '[data-on-keydown]', function() {
    var $this = $(this);
    var data = $this.data();
    var options = $.extend({el : this, element : $this, value : $this.val()},data,data.options);
    var methods = app.methods(data.onKeydown);
    Queue(methods,options);
  });

	$('body').on('keyup', '[data-on-keyup]', function() {
		var $this = $(this);
		var data = $this.data();
		var options = $.extend({el : this, element : $this, value : $this.val()},data,data.options);
		var methods = app.methods(data.onKeyup);
		Queue(methods,options);
	});

	$('body').on('change', '[data-on-change]', function() {
		var $this = $(this);
		var data = $this.data();
		var options = $.extend({el : this, element : $this, value : $this.val()},data,data.options);
		var methods = app.methods(data.onChange);
		Queue(methods,options);
	});

	$('body').on('blur', '[data-on-blur]', function() {
		var $this = $(this);
		var data = $this.data();
		var options = $.extend({el : this, element : $this, value : $this.val()},data,data.options);
		var methods = app.methods(data.onBlur);
		Queue(methods,options);
	});

	$('body').on('focus', '[data-on-focus]', function() {
		var $this = $(this);
		var data = $this.data();
		var options = $.extend({el : this, element : $this, value : $this.val()},data,data.options);
		var methods = app.methods(data.onFocus);
		Queue(methods,options);
	});

	$('body').on('submit', '[data-on-submit]', function(e) {
		e.preventDefault();
		var $this = $(this);
		var self = this;
		var data = $this.data();
		var options = $.extend({self : this,element : $this,iframe : $this.attr('target')},data,$this.data('options'));
		methods = app.methods(data.onSubmit);
		Queue(methods,options);
	});

})();
