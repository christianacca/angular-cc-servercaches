module.exports = function(gulp, plugins, pipes, locals) {

    return buildIndex;

    function buildIndex(streams) {
        return pipes.validatedIndex()
            .pipe(gulp.dest(locals.dest)) // write first to get relative path for inject
            .pipe(plugins.inject(streams.vendorScripts, {relative: true, name: 'bower'}))
            .pipe(plugins.inject(streams.compScripts, {relative: true, name: 'component'}))
            .pipe(plugins.inject(streams.appScripts, {relative: true}))
            .pipe(plugins.inject(streams.vendorStyles, {relative: true, name: 'bower'}))
            .pipe(plugins.inject(streams.compStyles, {relative: true, name: 'component'}))
            .pipe(plugins.inject(streams.appStyles, {relative: true}));
    }
};