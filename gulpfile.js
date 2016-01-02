var appPath = 'app/';
// Set process path under app directory
process.chdir(appPath);

var port = process.env.PORT || 8080;
var proxyAddr = process.env.PROXYADDR || 'localhost';

var gulp = require('gulp'),
  concat = require('gulp-concat'),
  sass = require('gulp-sass'),
  clean = require('gulp-clean'),
  mainBowerFiles = require('main-bower-files'),
  sourcemaps = require('gulp-sourcemaps'),
  source = require('vinyl-source-stream'),
  browserify = require('browserify'),
  notify = require('gulp-notify'),
  _ = require('lodash'),
  mergeStream = require('merge-stream'),
  minifyCss = require('gulp-minify-css'),
  uglify = require('gulp-uglify'),
  browserSync = require('browser-sync').create(),
  gulpif = require('gulp-if'),  
  nodemon = require('gulp-nodemon'),
  minifyHtml = require('gulp-minify-html'),
  rev = require('gulp-rev'),
  runSequence = require('run-sequence'),
  usemin = require('gulp-usemin'),
  gutil = require('gulp-util');

var browserSyncActive = false;

var paths = {
  vendorRoot: 	'bower_components/',
  sass: 		    ['sass/main.scss'],
  scripts:      'scripts/',
  templates:    'views/',
  dist: {
    root:       'static/',
    scripts:    'static/js/',
    css:        'static/css/'
  },        
  build:        'build/',
  serverFiles:  ['server.js', 'configuration/*']
};

var bundleConfigs = [{
  entries: paths.scripts + 'scripts.js',
  dest: paths.dist.scripts,
  outputName: 'scripts.js',
  paths: [paths.dist.scripts, paths.scripts]
}];

function onError() {
  var args = Array.prototype.slice.call(arguments);

  // Send error to notification center with gulp-notify
  notify.onError({
    title: "Compile Error",
    message: "<%= error %>"
  }).apply(this, args);

  // Keep gulp from hanging on this task
  this.emit('end');
}

gulp.task('clean', function() {
  return gulp.src([paths.dist.scripts, paths.dist.css, paths.build], {read: false})
    .pipe(clean());
});

gulp.task('bower', function() {
	return gulp.src(mainBowerFiles())
    .pipe(gulp.dest(paths.dist.scripts));	
});

gulp.task('scripts', function() {
  function browserifyMe(bundleConfig) {
    var b = browserify(bundleConfig);
    return b.bundle()
      .on('error', onError)
      .pipe(source(bundleConfig.outputName))
      .pipe(gulp.dest(bundleConfig.dest));  
  }

  return mergeStream.apply(gulp, _.map(bundleConfigs, browserifyMe));  
});

gulp.task('styles', function() {  
  return gulp.src(paths.sass)          
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))            
    .pipe(sourcemaps.write())    
    .pipe(gulp.dest(paths.dist.css))
    .pipe(gulpif(browserSyncActive, browserSync.stream()));
});

gulp.task('usemin', function () {  
  return gulp.src(paths.templates + '**/*.handlebars')
    .pipe(usemin({
      assetsDir: __dirname + '/' + appPath + paths.dist.root,
      outputRelativePath: '../',
      css: [ minifyCss(), rev() ],
      html: [ function() {
        return minifyHtml({ empty: true, comments: true, loose: true });
      } ],
      js: [ uglify(), rev() ]      
    }))
    .pipe(gulp.dest(paths.build + 'views/'));
});


gulp.task('watch', function(cb) {
  browserSyncActive = true;

  browserSync.init({
    proxy: proxyAddr + ':' + port
  });

  gulp.watch(paths.scripts + '*', ['reload']);
  gulp.watch(paths.sass + '*', ['styles']);
  gulp.watch(paths.templates + '*', ['reload']);
});

gulp.task('nodemon', function() {
  return nodemon({ 
    script: 'server.js',
    ignore: [paths.scripts + '*.js', '*.scss'] // We want browsersync to handle browser reloading on UI scripts
  }).on('start', function() {
    gulp.start('watch');
  });
});

gulp.task('copyServerToBuild', function() {
  return gulp.src(paths.serverFiles, {base: '.'})
    .pipe(gulp.dest(paths.build));
});

gulp.task('reload', ['scripts'], function() {
  browserSync.reload();
});

gulp.task('default', function() {  
  return runSequence('clean', 'styles', 'scripts', 'nodemon');
});

gulp.task('production', function() {
  return runSequence('clean', 'styles', 'scripts', 'usemin', 'copyServerToBuild');
});