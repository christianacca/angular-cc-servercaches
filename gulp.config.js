var _ = require('lodash').runInContext();
_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

module.exports = function (args) {
    'use strict';

    var bowerFolder = 'bower_components/';

    var paths = {
        distRoot: './dist.demo.{{env}}/',
        srcRoot: 'src/'
    };
    var commonImageExts = "{svg,jpg,gif,png}";

    var appSrcFolder = 'demoApp/';
    var appPaths = _.extend({}, paths, {
        src: paths.srcRoot + appSrcFolder
    });


    var appConfig = {
        isComponentBuild: false,
        distRoot: appPaths.distRoot,
        bowerComponents: {
            movedOtherFiles: movedVendorOtherFiles,
            getOtherFiles: getVendorOtherFiles,
            overrides: {
                // only want css and fonts from bs
                bootstrap: {
                    main: [
                        "dist/css/bootstrap.css",
                        "dist/fonts/glyphicons-halflings-regular.eot",
                        "dist/fonts/glyphicons-halflings-regular.svg",
                        "dist/fonts/glyphicons-halflings-regular.ttf",
                        "dist/fonts/glyphicons-halflings-regular.woff",
                        "dist/fonts/glyphicons-halflings-regular.woff2"
                    ],
                    dependencies: {}
                }
            },
            scripts: {
                dest: appPaths.distRoot + bowerFolder,
                filter: null,
                order: ['jquery.*', 'angular.*']
            },
            styles: {
                dest: appPaths.distRoot + bowerFolder,
                filter: null,
                order: ['bootstrap.*']
            },
            dest: appPaths.distRoot + bowerFolder
        },
        component: {
            srcRoot: './dist.{{env}}/',
            images: {
                exts: commonImageExts
            },
            scripts: {
                dest: appPaths.distRoot
            },
            styles: {
                dest: appPaths.distRoot
            }
        },
        builtOtherFiles: builtAppOtherFiles,
        getOtherFiles: getAppOtherFiles,
        images: {
            exts: commonImageExts,
            src: {
                path: appPaths.src + "**/*." + commonImageExts,
                options: {base: appPaths.srcRoot}
            },
            dest: args.env === 'dev' ? appPaths.distRoot : appPaths.distRoot + appSrcFolder + "images"
        },
        indexPage: paths.srcRoot + 'index.html',
        partials: {
            src: {
                path: [appPaths.src + '**/*.html'],
                options: {base: appPaths.srcRoot}
            },
            moduleName: 'shared',
            dest: appPaths.distRoot
        },
        pipesOptions: {
            pipeArgs: {}
        },
        scripts: {
            src: {
                path: appPaths.src + '**/*.js',
                options: {base: appPaths.srcRoot}
            },
            outputFile: 'app.js',
            isCacheBusted: true,
            isConcatFileOutput: false,
            dest: args.env === 'dev' ? appPaths.distRoot : appPaths.distRoot + appSrcFolder
        },
        scriptsDevServer: {
            src: {
                path: 'devServer/**/*.js'
            }
        },
        styles: {
            src: {
                path: [appPaths.src + '**/*.css', appPaths.src + '**/*.scss'],
                options: {base: appPaths.srcRoot}
            },
            isCacheBusted: true,
            isConcatFileOutput: false,
            outputFile: 'app.css',
            dest: args.env === 'dev' ? appPaths.distRoot : appPaths.distRoot + appSrcFolder
        }
    };
    appConfig = _.extend(appConfig, appPaths);

    var compSrcFolder = 'component/';
    var compPaths = _.extend({}, paths, {
        src: paths.srcRoot + compSrcFolder,
        distRoot: './dist.{{env}}/'
    });
    var compName = 'angular-cc-servercaches';
    var compConfig = {
        isComponentBuild: true,
        distRoot: compPaths.distRoot,
        images: {
            exts: commonImageExts,
            src: {
                path: compPaths.src + "**/*." + commonImageExts,
                options: {base: compPaths.srcRoot}
            },
            dest: args.env === 'dev' ? compPaths.distRoot : compPaths.distRoot + compSrcFolder + "images"
        },
        partials: {
            src: {
                path: [compPaths.src + '**/*.html'],
                options: {base: compPaths.srcRoot}
            },
            moduleName: 'ccServerCachesModule',
            dest: compPaths.distRoot
        },
        scripts: {
            src: {
                path: compPaths.src + '**/*.js',
                options: {base: compPaths.srcRoot}
            },
            isCacheBusted: false,
            isConcatFileOutput: true,
            outputFile: compName + '.js',
            dest: args.env === 'dev' ? compPaths.distRoot : compPaths.distRoot + compSrcFolder
        },
        styles: {
            src: {
                path: [compPaths.src + '**/*.css', compPaths.src + '**/*.scss'],
                options: {base: compPaths.srcRoot}
            },
            isCacheBusted: false,
            isConcatFileOutput: true,
            outputFile: compName + '.css',
            dest: args.env === 'dev' ? compPaths.distRoot : compPaths.distRoot + compSrcFolder
        },
        pipesOptions: {
            pipeArgs: {
                watched: {
                    isWatchStatusFileEnabled: true
                }
            }
        }
    };
    compConfig = _.extend(compConfig, compPaths);


    var config = {
        app: expandConfig(appConfig, args),
        comp: expandConfig(compConfig, args)
    };


    return config;

    ////////////////

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

    function getAppOtherFiles(/*locals*/){
        return [
            config.app.srcRoot + "Web.config"
        ];
    }

    function builtAppOtherFiles(locals){
        var files = getAppOtherFiles(locals);
        return locals.gulp.src(files)
            .pipe(locals.gulp.dest(config.app.distRoot));
    }

    function getVendorOtherFiles(locals) {
        var files = locals.lib({overrides: config.app.bowerComponents.overrides})
            .ext(true)
            .dev(true)
            .join({font: ['eot', 'woff', 'woff2', 'ttf', 'svg']})
            .deps.bootstrap.font;
        return files;
    }

    function movedVendorOtherFiles(locals){
        var files = getVendorOtherFiles(locals);
        return locals.gulp.src(files)
            .pipe(locals.gulp.dest(config.app.distRoot + "fonts"));
    }
};
