'use strict';
//Dor experiments
function TopBarCtrl($scope) {
    var result = false;
    var knowledgeDomain = false;
    $scope.toggle = function(classToToggle) {
        if(result) {
            result = false;
        } else{
            result = classToToggle;
        }
        return result;
    };
    $scope.toggleKnowledgeDomain = function(classToToggle) {
        if(knowledgeDomain) {
            knowledgeDomain = false;
        } else{
            knowledgeDomain = classToToggle;
        }
        return knowledgeDomain;
    };
}

function FormCtrl($scope, $location) {
    $scope.steps = [
        'Text',
        'URL',
        'PDF'];
    $scope.selection = $scope.steps[0];
    //Get the index of the current step given selection
    $scope.getCurrentStepIndex = function(){
        return $scope.steps.indexOf($scope.selection);
    };
    // Go to a defined step index
    $scope.goToStep = function(index){
        if(!($scope.steps[index] === undefined)) {
            $scope.selection = $scope.steps[index];
        }
    };
}

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

/***
 * knownode users
 */
function AddUserCtrl($scope, $http, $location) {
    $scope.userForm = {};
    $scope.submitUser = function (userForm) {
        $http.post('/users', userForm).
            success(function(data){
                $location.path('/');
            });
    }
}

function LoginCtrl($scope, $http, $location, $rootScope) {
    $scope.loginForm = {};

    $scope.performLogin = function () {
        $http.post('/login', $scope.loginForm).
            success(function(data) {
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
        success(function(data){
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

function ConceptListCtrl($scope, $http, $routeParams, userService) {

    $scope.isUserLoggedIn = userService.isUserLoggedIn();

    var showtoggle2 = false;
    $scope.plusToggle = function(classToToggle) {
        if(showtoggle2) {
            showtoggle2 = false;
        } else{
            showtoggle2 = classToToggle;
        }
        return showtoggle2;
    };

    angular.forEach($scope.edges, function(value,id){
        if($routeParams.id === value.source1.id) {
            $scope.subtitletest = value.source1.title;
        }
        if($routeParams.id === value.source2.id) {
            $scope.subtitletest = value.source2.title;
        }
    });

    $http.get('/concepts').success(function(data){
        if(data.error) {
            alert(data.error);
            return;
        }
        $scope.conceptList = data.success;
    });

    $scope.orderProp = "date";
}
ConceptListCtrl.$inject = ['$scope', '$http', '$routeParams', 'userService'];


function ArticleListCtrl($scope, $http, $routeParams, userService) {
    $scope.isUserLoggedIn = userService.isUserLoggedIn();

    var conceptId = $scope.conceptId = $routeParams.id;
    $http.get('/concepts/:' + conceptId).success(function(data){
       $scope.concept = data.success;
    });

    $http.get('/concepts/:' + conceptId + '/getRelatedKnownodes').success(function(data){
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

    $http.get('/knownodes/:' + knownodeId).success(function(data){
        $scope.knownode = data.success;
    });

    $http.get('/knownodes/:' + knownodeId + '/getRelatedKnownodes').success(function(data){
        if(data.error){
            return $scope.errorMessage = data.error;
        }
        $scope.knownodeList = data.success;
    });
}

function AddPostCtrl($scope, $http, $location, $routeParams) {
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
            success(function(data) {
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
