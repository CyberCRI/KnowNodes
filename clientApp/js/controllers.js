'use strict';

function TopBarCtrl($scope, $location, resource) {

    $scope.$on('$routeChangeSuccess', function (event, current, previous) {
        var path = $location.path().split('/')[1];
        $scope.mapButton = (path === 'concept' || path === 'article' || path === 'resource');
        $scope.resourceButton = (current.$route.controller.name === "MapCtrl");

        $scope.resourceId = current.params.id;
    });

    $scope.$on('searchResultSelected', function (event, result) {
        event.stopPropagation();
        switch (result.type) {
            case 'Link to Resource':
                delete result.type; // type is used only client-side, should not be persisted
                resource.create(result).then(function (createdResource) {
                    $location.path('/resource/' + createdResource.KN_ID);
                });
                break;
            case 'Wikipedia Article':
                $location.path('/wikipedia/' + result.id);
                break;
            case 'Resource':
                $location.path('/resource/' + result.KN_ID);
                break;
        }
    });

    $scope.$on('mapNavigated', function (event, result) {
        event.stopPropagation();
        $scope.resourceId = result;
    });
}


function CreateResourceDialogCtrl($scope, dialog, resource) {

    $scope.resourceToCreate = {title: dialog.options.title};

    $scope.close = function () {
        dialog.close();
    };

    $scope.submit = function () {
        resource.create($scope.resourceToCreate).then(function (createdResource) {
            dialog.close(createdResource);
        });
    };
}


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


function AddUserCtrl($scope, $http, $location) {
    $scope.userForm = {};
    $scope.submitUser = function (userForm) {
        $http.post('/users', userForm).
            success(function (data, status, headers, config) {
                $location.path('/');
            });
    };
}


function LoginCtrl($scope, $http, $location, $rootScope, $window) {
    $scope.loginForm = {};

    $scope.performLogin = function () {
        $http.post('/login', $scope.loginForm).
            success(function (data, status, headers, config) {
                if (data === 'ERROR') {
                    return $scope.loginerror = true;
                }
                $rootScope.user = data;
                $window.history.back();
            });
    };
}


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


function TripletListCtrl($scope, $routeParams, $location, userService, resource, wikipedia, wikinode) {

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
        wikinode.get($routeParams.title)
            .success(function (data) {
                $location.path('/resource/' + data.KN_ID);
            })
            .error(function (data, status) {
                if (status != 404) console.log('Unexpected Error', data);
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
            resource.delete(id)
                .success(function () {
                    $scope.knownodeList.splice(index, 1);
                })
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


function IndexCtrl($scope, $http, $location) {

}


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


function StaticPageCtrl($scope) {
}


function ConnectionPageCtrl($scope, $http, $routeParams, userService, PassKnownode) {
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
            alert('Not Implemented')
//            $http.delete('/knownodes/:' + id).
//                success(function () {
//                    $scope.knownodeList.splice(index, 1);
//                });
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
ConnectionPageCtrl.$inject = ['$scope', '$http', '$routeParams', 'userService', 'PassKnownode'];


function WikipediaArticleCtrl($scope, $routeParams, wikipedia) {

    var articleTitle = $routeParams.title;

    wikipedia.getArticle(articleTitle).then(function (article) {
        $scope.article = article;
    });

}


function TripletInputCtrl($scope, $rootScope, $q, $route, wikinode, resource, connection) {

    $scope.reversedDirection = false;

    $scope.$watch('concept', function(newValue) {
        if ($scope.startResource == null)
            $scope.startResource = newValue;
    });

    $scope.$on('resourceSelected', function (event, result) {
        event.stopPropagation();
        $scope[result.resourceName] = result.resource;
    });

    $scope.swapResources = function() {
        $scope.reversedDirection = !$scope.reversedDirection;
        var start = $scope.startResource;
        var end = $scope.endResource;
        $scope.startResource = end;
        $scope.endResource = start;
    }

    $scope.bgColor = 'auto-generated';

    $scope.isFormValid = function () {
        return $scope.startResource != null && $scope.endResource != null
            && $scope.connectionTitle.length > 2
            && $scope.connectionType != 'Choose link type';
    };

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
        if ($rootScope.user == null) {
            $scope.submitErrorMessage = "You should be logged in";
            return;
        }
        if (!$scope.isFormValid()) {
            // TODO Make the message more explicit
            $scope.submitErrorMessage = "Invalid Form";
            return;
        }
        $scope.submitted = true;
        // TODO Handle case where connection direction is reversed
        // TODO Cleanup
        if ($scope.startResource.type === 'Wikipedia Article' && $scope.endResource.type === 'Wikipedia Article') {
            // Get both wikinodes and create connection
            $q.all([wikinode.getOrCreate($scope.startResource.title),
                    wikinode.getOrCreate($scope.endResource.title)])
                .then(function (results) {
                    $scope.startResource = results[0].data;
                    $scope.endResource = results[1].data;
                    createConnection($scope.startResource.KN_ID, $scope.endResource.KN_ID)
                });
        } else if ($scope.startResource.type === 'Wikipedia Article') {
            // Get source wikinode and create connection
            wikinode.getOrCreate($scope.startResource.title).success(function (result) {
                $scope.startResource  = result.data;
                createConnection($scope.startResource.KN_ID, $scope.endResource.KN_ID);
            });
        } else if ($scope.endResource.type === 'Wikipedia Article') {
            // Get target wikinode and create connection
            wikinode.getOrCreate($scope.endResource.title).success(function (result) {
                $scope.endResource = result.data;
                createConnection($scope.startResource.KN_ID, $scope.endResource.KN_ID);
            });
        } else {
            createConnection($scope.startResource.KN_ID, $scope.endResource.KN_ID)
        }
    };

    var createConnection = function (currentResource, otherResource) {
        var sourceId, targetId;
        if ($scope.reversedDirection) {
            sourceId = otherResource;
            targetId = currentResource;
        } else {
            sourceId = currentResource;
            targetId = otherResource;
        }
        connection.create(sourceId, $scope.connectionTitle, $scope.connectionType, targetId)
            .success(function (data, status) {
                $route.reload();
            })
            .error(function (data, status) {
                console.log('Connection creation failed with error : ' + status);
                console.log('Error message : ' + data.message);
            });
    };

    $scope.clearOtherResource = function () {
        $scope.endResource = null;
        $('.target-resource-search-box').show();
    };

    $scope.clearStartResource = function () {
        $scope.startResource = null;
        $('.start-resource-search-box').show();
    };

}


function ResourceInputCtrl($scope) {

    $scope.$on('searchResultSelected', function (event, result) {
        event.stopPropagation();
        $scope.resource = result;
        emit();
    });

    function emit() {
        $scope.$emit('resourceSelected', {resourceName: $scope.resourceName, resource: $scope.resource});
    }

    $scope.clear = function() {
        $scope.resource = null;
        emit();
    };
}
ResourceInputCtrl.$inject = ['$scope'];


function SearchBoxCtrl($scope, $timeout, hybridSearch, resource, resourceDialog, scrape) {

    $scope.selectedResult = null;

    var lastQuery = "";
    $scope.searchBoxOptions = {
        width:"off",
        dropdownAutoWidth: true,
        minimumInputLength: 3,
        query: function (query) {
            lastQuery = query.term;
            $timeout(function () {
                if (lastQuery != query.term) return;
                if (query.term.indexOf("http://") == 0 || query.term.indexOf("https://") == 0 || query.term.indexOf("www.") == 0) {
                    resource.findByUrl(query.term)
                        .success(function (data) {
                            query.callback({ results: [
                                { id: data.KN_ID, text: data.title}
                            ]});
                        })
                        .error(function (data, status) {
                            if (status == 404) {
                                scrape.url(query.term)
                                    .success(function (data) {
                                        console.log("scrapeUrl result", data);
                                        query.callback({ results: [
                                            { title: data.title, body: data.body, image: data.image, url: query.term, type: 'Link to Resource', id: "scrape" }
                                        ]});})
                                    .error(function () {
                                        console.log("Cannot scrape URL")
                                        query.callback({ results: [
                                            { id: 'create_data_option_id', text: 'Create Resource: ' + query.term, type: 'Create Resource'}
                                        ]});
                                    });
                            } else {
                                console.log('Resource creation failed with error code : ' + status);
                                console.log('Error message : ' + data.message);
                            }
                        });
                } else {
                    hybridSearch.search(query.term).then(function (results) {
                        var suggestions = {results: []}, i;
                        var addResource = true;
                        // First item is the create resource option
                        for (i = 0; i < results.resources.length; i++) {
                            suggestions.results.push({id: results.resources[i].KN_ID, text: results.resources[i].title});
                            if (query.term.toLowerCase() == results.resources[i].title.toLowerCase()) {
                                addResource = false;
                            }
                            ;
                        }
                        for (i = 0; i < results.wikipediaArticles.length; i++) {
                            suggestions.results.push({id: results.wikipediaArticles[i].title, text: results.wikipediaArticles[i].title, type: 'Wikipedia Article'});
                        }
                        if (addResource == true) {
                            suggestions.results.unshift({id: 'create_data_option_id', title: query.term, text: 'Create Resource : ' + query.term, type: 'Create Resource'});
                        }
                        query.callback(suggestions);
                    });
                }
            }, 500);

        },

        formatResult: function (node) {
            var markup = "<table class='suggestion'><tr>";

            if (node.type === 'Create Resource') {
                markup += "<td class='suggestion-info'><div class='suggestion-title create-resource'>" + node.text + "</div></td>";
            } else if (node.type === "Link to Resource") {
                markup += "<td class='suggestion-info'><div class='suggestion-title create-resource'>Create Resource: " + node.title + "</div>";
                if (node.body === undefined && node.image != null) {
                    markup += "<div class='suggestion-body create-resource scrap-body'><p class='scrap-body-text'></p><img onerror='this.style.display = \"none\"' class='scrap-body-img' src=" + node.image + "></img></div></td>";
                }
                else if (node.body === undefined && node.image === undefined) {
                }
                else if (node.image === undefined) {
                    markup += "<div class='suggestion-body create-resource scrap-body'><p class='scrap-body-text'>" + node.body + "</p></div></td>";
                }
                else {
                    markup += "<div class='suggestion-body create-resource scrap-body'><p class='scrap-body-text'>" + node.body + "</p><img onerror='this.style.display = \"none\"' class='scrap-body-img' src=" + node.image + "></img></div></td>";
                }
            } else {
                markup += "<td class='suggestion-info'><div class='suggestion-title'>" + node.text + "</div></td>";
            }
            if (node.type === 'Wikipedia Article') {
                markup += "<td class='suggestion-image'><img src='img/wikipedia-icon.png'/></td>";
            }
            markup += "</tr></table>"
            return markup;
        }
    };

    $scope.$watch('selectedResult', function () {
        if (isResultSelected()) {
            var result = getSelectedResult();
            switch (result.type) {
                case 'Create Resource':
                    resourceDialog.open(result.title).then(function (createdResource) {
                        createdResource.type = 'Resource';
                        $scope.$emit('searchResultSelected', createdResource);
                    });
                    break;
                case 'Link to Resource':
                    $scope.$emit('searchResultSelected', {
                        title: result.title,
                        bodyText: result.body,
                        url: result.url,
                        type: 'Link to Resource'
                    });
                    break;
                case 'Wikipedia Article':
                    $scope.$emit('searchResultSelected', {
                        id: result.id,
                        title: result.id,
                        type: 'Wikipedia Article'
                    });
                    break;
                default: // Resource
                    $scope.$emit('searchResultSelected', {
                        id: result.id,
                        KN_ID: result.id,
                        title: result.text,
                        type: 'Resource'
                    });
                    break;
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


function ConnectionCtrl($scope) {
    //define a way for a node to know color based on connectionType
    $scope.BgColorClass = 'explain';
    $scope.colorSwitcher = function () {
        switch ($scope.triplet.connection.connectionType) {
            case "explain":
                return 'explain';
                break;
            case "question":
                return 'critique';
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

function VoteCtrl($scope, $http) {
    $scope.upActive = false;
    $scope.downActive = false;

    $scope.vote = function(voteType) {

        if(voteType === "up") {
            $scope.upActive = !$scope.upActive;
            if($scope.upActive == true) {
                $scope.downActive = false;
                $http.post('/vote/voteUp/',{connectionId:$scope.triplet.connection.KN_ID});
                console.log("voteUp")
            }
            if($scope.upActive === false) {
                $scope.downActive = false;
                $scope.upVoteClass = "";
                $http.post('/vote/cancelVote/',{connectionId:$scope.triplet.connection.KN_ID});
                console.log("voteUpCancelled")
            }
        }
        if(voteType == "down") {
            $scope.downActive = !$scope.downActive;
            if($scope.downActive === true) {
                $scope.upActive = false;
                $http.post('/vote/voteDown/',{connectionId:$scope.triplet.connection.KN_ID});
                console.log("voteDown")
            }
            if($scope.downActive === false) {
                $scope.upActive = false;
                $scope.downVoteClass = "";
                $http.post('/vote/cancelVote/',{connectionId:$scope.triplet.connection.KN_ID});
                console.log("voteDownCancelled")
            }
        }

        if($scope.upActive === true) {
            $scope.upVoteClass = "active";
            $scope.downVoteClass = "";
        } else if ($scope.downActive === true){
            $scope.downVoteClass = "active";
            $scope.upVoteClass = "";
        }


    };
}
