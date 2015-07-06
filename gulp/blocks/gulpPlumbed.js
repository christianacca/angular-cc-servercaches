module.exports = (function(){
    var gulp = require('gulp');
    var plumber = require('gulp-plumber');
    var notify = require('gulp-notify');
    var gulpSrcFn = gulp.src;
    gulp.src = plumbedSrc;
    return gulp;

    function plumbedSrc() {
        return gulpSrcFn.apply(gulp, arguments)
            .pipe(plumber({
                errorHandler: function(err) {
                    notify.onError({
                        title:    "Gulp Error",
                        message:  "Error: <%= error.message %>",
                        sound:    "Bottle"
                    })(err);
                    this.emit('end');
                }
            }));
    }
})();