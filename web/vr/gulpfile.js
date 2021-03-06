// Gulp dependencies
const gulp = require('gulp');

// Build dependencies
const babelify =  require('babelify');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');

// Style dependencies
const concatCss = require('gulp-concat-css');
const sass = require('gulp-sass');

// Development dependencies
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const nodemon = require('gulp-nodemon');
const runSequence = require('run-sequence');

// Asset dependencies
const imagemin = require('gulp-imagemin');
const cache = require('gulp-cache');

gulp.task('default', function(callback){
	runSequence(['sass', 'jslibs', 'es6', 'assets', 'models', 'fonts', 'browserSync', 'watch'], callback )
});

// gulp.task('build', function(callback){
// 	runSequence(['images', 'fonts'], callback )
// })

gulp.task('watch', function(){
	gulp.watch('host/views/*.pug', reload);
	gulp.watch('host/*.js', ['serverRestart']);
	gulp.watch('client/app/public/js/**/*.js', ['es6']);
	gulp.watch('client/app/public/js/libs/*.js', ['jslibs']);
	gulp.watch('client/app/public/scss/**/*.scss', ['sass']);
});

//task to optimise images + put them in dist folder
gulp.task('assets', function(){
	return gulp.src('client/app/public/assets/**/*.+(png|jpg|gif|svg|mp4|mp3|ogv|ogg|dat|hiro|pat)')
	// .pipe(cache(imagemin({
	// 	interlaced: true
	// })))
	.pipe(gulp.dest('client/dist/public/assets/'))
});

gulp.task('models', function(){
	return gulp.src('client/app/public/assets/**/*.+(obj|mtl|json|collada|ctm|vtk|fbx|tga|mtl|js)')
	.pipe(gulp.dest('client/dist/public/assets/'))
});

gulp.task('fonts', function(){
	return gulp.src('client/app/public/assets/fonts/**/*')
	.pipe(gulp.dest('client/dist/public/assets/fonts/'))
});

gulp.task('serverRestart', function(){
	return gulp.src('host/*.js')
	.pipe(gulp.dest('host'))
	.pipe(browserSync.reload({
		stream: true
	})); //build folder
});

gulp.task('es6', function() { //transform all code into es2015 format
	browserify('client/app/public/js/bundle.min.js') //take all code from index.js
	.transform('babelify', { //transform the code using the es2015 preset
		presets: ['es2015'],
	})
	.bundle() //return a stream of code
	.pipe(source('bundle.min.js')) //bundle into a new file name
	.pipe(buffer()) //put all new code into
	// .pipe(uglify()) //minifies code
	.pipe(gulp.dest('client/dist/public/js/'))
	.pipe(browserSync.reload({
		stream: true
	})) //build folder
});

gulp.task('jslibs', function(){
	return gulp.src('client/app/public/js/libs/*.js')
	.pipe(concat('libs.min.js'))
	// .pipe(uglify()) //minifies code
	.pipe(gulp.dest('client/dist/public/js/libs/'));
})

//task to turn sass into css and then reload browser
gulp.task('sass', function(){
	return gulp.src('client/app/public/scss/**/*.scss')
	.pipe(sass())
	.pipe(concatCss('styles.min.css'))
    .pipe(gulp.dest('client/dist/public/css/'))
    .pipe(browserSync.reload({
		stream: true
	}))
});

// our gulp-nodemon task
gulp.task('nodemon', function (cb) {
	var started = false;
	return nodemon({
		script: 'host/index.js'
	}).on('start', function () {
		//avoid nodemon being started multiple times
		if (!started) {
			console.log("server started");
			cb();
			started = true;
			setTimeout(function reload(){
				browserSync.reload({
					stream: false
				});
			}, 4000)
		}else{
			console.log("server restarted")
			setTimeout(function reload(){
				browserSync.reload({
					stream: false
				});
			}, 2000)
		}
	})
	.on('crash', function() {
		console.log('nodemon.crash');
	})
	.on('restart', function() {
		console.log('nodemon.restart');
		// browserSync.reload();
	})
	.once('quit', function () {
		// handle ctrl+c without a big weep
		process.exit();
	});
});

gulp.task('browserSync', ['nodemon'], function() {
	browserSync.init(null, {
	    proxy: "localhost:3000",
	    files: ["public/**/*.*"],
		port: 4000,
		browser: "google chrome",
    })
	console.log("Browser sync is working");
});
