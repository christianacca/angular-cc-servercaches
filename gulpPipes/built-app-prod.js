module.exports = function(gulp, plugins, pipes, locals) {

    var es = require('event-stream');
    var _ = require('lodash');

    return builtAppProd;

    function builtAppProd(config) {
        config = config || locals.config;
        var streams = [
            pipes.builtIndexProd(config),
            pipes.movedVendorSrcMapsProd(config.bowerComponents),
            pipes.compFiles("map").pipe(gulp.dest(config.distRoot)),
            pipes.compFiles(config.component.images.exts).pipe(gulp.dest(config.distRoot)),
            pipes.processedImagesProd(config.images),
            pipes.movedVendorOtherFiles(config.bowerComponents.movedOtherFiles),
            pipes.movedCompOtherFiles(config.component.movedOtherFiles),
            pipes.builtOtherFiles(config.builtOtherFiles)
        ];
        return es.merge(_.compact(streams));
    }
};