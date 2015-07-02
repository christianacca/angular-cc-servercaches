module.exports = function(gulp, plugins, pipes, locals) {

    return movedVendorOtherFiles;

    function movedVendorOtherFiles(moveFn){
        moveFn = moveFn || locals.config.bowerComponents.movedOtherFiles;
        return pipes.buildOtherFiles(moveFn);
    }
};