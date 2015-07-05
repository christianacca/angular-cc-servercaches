module.exports = function(gulp, plugins, pipes, locals) {

    return movedCompScripts;

    // moves component scripts into the dev environment
    function movedCompScripts(config){
        config = config || locals.config;
        return pipes.compFiles("js")
            .pipe(gulp.dest(config.component.scripts.dest));
    }
};