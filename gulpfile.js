/**
 * @author  Tony López <tony@lopezpagan.com>
 * @website lopezpagan.com
 */

/**
 * Import plugins
 */
var gulp = require('gulp');
var livereload = require('gulp-livereload');
var uglify = require('gulp-uglifyjs');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var imagemin = require('gulp-imagemin');
var htmlmin = require('gulp-htmlmin');
var pngquant = require('imagemin-pngquant');
var webserver = require('gulp-webserver');
var rename = require('gulp-rename');

/* Service Worker sw-precache */
var path = require('path');
var swPrecache = require('sw-precache');
const root = '/';
/**
 * Global variables
 */
var src = './src/';
var dest = './dist/';


/**
 * Image Optimization
 */
gulp.task('imagemin', function() {
    return gulp.src(src + 'assets/img/**/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(dest + 'assets/img/'));
});

/**
 * Minify HTML
 */
gulp.task('htmlmin', function() {
    console.log('***** HTML MIN *****');

    return gulp.src(src + '*.html')
        .pipe(htmlmin({ collapseWhitespace: false }))
        .pipe(gulp.dest(dest));
});

/**
 * SASS to CSS
 */
gulp.task('sass', function() {
    console.log('***** SASS *****');

    return gulp.src(src + 'sass/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 7', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(dest + 'assets/css'));

});

/**
 * Minify JS
 */
gulp.task('uglify', function() {
    console.log('***** UGLIFY *****');

    return gulp.src([src + 'lib/**/*.js', src + 'assets/js/**/*.js'])
        .pipe(uglify('app.js'))
        .pipe(gulp.dest(dest + 'assets/js'));
});


/**
 * Copy fonts
 */
gulp.task('fonts', function() {
    console.log('***** FONTS *****');

    return gulp.src(src + 'assets/fonts/**/*')
        .pipe(gulp.dest(dest + 'assets/fonts/'));
});

/**
 * Copy and minify manifest.json (PWA)
 */
gulp.task('manifest', function() {
    console.log('***** MANIFEST *****');

    return gulp.src(src + 'manifest.json')
        .pipe(htmlmin({ collapseWhitespace: false }))
        .pipe(gulp.dest(dest));
});

/**
 * Generate Service Worker (PWA)
 */
gulp.task('generate-service-worker', callback => {
    console.log('***** GENERATE SERVICE WORKER *****');

    swPrecache.write(path.join(dest, 'sw.js'), {
        staticFileGlobs: [
            // track and cache all files that match this pattern
            dest + '**/*.{js,html,css,png,jpg,gif,json}'
        ],
        stripPrefix: dest
    }, callback);
});

/**
 * Watch files
 */
gulp.task('watch', function() {
    console.log('***** WATCH & LISTEN *****');

    livereload.listen();

    gulp.watch(src + 'sass/**/*.scss', ['sass']);
    gulp.watch(src + 'lib/**/*.js', ['uglify']);
    gulp.watch(src + 'assets/js/**/*.js', ['uglify']);
    gulp.watch(src + 'assets/img/**/*', ['imagemin']);
    gulp.watch(src + '*.html', ['htmlmin']);

    gulp.watch([dest + 'assets/css/style.css', dest + 'assets/js/app.js', dest + 'sw.js', dest + 'assets/img/**/*', dest + 'manifest.json', dest + '*.html'],
        function(files) {
            livereload.changed(files)
        });

});

/**
 * Live Reload
 */
gulp.task('livereload', function() {
    console.log('***** LIVERELOAD *****');

    return gulp.pipe(livereload());
});

/**
 * Start Webserver
 */
gulp.task('webserver', function() {
    console.log('***** START WEBSERVER *****');

    gulp.src('dist')
        .pipe(webserver({
            host: 'localhost',
            port: 3000,
            livereload: true,
            directoryListing: false,
            open: true
        }));
});


/**
 * Default task
 */
gulp.task('default', ['fonts', 'sass', 'uglify', 'imagemin', 'manifest', 'generate-service-worker', 'htmlmin']);