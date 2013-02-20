'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('KnowNodesApp.services', [])
    .factory('userService', function($rootScope) {
        var serviceReturned = {};
        serviceReturned.isUserLoggedIn = function() {
            return $rootScope.user ? true : false;
        };

        serviceReturned.getConnectedUser = function(){
            return $rootScope.user;
        };

        serviceReturned.getUserDisplayName = function() {
            if($rootScope.user)
            {
                return $rootScope.user.firstName + " " + $rootScope.user.lastName;
            }
            return '';
        };

        return serviceReturned;
    })
    .value('version', '0.2');
