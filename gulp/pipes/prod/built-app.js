module.exports = function(gulp, plugins, pipes, locals) {

    var es = require('event-stream');
    var _ = require('lodash');

    return builtApp;

    function builtApp(config) {
        config = config || locals.config;
        var streams = [
            pipes.builtIndex(config),
            pipes.movedVendorSrcMaps(config),
            pipes.compFiles("map").pipe(gulp.dest(config.distRoot)),
            pipes.compFiles(config.component.images.exts).pipe(gulp.dest(config.distRoot)),
            pipes.processedImages(config),
            pipes.movedVendorOtherFiles(config),
            pipes.movedCompOtherFiles(config),
            pipes.builtOtherFiles(config)
        ];
        return es.merge(_.compact(streams));
    }
};