module.exports = function(gulp, plugins, pipes, locals) {

    return movedCompOtherFiles;

    function movedCompOtherFiles(moveFn){
        moveFn = moveFn || locals.config.component.movedOtherFiles;
        return pipes.buildOtherFiles(moveFn);
    }
};