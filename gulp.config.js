var _ = require('lodash').runInContext();
_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

module.exports = function (args) {
    'use strict';

    var bowerFolder = 'bower_components/';

    var appSrcFolder = 'demoApp/';
    var appPaths = {
        dist: './dist.{{env}}/',
        src: 'src/' + appSrcFolder,
        srcParent: 'src/'
    };


    var appConfig = {
        rootDist: appPaths.dist,
        bowerComponents: {
            scripts: {
                dest: appPaths.dist + bowerFolder,
                filter: null,
                order: ['jquery.*', 'angular.*']
            },
            styles: {
                dest: appPaths.dist + bowerFolder,
                filter: null,
                order: []
            },
            dest: appPaths.dist + bowerFolder
        },
        images: {
            src: {
                path: getImagePaths(appPaths.src),
                options: {base: appPaths.srcParent}
            },
            dest: appPaths.dist
        },
        partials: {
            src: {
                path: [appPaths.src + '**/*.html'],
                options: {base: appPaths.srcParent}
            },
            dest: appPaths.dist
        },
        scripts: {
            src: {
                path: appPaths.src + '**/*.js',
                options: {base: appPaths.srcParent}
            },
            minifedFile: 'app.min.js',
            dest: args.env === 'dev' ? appPaths.dist : appPaths.dist + appSrcFolder
        },
        scriptsDevServer: {
            src: {
                path: 'devServer/**/*.js'
            }
        },
        styles: {
            src: {
                path: [appPaths.src + '**/*.css', appPaths.src + '**/*.scss'],
                options: {base: appPaths.srcParent}
            },
            minifedFile: 'app.min.css',
            dest: args.env === 'dev' ? appPaths.dist : appPaths.dist + appSrcFolder
        }
    };

    var compPaths = {
        dist: './dist.comp.{{env}}/',
        src: 'src/component/',
        srcParent: 'src/'
    };
    var compConfig = {
        rootDist: compPaths.dist,
        bowerComponents: {
            scripts: {
                dest: compPaths.dist + bowerFolder,
                filter: {dev: false},
                order: []
            },
            styles: {
                dest: compPaths.dist + bowerFolder,
                filter: {dev: false},
                order: []
            },
            dest: compPaths.dist + bowerFolder
        },
        images: {
            src: {
                path: getImagePaths(compPaths.src),
                options: {base: compPaths.srcParent}
            },
            dest: compPaths.dist
        },
        partials: {
            src: {
                path: [compPaths.src + '**/*.html'],
                options: {base: compPaths.srcParent}
            },
            dest: compPaths.dist
        },
        scripts: {
            src: {
                path: compPaths.src + '**/*.js',
                options: {base: compPaths.srcParent}
            },
            minifedFile: 'component.min.js',
            dest: compPaths.dist
        },
        styles: {
            src: {
                path: [compPaths.src + '**/*.css', compPaths.src + '**/*.scss'],
                options: {base: compPaths.srcParent}
            },
            minifedFile: 'component.min.css',
            dest: compPaths.dist
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
