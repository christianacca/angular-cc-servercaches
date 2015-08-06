module.exports = function(gulp, plugins, pipes, locals) {

    var isDev = locals.args.env === 'dev';
    var _ = require('lodash');

    return watch;

    // clean, build, and watch live changes
    function watch(config) {

        config = config || locals.config;

        gulp.watch([config.scripts.src.path], pipes.watched(pipes.builtScripts, config));
        gulp.watch([config.styles.src.path], pipes.watched(pipes.builtStyles, config));

        var onPartialsChanged = isDev ? pipes.builtPartials : pipes.builtScripts;
        gulp.watch(config.partials.src.path, pipes.watched(onPartialsChanged, config));

        gulp.watch(config.images.src.path, pipes.watched(pipes.processedImages, config));

        if (config.getOtherFiles) {
            var buildFnCtx = {
                pipes: pipes,
                plugins: plugins,
                gulp: gulp,
                locals: _.extend({}, locals, { config: config })
            };
            gulp.watch(config.getOtherFiles(buildFnCtx), pipes.watched(_.partial(pipes.buildOtherFiles, config.builtOtherFiles), config));
        }

    }
};