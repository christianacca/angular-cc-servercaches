module.exports = function(gulp, plugins, pipes, locals) {

    var es = require('event-stream');
    var _ = require('lodash');

    return builtComp;

    function builtComp(config) {
        config = config || locals.config;
        var streams = [
            pipes.builtScripts(config),
            pipes.builtStyles(config),
            pipes.processedImages(config),
            pipes.builtOtherFiles(config)
        ];

        return es.merge(_.compact(streams));
    }
};