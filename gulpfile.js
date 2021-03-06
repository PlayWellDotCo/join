var fs               = require('fs');
var gulp             = require('gulp');
var watch            = require('gulp-watch');
var sass             = require('gulp-sass');
var sourcemaps       = require('gulp-sourcemaps');
var webserver        = require('gulp-webserver');
var awspublish       = require('gulp-awspublish');
var browserify       = require('browserify');
var source           = require('vinyl-source-stream');
var buffer           = require('vinyl-buffer');
var uglify           = require('gulp-uglify');
var gutil            = require('gulp-util');
var rename           = require('gulp-rename');
var addsrc           = require('gulp-add-src');
var concat           = require('gulp-concat');
var merge            = require('merge-stream');

gulp.task('watch', function() {
  gulp.watch('./sass/**/*.scss', ['sass']);
  gulp.watch('./js/**/*.js', ['js']);
});

gulp.task('sass', function () {
  gulp.src('./sass/*.scss')
    .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.init())
      .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./public/'));
});

gulp.task('js', function() {
  var bundler = browserify({
    entries: ['./js/app.js'],
    debug: true,
  });

  var bundle = function() {
    return bundler
      .bundle()
      .on('error', function(err) {
        console.log(err.toString());
        this.emit("end");
      })
      .pipe(source('app.js'))
      .pipe(buffer())
      .pipe(addsrc('./js/vendor/*.js'))  
      .pipe(concat('playwell.min.js'))
      .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .pipe(uglify())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./public/'));
  };

  return bundle();
});

gulp.task('webserver', function() {
  gulp.src('./')
    .pipe(webserver({
      livereload: true,
      directoryListing: true,
      open: true
    }));
});

gulp.task('publish', function() {
  var credentials = JSON.parse(fs.readFileSync('aws-credentials.json', 'utf8'));

  var publisher = awspublish.create({
    params: {
      Bucket: 'join.playwell.co'
    },
    region: 'us-west-2',
    accessKeyId:     credentials.accessKeyId,
    secretAccessKey: credentials.secretAccessKey,
  });

  var headers = {
    'Cache-Control': 'max-age=300, no-transform, public'
  };

  var gzipped = gulp.src(['./*.js', './*.css', './*.html', './*.map'], { cwd: "./public/" })
    .pipe(awspublish.gzip());

  var images = gulp.src('./images/*', { cwd: "./public/" })
    .pipe(rename({dirname: 'images'}));

  var other = gulp.src(['./*', '!./*.js', '!./*.css', '!./*.html', '!./*.map'], { cwd: "./public/" });

  return merge(gzipped, images, other)
    .pipe(publisher.publish())
    .pipe(publisher.cache())
    .pipe(awspublish.reporter());
});

gulp.task('build', ['sass', 'js']);
gulp.task('default', ['sass', 'js', 'watch', 'webserver']);
