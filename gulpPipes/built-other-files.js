module.exports = function(gulp, plugins, pipes, locals) {

    return builtOtherFiles;

    function builtOtherFiles(buildFn){
        buildFn = buildFn || locals.config.builtOtherFiles;
        return pipes.buildOtherFiles(buildFn);
    }
};