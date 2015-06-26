var args = require('yargs').argv;
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var del = require('del');
var es = require('event-stream');
var lib = require('bower-files')();
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

    return es.merge(scriptedPartials, validatedAppScripts)
        .pipe(plugins.angularFilesort())
        .pipe(plugins.sourcemaps.init())
            .pipe(plugins.concat({ path: scriptsConfig.minifedFile, cwd: ''}))
            .pipe(plugins.uglify())
            .pipe(plugins.rev())
        .pipe(plugins.sourcemaps.write('./'))
        .pipe(gulp.dest(scriptsConfig.dest));
};

pipes.builtAppScriptsProd = _.partial(pipes.builtScriptsProd, gc.app.scripts, gc.app.partials);

pipes.builtVendorScriptsDev = function(config) {
    return pipes.bowerFiles('js', config.filter)
        .pipe(gulp.dest(config.dest));
};

pipes.builtAppVendorScriptsDev = _.partial(pipes.builtVendorScriptsDev, gc.app.bowerComponents.scripts);

pipes.builtVendorScriptsProd = function(config) {
    return pipes.bowerFiles('min.js')
        .pipe(plugins.order(config.order))
        .pipe(plugins.concat('bower_components.min.js'))
        .pipe(plugins.rev())
        .pipe(gulp.dest(config.dest));
};

pipes.builtAppVendorScriptsProd = _.partial(pipes.builtVendorScriptsProd, gc.app.bowerComponents.scripts);

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
            moduleName: "shared"
        }));
};
pipes.scriptedAppPartials = _.partial(pipes.scriptedPartials, gc.app.partials);

pipes.bowerFiles = function (ext, options) {
    options = _.extend({}, { skipMissing: false, dev: true }, options);

    // note: we having to make up for the fact that bower does not have a mechanism to describe minified main and source
    // map files

    var primaryExt, secondaryExt, ternaryExt;
    var extParts = ext.split('.');
    primaryExt = extParts[1] || extParts[0];
    secondaryExt = extParts.length > 1 ? extParts[0] : undefined;
    ternaryExt = extParts[2];

    var fileMapFn;
    if (!secondaryExt){
        fileMapFn = _.identity;
    } else {
        var replacementExt = _.compact([secondaryExt, primaryExt, ternaryExt]).join('.');
        fileMapFn = function (name) {
            return name.replace('.' + primaryExt, '.' + replacementExt);
        };
    }

    var criteria = {
        dev: options.dev,
        ext: primaryExt
    };
    var files = lib.filter(criteria).map(fileMapFn);
    // not sure why gulp-expect-file cannot check files directly :-(
    var expectedFiles = files.map(function(filePath) {
        return '**/' + _.last(filePath.split('\\'));
    });
    var continuation = gulp.src(files);
    if (!options.skipMissing) {
        continuation = continuation
            .pipe(plugins.expectFile({ checkRealFile: true, reportMissing: true }, expectedFiles));
    }
    return continuation;
};

pipes.builtStylesDev = function(config) {
    return gulp.src(config.src.path, config.src.options)
        .pipe(plugins.sass())
        .pipe(gulp.dest(config.dest));
};

pipes.builtAppStylesDev = _.partial(pipes.builtStylesDev, gc.app.styles);

pipes.builtStylesProd = function(config) {
    return gulp.src(config.src.path, config.src.options)
        .pipe(plugins.sourcemaps.init())
            .pipe(plugins.sass())
            .pipe(plugins.concat({ path: config.minifedFile, cwd: ''}))
            .pipe(plugins.minifyCss())
            .pipe(plugins.rev())
        .pipe(plugins.sourcemaps.write('./'))
        .pipe(gulp.dest(config.dest));
};

pipes.builtAppStylesProd = function() {
    return pipes.builtStylesProd(gc.app.styles);
};

pipes.builtVendorStylesDev = function(config) {
    return pipes.bowerFiles('css', config.filter)
        .pipe(gulp.dest(config.dest));
};

pipes.builtAppVendorStylesDev = _.partial(pipes.builtVendorStylesDev, gc.app.bowerComponents.styles);

pipes.builtVendorStylesProd = function(config) {
    return pipes.bowerFiles('min.css', config.filter)
        .pipe(plugins.order(config.order))
        .pipe(plugins.concat('bower_components.min.css'))
        .pipe(plugins.rev())
        .pipe(gulp.dest(config.dest));
};

pipes.builtAppVendorStylesProd = _.partial(pipes.builtVendorStylesProd, gc.app.bowerComponents.styles);

pipes.vendorScriptSrcMapsProd = function() {

    // we need to return the source files as source maps reference them
    // todo: some source maps will inline the source code, for these we don't need to return the source file
    var sourceScripts = pipes.bowerFiles('js')
        .pipe(gulp.dest(gc.app.bowerComponents.dest));

    var sourceMaps = pipes.bowerFiles('min.js.map', { skipMissing: true })
        .pipe(gulp.dest(gc.app.bowerComponents.dest));

    return es.merge(sourceScripts, sourceMaps);
};

pipes.processedImagesDev = function(config) {
    return gulp.src(config.src.path, config.src.options)
        .pipe(gulp.dest(config.dest));
};

pipes.processedAppImagesDev = _.partial(pipes.processedImagesDev, gc.app.images);

pipes.processedImagesProd = function() {
    return gulp.src(paths.images)
        .pipe(plugins.flatten())
        .pipe(gulp.dest(paths.distProd + 'demoApp/images'));
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
        .pipe(plugins.inject(streams.appScripts, {relative: true}))
        .pipe(plugins.inject(streams.appStyles, {relative: true}))
        .pipe(plugins.inject(streams.vendorStyles, {relative: true, name: 'bower'}));
};


// validates and injects sources into index.html and moves it to the dev environment
pipes.builtIndexDev = function() {

    var streams = {
        vendorScripts: pipes.builtAppVendorScriptsDev()
            .pipe(plugins.order(gc.app.bowerComponents.scripts.order)),
        appScripts: pipes.builtAppScriptsDev().pipe(plugins.angularFilesort()),
        appStyles: pipes.builtAppStylesDev(),
        vendorStyles: pipes.builtAppVendorStylesDev()
            .pipe(plugins.order(gc.app.bowerComponents.styles.order))
    };

    return pipes.builtIndex(streams)
        .pipe(gulp.dest(gc.app.rootDist));
};

pipes.builtIndexProd = function() {

    var streams = {
        vendorScripts: pipes.builtAppVendorScriptsProd(),
        appScripts: pipes.builtAppScriptsProd(),
        appStyles: pipes.builtAppStylesProd(),
        vendorStyles: pipes.builtAppVendorStylesProd()
    };

    return pipes.builtIndex(streams)
        .pipe(plugins.htmlmin({collapseWhitespace: true, removeComments: true})
        .pipe(gulp.dest(gc.app.rootDist)));
};

pipes.builtAppDev = function() {
    return es.merge(pipes.builtIndexDev(), pipes.builtAppPartials(), pipes.processedAppImagesDev());
};

pipes.builtAppProd = function() {
    return es.merge(pipes.builtIndexProd(), pipes.vendorScriptSrcMapsProd(), pipes.processedImagesProd());
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

// moves vendor scripts into the dev environment
gulp.task('build-vendor-scripts-dev', pipes.builtAppVendorScriptsDev);

// concatenates, uglifies, and moves vendor scripts into the prod environment
gulp.task('build-vendor-scripts-prod', pipes.builtAppVendorScriptsProd);

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

pipes.validatedCompScripts = _.partial(pipes.validatedScripts, gc.comp.scripts);
pipes.builtCompScriptsDev = _.partial(pipes.builtScriptsDev, gc.comp.scripts);
pipes.builtCompPartials = _.partial(pipes.builtPartials, gc.comp.partials);
pipes.builtCompVendorScriptsDev = _.partial(pipes.builtVendorScriptsDev, gc.comp.bowerComponents.scripts);
pipes.builtCompVendorStylesDev = _.partial(pipes.builtVendorStylesDev, gc.comp.bowerComponents.styles);
pipes.builtCompStylesDev = _.partial(pipes.builtStylesDev, gc.comp.styles);
pipes.processedCompImagesDev = _.partial(pipes.processedImagesDev, gc.comp.images);

gulp.task('clean-build-comp-dev', ['clean-comp-dev'], function () {

    var vendorScripts = pipes.builtCompVendorScriptsDev();
    var scripts = pipes.builtCompScriptsDev();
    var styles = pipes.builtCompStylesDev();
    var vendorStyles = pipes.builtCompVendorStylesDev();

    var partials = pipes.builtCompPartials();
    var images = pipes.processedCompImagesDev();

    return es.merge(vendorScripts, scripts, styles, vendorStyles, partials, images);
});

gulp.task('clean-comp-dev', _.partial(pipes.cleanTaskImpl, gc.comp.rootDist));