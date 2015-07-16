// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint');
var sass = require('gulp-ruby-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var replace = require('gulp-replace');

var paths = {
  scripts: ['vendor/javascripts/jquery.history.js',
  'vendor/javascripts/mousetrap.min.js',
  'vendor/javascripts/isEventSupported.js',
  'vendor/javascripts/jquery.mobile.custom.min.js',
  'vendor/javascripts/jquery.quicksearch.js',
  'vendor/javascripts/jquery.payment.js',
  'vendor/javascripts/jquery.order.js',
  'vendor/javascripts/picker.js',
  'vendor/javascripts/picker.date.js',
  'vendor/javascripts/handlebars.js',
  'assets/javascripts/app.js',
  'assets/javascripts/controllers.js',
  'assets/javascripts/bindings.js',
  'src/javascripts/**/*.js'],
  styles: 'assets/stylesheets/**/*.scss'
};

// Lint Task
gulp.task('lint', function() {
  return gulp.src('assets/javascripts/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// Compile Our Sass

gulp.task('sass', function () {
  return sass('assets/stylesheets/')
    .on('error', function (err) {
    console.error('Error!', err.message);
  })
    .pipe(gulp.dest('public/stylesheets'));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
  return gulp.src(paths.scripts)
    .pipe(uglify())
    .pipe(concat('app.js'))
    .pipe(gulp.dest('public/javascripts'))
});

// Watch Files For Changes
gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['lint', 'scripts']);
  gulp.watch(paths.styles, ['sass']);
});

// Default Task
gulp.task('default', ['lint', 'sass', 'scripts', 'watch']);
