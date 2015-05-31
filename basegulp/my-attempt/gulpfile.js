var gulp = require('gulp');
var args = require('yargs').argv;
var config = require('./gulp.config')();
var del = require('del');
var $ = require('gulp-load-plugins')({lazy: true});

/**
 * yargs variables can be passed in to alter the behavior, when present.
 * Example: gulp serve-dev
 *
 * --verbose  : Various tasks will produce more output to the console.
 * --nosync   : Don't launch the browser with browser-sync when serving code.
 * --debug    : Launch debugger with node-inspector.
 * --debug-brk: Launch debugger and break on 1st line with node-inspector.
 * --startServers: Will start servers for midway tests on the test task.
 */

/**
 * List the available gulp tasks
 */
gulp.task('help', $.taskListing);
gulp.task('default', ['help']);

/**
 * vet the code and create coverage report
 * @return {Stream}
 */
gulp.task('vet', function() {
    log('Analyzing source with JSHint');

    return gulp
        .src(config.validateJs)
        .pipe($.if(args.verbose, $.print()))
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish', {verbose: true}))
        .pipe($.jshint.reporter('fail'));
});

/**
 * Create $templateCache from the html templates
 * @return {Stream}
 */
gulp.task('templatecache', function() {
    log('Creating an AngularJS $templateCache');

    return gulp
        .src(config.templateCache.src)
        .pipe($.if(args.verbose, $.bytediff.start()))
        .pipe($.minifyHtml({empty: true}))
        .pipe($.if(args.verbose, $.bytediff.stop(bytediffFormatter)))
        .pipe($.angularTemplatecache(
            config.templateCache.file,
            config.templateCache.options
        ))
        .pipe(gulp.dest(config.temp));
});


/**
 * Concatenates js into a single file and outputs this to the build director
 * @return {Stream}
 */
gulp.task('concat-js', function() {
    return gulp
        .src(config.js)
        .pipe($.plumber()) // exit gracefully if something fails after this
        .pipe($.concat(config.concat.jsFile))
        .pipe(gulp.dest(config.buildDir.js));
});

/**
 * Concatenates js including the inline html into a single file and outputs this to the build director
 * @return {Stream}
 */
gulp.task('concat-js-tpl', ['templatecache', 'concat-js'], function() {
    var js = [config.buildDir.js + config.concat.jsFile, config.temp + config.templateCache.file];
    return gulp
        .src(js)
        .pipe($.plumber()) // exit gracefully if something fails after this
        .pipe($.concat(config.concat.jsTplFile))
        .pipe(gulp.dest(config.buildDir.js));
});

/**
 * Compile css
 * @return {Stream}
 */
gulp.task('styles', ['clean-styles'], function() {
    log('Compiling CSS');

    // TODO: wire up sass as well as less compilers
    return gulp
        .src(config.cssSrc)
        .pipe($.plumber()) // exit gracefully if something fails after this
        .pipe($.less())
        .pipe($.autoprefixer({browsers: ['last 2 version', '> 5%']}))
        .pipe(gulp.dest(config.temp));
});

/**
 * Remove all files from the build, temp, and reports folders
 * @param  {Function} done - callback when complete
 */
gulp.task('clean', function(done) {
    var delconfig = [].concat(config.buildDir.root, config.temp, config.report);
    log('Cleaning: ' + $.util.colors.blue(delconfig));
    del(delconfig, done);
});

/**
 * Remove all js and html from the build and temp folders
 * @param  {Function} done - callback when complete
 */
gulp.task('clean-code', function(done) {
    var files = [].concat(
        config.temp + '**/*.js',
        config.buildDir.js + '**/*.js',
        config.buildDir.html + '**/*.html'
    );
    clean(files, done);
});

/**
 * Remove all styles from the build and temp folders
 * @param  {Function} done - callback when complete
 */
gulp.task('clean-styles', function(done) {
    var files = [].concat(
        config.temp + '**/*.css',
        config.buildDir.styles + '**/*.css'
    );
    clean(files, done);
});

gulp.task('styles-watcher', function() {
    // TODO: change to config.cssSrc
    gulp.watch([].concat(config.cssSrc), ['styles']);
});

////////////

/**
 * Formatter for bytediff to display the size changes after processing
 * @param  {Object} data - byte data
 * @return {String}      Difference in bytes, formatted
 */
function bytediffFormatter(data) {
    var difference = (data.savings > 0) ? ' smaller.' : ' larger.';
    return data.fileName + ' went from ' +
        (data.startSize / 1000).toFixed(2) + ' kB to ' +
        (data.endSize / 1000).toFixed(2) + ' kB and is ' +
        formatPercent(1 - data.percent, 2) + '%' + difference;
}

/**
 * Delete all files in a given path
 * @param  {Array}   path - array of paths to delete
 * @param  {Function} done - callback when complete
 */
function clean(path, done) {
    log('Cleaning: ' + $.util.colors.blue(path));
    del(path, done);
}

/**
 * Format a number as a percentage
 * @param  {Number} num       Number to format as a percent
 * @param  {Number} precision Precision of the decimal
 * @return {String}           Formatted perentage
 */
function formatPercent(num, precision) {
    return (num * 100).toFixed(precision);
}

/**
 * Log a message or series of messages using chalk's blue color.
 * Can pass in a string, object or array.
 */
function log(msg) {
    if (typeof(msg) === 'object') {
        for (var item in msg) {
            if (msg.hasOwnProperty(item)) {
                $.util.log($.util.colors.blue(msg[item]));
            }
        }
    } else {
        $.util.log($.util.colors.blue(msg));
    }
}
