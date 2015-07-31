var Queue = function(methods,options) {
	if (methods.length) {
		$.when(app[methods[0]](options)).then(function() {
			methods.splice(0,1);
			Queue(methods,options);
		});
	}
};
$.extend(app,{
	fireRef : new Firebase("https://stringings.firebaseio.com/"),
	touchDisabled : function() {
		return $('html').hasClass('no-touch');
	},
	auth : function() {
		return app.fireRef.getAuth();
	},
	oAuthLogin : function(options) {
		app.showLoading();
		app.fireRef.authWithOAuthRedirect(options.oauth, function(error, authData) {
			if (error) {
				console.log("Login Failed!", error);
			}
		});
	},
	checkForAccount : function(authData) {
		var $d = $.Deferred();
		// attempt to get the child in the collection by uid.
		app.fireRef.child('users').child(authData.uid).once('value', function(snapshot){
			// if data exists
			if (snapshot.exists()) {
				app.user = snapshot.val();
				$d.resolve();
			} else {
				app.createNewAccount(authData).then(function(data) {
					app.user = data;
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
			app.fireRef.child('users').child(authData.uid).set(user, onComplete);
		}
		return $d.promise();
		// find a suitable name based on the meta info given by each provider
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
	data : {
		"stringer" : {
			"fname" : '',
			"lname" : ''
		},
		"string" : {
			"brand" : '',
			"name" : '',
			"guage" : ''
		},
		"customer" : {
			"fname" : '',
			"lname" : ''
		},
		"racquet" : {
			"brand" : '',
			"name" : ''
		},
		"event" : {
			"name" : '',
			"start" : '',
			"end" : ''
		},
		details : {}
	},
	setValue : function(options) {
		app.setProperty(app.data,options.prop,options.element.val());
	},
	initData : function(callback) {
		if (app.user) {
			rivets.formatters.year = function(value){
				var d = new Date(Date.parse(value));
				return d.getFullYear();
			};
			rivets.bind(document.getElementById('stringings-app'), {app: app.data});
			app.fireRef.child('users').child(app.user.id).on("value", function(snapshot) {
				if (snapshot.exists()) {
					app.data.stringers = snapshot.child('stringers').exists() ? app.makeArray(snapshot.child('stringers').val()) : null;
					app.data.customers = snapshot.child('customers').exists() ? app.makeArray(snapshot.child('customers').val()) : null;
					app.data.strings = snapshot.child('strings').exists() ? app.makeArray(snapshot.child('strings').val()) : null;
					app.data.events = snapshot.child('events').exists() ? app.makeArray(snapshot.child('events').val()) : null;
					callback();
				}
			}, function (errorObject) {
				console.log("The read failed: " + errorObject.code);
			});
		}
	},
	initHistory : function(options) {
		app.showLoading();
		app.fireRef.onAuth(function(authData) {
			if (authData) {
				app.checkForAccount(authData).then(function() {
					app.initData(pushHistory);
					function pushHistory() {
						History.options.disableSuid = true;
						if(!History.getState().data.state) {
							History.pushState({state:options.initial}, 'Stringin.gs', '');
						} else {
							app.statechange();
						}
					}
				}).fail(function(data) {
					$('.panel.error.createAccount').addClass('visible').scrollTop(0).find('p').text(data);
				});
			} else {
				$('.panel.visible').removeClass('visible');
				$('.panel.login').addClass('visible').scrollTop(0);
			}
		});
	},
	statechange : function() {
		$('.panel.visible').removeClass('visible');
		var panel = History.getState().data.state,
		$panel = $('.panel' + panel),
		check = app.getProperty(app.data, $panel.data('check') || 'details');
		if (!check) {
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
		if (!app.touchDisabled() || options.force === true) {
			move();
			return true;
		}
	},
	showLoading : function() {
		$('.panel.loading').addClass('visible').scrollTop(0);
	},
	showPanel : function(options) {
		if (!app.user) {
			$('.panel.visible').removeClass('visible');
			$('.panel.login').addClass('visible').scrollTop(0);
		} else {
			History.pushState({state:options.panel}, 'Stringin.gs | ' + options.panel, options.panel);
		}
	},
	hidePanel : function(options) {
		History.back();
	},
	showLabel : function(options) {
		$(options.element).prev('label').toggleClass('show', options.value.length ? true : false);
	},
	getDetails : function(options) {
		app.data.details[options.details] = app.findInArrayOfObjects('id',options.id,app.data[options.key]);
	},
	getList : function(options) {
		var parent = app.findInArrayOfObjects('id',options.id,app.data[options.from]);
		app.data[options.key] = app.makeArray(parent[options.key]);
	},
	makeArray : function (obj) {
		return $.map(obj, function(el,key) { el.id = key; return el; });
	},
	listThings : function(things,name) {
		if (things) {
			var plural = name + 's',
			showList = $('.panel.' + plural).find('.list').html(''),
			pickList = $('.results.' + name).html(''),
			pickTemplate = $("#pick-" + name + "-template").length ? Handlebars.compile($("#pick-" + name + "-template").html()) : null,
			itemTemplate = $("#" + name + "-template").length ? Handlebars.compile($("#" + name + "-template").html()) : null;
			for (var i = 0; i < app[plural].length; i++) {
				showList.append(itemTemplate(app[plural][i]));
				pickList.append(pickTemplate(app[plural][i]));
			}
			showList.children().order();
			pickList.children().order();
		}
	},
	clearModel : function(model) {
		function iterate(obj) {
			for (var property in obj) {
				if (obj.hasOwnProperty(property)) {
					if (typeof obj[property] === "object") {
						iterate(obj[property]);
					} else {
						obj[property] = '';
					}
				}
			}
		}
		iterate(model);
	},
	update : function(options) {
		app.showLoading();
		var $d = $.Deferred(),
		fireArray = options.update.split(' in '),
		obj = {},
		keys = fireArray[0].split(' and '),
		ref = app.fireRef.child('users').child(app.user.id).child(fireArray[fireArray.length - 1]).child(options.id);
		for (var i = 0; i < keys.length; i++) {
			if (app.data.details[fireArray[1]].hasOwnProperty(keys[i])) {
				obj[keys[i]] = app.data.details[fireArray[1]][keys[i]];
			}
		}
		app.updateData(ref,obj).then(function() {
			$d.resolve();
		}).fail(function() {
			$d.reject();
			alert("Could not update the " + fireArray[0] + ". Please try again.");
		});
	},
	create : function(options) {
		app.showLoading();
		var $d = $.Deferred(),
		pathArray = options.create.split(' in '),
		objArray = pathArray.shift().split(' from '),
		keys = objArray.shift().split(' and '),
		obj = {},
		target = '';
		// Build clean object to pass to firebase
		for (var i = 0; i < keys.length; i++) {
			if (app.data[objArray[0]].hasOwnProperty(keys[i])) {
				obj[keys[i]] = app.data[objArray[0]][keys[i]];
			}
		}
		// Build reference path for firebase
		for (var i = 0; i < pathArray.reverse().length; i++) {
			if (~pathArray[i].indexOf('data-')) {
				target += options.element.attr(pathArray[i]);
			} else {
				target += pathArray[i];
			}
			if (pathArray.length - 1 > i) target += '/'
		}
		// console.log(pathArray.reverse());
		// console.log(objArray);
		// console.log(keys);
		// console.log(obj);
		// console.log(target);
		var ref = app.fireRef.child('users').child(app.user.id).child(target);
		app.pushData(ref,obj).then(function() {
			$d.resolve();
			app.clearModel(app.data[objArray[0]]);
		}).fail(function() {
			$d.reject();
			alert("Could not create that " + objArray[0] + ". Please try again.");
		});
		return $d.promise();
	},
	pushData : function(ref,data) {
		var $d = $.Deferred();
		ref.push(data, onComplete);
		return $d.promise();
		function onComplete(error) {
			if (error) {
				$d.reject();
			} else {
				$d.resolve();
			}
		}
	},
	updateData : function(ref,data) {
		var $d = $.Deferred();
		ref.update(data, onComplete);
		return $d.promise();
		function onComplete(error) {
			if (error) {
				$d.reject();
			} else {
				$d.resolve();
			}
		}
	},
	selectThis : function (options) {
		options.element.siblings().removeClass('selected');
		options.element.addClass('selected');
	},
	showContent : function(options) {
		var content = options.content.split(',');
		for (var i = 0; i < content.length; i++) {
			$(content[i]).addClass('show').siblings().removeClass('show');
		}
	},
	showTab : function(options) {
		options.element.addClass('selected').siblings().removeClass('selected');
		options.element.parents('.tabview').find('.tab' + options.tab).addClass('show').siblings().removeClass('show');
	},
	quickSearch : function(options) {
		if (!options.element.hasClass('searching')) {
			if (options.value.length > 1) {
				app.showResults(options);
				options.element.addClass('searching');
				options.element.quicksearch(options.results + '.results p', {

				});
			}
		}
		if (options.value.length <= 1) {
			app.hideResults(options,true);
		}
	},
	positionResults : function(options) {
		var halfWinHeight = window.outerHeight/2,
		formRow = options.element.parent(),
		formRowTop = formRow.position().top,
		formRowBottom = formRowTop + formRow.outerHeight(true),
		results = $(options.results + '.results'),
		resultsTop = 0,
		resultsBottom = Number(results.css('bottom').replace('px', ''));
		if (formRowBottom < halfWinHeight) {
			resultsTop = Math.ceil(formRowBottom);
		} else {
			resultsBottom = Math.floor(window.outerHeight - formRowTop) + 1;
		}
		$(options.results + '.results').css({
			top : resultsTop,
			bottom : resultsBottom
		});
	},
	showResults : function(options) {
		options.element.parents('.panel').addClass('no-scroll');
		$(options.results + '.results').removeClass('gonzo').data('input', options.element);
	},
	hideResults : function(options,now) {
		now = typeof now !== 'undefined' ? now : false;
		var hR = function() {
			options.element.parents('.panel').removeClass('no-scroll');
			$(options.results + '.results').addClass('gonzo').data('input', '');
			options.element.removeClass('searching');
			delete options.element.quickSearch;
		};
		if (now) {
			hR();
		} else {
			app.wait(200).then(function() {
				hR();
			});
		}
	},
	setSlider : function(options) {
		$('[data-input=' + options.slider + ']').val(options.value).slider('refresh');
	},
	makeValue : function(options) {
		options.element.parent().prev('input').val(options.element.text());
	},
	updateUrl : function(options) {
		var re = /https?:\/\//gi;
		options.element.val(options.element.val().replace(re, ""));
	},
	checkUrl : function(options) {
		if (options.element.val() && !app.validUrl({value:options.element.val()})) {
			options.element.addClass('invalid');
			options.element.val('').focus().select();
		}
	},
	checkEmail : function(options) {
		if (options.element.val() && !app.validEmail({value:options.element.val()})) {
			options.element.addClass('invalid');
			options.element.val('').focus().select();
		}
	},
	validUrl : function(options) {
		var re = new RegExp(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?[#?\w?]*$/);
		return options.value && options.value.length && options.value.match(re);
	},
	validEmail : function(options) {
		var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
		return options.value && options.value.length && emailReg.test(options.value);
	},
	showCardType : function(options) {
		if (options.value) {
			$(options.type).children().addClass('notit').removeClass('it');
			$(options.type).children('.' + $.payment.cardType(options.value)).removeClass('notit').addClass('it');
		} else {
			$(options.type).children().removeClass('notit').removeClass('it');
		}
	},
	findInArrayOfObjects : function(key,value,array) {
		for (var i=0; i < array.length; i++) {
			if (array[i][key] === value) {
				return array[i];
			}
		}
	},
	// models : {},
	setProperty : function(obj,path,value) {
		var paths = path.split('.'),
		current = obj,
		i;
		for (i = 0; i < paths.length; i++) {
			if (current[paths[i]] === undefined) {
				return undefined;
			} else if (paths.length - 1 === i) {
				current[paths[i]] = value;
			} else {
				current = current[paths[i]];
			}
		}
	},
	getProperty : function(obj,path) {
		var paths = path.split('.'),
		current = obj,
		i;
		for (i = 0; i < paths.length; ++i) {
			if (current[paths[i]] === undefined) {
				return undefined;
			} else {
				current = current[paths[i]];
			}
		}
		return current;
	},
	// initModels : function(options) {
	// 	var models = String(options.models).split(',');
	// 	models.forEach(function (name, index, array) {
	// 		$('[data-value^="' + name + '."]').each(function() {
	// 			var $this = $(this),
	// 			path = $this.data('value'),
	// 			value = app.getProperty(app.models, path);
	// 			if (value) {
	//
	// 			} else {
	// 				var model = new Model($this);
	// 			}
	// 		});
	// 	});
	// },
	logout : function() {
		app.user = false;
		app.fireRef.unauth();
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
});
