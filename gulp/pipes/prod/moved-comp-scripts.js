module.exports = function(gulp, plugins, pipes/*, locals*/) {

    return movedCompScripts;

    // moves component scripts into the production environment
    function movedCompScripts(config){
        return pipes.compFiles("min.js")
            .pipe(plugins.rev())
            .pipe(gulp.dest(config.scripts.dest));
    }
};