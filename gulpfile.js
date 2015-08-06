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
var config = configFactory.createAppConfig(require('./gulp.app.config'));

// == PIPE SEGMENTS ========


var pipeOptions = {
    locals: {
        args: args,
        config:config
    },
    plugins: plugins
};
pipeOptions = _.extend({},config.pipesOptions, pipeOptions);
var pipes = require('./gulp/blocks/loadPipes')(pipeOptions);


pipes.validatedDevServerScripts = function() {
    return gulp.src(config.scriptsDevServer.src.path)
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));
};

pipes.builtApp = _.partial(pipes.builtApp,config);

// == TASKS ========

// removes all compiled dev files
gulp.task('app-clean', _.partial(pipes.clean,config.distRoot));

// runs jshint on the dev server scripts
gulp.task('validate-devserver-scripts', pipes.validatedDevServerScripts);

// runs jshint on the app scripts
gulp.task('app-validate-scripts', _.partial(pipes.validatedScripts,config.scripts));

// builds a complete environment
gulp.task('app-build', pipes.builtApp);

// cleans and builds a complete environment
gulp.task('app-clean-build', ['app-clean'], pipes.builtApp);


gulp.task('app-watch', ['app-clean-build', 'validate-devserver-scripts'], _.partial(pipes.watchApp,config));

// default task builds for dev
gulp.task('default', ['app-clean-build']);

// experiment with copy only the files that have changed...
/*
gulp.task('testCopy', function(){
    return gulp.src(config.srcRoot + 'bower_components/!**!/!*.js')
        .pipe(plugins.changed(config.distRoot + 'bower_components'))
        .pipe(gulp.dest(config.distRoot + 'bower_components'));
});*/
