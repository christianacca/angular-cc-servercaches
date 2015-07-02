module.exports = function(gulp, plugins, pipes/*, locals*/) {

    return movedCompScriptsDev;

    // moves component scripts into the dev environment
    function movedCompScriptsDev(config){
        return pipes.compFiles("js")
            .pipe(gulp.dest(config.scripts.dest));
    }
};