module.exports = function(gulp, plugins, pipes, locals) {

    var isDev = locals.args.env === 'dev';
    var _ = require('lodash');

    return watch;

    // clean, build, and watch live changes
    function watch(config) {

        // rebuild scripts, etc and inject them into index page
        gulp.watch([config.indexPage, config.scripts.src.path, config.styles.src.path], _.partial(pipes.builtIndex, config));

        // watch html partials
        var onPartialsChanged = isDev ? _.partial(pipes.builtPartials, config.partials) : _.partial(pipes.builtIndex, config);
        gulp.watch(config.partials.src.path, onPartialsChanged);

        // watch images
        gulp.watch(config.images.src.path, _.partial(processedImages, config));

        // watch other files
        if (config.getOtherFiles) {
            gulp.watch(config.getOtherFiles(), _.partial(pipes.buildOtherFiles, config.builtOtherFiles));
        }

    }
};