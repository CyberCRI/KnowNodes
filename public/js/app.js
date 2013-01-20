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
var KnowNodesAppModule = angular.module('KnowNodesApp', ['ui.directives', 'KnowNodesApp.filters', 'KnowNodesApp.services', 'KnowNodesApp.directives']).
    config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.
        when('/', {
            templateUrl: 'partials/index',
            controller: IndexCtrl
        }).
        when('/login', {
            templateUrl: 'partials/User/login',
            controller: LoginCtrl
        }).
        when('/logout', {
            controller: LogoutCtrl
        }).
        when('/addUser', {
            templateUrl: 'partials/User/addUser',
            controller: AddUserCtrl
        }).
        when('/deleteUser/:id', {
            templateUrl: 'partials/User/deleteUser',
            controller: DeleteUserCtrl
        }).
        when('/addPostURL/:id', {
            templateUrl: 'partials/KnownodePost/addPostURL',
            controller: AddPostCtrl
        }).
        when('/AddEdge', {
            templateUrl: 'partials/KnownodePost/addEdge',
            controller: AddEdgeCtrl
        }).
        when('/addSubject', {
            templateUrl: 'partials/KnownodePost/addSubject',
            controller: AddSubjectCtrl
        }).
        when('/subjectList', {
            templateUrl: 'partials/KnownodePost/subjectList',
            controller: SubjectListCtrl
        }).
        when('/subject/:id', {
            templateUrl: 'partials/KnownodePost/articleList',
            controller: ArticleListCtrl
        }).
        otherwise({
            redirectTo: '/'
        });
    $locationProvider.html5Mode(true);
}]);


KnowNodesAppModule.value('ui.config', {
    select2: {
        allowClear: true
    }
});