'use strict';
//Dor experiments
function TopBarCtrl($scope) {
    var result = false;
    $scope.toggle = function (classToToggle) {
        if (result) {
            result = false;
        } else {
            result = classToToggle;
        }
        return result;
    };
}
TopBarCtrl.$inject = ['$scope'];

function ChatCtrl($scope, $timeout, $rootScope, angularFireCollection) {
    var el = document.getElementById("messagesDiv");
    var url = 'https://knownodes.firebaseIO.com/chat';
    $scope.messages = angularFireCollection(url, function () {
        $timeout(function () {
            el.scrollTop = el.scrollHeight;
        });
    });
    $scope.addMessage = function () {
        if (!$rootScope.userDisplayName) {
            window.alert("you must be logged in to do that");
        }
        else {
            $scope.messages.add({from: $rootScope.userDisplayName, content: $scope.message}, function () {
                el.scrollTop = el.scrollHeight;
            });
        }
        $scope.message = "";
    };
}
ChatCtrl.$inject = ['$scope', '$timeout', '$rootScope', 'angularFireCollection'];
/* Controllers */
function AppCtrl($scope, $http) {
    $http({method: 'GET', url: '/api/name'}).
        success(function (data, status, headers, config) {
            $scope.name = data.name;
        }).
        error(function (data, status, headers, config) {
            $scope.name = 'Error!';
        });
}
AppCtrl.$inject = ['$scope', '$http'];

/***
 * knownode users
 */
function AddUserCtrl($scope, $http, $location) {
    $scope.userForm = {};
    $scope.submitUser = function (userForm) {
        $http.post('/users', userForm).
            success(function (data, status, headers, config) {
                $location.path('/');
            });
    };
}

AddUserCtrl.$inject = ['$scope', '$http', '$location'];

function LoginCtrl($scope, $http, $location, $rootScope) {
    $scope.loginForm = {};

    $scope.performLogin = function () {
        $http.post('/login', $scope.loginForm).
            success(function (data, status, headers, config) {
                if (data == 'ERROR') {
                    return $scope.loginerror = true;
                }
                $rootScope.user = data;
                return $location.path('/conceptList');
            });
    };
}
LoginCtrl.$inject = ['$scope', '$http', '$location'];

function LogoutCtrl($http, $location, $rootScope) {
    $http.post('/logout').
        success(function (data) {
            if (data.success === 'Logout') {
                $rootScope.user = null;
                $rootScope.userDisplayName = null;
                $location.path('/login');
            }
        });
}

LoginCtrl.$inject = ['$scope', '$http', '$location', '$rootScope'];
/***
 * knownode concepts
 */
function AddConceptCtrl($scope, $http, $location) {
    var partnerList = document.getElementById('partner');
    $scope.userList = [];

    $http.get('/users').
        success(function (data, status, headers, config) {
            angular.forEach(data.success, function (user) {
                $scope.userList.push(user.displayName);
            });
        });

    $scope.form = {};
    $scope.form.concept = {};
    $scope.submitConcept = function () {
        $scope.isDisabled = true;

        $http.post('/concepts', $scope.form).
            success(function (data) {
                $location.path('/conceptList');
            });
    };
}
AddConceptCtrl.$inject = ['$scope', '$http', '$location'];

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


function ConceptListCtrl($scope, $http, $routeParams, userService) {

    $scope.isUserLoggedIn = userService.isUserLoggedIn();
    var showtoggle2 = false;
    $scope.plusToggle = function (classToToggle) {
        if (showtoggle2) {
            showtoggle2 = false;
        } else {
            showtoggle2 = classToToggle;
        }
        return showtoggle2;
    };

    angular.forEach($scope.edges, function (value, id) {
        if ($routeParams.id === value.source1.id) {
            $scope.subtitletest = value.source1.title;
        }
        if ($routeParams.id === value.source2.id) {
            $scope.subtitletest = value.source2.title;
        }
    });

    $http.get('/concepts').success(function (data, status, headers, config) {
        if (data.error) {
            alert(data.error);
            return;
        }
        $scope.conceptList = data.success;
    });

    $scope.orderProp = "date";
}
ConceptListCtrl.$inject = ['$scope', '$http', '$routeParams', 'userService'];

function ConceptGraphCtrl($scope, $http, $routeParams, userService) {
    /*
    $scope.isUserLoggedIn = userService.isUserLoggedIn();
    var showtoggle2 = false;
    $scope.plusToggle = function (classToToggle) {
        if (showtoggle2) {
            showtoggle2 = false;
        } else {
            showtoggle2 = classToToggle;
        }
        return showtoggle2;
    };

    angular.forEach($scope.edges, function (value, id) {
        if ($routeParams.id === value.source1.id) {
            $scope.subtitletest = value.source1.title;
        }
        if ($routeParams.id === value.source2.id) {
            $scope.subtitletest = value.source2.title;
        }
    });

    $http.get('/concepts').success(function (data, status, headers, config) {
        if (data.error) {
            alert(data.error);
            return;
        }
        $scope.conceptList = data.success;
    });

    $scope.orderProp = "date";
    */
}
ConceptGraphCtrl.$inject = ['$scope', '$http', '$routeParams', 'userService'];


function ArticleListCtrl($scope, $http, $routeParams, userService) {
    $scope.addNode = false;
    $scope.currentKnownode = {};
    //$scope.passKnownode = PassKnownode;
    $scope.isUserLoggedIn = userService.isUserLoggedIn();
    $scope.checkOwnership = function (userId) {
        if (userService.isUserLoggedIn()) {
            return userId == userService.getConnectedUser().id;
        }
        return false;
    }
    $scope.$broadcast('rootNodeExists', {rootNodeExists: true});

    $scope.deleteArticle = function (id, index) {
        if (confirm("Are you sure you want to delete this post?")) {
            $http.delete('/knownodes/:' + id).
                success(function () {
                    $scope.knownodeList.splice(index, 1);
                });
        }
    };

    $scope.isOwner = function (id) {
        if (userService.isUserLoggedIn()) {
            return userService.getConnectedUser().id === id;
        }
        return false;
    }

    var conceptId = $scope.conceptId = $routeParams.id;
    $http.get('/knownodes/:' + conceptId).success(function (data, status, headers, config) {
        $scope.concept = data.success;

        $scope.$broadcast('rootNodeExists');
        if ($scope.concept.url != null && $scope.concept.url.match(/youtube.com/ig)) {
            var search = $scope.concept.url.split('?')[1];
            var video_id = search.split('v=')[1];
            var ampersandPosition = video_id.indexOf('&');
            if (ampersandPosition != -1) {
                video_id = video_id.substring(0, ampersandPosition);
            }
            $scope.videoLink = video_id;
        }
    });

    $http.get('/concepts/:' + conceptId + '/getRelatedKnownodes').success(function (data, status, headers, config) {
        if (data.error) {
            return $scope.errorMessage = data.error;
        }
        $scope.knownodeList = data.success;
    });
    $scope.start = +new Date();

}
ArticleListCtrl.$inject = ['$scope', '$http', '$routeParams', 'userService'];

//knownode Post:
function KnownodeCtrl($scope, $http, $routeParams, userService) {
    var knownodeId = $scope.conceptId = $routeParams.id;
    $scope.isUserLoggedIn = userService.isUserLoggedIn();

    $http.get('/knownodes/:' + knownodeId).success(function (data, status, headers, config) {
        $scope.knownode = data.success;
        if (data.success.fileData) {
            $scope.attachedFile = JSON.parse(data.success.fileData);
        }
    });

    $http.get('/knownodes/:' + knownodeId + '/getRelatedKnownodes').success(function (data, status, headers, config) {
        if (data.error) {
            return $scope.errorMessage = data.error;
        }
        $scope.knownodeList = data.success;
    });
}
KnownodeCtrl.$inject = ['$scope', '$http', '$routeParams', 'userService'];


function EditPostCtrl($scope, $http, $location, $routeParams) {

}
EditPostCtrl.inject = ['$scope', '$http', '$location', '$routeParams'];

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

function IndexCtrl($scope, $http, $location) {
}
IndexCtrl.$inject = ['$scope', '$http', '$location'];

function DeleteUserCtrl($scope, $http, $location, $routeParams) {
    $http.get('/users/' + $routeParams.id).
        success(function (data) {
            $scope.post = data.post;
        });

    $scope.deleteUser = function () {
        $http.delete('/users/:' + $routeParams.id).
            success(function (data, status, headers, config) {
                $location.url('/');
            });
    };

    $scope.home = function () {
        $location.url('/');
    };
}
DeleteUserCtrl.$inject = ['$scope', '$http', '$location', '$routeParams'];

function commentCtrl($scope, $http, $routeParams, userService, broadcastService) {
    var objectId = $routeParams.id;
    $scope.comments = [];

    $http.get('/comments/:' + objectId)
        .success(function (data, status, headers, config) {
            $scope.comments = data.success;
        });

    $scope.addComment = function () {

    };

    $scope.$on('handleBroadcast', function () {
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

    $scope.submitComment = function (originalObjectId) {
        $scope.submitMade = false;
        $scope.submitNotMade = false;

        $scope.form.originalObject.id = originalObjectId || $scope.form.originalObject.id;

        $http.post('/comments', $scope.form).
            success(function (data, status, headers, config) {
                if (data.success) {
                    var comment = data.success;
                    comment.user = userService.getConnectedUser();
                    broadcastService.prepForBroadcast(comment);
                    $scope.submitMade = true;
                } else {
                    console.log(data.error);
                    $scope.submitNotMade = false;
                    $scope.error = data.error;

                }
            });
    };
}
addCommentCtrl.$inject = ['$scope', '$http', '$routeParams', 'userService', 'broadcastService'];

function aboutCtrl($scope) {

}
aboutCtrl.$inject = ['$scope'];

function EdgeCtrl($scope, $http, $routeParams, userService, PassKnownode) {
    var currentKnownode = PassKnownode.showCurrent();
    if (currentKnownode) {
        $scope.knownode = currentKnownode;
    }
    console.log($scope.knownode);
    $scope.isUserLoggedIn = userService.isUserLoggedIn();
    $scope.checkOwnership = function (userId) {
        if (userService.isUserLoggedIn()) {
            return userId == userService.getConnectedUser().id;
        }
        return false;
    };
    $scope.deleteNode = function (id, index) {
        if (confirm("Are you sure you want to delete this post?")) {
            $http.delete('/knownodes/:' + id).
                success(function () {
                    $scope.knownodeList.splice(index, 1);
                });
        }
    };

    $scope.isOwner = function (id) {
        if (userService.isUserLoggedIn()) {
            return userService.getConnectedUser().id === id;
        }
        return false;
    };

    var edgeId = $scope.edgeId = $routeParams.id;
    $http.get('/edges/:' + edgeId).success(function (data, status, headers, config) {
        $scope.knownode = data.success;
        $scope.knownode = $scope.knownode[0];
    });
}

EdgeCtrl.$inject = ['$scope', '$http', '$routeParams', 'userService', 'PassKnownode'];

function SearchCtrl($scope, $http, $rootScope) {
    $scope.keyword = "";
    $scope.searchByKeyword = function () {
        $http.get('/knownodes/:' + $scope.keyword + '/getNodesByKeyword').success(function (data, status, headers, config) {
            $scope.searchResults = data.success;

        })
    };

    $scope.addAsNode = function (nodeId) {
        $rootScope.existingNode = nodeId;
        console.log("rootscope updated");
    }

}
SearchCtrl.$inject = ['$scope', '$http', '$rootScope'];

function KnownodeInputCtrl($scope, hybridSearch, $routeParams) {

    $scope.bgColor = '';
    $scope.$on('rootNodeExists', function () {
        $scope.rootNodeExists = true;
    });

    $scope.inputOptions = {
        minimumInputLength: 3,
        query: function (query) {
            hybridSearch.search(query.term).then(function (results) {
                console.log('Got ' + results.nodes.length + ' nodes');
                console.log('Got ' + results.articles.length + ' articles');
                var data = {results: []}, i;
                for (i = 0; i < results.nodes.length; i++) {
                    data.results.push({id: results.nodes[i].results.KN_ID, text: results.nodes[i].results.title});
                }
                for (i = 0; i < results.articles.length; i++) {
                    data.results.push({id: results.articles[i].title, text: results.articles[i].title, wiki: true});
                }
                query.callback(data);
            });
        },
        formatResult: function movieFormatResult(node) {
            var markup = "<table class='suggestion'><tr>";
            markup += "<td class='suggestion-info'><div class='suggestion-title'>" + node.text + "</div></td>";
            if (node.wiki) {
                markup += "<td class='suggestion-image'><img src='img/wikipedia-icon.png'/></td>";
            }
            markup += "</tr></table>"
            return markup;
        }
    }

    $scope.isNodeSelected = function () {
        return $scope.selectedNode != null;
    };

    $scope.$watch('selectedSuggestions', function () {
        if (isSuggestionSelected()) {
            $scope.selectedNode = getSelectedSuggestion();
            $('.select2-container').hide();
        }
        else {
            $scope.selectedNode = null;
            $('.select2-container').show();
        }
    });

    $scope.selectedSuggestions = null;

    var isSuggestionSelected = function () {
        return $scope.selectedSuggestions != null && $scope.selectedSuggestions.length > 0;
    }

    var getSelectedSuggestion = function () {
        if (!isSuggestionSelected()) throw 'No Selected Suggestion';
        return $scope.selectedSuggestions[0];
    }

    $scope.isFormValid = function () {
        return $scope.isNodeSelected()
            && $scope.form.knownodeRelation.text != null
            && $scope.form.knownodeRelation.text.length > 5
            && $scope.form.knownodeRelation.connectionType != null
            && $scope.form.knownodeRelation.connectionType.length > 5;
    }

    $scope.userGenNode = false;
    $scope.form = {};
    $scope.form.knownodeForm = {};
    $scope.form.knownodeRelation = {};
    $scope.form.knownodeRelation.connectionType = 'Choose link type';
    $scope.dropText = 'Drop files here...';
//$scope.form.originalPostId = $scope.form.knownodeRelation.originalPostId = $routeParams.id;
    $scope.errorMessage = null;
    $scope.reversedDirection = false;
    $scope.categoryClick = function (category) {
        $scope.bgColor = category;
        $scope.form.knownodeRelation.connectionType = category;
    };
}
KnownodeInputCtrl.$inject = ['$scope', 'hybridSearch'];

