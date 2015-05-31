var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var del = require('del');
var es = require('event-stream');
var lib = require('bower-files')();
var path = require('path');
var Q = require('q');
var _ = require('lodash');

// == PATH STRINGS ========

var paths = {
    scripts: 'src/demoApp/**/*.js',
    styles: ['./src/demoApp/**/*.css', './src/demoApp/**/*.scss'],
    images: ['./src/demoApp/**/*.svg', './src/demoApp/**/*.jpg', './src/demoApp/**/*.gif', './src/demoApp/**/*.png'],
    index: './src/index.html',
    partials: ['src/demoApp/**/*.html'],
    distDev: './dist.dev',
    distProd: './dist.prod/',
    scriptsDevServer: 'devServer/**/*.js'
};

// == PIPE SEGMENTS ========

var pipes = {};

pipes.orderedVendorScripts = function() {
    return plugins.order(['jquery.*', 'angular.*']);
};

pipes.orderedAppScripts = function() {
    return plugins.angularFilesort();
};

pipes.orderedVendorStyles = function() {
    return plugins.order([]);
};


pipes.minifiedFileName = function() {
    return plugins.rename(function (path) {
        path.extname = '.min' + path.extname;
    });
};

pipes.validatedAppScripts = function(env) {
    env = env || 'dev';
    plugins.nunjucksRender.nunjucks.configure({ watch: false });
    var jsTplFilter = plugins.filter('**/*.tpl.js');
    return gulp.src(paths.scripts, { base: 'src/'})
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish', {verbose: true}))
        .pipe(jsTplFilter)
            .pipe(plugins.data(function(f){
                var tplData = require(path.dirname(f.path) + '\\' + path.basename(f.path, '.js') + '.json');
                return tplData && tplData[env];
            }))
            .pipe(plugins.nunjucksRender())
            .pipe(plugins.rename(function(f){
                f.extname = '.js';
                f.basename = f.basename.replace('.tpl', '');
            }))
        .pipe(jsTplFilter.restore());
};

pipes.builtAppScriptsDev = function() {
    return pipes.validatedAppScripts()
        .pipe(gulp.dest(paths.distDev));
};

pipes.builtAppScriptsProd = function() {
    var scriptedPartials = pipes.scriptedPartials();
    var validatedAppScripts = pipes.validatedAppScripts('prod');

    return es.merge(scriptedPartials, validatedAppScripts)
        .pipe(pipes.orderedAppScripts())
        .pipe(plugins.sourcemaps.init())
            .pipe(plugins.concat({ path: 'app.min.js', cwd: ''}))
            .pipe(plugins.uglify())
            .pipe(plugins.rev())
        .pipe(plugins.sourcemaps.write('./'))
        .pipe(gulp.dest(paths.distProd + 'demoApp/'));
};

pipes.builtVendorScriptsDev = function() {
    return pipes.bowerFiles('js')
        .pipe(gulp.dest('dist.dev/bower_components'));
};

pipes.builtVendorScriptsProd = function() {
    return pipes.bowerFiles('min.js')
        .pipe(pipes.orderedVendorScripts())
        .pipe(plugins.concat('bower_components.min.js'))
        .pipe(plugins.rev())
        .pipe(gulp.dest(paths.distProd + 'bower_components/'));
};

pipes.validatedDevServerScripts = function() {
    return gulp.src(paths.scriptsDevServer)
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));
};

pipes.validatedPartials = function() {
    return gulp.src(paths.partials, { base: 'src/'})
        .pipe(plugins.htmlhint({'doctype-first': false}))
        .pipe(plugins.htmlhint.reporter());
};

pipes.builtPartialsDev = function() {
    return pipes.validatedPartials()
        .pipe(gulp.dest(paths.distDev));
};

pipes.scriptedPartials = function() {
    return pipes.validatedPartials()
        .pipe(plugins.htmlhint.failReporter())
        .pipe(plugins.htmlmin({collapseWhitespace: true, removeComments: true}))
        .pipe(plugins.ngHtml2js({
            moduleName: "shared"
        }));
};

pipes.bowerFiles = function (ext, skipMissing) {

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
        dev: true,
        ext: primaryExt
    };
    var files = lib.filter(criteria).map(fileMapFn);
    // not sure why gulp-expect-file cannot check files directly :-(
    var expectedFiles = files.map(function(filePath) {
        return '**/' + _.last(filePath.split('\\'));
    });
    var continuation = gulp.src(files);
    if (!skipMissing) {
        continuation = continuation
            .pipe(plugins.expectFile({ checkRealFile: true, reportMissing: true }, expectedFiles));
    }
    return continuation;
};

pipes.builtStylesDev = function() {
    return gulp.src(paths.styles, { base: 'src/'})
        .pipe(plugins.sass())
        .pipe(gulp.dest(paths.distDev));
};

pipes.builtStylesProd = function() {
    return gulp.src(paths.styles, { base: 'src/'})
        .pipe(plugins.sourcemaps.init())
            .pipe(plugins.sass())
            .pipe(plugins.concat({ path: 'app.min.css', cwd: ''}))
            .pipe(plugins.minifyCss())
            .pipe(plugins.rev())
        .pipe(plugins.sourcemaps.write('./'))
        .pipe(gulp.dest(paths.distProd + 'demoApp/'));
};

pipes.builtVendorStylesDev = function() {
    return pipes.bowerFiles('css')
        .pipe(pipes.orderedVendorStyles())
        .pipe(gulp.dest('dist.dev/bower_components/'));
};

pipes.builtVendorStylesProd = function() {
    return pipes.bowerFiles('min.css')
        .pipe(pipes.orderedVendorStyles())
        .pipe(plugins.concat('bower_components.min.css'))
        .pipe(plugins.rev())
        .pipe(gulp.dest(paths.distProd + 'bower_components/'));
};

pipes.vendorScriptSrcMapsProd = function() {

    // we need to return the source files as source maps reference them
    // todo: some source maps will inline the source code, for these we don't need to return the source file
    var sourceScripts = pipes.bowerFiles('js')
        .pipe(gulp.dest(paths.distProd + 'bower_components/'));

    var sourceMaps = pipes.bowerFiles('min.js.map', true)
        .pipe(gulp.dest(paths.distProd + 'bower_components/'));

    return es.merge(sourceScripts, sourceMaps);
};

pipes.processedImagesDev = function() {
    return gulp.src(paths.images, { base: 'src/'})
        .pipe(gulp.dest(paths.distDev));
};

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

pipes.builtIndexDev = function() {

    var orderedVendorScripts = pipes.builtVendorScriptsDev()
        .pipe(pipes.orderedVendorScripts());

    var orderedAppScripts = pipes.builtAppScriptsDev()
        .pipe(pipes.orderedAppScripts());

    var appStyles = pipes.builtStylesDev();
    var vendorStyles = pipes.builtVendorStylesDev();

    return pipes.validatedIndex()
        .pipe(gulp.dest(paths.distDev)) // write first to get relative path for inject
        .pipe(plugins.inject(orderedVendorScripts, {relative: true, name: 'bower'}))
        .pipe(plugins.inject(orderedAppScripts, {relative: true}))
        .pipe(plugins.inject(appStyles, {relative: true}))
        .pipe(plugins.inject(vendorStyles, {relative: true, name: 'bower'}))
        .pipe(gulp.dest(paths.distDev));
};

pipes.builtIndexProd = function() {

    var vendorScripts = pipes.builtVendorScriptsProd();
    var appScripts = pipes.builtAppScriptsProd();
    var appStyles = pipes.builtStylesProd();
    var vendorStyles = pipes.builtVendorStylesProd();


    return pipes.validatedIndex()
        .pipe(gulp.dest(paths.distProd)) // write first to get relative path for inject
        .pipe(plugins.inject(vendorScripts, {relative: true, name: 'bower'}))
        .pipe(plugins.inject(appScripts, {relative: true}))
        .pipe(plugins.inject(appStyles, {relative: true}))
        .pipe(plugins.inject(vendorStyles, {relative: true, name: 'bower'}))
        //.pipe(plugins.htmlmin({collapseWhitespace: true, removeComments: true}))
        .pipe(gulp.dest(paths.distProd));
};

pipes.builtAppDev = function() {
    return es.merge(pipes.builtIndexDev(), pipes.builtPartialsDev(), pipes.processedImagesDev());
};

pipes.builtAppProd = function() {
    return es.merge(pipes.builtIndexProd(), pipes.vendorScriptSrcMapsProd(), pipes.processedImagesProd());
};

// == TASKS ========

// removes all compiled dev files
gulp.task('clean-dev', function() {
    var deferred = Q.defer();
    del(paths.distDev, function(err) {
        if (err){
            deferred.reject(err);
        } else {
            deferred.resolve();
        }
    });
    return deferred.promise;
});

// removes all compiled production files
gulp.task('clean-prod', function() {
    var deferred = Q.defer();
    del(paths.distProd, function(err) {
        if (err){
            deferred.reject(err);
        } else {
            deferred.resolve();
        }
    });
    return deferred.promise;
});

// checks html source files for syntax errors
gulp.task('validate-partials', pipes.validatedPartials);

// checks index.html for syntax errors
gulp.task('validate-index', pipes.validatedIndex);

// moves html source files into the dev environment
gulp.task('build-partials-dev', pipes.builtPartialsDev);

// converts partials to javascript using html2js
gulp.task('convert-partials-to-js', pipes.scriptedPartials);

// runs jshint on the dev server scripts
gulp.task('validate-devserver-scripts', pipes.validatedDevServerScripts);

// runs jshint on the app scripts
gulp.task('validate-app-scripts', pipes.validatedAppScripts);

// moves app scripts into the dev environment
gulp.task('build-app-scripts-dev', pipes.builtAppScriptsDev);

// concatenates, uglifies, and moves app scripts and partials into the prod environment
gulp.task('build-app-scripts-prod', pipes.builtAppScriptsProd);

// compiles app sass and moves to the dev environment
gulp.task('build-styles-dev', pipes.builtStylesDev);

// compiles and minifies app sass to css and moves to the prod environment
gulp.task('build-styles-prod', pipes.builtStylesProd);

// moves vendor scripts into the dev environment
gulp.task('build-vendor-scripts-dev', pipes.builtVendorScriptsDev);

// concatenates, uglifies, and moves vendor scripts into the prod environment
gulp.task('build-vendor-scripts-prod', pipes.builtVendorScriptsProd);

// validates and injects sources into index.html and moves it to the dev environment
gulp.task('build-index-dev', pipes.builtIndexDev);

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
    gulp.watch(paths.scripts, function() {
        return pipes.builtAppScriptsDev()
            .pipe(plugins.livereload());
    });

    // watch html partials
    gulp.watch(paths.partials, function() {
        return pipes.builtPartialsDev()
            .pipe(plugins.livereload());
    });

    // watch styles
    gulp.watch(paths.styles, function() {
        return pipes.builtStylesDev()
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
    gulp.watch(paths.scripts, function() {
        return pipes.builtAppScriptsProd()
            .pipe(plugins.livereload());
    });

    // watch hhtml partials
    gulp.watch(paths.partials, function() {
        return pipes.builtAppScriptsProd()
            .pipe(plugins.livereload());
    });

    // watch styles
    gulp.watch(paths.styles, function() {
        return pipes.builtStylesProd()
            .pipe(plugins.livereload());
    });

});

// default task builds for prod
gulp.task('default', ['clean-build-app-prod']);
