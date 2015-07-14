module.exports = function(gulp, plugins/*, pipes, locals*/) {

    var lib = require('bower-files'),
        _ = require('lodash');

    return bowerFiles;

    function bowerFiles(ext, options) {
        var filter = _.extend({}, { skipMissing: false, dev: true }, options && options.filter);

        // note: we having to make up for the fact that bower does not have a mechanism to describe minified main and source
        // map files

        var typeExt, minExt, mapExt;
        var extParts = ext.split('.');
        if (_.last(extParts) === 'map'){
            mapExt = 'map';
            typeExt = _.takeRight(extParts, 2)[0];
        } else {
            typeExt = _.last(extParts);
        }
        if (extParts[0] === 'min'){
            minExt = 'min';
        }

        var fileMapFn;
        if (extParts.length === 1){
            fileMapFn = _.identity;
        } else {
            var replacementExt = _.compact([minExt, typeExt, mapExt]).join('.');
            fileMapFn = function (name) {
                return name.replace('.' + typeExt, '.' + replacementExt);
            };
        }

        var criteria = {
            dev: filter.dev,
            ext: typeExt
        };
        var files = lib({ overrides: options.overrides }).filter(criteria).map(fileMapFn);
        // not sure why gulp-expect-file cannot check files directly :-(
        var expectedFiles = files.map(function(filePath) {
            return '**/' + _.last(filePath.split('\\'));
        });

        var maybeEnforceFileExists = !filter.skipMissing ?
            plugins.expectFile({checkRealFile: true, reportMissing: true}, expectedFiles) :
            plugins.util.noop();

        return gulp.src(files)
            .pipe(options.newerThan ? plugins.changed(options.newerThan) : plugins.util.noop())
            .pipe(plugins.util.noop());
    }
};