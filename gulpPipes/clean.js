module.exports = function(/*gulp, plugins, pipes, locals*/) {
    var del = require('del');
    var Q = require('q');

    return clean;

    function clean(path){
        var deferred = Q.defer();
        del(path, function(err) {
            if (err){
                deferred.reject(err);
            } else {
                deferred.resolve();
            }
        });
        return deferred.promise;
    }
};