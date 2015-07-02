module.exports = function(gulp, plugins, pipes/*, locals*/) {

    return movedCompScriptsProd;

    // moves component scripts into the production environment
    function movedCompScriptsProd(config){
        return pipes.compFiles("min.js")
            .pipe(plugins.rev())
            .pipe(gulp.dest(config.scripts.dest));
    }
};