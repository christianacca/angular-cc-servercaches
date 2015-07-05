module.exports = function(gulp, plugins, pipes, locals) {

    return movedCompStyles;

    // moves component styles into the production environment
    function movedCompStyles(config){
        config = config || locals.config;
        return pipes.compFiles('min.css')
            .pipe(gulp.dest(config.component.styles.dest));
    }
};