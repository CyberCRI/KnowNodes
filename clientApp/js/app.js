'use strict';


// Declare app level module which depends on filters, and services
/*angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives']).
 config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
 $routeProvider.when('/view1', {templateUrl: 'partials/partial1', controller: MyCtrl1});
 $routeProvider.when('/view2', {templateUrl: 'partials/partial2', controller: MyCtrl2});
 $routeProvider.otherwise({redirectTo: '/view1'});
 $locationProvider.html5Mode(true);
 }]);
 */
// Declare app level module which depends on filters, and services
var KnowNodesAppModule = angular.module('KnowNodesApp', ['angulartics', 'angulartics.ga', 'ngSanitize', 'ui', 'ui.directives', '$strap', 'KnowNodesApp.filters', 'KnowNodesApp.services', 'KnowNodesApp.directives', 'ui.bootstrap', 'ui.select2']).
    config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        $routeProvider.
            when('/', {
                templateUrl: 'screens/frontPage',
                controller: IndexCtrl
            }).
            when('/about', {
                templateUrl: 'screens/about',
                controller: StaticPageCtrl
            }).
            when('/terms', {
                templateUrl: 'screens/terms',
                controller: StaticPageCtrl
            }).
            when('/newUserGuide', {
                templateUrl: 'screens/newUserGuide',
                controller: StaticPageCtrl
            }).
            when('/login', {
                templateUrl: 'screens/login',
                controller: LoginCtrl
            }).
            when('/logout', {
                templateUrl: 'screens/frontPage',
                controller: LogoutCtrl
            }).
            when('/addUser', {
                templateUrl: 'screens/addUser',
                controller: LoginCtrl
            }).
            when('/deleteUser/:id', {
                templateUrl: 'partials/User/deleteUser',
                controller: DeleteUserCtrl
            }).
            when('/map/:id', {
                templateUrl: 'screens/map',
                controller: MapCtrl
            }).
            when('/concept/:id', {
                templateUrl: 'screens/tripletListPage',
                controller: TripletListCtrl
            }).
            when('/article/:id', {
                templateUrl: 'screens/tripletListPage',
                controller: TripletListCtrl
            }).
            when('/resource/:id', {
                templateUrl: 'screens/tripletListPage',
                controller: TripletListCtrl
            }).
            when('/wikipedia/:title', {
                templateUrl: 'screens/tripletListPage',
                controller: TripletListCtrl
            }).
            when('/connection/:id', {
                templateUrl: 'screens/connectionPage',
                controller: ConnectionPageCtrl
            }).
            when('/user/:id', {
                templateUrl: 'screens/userProfilePage',
                controller: UserProfilePageCtrl
            }).
            otherwise({
                redirectTo: '/'
            });
        $locationProvider.html5Mode(true);
    }])
    .run(function($rootScope) {
        $rootScope.$watch('user', function(newValue, oldValue) {
            if(newValue) {
                $rootScope.userDisplayName = newValue.firstName + ' ' + newValue.lastName;
            }
        },
        true);

        if(KN) {
            $rootScope.user = KN.initAngularUser();
        }
    });


KnowNodesAppModule.value('ui.config', {
    select2: {
        allowClear: true
    },
    tinymce: {
        theme : "advanced",
        theme_advanced_toolbar_location : "top",
        theme_advanced_buttons1 : "bold,italic,underline,link,unlink,",
        theme_advanced_buttons2 : "",
        theme_advanced_buttons3 : "",
        theme_advanced_statusbar_location : "none",
        setup : function(ed) {
            ed.onInit.add(function(ed)
            {
                var e = ed.getBody();
                e.style.fontSize='14px';
                e.style.fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif";
                e.style.fontWeight='normal';
            });
        }

    }
});