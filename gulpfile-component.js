var args = require('yargs').argv;
var gulp = require('./gulp/blocks/gulpPlumbed');
var plugins = require('gulp-load-plugins')();
var _ = require('lodash');

/**
 * yargs variables can be passed in to alter the behavior, when present.
 * Example: gulp build-app --dev
 *
 * --env  : The environment name to build for; defaults to 'dev'.
 */

args.env = args.env || 'dev';
var gc = require('./gulp.config')(args);

// == PIPE SEGMENTS ========


var pipeOptions = {
    locals: {
        args: args,
        config: gc.comp
    },
    plugins: plugins
};
pipeOptions = _.extend({}, gc.comp.pipesOptions, pipeOptions);
var pipes = require('./gulp/blocks/loadPipes')(pipeOptions);

// == TASKS ========


// default task builds for dev
gulp.task('default', ['comp-build']);
gulp.task('comp-clean', _.partial(pipes.clean, gc.comp.distRoot));
gulp.task('comp-build', _.partial(pipes.builtComp, gc.comp));
gulp.task('comp-clean-build', ['comp-clean'], _.partial(pipes.builtComp, gc.comp));
gulp.task('comp-watch', ['comp-clean-build'], _.partial(pipes.watchComp, gc.comp));