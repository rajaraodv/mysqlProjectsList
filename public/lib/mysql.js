//Update this to use mysql
angular.module('mysql', ['ngResource']).
    factory('Project', function ($resource) {
        var Project = $resource('/todo', {}, {update:{method:'PUT'}});

        Project.prototype.update = function (cb) {
            return Project.update({id:this.id},
                angular.extend({}, this, {id:undefined}), cb);
        };

        Project.prototype.destroy = function (cb) {
            return Project.remove({id:this.id}, cb);
        };

        return Project;
    });