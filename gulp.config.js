var _ = require('lodash').runInContext();
_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

module.exports = function (args) {
    'use strict';

    var bowerFolder = 'bower_components/';

    var paths = {
        distRoot: './dist.{{env}}/',
        srcRoot: 'src/'
    };

    var appSrcFolder = 'demoApp/';
    var appPaths = _.extend({}, paths, {
        src: paths.srcRoot + appSrcFolder
    });


    var appConfig = {
        rootDist: appPaths.distRoot,
        bowerComponents: {
            scripts: {
                dest: appPaths.distRoot + bowerFolder,
                filter: null,
                order: ['jquery.*', 'angular.*']
            },
            styles: {
                dest: appPaths.distRoot + bowerFolder,
                filter: null,
                order: []
            },
            dest: appPaths.distRoot + bowerFolder
        },
        images: {
            src: {
                path: getImagePaths(appPaths.src),
                options: {base: appPaths.srcRoot}
            },
            dest: appPaths.distRoot
        },
        partials: {
            src: {
                path: [appPaths.src + '**/*.html'],
                options: {base: appPaths.srcRoot}
            },
            dest: appPaths.distRoot
        },
        scripts: {
            src: {
                path: appPaths.src + '**/*.js',
                options: {base: appPaths.srcRoot}
            },
            minifedFile: 'app.min.js',
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
            minifedFile: 'app.min.css',
            dest: args.env === 'dev' ? appPaths.distRoot : appPaths.distRoot + appSrcFolder
        }
    };

    var compPaths = _.extend({}, paths, {
        src: 'src/component/'
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
            src: {
                path: getImagePaths(compPaths.src),
                options: {base: compPaths.srcRoot}
            },
            dest: compPaths.distRoot
        },
        partials: {
            src: {
                path: [compPaths.src + '**/*.html'],
                options: {base: compPaths.srcRoot}
            },
            dest: compPaths.distRoot
        },
        scripts: {
            src: {
                path: compPaths.src + '**/*.js',
                options: {base: compPaths.srcRoot}
            },
            minifedFile: 'component.min.js',
            dest: compPaths.distRoot
        },
        styles: {
            src: {
                path: [compPaths.src + '**/*.css', compPaths.src + '**/*.scss'],
                options: {base: compPaths.srcRoot}
            },
            minifedFile: 'component.min.css',
            dest: compPaths.distRoot
        }
    };


    var config = {
        app: expandConfig(appConfig, args),
        comp: expandConfig(compConfig, args)
    };


    return config;

    ////////////////

    function expandConfig(obj, locals) {
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

    function getImagePaths(baseDir, imageExts) {
        imageExts = ['svg', 'jpg', 'gif', 'png'] || imageExts;
        return imageExts.map(function (ext) {
            return baseDir + '**/*.' + ext;
        });
    }
};
