require('dotenv').load({silent: true});

var gulp = require('gulp');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var usemin = require('gulp-usemin');
var rev = require('gulp-rev');
var clean = require('gulp-clean');

var environment = process.env.NODE_ENV;

var nodemon = require('gulp-nodemon');

function swallowError (error) {
    //If you want details of the error in the console
    console.log(error.toString());
    this.emit('end');
}

gulp.task('clean', function(){
    return gulp.src('./build/**/*.*', {read: false})
      .pipe(clean());
});

gulp.task('default', function(){
  console.log('yo. use gulp watch or something');
});

gulp.task('js', ['clean'], function () {
  if (environment !== 'dev'){
    // Minify for non-development
    gulp.src(['app/client/src/**/*.js', 'app/client/views/**/*.js'])
      .pipe(sourcemaps.init())
        .pipe(concat('app.js'))
        .pipe(ngAnnotate())
        .on('error', swallowError)
        .pipe(uglify())
      .pipe(gulp.dest('./app/client/build'));
  } else {
    return gulp.src(['./app/client/index.html'])
      .pipe(usemin({
        vendorjs: [sourcemaps.init(), 'concat', rev(), sourcemaps.write()],
        js: [sourcemaps.init(), 'concat', rev(), sourcemaps.write()],
        vendorcss: [rev()]
      }))
      .pipe(gulp.dest('./build'));
  }
});

gulp.task('sass', ['clean'], function () {
  gulp.src('app/client/stylesheets/site.scss')
    .pipe(sass())
      .on('error', sass.logError)
    .pipe(minifyCss())
    .pipe(gulp.dest('./build'));
});

gulp.task('assets', ['clean'], function() {
  gulp.src('app/client/assets/**/*.*')
    .pipe(gulp.dest('./build/assets/'));
});

gulp.task('html', ['clean'], function() {
  gulp.src(['app/client/**/*.html', '!app/client/index.html'])
    .pipe(gulp.dest('./build'));
  });

gulp.task('build', ['js', 'sass', 'assets', 'html'], function(){
  // Yup, build the js and sass.
});

gulp.task('watch', ['js', 'sass'], function () {
  gulp
    .watch('app/client/src/**/*.js', ['js']);
  gulp
    .watch('app/client/views/**/*.js', ['js']);
  gulp
    .watch('app/client/stylesheets/**/*.scss', ['sass']);
});

gulp.task('server', ['watch'], function(){
  nodemon({
    script: 'app.js',
    env: { 'NODE_ENV': process.env.NODE_ENV || 'DEV' },
    watch: [
      'app/server'
    ]
  });
});
