module.exports = (function(){
    var config = {
        bowerComponents: {
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
                order: ['jquery.*', 'angular.*']
            },
            styles: {
                order: ['bootstrap.*']
            }
        },
        builtOtherFiles: builtAppOtherFiles,
        getOtherFiles: getAppOtherFiles
    };
    return config;

    ////////

    function builtAppOtherFiles(context){
        var files = context.locals.config.getOtherFiles(context);
        return context.gulp.src(files)
            .pipe(context.gulp.dest(context.locals.config.distRoot));
    }

    function getAppOtherFiles(context){
        return [
            context.locals.config.srcRoot + "Web.config"
        ];
    }
})();
