module.exports = function(gulp, plugins, pipes/*, locals*/) {

    return movedCompStylesProd;

    // moves component styles into the production environment
    function movedCompStylesProd(config){
        return pipes.compFiles("min.css")
            .pipe(plugins.rev())
            .pipe(gulp.dest(config.styles.dest));
    }
};