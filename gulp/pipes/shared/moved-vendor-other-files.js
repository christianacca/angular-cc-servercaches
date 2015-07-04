module.exports = function(gulp, plugins, pipes, locals) {

    return movedVendorOtherFiles;

    function movedVendorOtherFiles(config){
        config = config || locals.config;
        return pipes.buildOtherFiles(config.bowerComponents.movedOtherFiles);
    }
};