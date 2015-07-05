module.exports = function(gulp, plugins, pipes, locals) {

    var _ = require('lodash');

    var statusFile = 'last-watched.txt';
    watched.statusFile = statusFile;
    return watched;

    function watched(watchAction, config){
        config = config || locals.config;

        var defaultOptions = {
            isWatchStatusFileEnabled: false,
            statusFile: statusFile,
            statusFileDest: config.distRoot,
            watchCompleted: plugins.util.noop
        };

        var options = _.extend({}, defaultOptions, locals);

        var watchCompletedCtx = {
            config: config,
            pipes: pipes,
            plugins: plugins,
            gulp: gulp,
            locals: options
        };
        return function doWatch() {

            var maybeStatusFileWritten = plugins.util.noop();
            if (options.isWatchStatusFileEnabled){
                maybeStatusFileWritten = plugins.file(options.statusFile, Date.now().toString())
                    .pipe(gulp.dest(options.statusFileDest));
            }

            return watchAction.call(null, config)
                .pipe(maybeStatusFileWritten)
                .pipe(options.watchCompleted(watchCompletedCtx));
        };
    }
};