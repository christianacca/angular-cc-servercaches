module.exports = function(config){
  config.set({

    basePath : './',

    files : [
      'demo/client/app/bower_components/angular/angular.js',
      'demo/client/app/bower_components/angular-route/angular-route.js',
      'demo/client/app/bower_components/angular-aria/angular-aria.js',
      'demo/client/app/bower_components/angular-mocks/angular-mocks.js',
      'demo/client/app/bower_components/angular-material/angular-material.js',
      'demo/client/app/components/**/*.js',
      'demo/client/app/view*/**/*.js'
    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['Chrome'],

    plugins : [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-junit-reporter'
            ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};
