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
            if($rootScope.user) {
                $rootScope.user.displayName = serviceReturned.getUserDisplayName();
            }
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
    .factory('PassUserLocation', function() {
        var currentLocation;
        var PassUserLocationService = {};
        PassUserLocationService.changeCurrent = function(data) {
            currentLocation = data;
            console.log(data);
        };
        PassKnownodeService.showCurrent = function() {
            console.log("showCurrent "+currentEdge);
            return currentLocation;

        };
        return PassKnownodeService;
    })
    .factory('PassKnownode', function() {
        var currentEdge;
        var PassKnownodeService = {};
        PassKnownodeService.changeCurrent = function(data) {
            currentEdge = data;
        };
        PassKnownodeService.showCurrent = function() {
            return currentEdge;

        };
        return PassKnownodeService;
    })
    .factory('broadcastService', function($rootScope){
        var serviceReturned = {};

        serviceReturned.message = '';

        serviceReturned.prepForBroadcast = function(msg) {
            this.message = msg;
            this.broadcastItem();
        };

        serviceReturned.broadcastItem = function() {
            $rootScope.$broadcast('handleBroadcast');
        };

        return serviceReturned;
    })
    .factory('nowTime', ['$timeout',function($timeout) {
    var nowTime;
    (function updateTime() {
        nowTime = Date.now();
        $timeout(updateTime, 1000);
    }());
    return function() {
        return nowTime;
    };
    }])
    .value('version', '0.2');
