var gulp                = require('gulp');
var jshint              = require('gulp-jshint');
var webserver           = require('gulp-webserver');
var sass                = require('gulp-sass');
var concat              = require('gulp-concat');
var uglify              = require('gulp-uglify');
var extender            = require('gulp-html-extend');

var paths = {
  scripts: ['vendor/javascripts/jquery.history.js',
  'vendor/javascripts/mousetrap.min.js',
  'vendor/javascripts/isEventSupported.js',
  'vendor/javascripts/jquery.mobile.custom.min.js',
  'vendor/javascripts/moment.js',
  'vendor/javascripts/handlebars.js',
  'vendor/javascripts/datedropper.js',
  'vendor/javascripts/fastclick.js',
  'vendor/javascripts/fires.js',
  'assets/javascripts/stringings.js'],
  styles: 'assets/stylesheets/**/*.scss'
};

gulp.task('serve', function() {
  gulp.src('./public')
    .pipe(webserver({
      fallback: 'index.html'
    }));
});

gulp.task('extend', function () {
  gulp.src('views/**/*.html', { base: 'views' })
  .pipe(extender({annotations:false,verbose:false})) // default options
  .pipe(gulp.dest('./public'));
});

// Lint Task
gulp.task('lint', function() {
  return gulp.src('assets/javascripts/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// Concatenate & Minify JS
gulp.task('scripts', ['lint'], function() {
  return gulp.src(paths.scripts)
    .pipe(uglify())
    .pipe(concat('stringings.js'))
    .pipe(gulp.dest('public/javascripts'));
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
    return gulp.src(paths.styles)
        .pipe(sass())
        .pipe(gulp.dest("public/stylesheets"));
});

gulp.task('default', ['sass','scripts','extend','serve'], function() {
  gulp.watch(paths.styles, ['sass']);
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(['views/**/*.html'], ['extend']);
});
