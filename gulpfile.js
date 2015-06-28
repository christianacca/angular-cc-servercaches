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

args.env = args.env || 'prod';
var gc = require('./gulp.config')(args);

// == PATH STRINGS ========

var paths = {
    images: ['./src/demoApp/**/*.svg', './src/demoApp/**/*.jpg', './src/demoApp/**/*.gif', './src/demoApp/**/*.png'],
    index: './src/index.html',
    distProd: './dist.prod/',
    scriptsDevServer: 'devServer/**/*.js'
};

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
    plugins.nunjucksRender.nunjucks.configure({ watch: false });
    var jsTplFilter = plugins.filter('**/*.tpl.js');
    return gulp.src(config.src.path, config.src.options)
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish', {verbose: true}))
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

pipes.builtAppScriptsDev = _.partial(pipes.builtScriptsDev, gc.app.scripts);

pipes.builtScriptsProd = function(scriptsConfig, partialsConfig) {
    var scriptedPartials = pipes.scriptedPartials(partialsConfig);
    var validatedAppScripts = pipes.validatedScripts(scriptsConfig);

    var maybeCacheBustedPipe = es.merge(scriptedPartials, validatedAppScripts)
        .pipe(plugins.angularFilesort())
        .pipe(plugins.sourcemaps.init())
            .pipe(plugins.concat({ path: scriptsConfig.minifedFile, cwd: ''}))
            .pipe(plugins.uglify());

    if (scriptsConfig.isCacheBusted){
        maybeCacheBustedPipe = maybeCacheBustedPipe.pipe(plugins.rev());
    }

    return maybeCacheBustedPipe
        .pipe(plugins.sourcemaps.write('./'))
        .pipe(gulp.dest(scriptsConfig.dest));
};

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

pipes.appVendorScriptsProd = function(){
    var config = _.extend({}, gc.app.bowerComponents.scripts, { overrides: gc.app.bowerComponents.overrides });
    // todo: find a way to concatenate existing minified js that does not break sourcemap concept
    // ie combining all the minified files into one also includes sourceMapUrl for each js file - this
    // isn't supported by browsers
    return pipes.bowerFiles('min.js', config)
        .pipe(plugins.order(config.order))
        //.pipe(plugins.concat('bower_components.min.js'))
        .pipe(plugins.rev())
        .pipe(gulp.dest(config.dest));
};

pipes.appCompScriptsProd = function(){
    return pipes.compFiles("js")
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
    typeExt = extParts[1] || extParts[0];
    minExt = extParts.length > 1 ? extParts[0] : undefined;
    mapExt = extParts[2];

    var fileMapFn;
    if (!minExt){
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

pipes.builtAppStylesDev = _.partial(pipes.builtStylesDev, gc.app.styles);

pipes.builtStylesProd = function(config) {
    var maybeCacheBustedPipe = gulp.src(config.src.path, config.src.options)
        .pipe(plugins.sourcemaps.init())
            .pipe(plugins.sass())
            .pipe(plugins.concat({path: config.minifedFile, cwd: ''}))
            .pipe(plugins.minifyCss());

    if (config.isCacheBusted){
        maybeCacheBustedPipe = maybeCacheBustedPipe
            .pipe(plugins.rev());
    }
    return maybeCacheBustedPipe
        .pipe(plugins.sourcemaps.write('./'))
        .pipe(gulp.dest(config.dest));
};

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
    return pipes.compFiles("css")
        .pipe(plugins.rev())
        .pipe(gulp.dest(gc.app.rootDist));
};

pipes.vendorScriptSrcMapsProd = function() {

    // we need to return the source files as source maps reference them
    // todo: some source maps will inline the source code, for these we don't need to return the source file
    var sourceScripts = pipes.bowerFiles('js', gc.app.bowerComponents.scripts)
        .pipe(gulp.dest(gc.app.bowerComponents.dest));

    var srcMapOptions = _.extend({}, gc.app.bowerComponents.scripts, {overrides: gc.app.bowerComponents.overrides});
    srcMapOptions.filter = _.extend({}, srcMapOptions.filter, { skipMissing: true });
    var sourceMaps = pipes.bowerFiles('min.js.map', srcMapOptions)
        .pipe(gulp.dest(gc.app.bowerComponents.dest));

    return es.merge(sourceScripts, sourceMaps);
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

pipes.validatedIndex = function() {
    return gulp.src(paths.index)
        .pipe(plugins.htmlhint())
        .pipe(plugins.htmlhint.reporter());
};

pipes.builtIndex = function(streams) {
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

    return pipes.builtIndex(streams)
        .pipe(gulp.dest(gc.app.rootDist));
};

pipes.builtIndexProd = function() {

    var streams = {
        vendorScripts: pipes.appVendorScriptsProd(),
        appScripts: pipes.builtAppScriptsProd(),
        compScripts: pipes.appCompScriptsProd(),
        appStyles: pipes.builtAppStylesProd(),
        compStyles: pipes.appCompStylesProd(),
        vendorStyles: pipes.appVendorStylesProd()
    };

    return pipes.builtIndex(streams)
        .pipe(plugins.htmlmin({collapseWhitespace: true, removeComments: true})
        .pipe(gulp.dest(gc.app.rootDist)));
};


pipes.builtOtherFiles = function(getterFn) {
    if (!getterFn) return null;

    var locals = {
        pipes: pipes,
        plugins: plugins,
        gulp: gulp,
        lib: lib
    };
    return getterFn(locals);
};

pipes.appVendorOtherFiles = _.partial(pipes.builtOtherFiles, gc.app.bowerComponents.getOtherFiles);
pipes.builtAppOtherFiles = _.partial(pipes.builtOtherFiles, gc.app.getOtherFiles);

pipes.builtAppDev = function() {
    // todo: consider a builtVendorPartials that will copy html templates
    var streams = [
        pipes.builtIndexDev(),
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
        pipes.vendorScriptSrcMapsProd(),
        pipes.compFiles("map").pipe(gulp.dest(gc.app.rootDist)),
        pipes.compFiles(gc.comp.images.exts).pipe(gulp.dest(gc.app.rootDist)),
        pipes.processedImagesProd(gc.app.images),
        pipes.appVendorOtherFiles(),
        pipes.builtCompOtherFiles(),
        pipes.builtAppOtherFiles()
    ];
    return es.merge(_.compact(streams));
};

// == TASKS ========

// removes all compiled dev files
gulp.task('clean-dev', _.partial(pipes.cleanTaskImpl, gc.app.rootDist));

// removes all compiled production files
gulp.task('clean-prod', _.partial(pipes.cleanTaskImpl, gc.app.rootDist));

// checks index.html for syntax errors
gulp.task('validate-index', pipes.validatedIndex);

// moves html source files into the dev environment
gulp.task('build-partials-dev', pipes.builtAppPartials);

// runs jshint on the dev server scripts
gulp.task('validate-devserver-scripts', pipes.validatedDevServerScripts);

// moves app scripts into the dev environment
gulp.task('build-app-scripts-dev', pipes.builtAppScriptsDev);

// concatenates, uglifies, and moves app scripts and partials into the prod environment
gulp.task('build-app-scripts-prod', pipes.builtAppScriptsProd);

// compiles app sass and moves to the dev environment
gulp.task('build-styles-dev', pipes.builtAppStylesDev);

// compiles and minifies app sass to css and moves to the prod environment
gulp.task('build-styles-prod', pipes.builtAppStylesProd);

// concatenates, uglifies, and moves vendor scripts into the prod environment
gulp.task('build-vendor-scripts-prod', pipes.appVendorScriptsProd);

// validates and injects sources into index.html, minifies and moves it to the dev environment
gulp.task('build-index-prod', pipes.builtIndexProd);

// builds a complete dev environment
gulp.task('build-app-dev', pipes.builtAppDev);

// builds a complete prod environment
gulp.task('build-app-prod', pipes.builtAppProd);

// cleans and builds a complete dev environment
gulp.task('clean-build-app-dev', ['clean-dev'], pipes.builtAppDev);

// cleans and builds a complete prod environment
gulp.task('clean-build-app-prod', ['clean-prod'], pipes.builtAppProd);

// clean, build, and watch live changes to the dev environment
gulp.task('watch-dev', ['clean-build-app-dev', 'validate-devserver-scripts'], function() {

    // start nodemon to auto-reload the dev server
    plugins.nodemon({ script: 'server.js', ext: 'js', watch: ['devServer/'], env: {NODE_ENV : 'development'} })
        .on('change', ['validate-devserver-scripts'])
        .on('restart', function () {
            console.log('[nodemon] restarted dev server');
        });

    // start live-reload server
    plugins.livereload.listen({ start: true });

    // watch index
    gulp.watch(paths.index, function() {
        return pipes.builtIndexDev()
            .pipe(plugins.livereload());
    });

    // watch app scripts
    gulp.watch(gc.app.scripts.src.path, function() {
        return pipes.builtAppScriptsDev()
            .pipe(plugins.livereload());
    });

    // watch html partials
    gulp.watch(gc.app.partials.src.path, function() {
        return pipes.builtAppPartials()
            .pipe(plugins.livereload());
    });

    // watch styles
    gulp.watch(gc.app.styles.src.path, function() {
        return pipes.builtAppStylesDev()
            .pipe(plugins.livereload());
    });

});

// clean, build, and watch live changes to the prod environment
gulp.task('watch-prod', ['clean-build-app-prod', 'validate-devserver-scripts'], function() {

    // start nodemon to auto-reload the dev server
    plugins.nodemon({ script: 'server.js', ext: 'js', watch: ['devServer/'], env: {NODE_ENV : 'production'} })
        .on('change', ['validate-devserver-scripts'])
        .on('restart', function () {
            console.log('[nodemon] restarted dev server');
        });

    // start live-reload server
    plugins.livereload.listen({start: true});

    // watch index
    gulp.watch(paths.index, function() {
        return pipes.builtIndexProd()
            .pipe(plugins.livereload());
    });

    // watch app scripts
    gulp.watch(gc.app.scripts.src.path, function() {
        return pipes.builtAppScriptsProd()
            .pipe(plugins.livereload());
    });

    // watch hhtml partials
    gulp.watch(gc.app.partials.src.path, function() {
        return pipes.builtAppScriptsProd()
            .pipe(plugins.livereload());
    });

    // watch styles
    gulp.watch(gc.app.styles.src.path, function() {
        return pipes.builtAppStylesProd()
            .pipe(plugins.livereload());
    });

});

// default task builds for prod
gulp.task('default', ['clean-build-app-prod']);


/* Component build */

pipes.builtCompScriptsDev = _.partial(pipes.builtScriptsDev, gc.comp.scripts);
pipes.builtCompPartials = _.partial(pipes.builtPartials, gc.comp.partials);
pipes.builtCompStylesDev = _.partial(pipes.builtStylesDev, gc.comp.styles);
pipes.processedCompImagesDev = _.partial(pipes.processedImagesDev, gc.comp.images);
pipes.builtCompOtherFiles = _.partial(pipes.builtOtherFiles, gc.comp.getOtherFiles);

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

gulp.task('clean-comp', _.partial(pipes.cleanTaskImpl, gc.comp.rootDist));
gulp.task('build-comp-dev', pipes.builtCompDev);
gulp.task('build-comp-prod', pipes.builtCompProd);
gulp.task('clean-build-comp-dev', ['clean-comp'], pipes.builtCompDev);
gulp.task('clean-build-comp-prod', ['clean-comp'], pipes.builtCompProd);