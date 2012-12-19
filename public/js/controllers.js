'use strict';

/* Controllers */

function AppCtrl($scope, $http) {
  $http({method: 'GET', url: '/api/name'}).
  success(function(data, status, headers, config) {
    $scope.name = data.name;
  }).
  error(function(data, status, headers, config) {
    $scope.name = 'Error!'
  });
}

function MyCtrl1() {}
MyCtrl1.$inject = [];


function MyCtrl2() {}
MyCtrl2.$inject = [];


// Users:
function AddUserCtrl($scope, $http, $location) {
    $scope.form = {};
    $scope.submitUser = function () {
        $http.post('/API/users', $scope.form).
            success(function(data){
                $location.path('/');
            });
    }
}

//knownode Post:
function AddPostCtrl($scope, $http, $location) {
    $scope.form = {};
    $scope.submitPost = function () {
        $http.post('/API/knownodes', $scope.form).
            success(function(data) {
                $location.path('/AddEdge');
            });
    }
}

function AddEdgeCtrl($scope, $http, $location){
    $scope.form = {};
    $scope.submitPost = function () {
        $http.post('/API/knownodes/edge', $scope.form).
            success(function(data) {
                $location.path('/AddPost');
            });
    }
}

function IndexCtrl($scope, $http) {
  $http.get('/api/users').
    success(function(data, status, headers, config) {
      $scope.users = data.users;
    });
}
