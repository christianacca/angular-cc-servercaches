module.exports = function(gulp, plugins, pipes, locals) {

    var lib = require('bower-files');

    return buildOtherFiles;

    function buildOtherFiles(buildFn/*, config*/){
        if (!buildFn) return null;

        var buildFnCtx = {
            pipes: pipes,
            plugins: plugins,
            gulp: gulp,
            lib: lib,
            locals: locals
        };
        return buildFn(buildFnCtx);
    }
};