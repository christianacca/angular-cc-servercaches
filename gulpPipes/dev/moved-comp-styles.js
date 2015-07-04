module.exports = function(gulp, plugins, pipes/*, locals*/) {

    return movedCompStyles;

    // moves component styles into the production environment
    function movedCompStyles(config){
        return pipes.compFiles("min.css")
            .pipe(plugins.rev())
            .pipe(gulp.dest(config.styles.dest));
    }
};