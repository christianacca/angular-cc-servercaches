var args = require('yargs').argv;
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var del = require('del');
var es = require('event-stream');
var lib = require('bower-files');
var path = require('path');
var Q = require('q');
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

var pipes = {};

pipes.cleanTaskImpl = function(path){
    var deferred = Q.defer();
    del(path, function(err) {
        if (err){
            deferred.reject(err);
        } else {
            deferred.resolve();
        }
    });
    return deferred.promise;
};


pipes.minifiedFileName = function() {
    return plugins.rename(function (path) {
        path.extname = '.min' + path.extname;
    });
};

pipes.validatedScripts = function(config) {
    return pipes.processedScripts(config)
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish', {verbose: true}));
};
pipes.processedScripts = function(config) {
    plugins.nunjucksRender.nunjucks.configure({ watch: false });
    var jsTplFilter = plugins.filter('**/*.tpl.js');
    return gulp.src(config.src.path, config.src.options)
        .pipe(jsTplFilter)
            .pipe(plugins.data(function(f){
                var tplData = require(path.dirname(f.path) + '\\' + path.basename(f.path, '.js') + '.json');
                return tplData && tplData[args.env];
            }))
            .pipe(plugins.nunjucksRender())
            .pipe(plugins.rename(function(f){
                f.extname = '.js';
                f.basename = f.basename.replace('.tpl', '');
            }))
        .pipe(jsTplFilter.restore());
};

pipes.validatedAppScripts = _.partial(pipes.validatedScripts, gc.app.scripts);

pipes.builtScriptsDev = function(config) {
    return pipes.validatedScripts(config)
        .pipe(gulp.dest(config.dest));
};

// moves app scripts into the dev environment
pipes.builtAppScriptsDev = _.partial(pipes.builtScriptsDev, gc.app.scripts);

pipes.builtScriptsProd = function(scriptsConfig, partialsConfig) {
    var scriptedPartials = pipes.scriptedPartials(partialsConfig);
    var validatedAppScripts = pipes.validatedScripts(scriptsConfig);

    return es.merge(scriptedPartials, validatedAppScripts)
        .pipe(plugins.angularFilesort())
        .pipe(plugins.sourcemaps.init())
            .pipe(plugins.concat({ path: scriptsConfig.outputFile, cwd: ''}))
            .pipe(scriptsConfig.isConcatFileOutput ? gulp.dest(scriptsConfig.dest) : plugins.util.noop())
            .pipe(pipes.minifiedFileName())
            .pipe(plugins.uglify())
            .pipe(scriptsConfig.isCacheBusted ? plugins.rev() : plugins.util.noop())
        .pipe(plugins.sourcemaps.write('./'))
        .pipe(gulp.dest(scriptsConfig.dest));
};

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
        .pipe(gulp.dest(gc.app.rootDist));
};

// moves minified vendor scripts into the production environment
pipes.appVendorScriptsProd = function(){
    var config = _.extend({}, gc.app.bowerComponents.scripts, { overrides: gc.app.bowerComponents.overrides });
    // todo: find a way to concatenate existing minified js that does not break sourcemap concept
    // ie combining all the minified files into one also includes sourceMapUrl for each js file - this
    // isn't supported by browsers
    return pipes.bowerFiles('min.js', config)
        //.pipe(plugins.order(config.order))
        //.pipe(plugins.concat('bower_components.min.js'))
        .pipe(plugins.rev())
        .pipe(gulp.dest(config.dest));
};

pipes.appCompScriptsProd = function(){
    return pipes.compFiles("min.js")
        .pipe(plugins.rev())
        .pipe(gulp.dest(gc.app.rootDist));
};

pipes.validatedDevServerScripts = function() {
    return gulp.src(gc.app.scriptsDevServer.src.path)
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));
};

pipes.validatedPartials = function(config) {
    return gulp.src(config.src.path, config.src.options)
        .pipe(plugins.htmlhint({'doctype-first': false}))
        .pipe(plugins.htmlhint.reporter());
};

pipes.builtPartials = function(config) {
    return pipes.validatedPartials(config)
        .pipe(gulp.dest(config.dest));
};

// moves app html source files into the dev environment
pipes.builtAppPartials = _.partial(pipes.builtPartials, gc.app.partials);

pipes.scriptedPartials = function(config) {
    return pipes.validatedPartials(config)
        .pipe(plugins.htmlhint.failReporter())
        .pipe(plugins.htmlmin({collapseWhitespace: true, removeComments: true}))
        .pipe(plugins.ngHtml2js({
            moduleName: config.moduleName
        }));
};
pipes.scriptedAppPartials = _.partial(pipes.scriptedPartials, gc.app.partials);

pipes.bowerFiles = function (ext, options) {
    var filter = _.extend({}, { skipMissing: false, dev: true }, options && options.filter);

    // note: we having to make up for the fact that bower does not have a mechanism to describe minified main and source
    // map files

    var typeExt, minExt, mapExt;
    var extParts = ext.split('.');
    if (_.last(extParts) === 'map'){
        mapExt = 'map';
        typeExt = _.takeRight(extParts, 2)[0];
    } else {
        typeExt = _.last(extParts);
    }
    if (extParts[0] === 'min'){
        minExt = 'min';
    }

    var fileMapFn;
    if (extParts.length === 1){
        fileMapFn = _.identity;
    } else {
        var replacementExt = _.compact([minExt, typeExt, mapExt]).join('.');
        fileMapFn = function (name) {
            return name.replace('.' + typeExt, '.' + replacementExt);
        };
    }

    var criteria = {
        dev: filter.dev,
        ext: typeExt
    };
    var files = lib({ overrides: options.overrides }).filter(criteria).map(fileMapFn);
    // not sure why gulp-expect-file cannot check files directly :-(
    var expectedFiles = files.map(function(filePath) {
        return '**/' + _.last(filePath.split('\\'));
    });
    var continuation = gulp.src(files);
    if (!filter.skipMissing) {
        continuation = continuation
            .pipe(plugins.expectFile({ checkRealFile: true, reportMissing: true }, expectedFiles));
    }
    return continuation;
};

pipes.compFiles = function(ext){
    return gulp.src(gc.comp.rootDist + "**/*." + ext);
};

pipes.builtStylesDev = function(config) {
    return gulp.src(config.src.path, config.src.options)
        .pipe(plugins.sass())
        .pipe(gulp.dest(config.dest));
};

// compiles app sass and moves to the dev environment
pipes.builtAppStylesDev = _.partial(pipes.builtStylesDev, gc.app.styles);

pipes.builtStylesProd = function(config) {
    return gulp.src(config.src.path, config.src.options)
        .pipe(plugins.sourcemaps.init())
            .pipe(plugins.sass())
            .pipe(plugins.concat({path: config.outputFile, cwd: ''}))
            .pipe(config.isConcatFileOutput ? gulp.dest(config.dest) : plugins.util.noop())
            .pipe(pipes.minifiedFileName())
            .pipe(plugins.minifyCss())
            .pipe(config.isCacheBusted ? plugins.rev(): plugins.util.noop())
        .pipe(plugins.sourcemaps.write('./'))
        .pipe(gulp.dest(config.dest));
};

// compiles and minifies app sass to css and moves to the prod environment
pipes.builtAppStylesProd = _.partial(pipes.builtStylesProd, gc.app.styles);

pipes.appVendorStylesDev = function(){
    var config = _.extend({}, gc.app.bowerComponents.styles, { overrides: gc.app.bowerComponents.overrides });
    return pipes.bowerFiles('css', config)
        .pipe(gulp.dest(config.dest));
};

pipes.appCompStylesDev = function(){
    return pipes.compFiles("css")
        .pipe(gulp.dest(gc.app.rootDist));
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
        .pipe(gulp.dest(gc.app.rootDist));
};

pipes.vendorSrcMapsDev = function() {
    var jsConfig = _.extend({}, gc.app.bowerComponents.scripts, {overrides: gc.app.bowerComponents.overrides});
    var jsFiles = pipes.vendorSrcMapsByExt('js', jsConfig);
    var cssConfig = _.extend({}, gc.app.bowerComponents.styles, {overrides: gc.app.bowerComponents.overrides});
    var cssFiles = pipes.vendorSrcMapsByExt('css', cssConfig);
    return es.merge(jsFiles, cssFiles);
};


pipes.vendorSrcMapsProd = function() {
    var jsConfig = _.extend({}, gc.app.bowerComponents.scripts, {overrides: gc.app.bowerComponents.overrides});
    var jsFiles = pipes.vendorSrcMapsByExt('min.js', jsConfig);
    var cssConfig = _.extend({}, gc.app.bowerComponents.styles, {overrides: gc.app.bowerComponents.overrides});
    var cssFiles = pipes.vendorSrcMapsByExt('min.css', cssConfig);
    return es.merge(jsFiles, cssFiles);
};

pipes.vendorSrcMapsByExt = function(ext, config) {

    // we need to return the source files as source maps reference them
    // todo: some source maps will inline the source code, for these we don't need to return the source file
    var sourceFiles = pipes.bowerFiles(ext, config)
        .pipe(gulp.dest(gc.app.bowerComponents.dest));

    var srcMapOptions = _.clone(config);
    srcMapOptions.filter = _.extend({}, srcMapOptions.filter, { skipMissing: true });
    var sourceMapFiles = pipes.bowerFiles(ext + '.map', srcMapOptions)
        .pipe(gulp.dest(gc.app.bowerComponents.dest));

    return es.merge(sourceFiles, sourceMapFiles);
};

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
        .pipe(gulp.dest(gc.app.rootDist)) // write first to get relative path for inject
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
        .pipe(gulp.dest(gc.app.rootDist));
};

// validates and injects sources into index.html, minifies and moves it to the prod environment
pipes.builtIndexProd = function() {

    var streams = {
        vendorScripts: pipes.appVendorScriptsProd(),
        appScripts: pipes.builtAppScriptsProd(),
        compScripts: pipes.appCompScriptsProd(),
        appStyles: pipes.builtAppStylesProd(),
        compStyles: pipes.appCompStylesProd(),
        vendorStyles: pipes.appVendorStylesProd()
    };

    return pipes.buildIndex(streams)
        .pipe(plugins.htmlmin({collapseWhitespace: true, removeComments: true})
        .pipe(gulp.dest(gc.app.rootDist)));
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
        pipes.vendorSrcMapsDev(),
        pipes.builtAppPartials(),
        pipes.compFiles("html").pipe(gulp.dest(gc.app.rootDist)),
        pipes.compFiles(gc.comp.images.exts).pipe(gulp.dest(gc.app.rootDist)),
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
        pipes.vendorSrcMapsProd(),
        pipes.compFiles("map").pipe(gulp.dest(gc.app.rootDist)),
        pipes.compFiles(gc.comp.images.exts).pipe(gulp.dest(gc.app.rootDist)),
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
gulp.task('app-clean', _.partial(pipes.cleanTaskImpl, gc.app.rootDist));

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


gulp.task('comp-clean', _.partial(pipes.cleanTaskImpl, gc.comp.rootDist));
gulp.task('comp-build', pipes.builtComp);
gulp.task('comp-clean-build', ['comp-clean'], pipes.builtComp);