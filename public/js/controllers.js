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
    var dropbox = document.getElementById("dropbox");

    function dragEnterLeave(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        $scope.$apply(function(){
            $scope.dropText = 'Drop files here...';
            $scope.dropClass = '';
        });
    }

    dropbox.addEventListener("dragenter", dragEnterLeave, false);
    dropbox.addEventListener("dragleave", dragEnterLeave, false);
    dropbox.addEventListener("dragover", function(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        var clazz = 'not-available',
            ok = evt.dataTransfer && evt.dataTransfer.types && evt.dataTransfer.types.indexOf('Files') >= 0;
        $scope.$apply(function(){
            $scope.dropText = ok ? 'Drop files here...' : 'Only files are allowed!';
            $scope.dropClass = ok ? 'over' : 'not-available';
        })
    }, false);
    dropbox.addEventListener("drop", function(evt) {
        console.log('drop evt:', JSON.parse(JSON.stringify(evt.dataTransfer)));
        evt.stopPropagation();
        evt.preventDefault();
        $scope.$apply(function(){
            $scope.dropText = 'Drop files here...';
            $scope.dropClass = '';
        })
        var files = evt.dataTransfer.files,
            i;
        if (files.length > 0) {
            $scope.$apply(function(){
                $scope.files = [];
                for (i = 0; i < files.length; i++) {
                    $scope.files.push(files[i]);
                }
            });
        }
    }, false);
    //============== DRAG & DROP =============

    $scope.setFiles = function(element) {
        $scope.$apply(function(scope) {
            console.log('files:', element.files);
            // Turn the FileList object into an Array
            scope.files = [];
            for (var i = 0; i < element.files.length; i++) {
                scope.files.push(element.files[i]);
            }
            scope.progressVisible = false;
        });
    };

    $scope.uploadFile = function() {
        var i, fd = new FormData();
        for (i in $scope.files) {
            fd.append("uploadedFile", $scope.files[i]);
        }
        var xhr = new XMLHttpRequest()
        xhr.upload.addEventListener("progress", uploadProgress, false);
        xhr.addEventListener("load", uploadComplete, false);
        xhr.addEventListener("error", uploadFailed, false);
        xhr.addEventListener("abort", uploadCanceled, false);
        xhr.open("POST", "/API/knownodes");
        $scope.progressVisible = true;
        xhr.send(fd);
    }

    function uploadProgress(evt) {
        $scope.$apply(function(){
            if (evt.lengthComputable) {
                $scope.progress = Math.round(evt.loaded * 100 / evt.total);
            } else {
                $scope.progress = 'unable to compute';
            }
        })
    }

    function uploadComplete(evt) {
        /* This event is raised when the server send back a response */
        alert(evt.target.responseText);
        //$location.path('/AddEdge');
    }

    function uploadFailed(evt) {
        alert("There was an error attempting to upload the file.");
    }

    function uploadCanceled(evt) {
        $scope.$apply(function(){
            scope.progressVisible = false;
        })
        alert("The upload has been canceled by the user or the browser dropped the connection.");
    }

    $scope.form = {};
    $scope.dropText = 'Drop files here...';

    $scope.submitPost = function () {
        $http.post('/API/knownodes', $scope.form).
            success(function(data) {
                $location.path('/AddEdge');
            });
    };
}

function AddEdgeCtrl($scope, $http, $location){
    $scope.form = {};
    $scope.submitPost = function () {
        $http.post('/API/knownodes/edge', $scope.form).
            success(function(data) {
                $location.path('/AddPost');
            });
    };
}

function IndexCtrl($scope, $http, $location) {
  $http.get('/api/users').
    success(function(data, status, headers, config) {
      $scope.users = data.users;
    });

  $scope.deleteUser = function(){
      $http.delete('/api/users').
          success(function(data, status, headers, config) {

          });
  };
}

function DeleteUserCtrl($scope, $http, $location, $routeParams) {
    $http.get('/api/users/' + $routeParams.id).
        success(function(data) {
            $scope.post = data.post;
        });

    $scope.deleteUser = function () {
        $http.delete('/api/users/:' + $routeParams.id).
            success(function(data) {
                $location.url('/');
            });
    };

    $scope.home = function () {
        $location.url('/');
    };
}

function LoginCtrl($scope, $http, $location) {
    $scope.loginForm = {};
    $scope.performLogin = function () {
        $http.post('/API/knownodes/edge', $scope.loginForm).
            success(function(data) {
                $location.path('/');
            });
    };
}