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
var configFactory = require('./gulp/blocks/configFactory')(args);
var config = configFactory.createCompConfig(require('./gulp.comp.config'));

// == PIPE SEGMENTS ========


var pipeOptions = {
    locals: {
        args: args,
        config: config
    },
    plugins: plugins
};
pipeOptions = _.extend({}, config.pipesOptions, pipeOptions);
var pipes = require('./gulp/blocks/loadPipes')(pipeOptions);

// == TASKS ========


// default task builds for dev
gulp.task('default', ['comp-build']);
gulp.task('comp-clean', _.partial(pipes.clean, config.distRoot));
gulp.task('comp-build', _.partial(pipes.builtComp, config));
gulp.task('comp-clean-build', ['comp-clean'], _.partial(pipes.builtComp, config));
gulp.task('comp-watch', ['comp-clean-build'], _.partial(pipes.watchComp, config));