var args = require('yargs').argv;
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var es = require('event-stream');
var lib = require('bower-files');
var _ = require('lodash');

/**
 * yargs variables can be passed in to alter the behavior, when present.
 * Example: gulp build-app --dev
 *
 * --env  : The environment name to build for; defaults to 'dev'.
 */

args.env = args.env || 'dev';
var isDev = args.env === 'dev';
var gc = require('./gulp.config')(args);

// == PIPE SEGMENTS ========

var pipes = requirePipes([
    'clean', 'processed-scripts', 'validated-scripts', 'validated-partials', 'scripted-partials', 'bower-files',
    'built-scripts-dev', 'built-scripts-prod', 'built-styles-dev', 'built-styles-prod', 'minified-file-name',
    'vendor-src-maps-by-ext', 'vendor-src-maps-dev', 'vendor-src-maps-prod', 'moved-vendor-scripts-prod'
]);

function requirePipes(pipeNames){
    return _(pipeNames).reduce(function(result, name){
        var fnName = _.camelCase(name);
        var modulePath = './gulpPipes/gulp-' + name + '-pipe';
        result[fnName] = require(modulePath)(gulp, plugins, result, { args: args});
        return result;
    }, {});
}

pipes.validatedAppScripts = _.partial(pipes.validatedScripts, gc.app.scripts);

// moves app scripts into the dev environment
pipes.builtAppScriptsDev = _.partial(pipes.builtScriptsDev, gc.app.scripts);

// concatenates, uglifies, and moves app scripts and partials into the prod environment
pipes.builtAppScriptsProd = _.partial(pipes.builtScriptsProd, gc.app.scripts, gc.app.partials);

// moves vendor scripts into the dev environment
pipes.appVendorScriptsDev = function(){
    var config = _.extend({}, gc.app.bowerComponents.scripts, { overrides: gc.app.bowerComponents.overrides });
    return pipes.bowerFiles('js', config)
        .pipe(gulp.dest(config.dest));
};

pipes.appCompScriptsDev = function(){
    return pipes.compFiles("js")
        .pipe(gulp.dest(gc.app.distRoot));
};

pipes.appMovedVendorScriptsProd = _.partial(pipes.movedVendorScriptsProd, gc.app.bowerComponents);

pipes.appCompScriptsProd = function(){
    return pipes.compFiles("min.js")
        .pipe(plugins.rev())
        .pipe(gulp.dest(gc.app.distRoot));
};

pipes.validatedDevServerScripts = function() {
    return gulp.src(gc.app.scriptsDevServer.src.path)
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));
};

pipes.builtPartials = function(config) {
    return pipes.validatedPartials(config)
        .pipe(gulp.dest(config.dest));
};

// moves app html source files into the dev environment
pipes.builtAppPartials = _.partial(pipes.builtPartials, gc.app.partials);

pipes.scriptedAppPartials = _.partial(pipes.scriptedPartials, gc.app.partials);

pipes.compFiles = function(ext){
    return gulp.src(gc.comp.distRoot + "**/*." + ext);
};

// compiles app sass and moves to the dev environment
pipes.builtAppStylesDev = _.partial(pipes.builtStylesDev, gc.app.styles);

// compiles and minifies app sass to css and moves to the prod environment
pipes.builtAppStylesProd = _.partial(pipes.builtStylesProd, gc.app.styles);

pipes.appVendorStylesDev = function(){
    var config = _.extend({}, gc.app.bowerComponents.styles, { overrides: gc.app.bowerComponents.overrides });
    return pipes.bowerFiles('css', config)
        .pipe(gulp.dest(config.dest));
};

pipes.appCompStylesDev = function(){
    return pipes.compFiles("css")
        .pipe(gulp.dest(gc.app.distRoot));
};

pipes.appVendorStylesProd = function(){
    var config = _.extend({}, gc.app.bowerComponents.styles, { overrides: gc.app.bowerComponents.overrides });
    // todo: find a way to concatenate existing minified css that does not break sourcemap concept
    // ie combining all the minified files into one also includes sourceMapUrl for each css file - this
    // isn't supported by browsers
    return pipes.bowerFiles('min.css', config)
        .pipe(plugins.order(config.order))
        //.pipe(plugins.concat('bower_components.min.css'))
        .pipe(plugins.rev())
        .pipe(gulp.dest(config.dest));
};

pipes.appCompStylesProd = function(){
    return pipes.compFiles("min.css")
        .pipe(plugins.rev())
        .pipe(gulp.dest(gc.app.distRoot));
};

pipes.appVendorSrcMapsDev = _.partial(pipes.vendorSrcMapsDev, gc.app.bowerComponents);
pipes.appVendorSrcMapsProd = _.partial(pipes.vendorSrcMapsProd, gc.app.bowerComponents);

pipes.processedImagesDev = function(config) {
    return gulp.src(config.src.path, config.src.options)
        .pipe(gulp.dest(config.dest));
};

pipes.processedAppImagesDev = _.partial(pipes.processedImagesDev, gc.app.images);

pipes.processedImagesProd = function(config) {
    return gulp.src(config.src.path, config.src.options)
        .pipe(plugins.flatten())
        .pipe(gulp.dest(config.dest));
};

pipes.processedAppImagesProd = _.partial(pipes.processedImagesProd, gc.app.images);

// checks index.html for syntax errors
pipes.validatedIndex = function() {
    return gulp.src(gc.app.indexPage)
        .pipe(plugins.htmlhint())
        .pipe(plugins.htmlhint.reporter());
};

pipes.buildIndex = function(streams) {
    return pipes.validatedIndex()
        .pipe(gulp.dest(gc.app.distRoot)) // write first to get relative path for inject
        .pipe(plugins.inject(streams.vendorScripts, {relative: true, name: 'bower'}))
        .pipe(plugins.inject(streams.compScripts, {relative: true, name: 'component'}))
        .pipe(plugins.inject(streams.appScripts, {relative: true}))
        .pipe(plugins.inject(streams.vendorStyles, {relative: true, name: 'bower'}))
        .pipe(plugins.inject(streams.compStyles, {relative: true, name: 'component'}))
        .pipe(plugins.inject(streams.appStyles, {relative: true}));
};


// validates and injects sources into index.html and moves it to the dev environment
pipes.builtIndexDev = function() {

    var streams = {
        vendorScripts: pipes.appVendorScriptsDev()
            .pipe(plugins.order(gc.app.bowerComponents.scripts.order)),
        compScripts: pipes.appCompScriptsDev().pipe(plugins.angularFilesort()),
        appScripts: pipes.builtAppScriptsDev().pipe(plugins.angularFilesort()),
        vendorStyles: pipes.appVendorStylesDev()
            .pipe(plugins.order(gc.app.bowerComponents.styles.order)),
        compStyles: pipes.appCompStylesDev(),
        appStyles: pipes.builtAppStylesDev()
    };

    return pipes.buildIndex(streams)
        .pipe(gulp.dest(gc.app.distRoot));
};

// validates and injects sources into index.html, minifies and moves it to the prod environment
pipes.builtIndexProd = function() {

    var streams = {
        vendorScripts: pipes.appMovedVendorScriptsProd(),
        appScripts: pipes.builtAppScriptsProd(),
        compScripts: pipes.appCompScriptsProd(),
        appStyles: pipes.builtAppStylesProd(),
        compStyles: pipes.appCompStylesProd(),
        vendorStyles: pipes.appVendorStylesProd()
    };

    return pipes.buildIndex(streams)
        .pipe(plugins.htmlmin({collapseWhitespace: true, removeComments: true})
        .pipe(gulp.dest(gc.app.distRoot)));
};

function getLocals() {
    var locals = {
        pipes: pipes,
        plugins: plugins,
        gulp: gulp,
        lib: lib
    };
    return locals;
}

pipes.buildOtherFiles = function(buildFn) {
    if (!buildFn) return null;

    var locals = getLocals();
    return buildFn(locals);
};

pipes.appVendorOtherFiles = _.partial(pipes.buildOtherFiles, gc.app.bowerComponents.builtOtherFiles);
pipes.builtAppOtherFiles = _.partial(pipes.buildOtherFiles, gc.app.builtOtherFiles);

pipes.builtAppDev = function() {
    // todo: consider a builtVendorPartials that will copy html templates
    var streams = [
        pipes.builtIndexDev(),
        pipes.appVendorSrcMapsDev(),
        pipes.builtAppPartials(),
        pipes.compFiles("html").pipe(gulp.dest(gc.app.distRoot)),
        pipes.compFiles(gc.comp.images.exts).pipe(gulp.dest(gc.app.distRoot)),
        pipes.processedAppImagesDev(),
        pipes.appVendorOtherFiles(),
        pipes.builtCompOtherFiles(),
        pipes.builtAppOtherFiles()
    ];
    return es.merge(_.compact(streams));
};

pipes.builtAppProd = function() {
    var streams = [
        pipes.builtIndexProd(),
        pipes.appVendorSrcMapsProd(),
        pipes.compFiles("map").pipe(gulp.dest(gc.app.distRoot)),
        pipes.compFiles(gc.comp.images.exts).pipe(gulp.dest(gc.app.distRoot)),
        pipes.processedAppImagesProd(),
        pipes.appVendorOtherFiles(),
        pipes.builtCompOtherFiles(),
        pipes.builtAppOtherFiles()
    ];
    return es.merge(_.compact(streams));
};

pipes.builtApp = isDev ? pipes.builtAppDev : pipes.builtAppProd;

// == TASKS ========

// removes all compiled dev files
gulp.task('app-clean', _.partial(pipes.clean, gc.app.distRoot));

// runs jshint on the dev server scripts
gulp.task('validate-devserver-scripts', pipes.validatedDevServerScripts);

// runs jshint on the app scripts
gulp.task('app-validate-scripts', pipes.validatedAppScripts);

// builds a complete environment
gulp.task('app-build', pipes.builtApp);

// cleans and builds a complete environment
gulp.task('app-clean-build', ['app-clean'], pipes.builtApp);

// clean, build, and watch live changes
gulp.task('app-watch', ['app-clean-build', 'validate-devserver-scripts'], function() {

    // start nodemon to auto-reload the dev server
    plugins.nodemon({ script: 'server.js', ext: 'js', watch: ['devServer/'], env: {NODE_ENV : 'development'} })
        .on('change', ['validate-devserver-scripts'])
        .on('restart', function () {
            console.log('[nodemon] restarted dev server');
        });

    // rebuild scripts, etc and inject them into index page
    var builtIndex = isDev ? pipes.builtIndexDev : pipes.builtIndexProd;
    gulp.watch([gc.app.indexPage, gc.app.scripts.src.path, gc.app.styles.src.path], builtIndex);

    // watch html partials
    var onPartialsChanged = isDev ? pipes.builtAppPartials : pipes.builtIndexDev;
    gulp.watch(gc.app.partials.src.path, onPartialsChanged);

    // watch images
    var processedImages = isDev ? pipes.processedAppImagesDev : pipes.processedAppImagesProd;
    gulp.watch(gc.app.images.src.path, processedImages);

    // watch other files
    if (gc.app.getOtherFiles) {
        gulp.watch(gc.app.getOtherFiles(), pipes.builtAppOtherFiles);
    }

});

// default task builds for dev
gulp.task('default', ['app-clean-build']);


/* Component build */

pipes.builtCompScriptsDev = _.partial(pipes.builtScriptsDev, gc.comp.scripts);
pipes.builtCompPartials = _.partial(pipes.builtPartials, gc.comp.partials);
pipes.builtCompStylesDev = _.partial(pipes.builtStylesDev, gc.comp.styles);
pipes.processedCompImagesDev = _.partial(pipes.processedImagesDev, gc.comp.images);
pipes.builtCompOtherFiles = _.partial(pipes.buildOtherFiles, gc.comp.builtOtherFiles);

pipes.builtCompDev = function () {

    var streams = [
        pipes.builtCompScriptsDev(),
        pipes.builtCompStylesDev(),
        pipes.builtCompPartials(),
        pipes.processedCompImagesDev(),
        pipes.builtCompOtherFiles()
    ];

    return es.merge(_.compact(streams));
};

pipes.builtCompScriptsProd = _.partial(pipes.builtScriptsProd, gc.comp.scripts, gc.comp.partials);
pipes.builtCompStylesProd = _.partial(pipes.builtStylesProd, gc.comp.styles);

pipes.builtCompProd = function () {

    var streams = [
        pipes.builtCompScriptsProd(),
        pipes.builtCompStylesProd(),
        pipes.processedImagesProd(gc.comp.images),
        pipes.builtCompOtherFiles()
    ];

    return es.merge(_.compact(streams));
};
pipes.builtComp = isDev ? pipes.builtCompDev : pipes.builtCompProd;


gulp.task('comp-clean', _.partial(pipes.clean, gc.comp.distRoot));
gulp.task('comp-build', pipes.builtComp);
gulp.task('comp-clean-build', ['comp-clean'], pipes.builtComp);