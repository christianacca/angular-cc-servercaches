module.exports = function(gulp, plugins, pipes, locals) {

    return movedCompOtherFiles;

    function movedCompOtherFiles(config){
        config = config || locals.config;
        return pipes.buildOtherFiles(config.component.movedOtherFiles);
    }
};