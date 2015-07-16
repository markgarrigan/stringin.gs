$(function(){

	$('.only-number').payment('restrictNumeric');

	$('.slider').slider({
		create: function() {
			$('[name=' + $(this).data('input') + ']').val(this.value);
		}
	}).on('change', function() {
		$('[name=' + $(this).data('input') + ']').val(this.value);
	});

	$('.ui-slider-handle').mousedown(function(e) {
		e.stopPropagation();
	});

	$('.datepicker').pickadate().pickadate('picker').set('select', Date.now());

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

	$('body').on('tap', '[data-on-tap]', function(e) {
		e.stopPropagation();
		e.preventDefault();
		var $this = $(this);
		var data = $this.data();
		var options = $.extend({el : this, element : $this},data,data.options);
		var methods = app.methods(data.onTap);
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

	$('body').on('submit', '[data-on-submit]', function(e) {
		e.preventDefault();
		var $this = $(this);
		var self = this;
		var data = $this.data();
		var options = $.extend({self : this,element : $this,iframe : $this.attr('target')},data,$this.data('options'));
		methods = app.methods(data.onSubmit);
		Queue(methods,options);
	});

	// Get a database reference to our posts
	var ref = new Firebase("https://docs-examples.firebaseio.com/web/saving-data/fireblog/posts");

	// Attach an asynchronous callback to read the data at our posts reference
	app.fireRef.child("stringers").on("value", function(snapshot) {
		app.stringers = app.makeArray(snapshot.val());
		app.listStringers();
	}, function (errorObject) {
	  console.log("The read failed: " + errorObject.code);
	});

});
