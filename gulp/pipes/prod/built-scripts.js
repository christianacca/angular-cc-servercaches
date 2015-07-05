module.exports = function(gulp, plugins, pipes, locals) {

    var es = require('event-stream');

    return builtScripts;

    // concatenates, uglifies, and moves scripts and partials into the prod environment
    function builtScripts(config) {
        config = config || locals.config;
        var scriptedPartials = pipes.scriptedPartials(config);
        var validatedAppScripts = pipes.validatedScripts(config);

        return es.merge(scriptedPartials, validatedAppScripts)
            .pipe(plugins.angularFilesort())
            .pipe(plugins.sourcemaps.init())
                .pipe(plugins.concat({ path: config.scripts.outputFile, cwd: ''}))
                .pipe(config.scripts.isConcatFileOutput ? gulp.dest(config.scripts.dest) : plugins.util.noop())
                .pipe(pipes.minifiedFileName())
                .pipe(plugins.uglify())
                .pipe(config.scripts.isCacheBusted ? plugins.rev() : plugins.util.noop())
            .pipe(plugins.sourcemaps.write('./'))
            .pipe(gulp.dest(config.scripts.dest));
    }
};