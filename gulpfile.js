var gulp = require('gulp');
var util = require('gulp-util');
var pleeease = require('gulp-pleeease');
var plumber = require('gulp-plumber');
var browserSync = require('browser-sync');
var sass = require('gulp-sass');
var pug = require('gulp-pug');

/*--------------------------------------------------------*/

gulp.task('sass', function() {
  gulp
    .src('./resource/scss/**/*.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(
      pleeease({
        autoprefixer: { browsers: ['last 4 versions', 'ie 11', 'Android 4'] },
        minifier: util.env.d ? false : true
      })
    )
    .pipe(gulp.dest('./docs/css/'));
});

gulp.task('pug', function() {
  gulp
    .src(['./resource/pug/**/*.pug', '!./resource/pug/partial/*.pug'])
    .pipe(pug({ pretty: util.env.d ? true : true }))
    .pipe(gulp.dest('./docs/'));
});

gulp.task('watch', function() {
  gulp.watch(['./resource/scss/**/*.scss'], ['sass']);
  gulp.watch(['./resource/pug/**/*.pug'], ['pug']);
});

gulp.task('server', function() {
  browserSync.init({
    port: 3011,
    server: {
      baseDir: './docs'
    }
  });
  gulp.watch('./docs/**/*.html', ['serverReload']);
  gulp.watch('./docs/**/*.css', ['serverReload']);
  gulp.watch('./docs/**/*.js', ['serverReload']);
});

gulp.task('serverReload', function() {
  browserSync.reload();
});

gulp.task('build', ['sass', 'pug']);
gulp.task('default', ['watch', 'pug', 'sass', 'server']);
