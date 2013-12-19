var Queue = function(methods,options) {
	if (methods.length) {
		$.when(app[methods[0]](options)).then(function() {
			methods.splice(0,1);
			Queue(methods,options);
		});
	}
};
$.extend(app,{
	stringerTemplate : $("#stringer-template").length ? Handlebars.compile($("#stringer-template").html()) : null,
	touchEnabled : isEventSupported('touchstart'),
	initHistory : function(options) {
		History.options.disableSuid = true;
		if(!History.getState().data.state) {
			History.pushState({state:options.initial}, 'Stringin.gs', '');
		}
		app.statechange();
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
			if (options.move == "touch" && app.touchEnabled) {
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
	addStringer : function(options) {
		var form = options.element.parents('form'),
			panel = $(options.panel),
			list = panel.find('.list'),
			d = $.Deferred();
	    var request = $.ajax({
	          url: form.attr('action'),
	          type: 'POST',
	          data: form.serialize()
	        });
		request.done(function (data) {
			form.find('input').val('');
			list.append(app.stringerTemplate(data));
			list.children().order();
		  	d.resolve(data);
		});
		request.fail(d.reject);
		return d.promise();
	},
	quickSearch : function(options) {
		if (!options.element.hasClass('searching')) {
			if (options.value.length > 1) {
				$(options.results + '.results').show().data('input', options.element);
				options.element.addClass('searching');
				options.element.quicksearch(options.results + '.results p', {

				});
			}
		}
		if (options.value.length <= 1) {
			app.hideResults(options,true);
		}
	},
	hideResults : function(options,now) {
		now = typeof now !== 'undefined' ? now : false;
		var hR = function() {
			$(options.results + '.results').hide().data('input', '');
			options.element.removeClass('searching');
			delete options.element['quickSearch'];			
		}
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