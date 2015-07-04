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


var pipeOptions = {
    standardPipesDir: './gulpPipes/',
    customPipesDir: './gulpPipesCustom/',
    gulp: gulp,
    locals: {
        args: args,
        config: gc.app
    },
    plugins: plugins,
    pipeArgs: {
        buildIndex: {
            dest: gc.app.distRoot
        },
        compFiles: {
            compDir: gc.comp.distRoot
        },
        validatedIndex: {
            indexPage: gc.app.indexPage
        }
    }
};
var pipes = require('./gulpBlocks/loadPipes')(pipeOptions);


pipes.validatedAppScripts = _.partial(pipes.validatedScripts, gc.app.scripts);





pipes.validatedDevServerScripts = function() {
    return gulp.src(gc.app.scriptsDevServer.src.path)
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));
};

pipes.builtApp = isDev ? _.partial(pipes.builtAppDev, gc.app) : _.partial(pipes.builtAppProd, gc.app);

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


gulp.task('app-watch', ['app-clean-build', 'validate-devserver-scripts'], _.partial(pipes.watch, gc.app));

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