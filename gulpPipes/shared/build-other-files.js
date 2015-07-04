module.exports = function(gulp, plugins, pipes, locals) {

    var lib = require('bower-files');

    return buildOtherFiles;

    function buildOtherFiles(buildFn){
        if (!buildFn) return null;

        var locals = {
            pipes: pipes,
            plugins: plugins,
            gulp: gulp,
            lib: lib,
            locals: locals
        };
        return buildFn(locals);
    }
};