module.exports = function() {
    var src = './src/';
    var temp = './.tmp/';


    var config = {
        /**
         * Files paths
         */
        buildDir: {
            html: './build',
            root: './build/',
            js: './build/js/',
            styles: './build/styles/'
        },
        cssSrc: src + 'styles/styles.less',
        js: [
            src + '**/app.module.js',
            src + '**/*.module.js',
            src + '**/*.provider.js',
            src + '**/*.config.js',
            src + '**/*.js',
            '!' + src + '**/*.spec.js'
        ],
        root: './report/',
        temp: temp,
        // all javascript that we want to vet
        validateJs: [
            './src/**/*.js',
            './*.js'
        ],

        concat: {
            jsFile: 'angular-cc-servercaches.js',
            jsTplFile: 'angular-cc-servercaches-tpl.js'
        },

        /**
         * template cache
         */
        templateCache: {
            src: src + '**/*.html',
            file: 'templates.js',
            options: {
                module: 'ccServerCachesModule',
                root: '/',
                standAlone: false
            }
        }
    };

    return config;
};
