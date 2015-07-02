module.exports = function(gulp, plugins, pipes/*, locals*/) {

    var es = require('event-stream'),
        _ = require('lodash');

    return movedVendorSrcMapsByExt;

    function movedVendorSrcMapsByExt(ext, config) {

        // we need to return the source files as source maps reference them
        // todo: some source maps will inline the source code, for these we don't need to return the source file
        var sourceFiles = pipes.bowerFiles(ext, config)
            .pipe(gulp.dest(config.dest));

        var srcMapOptions = _.clone(config);
        srcMapOptions.filter = _.extend({}, srcMapOptions.filter, { skipMissing: true });
        var sourceMapFiles = pipes.bowerFiles(ext + '.map', srcMapOptions)
            .pipe(gulp.dest(config.dest));

        return es.merge(sourceFiles, sourceMapFiles);
    }
};