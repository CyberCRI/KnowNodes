'use strict';

/***
 * knownode users
 */
function AddUserCtrl($scope, $http, $location) {
    $scope.userForm = {};
    $scope.submitUser = function (userForm) {
        $http.post('/users', userForm).
            success(function(data, status, headers, config){
                $location.path('/');
            });
    }
}

function LoginCtrl($scope, $http, $location, $rootScope) {
    $scope.loginForm = {};

    $scope.performLogin = function () {
        $http.post('/login', $scope.loginForm).
            success(function(data, status, headers, config) {
                if(data == 'ERROR'){
                    return $scope.loginerror = true;
                }

                $rootScope.user = data;
                return $location.path('/conceptList');
            });
    };
}

function LogoutCtrl($http, $location, $rootScope) {
    $http.post('/logout').
        success(function(data) {
            if(data.success === 'Logout') {
                $rootScope.user = null;
                $location.path('/login');
            }
        });
}

/***
 * knownode concepts
 */
function AddConceptCtrl($scope, $http, $location) {
    var partnerList = document.getElementById('partner');

    $http.get('/users').
        success(function(data, status, headers, config){
            $scope.userList = data;
        });

    $scope.form = {};
    $scope.form.concept = {};
    $scope.submitConcept = function () {
        $scope.isDisabled = true;

        $http.post('/concepts', $scope.form).
            success(function(data) {
                $location.path('/conceptList');
            });
    };
}

function ConceptListCtrl($scope, $http, userService) {
    $scope.isUserLoggedIn = userService.isUserLoggedIn();

    $http.get('/concepts').success(function(data, status, headers, config){
        if(data.error) {
            alert(data.error);
            return;
        }
        $scope.conceptList = data.success;
    });
}
ConceptListCtrl.$inject = ['$scope', '$http', 'userService'];


function ArticleListCtrl($scope, $http, $routeParams, userService) {
    $scope.isUserLoggedIn = userService.isUserLoggedIn();

    var conceptId = $scope.conceptId = $routeParams.id;
    $http.get('/concepts/:' + conceptId).success(function(data, status, headers, config){
       $scope.concept = data.success;
    });

    $http.get('/concepts/:' + conceptId + '/getRelatedKnownodes').success(function(data, status, headers, config){
        if(data.error){
            return $scope.errorMessage = data.error;
        }
        $scope.knownodeList = data.success;
    });
}
ArticleListCtrl.$inject = ['$scope', '$http', '$routeParams', 'userService'];


//knownode Post:
function KnownodeCtrl($scope, $http, $routeParams, userService) {
    var knownodeId = $scope.conceptId = $routeParams.id;
    $scope.isUserLoggedIn = userService.isUserLoggedIn();

    $http.get('/knownodes/:' + knownodeId).success(function(data, status, headers, config){
        $scope.knownode = data.success;
    });

    $http.get('/knownodes/:' + knownodeId + '/getRelatedKnownodes').success(function(data, status, headers, config){
        if(data.error){
            return $scope.errorMessage = data.error;
        }
        $scope.knownodeList = data.success;
    });
}

function AddPostCtrl($scope, $http, $location, $routeParams) {

    var conceptId = $scope.conceptId = $routeParams.id;
    $http.get('/concepts/:' + conceptId).success(function(data){
        $scope.concept = data.success;
    });

    var dropbox = document.getElementById("dropbox");

    var conceptId = $scope.conceptId = $routeParams.id;
    $http.get('/concepts/:' + conceptId).success(function(data, status, headers, config){
        $scope.concept = data.success;
    });

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

    var uploadFile = function() {
        var i, fd = new FormData();
        for (i in $scope.files) {
            fd.append("uploadedFile", $scope.files[i]);
        }
        var xhr = new XMLHttpRequest()
        xhr.upload.addEventListener("progress", uploadProgress, false);
        xhr.addEventListener("load", uploadComplete, false);
        xhr.addEventListener("error", uploadFailed, false);
        xhr.addEventListener("abort", uploadCanceled, false);
        //fd.append($scope.form)
        xhr.open("POST", "/knownodeFiles");
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
        var fileData = JSON.parse(evt.target.responseText);
        $scope.form.knownodeForm.fileData = fileData;

        saveForm();
        //$location.path('/AddEdge');
    }

    function uploadFailed(evt) {
        $scope.errorMessage = "There was an error attempting to upload the file.";
    }

    function uploadCanceled(evt) {
        $scope.$apply(function(){
            $scope.progressVisible = false;
        })
        $scope.errorMessage = "The upload has been canceled by the user or the browser dropped the connection.";
    }

    function saveForm(){
        $http.post('/knownodes', $scope.form).
            success(function(data, status, headers, config) {
                if(data.success) {
                    $location.path('/concept/:' + $scope.form.originalPostId);
                }
            });
    }

    $scope.form = {};
    $scope.form.knownodeForm = {};
    $scope.form.knownodeRelation = {};

    $scope.dropText = 'Drop files here...';
    $scope.form.originalPostId = $scope.form.knownodeRelation.originalPostId = $routeParams.id;
    $scope.errorMessage = null;

    $scope.tooltip = {title: "Hello Tooltip<br />This is a multiline message!", checked: false};

    /*{
        knownodeRelation : {
            bodyText : {
                "title": "Hello Tooltip<br />This is a multiline message!",
                "checked": false
            }
        }
    }; */

    $scope.submitPost = function (form) {
        if($scope.files && $scope.files.length > 0) {
            uploadFile();
        }
        else {
            saveForm();
        }
    };
}

function IndexCtrl($scope, $http, $location) {
}

function DeleteUserCtrl($scope, $http, $location, $routeParams) {
    $http.get('/users/' + $routeParams.id).
        success(function(data) {
            $scope.post = data.post;
        });

    $scope.deleteUser = function () {
        $http.delete('/users/:' + $routeParams.id).
            success(function(data, status, headers, config) {
                $location.url('/');
            });
    };

    $scope.home = function () {
        $location.url('/');
    };
}

function commentCtrl($scope, $http, $routeParams, userService, broadcastService)
{
    var objectId = $routeParams.id;
    $scope.comments = [];

    $http.get('/comments/:' + objectId)
        .success(function(data, status, headers, config) {
            $scope.comments = data.success;
        });

    $scope.addComment = function() {

    };

    $scope.$on('handleBroadcast', function() {
        $scope.comments.push(broadcastService.message);
    });
}
commentCtrl.$inject = ['$scope', '$http', '$routeParams', 'userService', 'broadcastService'];

function addCommentCtrl($scope, $http, $routeParams, userService, broadcastService) {
    var objectId = $routeParams.id;
    $scope.isUserLoggedIn = userService.isUserLoggedIn();

    $scope.form = $scope.form || {};
    $scope.form.comment = {};
    $scope.form.originalObject = {};
    $scope.form.originalObject.id = objectId;

    $scope.submitComment = function(originalObjectId) {
        $scope.form.originalObject.id = originalObjectId || $scope.form.originalObject.id;

        $http.post('/comments', $scope.form).
            success(function(data, status, headers, config) {
                var comment = data.success;
                comment.user = userService.getConnectedUser();
                broadcastService.prepForBroadcast(comment);
            });
    };
}
addCommentCtrl.$inject = ['$scope', '$http', '$routeParams', 'userService', 'broadcastService'];
