module.exports = function(gulp, plugins, pipes, locals) {

    var isDev = locals.args.env === 'dev';
    var _ = require('lodash');

    return watch;

    // clean, build, and watch live changes
    function watch(config) {

        config = config || locals.config;

        gulp.watch([config.indexPage, config.scripts.src.path, config.styles.src.path], pipes.watched(pipes.builtIndex, config));

        var onPartialsChanged = isDev ? pipes.builtPartials : pipes.builtIndex;
        gulp.watch(config.partials.src.path, pipes.watched(onPartialsChanged, config));

        gulp.watch(config.images.src.path, pipes.watched(pipes.processedImages, config));

        // watch other files
        if (config.getOtherFiles) {
            var buildFnCtx = {
                pipes: pipes,
                plugins: plugins,
                gulp: gulp,
                locals: _.extend({}, locals, { config: config })
            };
            gulp.watch(config.getOtherFiles(buildFnCtx), pipes.watched(_.partial(pipes.buildOtherFiles, config.builtOtherFiles)));
        }

        // watch triggered component builds
        gulp.watch(config.component.srcRoot + pipes.watched.statusFile, pipes.watched(pipes.builtApp, config));
    }
};