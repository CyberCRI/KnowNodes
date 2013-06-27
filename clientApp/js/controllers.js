'use strict';

function TopBarCtrl($scope, $location) {

    $scope.$on('$routeChangeSuccess', function (event, current, previous) {
        var path = $location.path().split('/')[1];
        $scope.mapButton = (path === 'concept' || path === 'article' || path === 'resource');
        $scope.resourceButton = (current.$route.controller.name === "MapCtrl");

        $scope.resourceId = current.params.id;
    });

    $scope.$on('searchResultSelected', function (event, result) {
        event.stopPropagation();
        if (result.type === 'Wikipedia Article') {
            $location.path('/wiki/' + result.id);
        } else { // Resource
            $location.path('/concept/' + result.id);
        }
    });

    $scope.$on('mapNavigated', function (event, result) {
        event.stopPropagation();
        $scope.resourceId = result;
    });
}
TopBarCtrl.$inject = ['$scope', '$location'];


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
                if (data === 'ERROR') {
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
LogoutCtrl.$inject = ['$scope', '$http', '$location', '$rootScope'];


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


function MapCtrl($scope, $routeParams) {
    $(document).ready(function () {
        var css = jQuery("<link>");
        css.attr({
            rel: "stylesheet",
            type: "text/css",
            href: "http://fonts.googleapis.com/css?family=Roboto"
        });
        $("head").append(css);

        function navigationListener(resourceId) {
            $scope.$emit("mapNavigated", resourceId);
        };

        Renderer.init("viewport", $routeParams.id, navigationListener);
        PanelsHandler.initPanels();
    });
}
MapCtrl.$inject = ['$scope', '$routeParams'];


function KnownodeListCtrl($scope, $http, $routeParams, $location, userService, resource, wikipedia, wikinode) {

    // First, check whether the resource is a KN Resource or a Wikipedia Article
    if ($routeParams.id != null) {
        // KN Resource
        resource.get($routeParams.id).then(function (resource) {
            $scope.concept = resource;

            $scope.rootNodeExists = true;
            if ($scope.concept.url != null && $scope.concept.url.match(/youtube.com/ig)) {
                var search = $scope.concept.url.split('?')[1];
                var video_id = search.split('v=')[1];
                var ampersandPosition = video_id.indexOf('&');
                if (ampersandPosition != -1) {
                    video_id = video_id.substring(0, ampersandPosition);
                }
                $scope.videoLink = video_id;
            }

            $scope.knownodeList = resource.relations;
        });
    } else if ($routeParams.title != null) {
        // Check if a Wikinode exists for this Wikipedia article
        wikinode.get($routeParams.title).then(function (wikinode) {
            if (wikinode != null) {
                $location.path('/concept/' + wikinode.KN_ID);
            } else {
                // No Wikinode, just a plain Wikipedia article
                wikipedia.getArticle($routeParams.title).then(function (article) {
                    $scope.concept = {
                        type: 'Wikipedia Article',
                        title: article.title,
                        bodyText: article.extract,
                        wikipediaLinks: article.links
                    };
                    $scope.rootNodeExists = true;
                });
            }
        });
    } else throw 'No id nor title found in URL';

    $scope.addNode = false;
    $scope.currentKnownode = {};
    $scope.isUserLoggedIn = userService.isUserLoggedIn();
    $scope.checkOwnership = function (userId) {
        if (userService.isUserLoggedIn()) {
            return userId === userService.getConnectedUser().id;
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

    $scope.start = +new Date();

}
KnownodeListCtrl.$inject = ['$scope', '$http', '$routeParams', '$location', 'userService', 'resource', 'wikipedia', 'wikinode'];


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


function StaticPageCtrl($scope) {
}
StaticPageCtrl.$inject = ['$scope'];


function EdgeCtrl($scope, $http, $routeParams, userService, PassKnownode) {
    var currentKnownode = PassKnownode.showCurrent();
    if (currentKnownode) {
        $scope.knownode = currentKnownode;
    }
    console.log($scope.knownode);
    $scope.isUserLoggedIn = userService.isUserLoggedIn();
    $scope.checkOwnership = function (userId) {
        if (userService.isUserLoggedIn()) {
            return userId === userService.getConnectedUser().id;
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


function WikipediaArticleCtrl($scope, $routeParams, wikipedia) {

    var articleTitle = $routeParams.title;

    wikipedia.getArticle(articleTitle).then(function (article) {
        $scope.article = article;
    });

}
WikipediaArticleCtrl.$inject = ['$scope', '$routeParams', 'wikipedia'];


function KnownodeInputCtrl($scope, $q, $location, wikinode, connection) {

    var targetResource;

    $scope.bgColor = 'auto-generated';

    $scope.isFormValid = function () {
        return $scope.connectionTitle != null && $scope.connectionTitle.length > 2
            && $scope.connectionType != 'Choose link type'
            && targetResource != null;
    }

    $scope.$on('searchResultSelected', function (event, result) {
        event.stopPropagation();
        targetResource = result;
        $scope.targetResourceTitle = targetResource.title;
        $('.target-resource-search-box').hide();
    });

    $scope.userGenNode = false;
    $scope.connectionTitle = '';
    $scope.connectionType = 'Choose link type';
    $scope.dropText = 'Drop files here...';
    $scope.errorMessage = null;
    $scope.reversedDirection = false;
    $scope.categoryClick = function (category) {
        $scope.bgColor = category;
        $scope.connectionType = category;
    };

    $scope.submit = function () {
        if (!$scope.isFormValid()) return;
        $scope.submitted = true;
        // TODO Handle case where connection direction is reversed
        // TODO Cleanup
        if ($scope.concept.type === 'Wikipedia Article' && targetResource.type === 'Wikipedia Article') {
            // Get both wikinodes and create connection
            $q.all([wikinode.getOrCreate($scope.concept.title),
                    wikinode.getOrCreate(targetResource.title)])
                .then(function (results) {
                    $scope.concept = results[0].data.success;
                    targetResource = results[1].data.success;
                    createConnection($scope.concept.KN_ID, targetResource.KN_ID)
                });
        } else if ($scope.concept.type === 'Wikipedia Article') {
            // Get source wikinode and create connection
            wikinode.getOrCreate($scope.concept.title).then(function (result) {
                $scope.concept = result.data.success;
                createConnection($scope.concept.KN_ID, targetResource.id);
            });
        }
        else if (targetResource.type === 'Wikipedia Article') {
            // Get target wikinode and create connection
            wikinode.getOrCreate(targetResource.title).then(function (result) {
                targetResource = result.data.success;
                createConnection($scope.concept.KN_ID, targetResource.KN_ID);
            });
        } else {
            createConnection($scope.concept.KN_ID, targetResource.id)
        }
    }

    var createConnection = function (sourceId, targetId) {
        connection.create(sourceId, $scope.connectionTitle, $scope.connectionType, targetId)
            .success(function (data, status) {
                $location.path('/concept/' + sourceId);
            })
            .error(function (data, status) {
                console.log('Connection creation failed with error : ' + status);
                console.log('Error message : ' + data.message);
            });
    }
}
KnownodeInputCtrl.$inject = ['$scope', '$q', '$location', 'wikinode', 'connection'];


function SearchBoxCtrl($scope, $http, hybridSearch) {

    $scope.selectedResult = null;

    $scope.searchBoxOptions = {
        dropdownAutoWidth: true,
        minimumInputLength: 3,
        query: function (query) {
            hybridSearch.search(query.term).then(function (results) {
                var suggestions = {results: []}, i;
                // First item is the create resource option
                suggestions.results.push({id: 'create_data_option_id', text: 'Create Resource...', type: 'Create'});
                for (i = 0; i < results.resources.length; i++) {
                    suggestions.results.push({id: results.resources[i].results.KN_ID, text: results.resources[i].results.title});
                }
                for (i = 0; i < results.wikipediaArticles.length; i++) {
                    suggestions.results.push({id: results.wikipediaArticles[i].title, text: results.wikipediaArticles[i].title, type: 'Wikipedia Article'});
                }
                query.callback(suggestions);
            });
        },
        formatResult: function movieFormatResult(node) {
            var markup = "<table class='suggestion'><tr>";
            markup += "<td class='suggestion-info'><div class='suggestion-title'>" + node.text + "</div></td>";
            if (node.type === 'Wikipedia Article') {
                markup += "<td class='suggestion-image'><img src='img/wikipedia-icon.png'/></td>";
            }
            markup += "</tr></table>"
            return markup;
        }
    }

    $scope.$watch('selectedResult', function () {
        if (isResultSelected()) {
            var result = getSelectedResult();
            if (result.type === 'Create') {
                // Create Resource
            }
            if (result.type === 'Wikipedia Article') {
                $scope.$emit('searchResultSelected', {
                    id: result.id,
                    title: result.id,
                    type: 'Wikipedia Article'
                });
            } else { // Resource
                $scope.$emit('searchResultSelected', {
                    id: result.id,
                    title: result.text,
                    type: 'Resource'
                });
            }
            $scope.clear();
        }
    });

    var isResultSelected = function () {
        return $scope.selectedResult != null && $scope.selectedResult.length > 0;
    };

    var getSelectedResult = function () {
        if (!isResultSelected()) throw 'No Selected Resource';
        return $scope.selectedResult[0];
    };

}
SearchBoxCtrl.$inject = ['$scope', '$http', 'hybridSearch'];


function RelationCtrl($scope) {
    //define a way for a node to know color based on connectionType
    $scope.BgColorClass = 'explain';
    $scope.colorSwitcher = function () {
        switch ($scope.knownode.connection.connectionType) {
            case "explain":
                return 'explain';
                break;
            case "question":
                return 'question';
                break;
            case "inspire":
                return 'inspire';
                break;
            case "Wikipedia Link":
                return 'auto-generated';
                break;
            default:
                return 'explain';
        }
    };
}
RelationCtrl.$inject = ['$scope'];
