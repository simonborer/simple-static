const gulp = require('gulp');
const $    = require('gulp-load-plugins')();
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sassPaths = [
  './node_modules/normalize.css',
];
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');

gulp.task('sass', function() {
  return gulp.src('./src/assets/scss/*.scss')
    .pipe($.sass({
      includePaths: sassPaths,
      outputStyle: 'compact' // if css compressed **file size**
    })
      .on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: ['last 2 versions', 'ie >= 9']
    }))
    .pipe(gulp.dest('./src/assets/css'));
});

gulp.task('prod', function () {
    var plugins = [
        cssnano({
            discardComments: {removeAll: true}
        })
    ];
    return gulp.src('./src/assets/css/*.css')
        .pipe(postcss(plugins))
        .pipe(gulp.dest('./docs/assets/css'));
});

gulp.task('default', gulp.parallel('sass', function() {
  gulp.watch(['./src/assets/scss/**/*.scss'], ['sass']);
}));