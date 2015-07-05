module.exports = function(gulp, plugins, pipes, locals) {

    var path = require('path');

    return processedScripts;

    function processedScripts(config) {
        config = config || locals.config;

        plugins.nunjucksRender.nunjucks.configure({ watch: false });
        var jsTplFilter = plugins.filter('**/*.tpl.js');
        return gulp.src(config.scripts.src.path, config.scripts.src.options)
            .pipe(jsTplFilter)
            .pipe(plugins.data(function(f){
                var tplData = require(path.dirname(f.path) + '\\' + path.basename(f.path, '.js') + '.json');
                return tplData && tplData[locals.args.env];
            }))
            .pipe(plugins.nunjucksRender())
            .pipe(plugins.rename(function(f){
                f.extname = '.js';
                f.basename = f.basename.replace('.tpl', '');
            }))
            .pipe(jsTplFilter.restore());
    }};