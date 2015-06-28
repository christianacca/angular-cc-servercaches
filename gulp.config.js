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
        rootDist: appPaths.distRoot,
        bowerComponents: {
            getOtherFiles: getVendorOtherFiles,
            overrides: {
                bootstrap: {
                    main: [
                        "dist/css/bootstrap.css",
                        "dist/js/bootstrap.js",
                        "dist/fonts/glyphicons-halflings-regular.eot",
                        "dist/fonts/glyphicons-halflings-regular.svg",
                        "dist/fonts/glyphicons-halflings-regular.ttf",
                        "dist/fonts/glyphicons-halflings-regular.woff",
                        "dist/fonts/glyphicons-halflings-regular.woff2"
                    ]
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
        getOtherFiles: getAppOtherFiles,
        images: {
            exts: commonImageExts,
            src: {
                path: appPaths.src + "**/*." + commonImageExts,
                options: {base: appPaths.srcRoot}
            },
            dest: args.env === 'dev' ? appPaths.distRoot : appPaths.distRoot + appSrcFolder + "images"
        },
        partials: {
            src: {
                path: [appPaths.src + '**/*.html'],
                options: {base: appPaths.srcRoot}
            },
            moduleName: 'shared',
            dest: appPaths.distRoot
        },
        scripts: {
            src: {
                path: appPaths.src + '**/*.js',
                options: {base: appPaths.srcRoot}
            },
            minifedFile: 'app.min.js',
            isCacheBusted: true,
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
            minifedFile: 'app.min.css',
            dest: args.env === 'dev' ? appPaths.distRoot : appPaths.distRoot + appSrcFolder
        }
    };
    appConfig = _.extend(appConfig, appPaths);

    var compSrcFolder = 'component/';
    var compPaths = _.extend({}, paths, {
        src: paths.srcRoot + compSrcFolder,
        distRoot: './dist.{{env}}/'
    });
    var compConfig = {
        rootDist: compPaths.distRoot,
        bowerComponents: {
            scripts: {
                dest: compPaths.distRoot + bowerFolder,
                filter: {dev: false},
                order: []
            },
            styles: {
                dest: compPaths.distRoot + bowerFolder,
                filter: {dev: false},
                order: []
            },
            dest: compPaths.distRoot + bowerFolder
        },
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
            minifedFile: 'component.min.js',
            dest: args.env === 'dev' ? compPaths.distRoot : compPaths.distRoot + compSrcFolder
        },
        styles: {
            src: {
                path: [compPaths.src + '**/*.css', compPaths.src + '**/*.scss'],
                options: {base: compPaths.srcRoot}
            },
            isCacheBusted: false,
            minifedFile: 'component.min.css',
            dest: args.env === 'dev' ? compPaths.distRoot : compPaths.distRoot + compSrcFolder
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

    function getAppOtherFiles(locals){
        var gulp = locals.gulp;
        var files = [
            config.app.srcRoot + "Web.config"
        ];
        return gulp.src(files)
            .pipe(gulp.dest(config.app.rootDist));
    }

    function getVendorOtherFiles(locals){
        var gulp = locals.gulp;
        var lib = locals.lib({ overrides: config.app.bowerComponents.overrides});
        var bs = lib.ext(true).dev(true).join({font: ['eot', 'woff', 'woff2', 'ttf', 'svg']}).deps.bootstrap;
        return gulp.src(bs.font)
            .pipe(gulp.dest(config.app.rootDist + "fonts"));
    }
};
