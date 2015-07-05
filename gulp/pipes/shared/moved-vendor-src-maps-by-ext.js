module.exports = function(gulp, plugins, pipes/*, locals*/) {

    var es = require('event-stream'),
        _ = require('lodash');

    return movedVendorSrcMapsByExt;

    function movedVendorSrcMapsByExt(ext, options) {

        // we need to return the source files as source maps reference them
        // todo: some source maps will inline the source code, for these we don't need to return the source file
        var sourceFiles = pipes.bowerFiles(ext, options)
            .pipe(gulp.dest(options.dest));

        var srcMapOptions = _.clone(options);
        srcMapOptions.filter = _.extend({}, srcMapOptions.filter, { skipMissing: true });
        var sourceMapFiles = pipes.bowerFiles(ext + '.map', srcMapOptions)
            .pipe(gulp.dest(options.dest));

        return es.merge(sourceFiles, sourceMapFiles);
    }
};