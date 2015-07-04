module.exports = function(gulp, plugins, pipes, locals) {

    return compFiles;

    function compFiles(ext){
        return gulp.src(locals.compDir + "**/*." + ext);
    }
};