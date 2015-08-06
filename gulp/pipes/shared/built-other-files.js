module.exports = function(gulp, plugins, pipes, locals) {

    return builtOtherFiles;

    function builtOtherFiles(config){
        config = config || locals.config;
        if (!config.builtOtherFiles) return null;

        return pipes.buildOtherFiles(config.builtOtherFiles.bind(config), config);
    }
};