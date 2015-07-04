module.exports = function(gulp, plugins, pipes, locals) {

    var es = require('event-stream');
    var _ = require('lodash');

    return builtApp;

    function builtApp(config) {
        config = config || locals.config;
        // todo: consider a builtVendorPartials that will copy html templates
        var streams = [
            pipes.builtIndex(config),
            pipes.movedVendorSrcMaps(config),
            pipes.builtPartials(config),
            pipes.compFiles("html").pipe(gulp.dest(config.distRoot)),
            pipes.compFiles(config.component.images.exts).pipe(gulp.dest(config.distRoot)),
            pipes.processedImages(config),
            pipes.movedVendorOtherFiles(config),
            pipes.movedCompOtherFiles(config),
            pipes.builtOtherFiles(config)
        ];
        return es.merge(_.compact(streams));
    }
};