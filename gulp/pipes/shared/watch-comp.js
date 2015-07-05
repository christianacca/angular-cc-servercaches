module.exports = function(gulp, plugins, pipes, locals) {

    var isDev = locals.args.env === 'dev';
    var _ = require('lodash');

    return watch;

    // clean, build, and watch live changes
    function watch(config) {

        config = config || locals.config;

        gulp.watch([config.scripts.src.path, config.styles.src.path], _.partial(pipes.builtScripts, config));
        gulp.watch([config.styles.src.path, config.styles.src.path], _.partial(pipes.builtStyles, config));

        var onPartialsChanged = isDev ? _.partial(pipes.builtPartials, config) : _.partial(pipes.builtScripts, config);
        gulp.watch(config.partials.src.path, onPartialsChanged);

        gulp.watch(config.images.src.path, _.partial(pipes.processedImages, config));

        if (config.getOtherFiles) {
            gulp.watch(config.getOtherFiles(), _.partial(pipes.buildOtherFiles, config.builtOtherFiles));
        }

    }
};