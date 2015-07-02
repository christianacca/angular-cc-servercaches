module.exports = function(gulp, plugins, pipes/*, locals*/) {

    return movedCompStylesDev;

    // moves component styles into the dev environment
    function movedCompStylesDev(config){
        return pipes.compFiles("css")
            .pipe(gulp.dest(config.styles.dest));
    }
};