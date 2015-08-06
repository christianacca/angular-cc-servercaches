module.exports = function(args){

    var _ = require('lodash');
    var merge = require('merge-deep');
    _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

    var bowerFolder = 'bower_components/';
    var commonPaths = {
        srcRoot: 'src/'
    };
    var commonImageExts = "{svg,jpg,gif,png}";

    return {
        createAppConfig: createAppConfig,
        createCompConfig: createCompConfig
    };

    function createAppConfig(initialConfig){

        initialConfig = _.clone(initialConfig);
        _.defaults(initialConfig, {
            distRoot: './dist.demo.{{env}}/',
            srcFolder: 'demoApp',
            srcRoot: commonPaths.srcRoot
        });
        _.defaults(initialConfig, { src: initialConfig.srcRoot + initialConfig.srcFolder + '/'});

        var srcFolder = initialConfig.srcFolder;

        var appConfig = {
            isComponentBuild: false,
            bowerComponents: {
                movedOtherFiles: movedVendorOtherFiles,
                getOtherFiles: getVendorOtherFiles,
                scripts: {
                    dest: initialConfig.distRoot + bowerFolder,
                    filter: null
                },
                styles: {
                    dest: initialConfig.distRoot + bowerFolder,
                    filter: null
                },
                dest: initialConfig.distRoot + bowerFolder
            },
            component: {
                /* todo: don't hard code this here */
                srcRoot: './dist.{{env}}/',
                images: {
                    exts: commonImageExts
                },
                scripts: {
                    dest: initialConfig.distRoot
                },
                styles: {
                    dest: initialConfig.distRoot
                }
            },
            indexPage: initialConfig.srcRoot + 'index.html',
            images: {
                exts: commonImageExts,
                src: {
                    path: initialConfig.src + "**/*." + commonImageExts,
                    options: {base: initialConfig.srcRoot}
                },
                dest: args.env === 'dev' ? initialConfig.distRoot : initialConfig.distRoot + srcFolder  + '/' + "images"
            },
            partials: {
                src: {
                    path: [initialConfig.src + '**/*.html'],
                    options: {base: initialConfig.srcRoot}
                },
                moduleName: 'shared',
                dest: initialConfig.distRoot
            },
            pipesOptions: {
                pipeArgs: {}
            },
            scripts: {
                src: {
                    path: initialConfig.src + '**/*.js',
                    options: {base: initialConfig.srcRoot}
                },
                outputFile: 'app.js',
                isCacheBusted: true,
                isConcatFileOutput: false,
                dest: args.env === 'dev' ? initialConfig.distRoot : initialConfig.distRoot + srcFolder + '/'
            },
            scriptsDevServer: {
                src: {
                    path: 'devServer/**/*.js'
                }
            },
            styles: {
                src: {
                    path: [initialConfig.src + '**/*.css', initialConfig.src + '**/*.scss'],
                    options: {base: initialConfig.srcRoot}
                },
                outputFile: 'app.css',
                isCacheBusted: true,
                isConcatFileOutput: false,
                dest: args.env === 'dev' ? initialConfig.distRoot : initialConfig.distRoot + srcFolder + '/'
            }
        };

        var finalConfigs = merge({}, appConfig, initialConfig);
        return expandConfig(finalConfigs, args);
    }

    function createCompConfig(initialConfig){

        initialConfig = _.clone(initialConfig);
        _.defaults(initialConfig, {
            distRoot: './dist.{{env}}/',
            srcFolder: 'component',
            srcRoot: commonPaths.srcRoot
        });
        _.defaults(initialConfig, { src: initialConfig.srcRoot + initialConfig.srcFolder + '/'});

        var srcFolder = initialConfig.srcFolder;

        var compConfig = {
            isComponentBuild: true,
            images: {
                exts: commonImageExts,
                src: {
                    path: initialConfig.src + "**/*." + commonImageExts,
                    options: {base: initialConfig.srcRoot}
                },
                dest: args.env === 'dev' ? initialConfig.distRoot : initialConfig.distRoot + srcFolder  + '/' + "images"
            },
            partials: {
                src: {
                    path: [initialConfig.src + '**/*.html'],
                    options: {base: initialConfig.srcRoot}
                },
                dest: initialConfig.distRoot
            },
            pipesOptions: {
                pipeArgs: {
                    watched: {
                        isWatchStatusFileEnabled: true
                    }
                }
            },
            scripts: {
                src: {
                    path: initialConfig.src + '**/*.js',
                    options: {base: initialConfig.srcRoot}
                },
                outputFile: initialConfig.componentName + '.js',
                isCacheBusted: false,
                isConcatFileOutput: true,
                dest: args.env === 'dev' ? initialConfig.distRoot : initialConfig.distRoot + srcFolder + '/'
            },
            styles: {
                src: {
                    path: [initialConfig.src + '**/*.css', initialConfig.src + '**/*.scss'],
                    options: {base: initialConfig.srcRoot}
                },
                outputFile: initialConfig.componentName + '.css',
                isCacheBusted: false,
                isConcatFileOutput: true,
                dest: args.env === 'dev' ? initialConfig.distRoot : initialConfig.distRoot + srcFolder + '/'
            }
        };

        var finalConfigs = merge({}, compConfig, initialConfig);
        return expandConfig(finalConfigs, args);
    }

    function expandConfig(obj, locals) {
        if (_.isFunction(obj) || !(_.isString(obj) || _.isObject(obj) || _.isArray(obj))) return obj;

        if (_.isArray(obj)) {
            return _.map(obj, function (value) {
                return expandConfig(value, locals);
            });
        } else if (_.isString(obj)) {
            return _.template(obj)(locals);
        } else if (_.isObject(obj)) {
            return _.reduce(obj, function (prev, value, name) {
                prev[name] = expandConfig(value, locals);
                return prev;
            }, {});
        }
    }

    function getVendorOtherFiles(context) {
        var files = context.lib({overrides: context.locals.config.bowerComponents.overrides})
            .ext(true)
            .dev(true)
            .join({font: ['eot', 'woff', 'woff2', 'ttf', 'svg']})
            .deps.bootstrap.font;
        return files;
    }

    function movedVendorOtherFiles(context){
        var files = getVendorOtherFiles(context);
        return context.gulp.src(files)
            .pipe(context.gulp.dest(context.locals.config.distRoot + "fonts"));
    }
};