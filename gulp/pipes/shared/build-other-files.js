module.exports = function(gulp, plugins, pipes, locals) {

    var _ = require('lodash');
    var lib = require('bower-files');

    return buildOtherFiles;

    function buildOtherFiles(buildFn, config){
        if (!buildFn) return null;

        config = config || locals.config;

        var buildFnCtx = {
            pipes: pipes,
            plugins: plugins,
            gulp: gulp,
            lib: lib,
            locals: _.extend({}, locals, { config: config })
        };
        return buildFn(buildFnCtx);
    }
};