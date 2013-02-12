'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.

angular.module('KnowNodesApp.services', []).
  value('version', '0.1')
    .factory('MockJSON', function($http) {
        var service = {},
            _data = {};

        service.getData = function() {
            return $http.get('json/edges.json').success(function(data) {
                return data;
            });
        };
        return service;
});


