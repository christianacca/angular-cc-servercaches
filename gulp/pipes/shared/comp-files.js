module.exports = function(gulp, plugins, pipes, locals) {

    return compFiles;

    function compFiles(ext, config){
        config = config || locals.config;
        return gulp.src(config.component.srcRoot + "**/*." + ext);
    }
};