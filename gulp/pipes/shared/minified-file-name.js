module.exports = function(gulp, plugins/*, pipes, locals*/) {

    return minifiedFileName;

    function minifiedFileName() {
        return plugins.rename(function (path) {
            path.extname = '.min' + path.extname;
        });
    }
};