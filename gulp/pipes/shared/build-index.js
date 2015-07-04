module.exports = function(gulp, plugins, pipes, locals) {

    return buildIndex;

    function buildIndex(streams, config) {
        config = config || locals.config;
        return pipes.validatedIndex(config)
            .pipe(gulp.dest(config.distRoot)) // write first to get relative path for inject
            .pipe(plugins.inject(streams.vendorScripts, {relative: true, name: 'bower'}))
            .pipe(plugins.inject(streams.compScripts, {relative: true, name: 'component'}))
            .pipe(plugins.inject(streams.appScripts, {relative: true}))
            .pipe(plugins.inject(streams.vendorStyles, {relative: true, name: 'bower'}))
            .pipe(plugins.inject(streams.compStyles, {relative: true, name: 'component'}))
            .pipe(plugins.inject(streams.appStyles, {relative: true}));
    }
};