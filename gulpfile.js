var args = require('yargs').argv;
var gulp = require('./gulp/blocks/gulpPlumbed');
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
    locals: {
        args: args,
        config: gc.app
    },
    plugins: plugins
};
pipeOptions = _.extend({}, gc.app.pipesOptions, pipeOptions);
var pipes = require('./gulp/blocks/loadPipes')(pipeOptions);


pipes.validatedDevServerScripts = function() {
    return gulp.src(gc.app.scriptsDevServer.src.path)
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));
};

pipes.builtApp = _.partial(pipes.builtApp, gc.app);

// == TASKS ========

// removes all compiled dev files
gulp.task('app-clean', _.partial(pipes.clean, gc.app.distRoot));

// runs jshint on the dev server scripts
gulp.task('validate-devserver-scripts', pipes.validatedDevServerScripts);

// runs jshint on the app scripts
gulp.task('app-validate-scripts', _.partial(pipes.validatedScripts, gc.app.scripts));

// builds a complete environment
gulp.task('app-build', pipes.builtApp);

// cleans and builds a complete environment
gulp.task('app-clean-build', ['app-clean'], pipes.builtApp);


gulp.task('app-watch', ['app-clean-build', 'validate-devserver-scripts'], _.partial(pipes.watchApp, gc.app));

// default task builds for dev
gulp.task('default', ['app-clean-build']);