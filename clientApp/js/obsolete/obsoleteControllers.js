
// KEPT FOR REFERENCE :
//      - File Upload
//      - Drag & Drop
// Template : addPostURL

function AddPostCtrl($scope, $http, $location, $routeParams, $rootScope) {
    var dropbox = document.getElementById("dropbox");
    var conceptId = $scope.conceptId = $routeParams.id;

    function dragEnterLeave(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        $scope.$apply(function () {
            $scope.dropText = 'Drop files here...';
            $scope.dropClass = '';
        });
    }

    $http.get('/concepts/:' + conceptId).success(function (data) {
        $scope.concept = data.success;
    });

    // form tab manager
    $scope.resourceFormats = [
        'Text',
        'URL',
        'File'];
    $scope.currentFormat = $scope.resourceFormats[0];

    //Get the index of the current step given selection
    $scope.getCurrentFormatIndex = function () {
        return $scope.resourceFormats.indexOf($scope.currentFormat);
    };

    // Go to a defined step index
    $scope.goToFormat = function (index) {
        if (!($scope.resourceFormats[index] === undefined)) {
            $scope.currentFormat = $scope.resourceFormats[index];
        }
    };

    // toggle knowledgeDomain selector window
    var knowledgeDomain = false;
    $scope.toggleKnowledgeDomain = function (classToToggle) {
        if (knowledgeDomain) {
            knowledgeDomain = false;
        } else {
            knowledgeDomain = classToToggle;
        }
        return knowledgeDomain;
    };


    if (dropbox === null) {
        return console.log("no dropbox");
    } else {
        dropbox.addEventListener("dragenter", dragEnterLeave, false);
        dropbox.addEventListener("dragleave", dragEnterLeave, false);
        dropbox.addEventListener("dragover", function (evt) {
            evt.stopPropagation();
            evt.preventDefault();
            var clazz = 'not-available',
                ok = evt.dataTransfer && evt.dataTransfer.types && evt.dataTransfer.types.indexOf('Files') >= 0;
            $scope.$apply(function () {
                $scope.dropText = ok ? 'Drop files here...' : 'Only files are allowed!';
                $scope.dropClass = ok ? 'over' : 'not-available';
            })
        }, false);

        dropbox.addEventListener("drop", function (evt) {
            console.log('drop evt:', JSON.parse(JSON.stringify(evt.dataTransfer)));
            evt.stopPropagation();
            evt.preventDefault();
            $scope.$apply(function () {
                $scope.dropText = 'Drop files here...';
                $scope.dropClass = '';
            })
            var files = evt.dataTransfer.files,
                i;
            if (files.length > 0) {
                $scope.$apply(function () {
                    $scope.files = [];
                    for (i = 0; i < files.length; i++) {
                        $scope.files.push(files[i]);
                    }
                });
            }
        }, false);
    }
    //============== DRAG & DROP =============

    $scope.setFiles = function (element) {
        $scope.$apply(function (scope) {
            console.log('files:', element.files);
            // Turn the FileList object into an Array
            scope.files = [];
            for (var i = 0; i < element.files.length; i++) {
                scope.files.push(element.files[i]);
            }
            scope.progressVisible = false;
        });
    };

    var uploadFile = function () {
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
        $scope.$apply(function () {
            if (evt.lengthComputable) {
                $scope.progress = Math.round(evt.loaded * 100 / evt.total);
            } else {
                $scope.progress = 'unable to compute';
            }
        })
    }

    function uploadComplete(evt) {
        /* This event is raised when the server send back a response */
        var response = JSON.parse(evt.target.responseText);
        if (response.error) {
            $scope.errorMessage = response.error.stack;
            return;
        }
        if (JSON.parse(evt.target.responseText).success) {
            var fileData = JSON.parse(evt.target.responseText).success;
            $scope.form.knownodeForm.fileId = fileData.files[0]._id;
            $scope.form.knownodeForm.fileName = fileData.files[0].filename;
            $scope.form.knownodeForm.fileData = JSON.stringify(fileData);

            saveForm();
        }
        else {
            $scope.error = JSON.parse(evt.target.responseText).error;
        }
        //$location.path('/AddEdge');
    }

    function uploadFailed(evt) {
        $scope.errorMessage = "There was an error attempting to upload the file.";
    }

    function uploadCanceled(evt) {
        $scope.$apply(function () {
            $scope.progressVisible = false;
        });
        $scope.errorMessage = "The upload has been canceled by the user or the browser dropped the connection.";
    }

    function saveForm() {

        $http.post('/knownodes', $scope.form).
            success(function (data, status, headers, config) {
                if (data.success) {
                    $location.path('/concept/:' + $scope.form.originalPostId);
                }
                if (data.error) {
                    $scope.errorMessage = data.error
                }
                $("#btnSubmitPost").removeAttr('disabled');
                $scope.existingNode = null;
            });
    }

    $scope.form = {};
    $scope.form.knownodeForm = {};
    $scope.form.knownodeRelation = {};
    $scope.form.knownodeRelation.connectionType = "Choose connection type";
    $scope.dropText = 'Drop files here...';
    $scope.form.originalPostId = $scope.form.knownodeRelation.originalPostId = $routeParams.id;
    $scope.errorMessage = null;
    $scope.tooltip = {title: "Hello Tooltip<br />This is a multiline message!", checked: false};
    $scope.reversedDirection = false;

    $scope.submitPost = function (form) {
        $scope.existingNode = $rootScope.existingNode;

        if ($scope.existingNode) {
            $scope.form.existingNode = $scope.existingNode;
        }
        if ($scope.reversedDirection) {
            $scope.form.knownodeRelation.reversedDirection = true;
        }
        $("#btnSubmitPost").attr('disabled', 'disabled');
        if ($scope.files && $scope.files.length > 0) {
            uploadFile();
        }
        else {
            saveForm();
        }
    };
}
AddPostCtrl.$inject = ['$scope', '$http', '$location', '$routeParams', '$rootScope'];


function EditConceptCtrl($scope, $http, $location, $routeParams) {
    var partnerList = document.getElementById('partner'),
        conceptId = $scope.conceptId = $routeParams.id;
    $scope.userList = [];
    $scope.form = {};
    $scope.form.concept = {};

    $http.get('/users').
        success(function (data, status, headers, config) {
            angular.forEach(data.success, function (user) {
                $scope.userList.push(user.displayName);
            });
        });

    $http.get('/concepts/:' + conceptId).
        success(function (data, status, headers, config) {
            if (data.success) {
                angular.forEach(data.success, function (value, key) {
                    $scope.form.concept[key] = value;
                });
            }
        });

    $scope.submitConcept = function () {
        $scope.isDisabled = true;

        $http.put('/concepts/:' + conceptId, $scope.form).
            success(function (data) {
                $location.path('/conceptList');
            });
    };
}
EditConceptCtrl.$inject = ['$scope', '$http', '$location', '$routeParams'];
