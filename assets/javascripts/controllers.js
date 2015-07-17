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
	pickStringerTemplate : $("#pick-stringer-template").length ? Handlebars.compile($("#pick-stringer-template").html()) : null,
	stringerTemplate : $("#stringer-template").length ? Handlebars.compile($("#stringer-template").html()) : null,
	touchEnabled : $('html').hasClass('touch'),
	auth : function() {
		return app.fireRef.getAuth();
	},
	oAuthLogin : function(options) {
		app.fireRef.authWithOAuthRedirect(options.oauth, function(error, authData) {
			if (error) {
				console.log("Login Failed!", error);
			}
		});
	},
	initHistory : function(options) {
		app.fireRef.onAuth(function(authData) {
		  if (authData) {
				History.options.disableSuid = true;
				if(!History.getState().data.state) {
					History.pushState({state:options.initial}, 'Stringin.gs', '');
				} else {
					app.statechange();
				}
		  } else {
		    $('.panel.login').addClass('visible').scrollTop(0);
		  }
		});
	},
	statechange : function() {
		$('.panel.visible').removeClass('visible');
		$(History.getState().data.state).addClass('visible').scrollTop(0);
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
			moveContent = function() {
				if (content.hasClass('moved')) {
					content.removeClass('moved');
					$('.app-nav').removeClass('visible');
				}
			};
		if (options.move) {
			if (options.move === "touch" && app.touchEnabled) {
				moveContent();
			}
		} else {
			moveContent();
		}
	},
	showPanel : function(options) {
		var panel = $(options.panel);
		History.pushState({state:options.panel}, 'Stringin.gs | ' + options.panel, options.panel);
	},
	hidePanel : function(options) {
		History.back();
	},
	makeArray : function (obj) {
		return $.map(obj, function(el,key) { el.id = key; return el; });
	},
	listStringers : function(options) {
			var showList = $('.panel.stringers').find('.list').html(''),
					pickList = $('.results.stringer').html(''),
					$d = $.Deferred();
			for (var i = 0; i < app.stringers.length; i++) {
				showList.append(app.stringerTemplate(app.stringers[i]));
				pickList.append(app.pickStringerTemplate(app.stringers[i]));
			}
			showList.children().order();
			pickList.children().order();
	},
	addStringer : function(options) {
		var $d = $.Deferred();
		var stringer = {
			ref : app.fireRef.child("stringers"),
			fname : $('[name="new.stringer.fname"]'),
			lname : $('[name="new.stringer.lname"]'),
			onComplete : function(error) {
				if (error) {
					$d.reject();
					console.log('Bad news bears.');
				} else {
					$d.resolve();
					console.log('Sweet!');
					stringer.fname.val('');
					stringer.lname.val('');
				}
			}
		};
		stringer.ref.child(stringer.fname.val() + stringer.lname.val()).set({
			date_added : Date.now(),
			full_name : stringer.fname.val() + ' ' + stringer.lname.val()
		}, stringer.onComplete);
		return $d.promise();
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
		options.element.parent().data('input').val(options.element.text());
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
	logout : function() {
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
