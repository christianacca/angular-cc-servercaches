module.exports = function(gulp, plugins, pipes, locals) {

    return validatedScripts;

    function validatedScripts(config) {
        config = config || locals.config;
        return pipes.processedScripts(config)
            .pipe(plugins.jshint())
            .pipe(plugins.jshint.reporter('jshint-stylish', {verbose: true}));
    }
};