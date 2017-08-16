var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');


gulp.task('sass', function() {
  return gulp.src('app/scss/app.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(gulp.dest('app/css'));
});

// Static Server + watching scss/html files
gulp.task('serve', ['sass'], function() {
  browserSync.init({
    server: true
  });
  gulp.watch("app/scss/**/*.scss", ['sass']);
  gulp.watch("*.html").on('change', browserSync.reload);
  gulp.watch("app/css/*.css").on('change', browserSync.reload);
  gulp.watch("app/**/*.js").on('change', browserSync.reload);
});


gulp.task('default', ['serve']);
