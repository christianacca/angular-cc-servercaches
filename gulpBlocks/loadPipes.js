module.exports = function(options) {
    var _ = require('lodash'),
        requireDir = require('require-dir'),
        fs = require('fs'),
        path = require('path');

    var stdPipeModules = requirePipeModules(options.standardPipesDir);
    var custPipesModules = requirePipeModules(options.customPipesDir);
    var mergedModules = _.merge(stdPipeModules, custPipesModules, function(stdModule, custModule){
        custModule.baseModule = stdModule;
        return custModule;
    });
    var pipes = _(mergedModules).reduce(function(result, module, pipeFnName){
        var pipeLocals = _.extend({}, options.locals, options.pipeArgs[pipeFnName]);
        var pipe = module(options.gulp, options.plugins, result, pipeLocals);
        if (module.baseModule){
            pipe.basePipe = module.baseModule(options.gulp, options.plugins, result, pipeLocals);
        }
        result[pipeFnName] = pipe;
        return result;
    }, {});

    return pipes;

    function requirePipeModules(dirPath) {
        if (!fs.existsSync(dirPath)) return {};

        var dirModules = requireDir(path.join('..', dirPath), { recurse: true });
        return _(dirModules).reduce(function(modules, module, moduleName){
            modules[_.camelCase(moduleName)] = module;
            return modules;
        }, {});
    }
};