module.exports = function(gulp, plugins, pipes/*, locals*/) {

    var es = require('event-stream');

    return builtScripts;

    // concatenates, uglifies, and moves scripts and partials into the prod environment
    function builtScripts(scriptsConfig, partialsConfig) {
        var scriptedPartials = pipes.scriptedPartials(partialsConfig);
        var validatedAppScripts = pipes.validatedScripts(scriptsConfig);

        return es.merge(scriptedPartials, validatedAppScripts)
            .pipe(plugins.angularFilesort())
            .pipe(plugins.sourcemaps.init())
                .pipe(plugins.concat({ path: scriptsConfig.outputFile, cwd: ''}))
                .pipe(scriptsConfig.isConcatFileOutput ? gulp.dest(scriptsConfig.dest) : plugins.util.noop())
                .pipe(pipes.minifiedFileName())
                .pipe(plugins.uglify())
                .pipe(scriptsConfig.isCacheBusted ? plugins.rev() : plugins.util.noop())
            .pipe(plugins.sourcemaps.write('./'))
            .pipe(gulp.dest(scriptsConfig.dest));
    }
};