module.exports = function(options) {
    var defaultOptions = {
        standardPipesDir: './gulp/pipes/',
        customPipesDir: './gulp/pipesCustom/',
        gulp: require('gulp'),
        locals: {
            args: {},
            config: {}
        },
        plugins: {},
        pipeArgs: {}
    };

    var _ = require('lodash'),
        requireDir = require('require-dir'),
        fs = require('fs'),
        path = require('path');


    options = _.defaultsDeep(options, defaultOptions);

    var stdPipeModules = requirePipeModules(options.standardPipesDir);
    var normalizedStdPipeModules = _.merge(stdPipeModules.shared, stdPipeModules[options.locals.args.env] || {});
    var custPipesModules = requirePipeModules(options.customPipesDir);
    var normalizedCustPipeModules = _.merge(custPipesModules.shared, custPipesModules[options.locals.args.env] || {});
    var mergedModules = _.merge(normalizedStdPipeModules, normalizedCustPipeModules || {}, function(stdModule, custModule){
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

        var modulesDic = requireDir(path.join('../..', dirPath), { recurse: true });
        return _(modulesDic).reduce(function(result, modules, key){
            result[key] = _.mapKeys(modules, function(module, moduleName){
                return _.camelCase(moduleName);
            });
            return result;
        }, {});
    }
};