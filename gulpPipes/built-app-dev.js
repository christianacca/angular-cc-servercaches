module.exports = function(gulp, plugins, pipes, locals) {

    var es = require('event-stream');
    var _ = require('lodash');

    return builtAppDev;

    function builtAppDev(config) {

        config = config || locals.config;

        // todo: consider a builtVendorPartials that will copy html templates
        var streams = [
            pipes.builtIndexDev(config),
            pipes.movedVendorSrcMapsDev(config.bowerComponents),
            pipes.builtPartials(config.partials),
            pipes.compFiles("html").pipe(gulp.dest(config.distRoot)),
            pipes.compFiles(config.component.images.exts).pipe(gulp.dest(config.distRoot)),
            pipes.processedImagesDev(config.images),
            pipes.movedVendorOtherFiles(config.bowerComponents.movedOtherFiles),
            pipes.movedCompOtherFiles(config.component.movedOtherFiles),
            pipes.builtOtherFiles(config.builtOtherFiles)
        ];
        return es.merge(_.compact(streams));
    }
};