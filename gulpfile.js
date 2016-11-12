var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var babel = require('gulp-babel');
var es2015 = require('babel-preset-es2015');

gulp.task('default', ['copy-html', 'copy-images', 'styles', 'scripts', 'json', 'sw'], function() {
	gulp.watch('src/sass/**/*.scss', ['styles']);
	gulp.watch('src/index.html', ['copy-html']);
	gulp.watch('./dist/index.html').on('change', browserSync.reload);

	browserSync.init({
		server: './dist'
	});
});

gulp.task('dist', [
	'copy-html',
	'copy-images',
	'styles',
	'scripts',
	'json',
	'sw'
]);

gulp.task('scripts', function() {
	gulp.src('src/js/**/*.js')
		.pipe(concat('all.js'))
    .pipe(babel({ presets: ['es2015'] }))
		.pipe(uglify().on('error', gutil.log))
		.pipe(gulp.dest('dist/js'));
});

gulp.task('json', function() {
	gulp.src('src/*.json')
		.pipe(gulp.dest('dist/'));
});

gulp.task('sw', function() {
	gulp.src('src/sw.js')
		.pipe(gulp.dest('dist/'));
});

gulp.task('copy-html', function() {
	gulp.src('src/index.html')
		.pipe(gulp.dest('./dist'));
});

gulp.task('copy-images', function() {
	gulp.src('src/img/*')
		.pipe(gulp.dest('dist/img'));
});

gulp.task('styles', function() {
	gulp.src('src/sass/**/*.scss')
		.pipe(sass({
			outputStyle: 'compressed'
		}).on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ['last 2 versions']
		}))
		.pipe(gulp.dest('dist/css'))
		.pipe(browserSync.stream());
});
