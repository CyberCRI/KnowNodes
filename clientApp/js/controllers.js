'use strict';

function TopBarCtrl($rootScope, $scope, $location, resource, userService) {

    $scope.$on('$routeChangeSuccess', function (event, current, previous) {
        var path = $location.path().split('/')[1];
        $scope.mapButton = (path === 'concept' || path === 'article' || path === 'resource');
        $scope.usermapButton = (path === 'user');
        $scope.resourceButton = (current.$route.controller.name === "GraphCtrl");

        $scope.resourceId = current.params.id;

        $scope.currentpath = path;    // checking if we're on the path == graph

        // Load Karma if necessary
        if ($rootScope.user != null && $rootScope.user.karma == null) {
            userService.getLoggedUserKarma($rootScope.user).success(function (response) {
                $rootScope.user.karma = response.karma;
            });
        }
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
                if ($scope.currentpath == 'graph') {
                    $location.path('/graph/' + result.KN_ID);
                }
                else {
                    $location.path('/resource/' + result.KN_ID);
                }
                break;
        }
    });

    $scope.$on('mapNavigated', function (event, result) {
        event.stopPropagation();
        $scope.resourceId = result;
    });
}

function NotificationsCtrl($scope, notification) {

    notification.getNotifications(function (result) {
        $scope.notifications = result;
        var isReadCount = _.countBy(result, function (notification) {
            return notification.alreadyRead;
        });
        $scope.unreadCount = isReadCount.false;
    });

    $scope.getStyle = function (isRead) {
        if (isRead)
            return 'background-color:lightgrey';
        else
            return '';
    };

    $scope.markAllAsRead = function () {
        $scope.unreadCount = 0;
        notification.markAllAsRead();
    }
}

function CreateResourceModalCtrl($scope, dialog, resource) {

    $scope.resourceToCreate = {title: dialog.options.title};

    $scope.close = function () {
        dialog.close();
    };

    $scope.submit = function () {
        if ($scope.files && $scope.files.length > 0) {
            uploadFile();
        } else {
            submitForm();
        }

    };
    function capitaliseFirstLetter(string)
    {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

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
            submitForm();
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

    function submitForm() {
        $scope.submitted = true;
        $scope.resourceToCreate.title = capitaliseFirstLetter($scope.resourceToCreate.title);
        resource.create($scope.resourceToCreate).then(function (createdResource) {
            dialog.close(createdResource);
        });
    }

}

function LoginCtrl($scope, $location, $rootScope, $window, loginModal, userService) {

    $scope.loginForm = {};
    $scope.userForm = {};
    $scope.newUser;
    $scope.submitUser = function (userForm) {
        userService.create(userForm).
            success(function (data, status, headers, config) {
                $scope.loginForm.email = userForm.email;
                $scope.loginForm.password = userForm.password;
                $scope.newUser = true;
                return $scope.performLogin();
            });
    };

    $scope.performLogin = function () {
        userService.login($scope.loginForm).
            then(function (data, status, headers, config) {
                if (data === 'ERROR') {
                    return $scope.loginerror = true;
                }
                $rootScope.user = data;
                if ($scope.newUser === true) {
                    $location.path('/');
                } else {
                    $window.history.back();
                }
            });
    };

    $scope.closeLoginModal = function () {
        loginModal.close();
    };

}


function LogoutCtrl($location, $rootScope, userService) {
    userService.logout().
        success(function (data) {
            if (data.success === 'Logout') {
                $rootScope.user = null;
                $rootScope.userDisplayName = null;
                $location.path('/');
            }
        });
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

function GraphCtrl($scope,$routeParams,$location, userService, resource, wikipedia, wikinode) {


    $scope.goToUrl = function (something) {
        $location.path(something);
    };

    // Sort triplets by default the most recent ones at the top

    $scope.orderProp = "-connection.__CreatedOn__";

    // $scope.orderProp = "-(upvotes-downvotes)";


    // First, check whether the resource is a KN Resource or a Wikipedia Article
    if ($routeParams.id != null) {
        // KN Resource
        resource.get($routeParams.id).then(function (resource) {

            $scope.concept = resource;

            if ($scope.concept.nodeType == 'kn_Post') {


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

            console.log($scope.knownodeList);
            }


        });
    }

    $scope.addNode = false;
    $scope.currentKnownode = {};
    $scope.isUserLoggedIn = userService.isUserLoggedIn();

    $scope.$broadcast('rootNodeExists', {rootNodeExists: true});


    if ($routeParams.userid) {

        var $gexftoopen = '/gexf/userTriplets/' + $routeParams.id + '.gexf';

    }
    else {

        var $gexftoopen = '/gexf/resourceTriplets/' + $routeParams.id + '.gexf';
    }

    $scope.gexftoopen = $gexftoopen;

    $scope.$on('$viewContentLoaded', function() {

        var sigInst = sigma.init(document.getElementById('sigma-example')).drawingProperties({
            defaultLabelColor: '#000',
            defaultLabelSize: 16,
            defaultLabelBGColor: '#fff',
            defaultLabelHoverColor: '#333',
            labelThreshold: 8,
            defaultEdgeType: 'curve'
        }).graphProperties({
                minNodeSize: 3,
                maxNodeSize: 20,
                minEdgeSize: 1,
                maxEdgeSize: 5,
                sideMargin: 10
            }).mouseProperties({
                maxRatio: 32
            });

        // Parse a GEXF encoded file to fill the graph
        // (requires "sigma.parseGexf.js" to be included)

        // If we want to see user's triplets, we request it using path /graph/ID/user
        // Normal concepts are requested using /graph/ID only


            sigInst.parseGexf($gexftoopen);



        // Draw the graph, using ForceAtlas layout, which stops after 3 seconds

        setTimeout (function () {
        sigInst.startForceAtlas2();
        },1000,false);

        setTimeout(function() {
            sigInst.stopForceAtlas2();
        },3000);

        // if no ForceAtlas, launch using
        // sigInst.draw();

        sigInst.iterNodes(function(node) {
            var nodeid = (((node || {}).attr || {}).attributes || []).reduce(function(s, o) {
                if ((o || {}).attr === 'id')
                    return o.val;
                else
                    return s;
            }, null);

            if (nodeid == $routeParams.id) {
                node.color = '#777';
                node.size = node.degree + 3;
            }
            else {
                node.color = '#bbb';
                node.size = node.degree;
            }



        }).draw();
        // Fixes bug where Angular doesn't let Sigma expand its DIV

        requestAnimationFrame(sigInst.resize.bind(sigInst));



        sigInst.bind('downnodes',function(event){
            var node;
            sigInst.iterNodes(function(n){
                node = n;
            },[event.content[0]]);

            var url = (((node || {}).attr || {}).attributes || []).reduce(function(s, o) {
                if ((o || {}).attr === 'id')
                    return o.val;
                else
                    return s;
            }, null);

            if (url)
                window.location = '/graph/' + url;
        });


    });

}


function TripletListCtrl($scope, $routeParams, $location, userService, resource, wikipedia, wikinode) {
    $scope.goToUrl = function (something) {
        $location.path(something);
    };

    // Sort triplets by default the most recent ones at the top

    $scope.orderProp = "-connection.__CreatedOn__";

    // $scope.orderProp = "-(upvotes-downvotes)";


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

    $scope.$broadcast('rootNodeExists', {rootNodeExists: true});

}


function IndexCtrl($scope, userService, $location, triplets) {

    $scope.goToUrl = function (something) {
        $location.path(something);
    };

    $scope.isUserLoggedIn = userService.isUserLoggedIn();
    $scope.knownodeList = {};
    $scope.orderProp = "-(upvotes - downvotes)";
    triplets.hottest().success(function (data, status, headers, config) {
        $scope.knownodeList = data;
    });
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


function commentCtrl($scope, $routeParams, broadcastService, comment) {
    var objectId = $routeParams.id;
    $scope.comments = [];

    comment.findByConnectionId(objectId)
        .success(function (data, status, headers, config) {
            $scope.comments = data;
        });

    $scope.addComment = function () {

    };

    $scope.$on('handleBroadcast', function () {
        $scope.comments.push(broadcastService.message);
    });
}


function addCommentCtrl($scope, $routeParams, userService, broadcastService, comment) {
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

        comment.create($scope.form.comment.bodyText, $scope.form.originalObject.id)
            .success(function (data, status, headers, config) {
                    var comment = data;
                    comment.user = userService.getConnectedUser();
                    broadcastService.prepForBroadcast(comment);
                    $scope.submitMade = true;
                    $scope.form.comment.bodyText = "";
                }).error(function (data, status, headers, config) {
                    console.log("error", data.error);
                    $scope.submitNotMade = false;
                    $scope.error = data.error;
            });
    };
}


function StaticPageCtrl($scope) {
}


function ConnectionPageCtrl($scope, $routeParams, userService, triplet) {
    $scope.isUserLoggedIn = userService.isUserLoggedIn();
    $scope.knownodeList = {};
    triplet.findByConnectionId($routeParams.id).success(function (data) {
        $scope.knownodeList = [data];
    });

}

function TripletInputCtrl($scope, $rootScope, $route, $location, wikinode, resource, connection) {

    $scope.reversedDirection = false;

    $scope.$watch('concept', function (newValue) {
            if(!newValue) return;
            $scope.startResource = $scope.startResource || newValue;
            $scope.tutorialText = $scope.tutorialText || {};
            $scope.tutorialText.startResource = "This is the resource " + $scope.startResource.title;
            $scope.tutorialText.connection = "Here you describe how "+ $scope.startResource.title+" is connected to the second resource.";
            $scope.tutorialText.endResource = "Here you enter the name of the resource to connect with " + $scope.startResource.title;

    });

    $scope.$on('resourceSelected', function (event, result) {
        event.stopPropagation();
        $scope[result.resourceName] = result.resource;
    });

    $scope.swapResources = function () {
        $scope.reversedDirection = !$scope.reversedDirection;
        var start = $scope.startResource;
        var end = $scope.endResource;
        $scope.startResource = end;
        $scope.endResource = start;
    }

    $scope.bgColor = 'explain';

    $scope.isFormValid = function () {
        return $scope.startResource != null && $scope.endResource != null
            && $scope.connectionTitle.length > 2
            && $scope.connectionType != 'Choose link type';
    };

    $scope.connectionTitle = '';

    $scope.dropText = 'Drop files here...';
    $scope.errorMessage = null;
    $scope.reversedDirection = false;
    $scope.connectionType = 'explain';
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
        formatStartResource();
    };

    function formatStartResource() {


        if ($scope.startResource.type === 'Wikipedia Article') {
            // Get source wikinode and create connection
            wikinode.getOrCreate($scope.startResource.title).success(function (createdStartResource) {
                $scope.startResource = createdStartResource;
                formatEndResource();
            });
        } else if ($scope.startResource.type === 'Link to Resource') {
            // create url resource and create connection
            delete $scope.startResource.type; // type is used only client-side, should not be persisted
            resource.create($scope.startResource).then(function (createdStartResource) {
                $scope.startResource = createdStartResource;
                formatEndResource();

            });
        } else {
            formatEndResource();
        }
    };

    function formatEndResource() {

        if ($scope.endResource.type === 'Wikipedia Article') {
            // Get target wikinode and create connection
            wikinode.getOrCreate($scope.endResource.title).success(function (createdEndResource) {
                $scope.endResource = createdEndResource;
                createConnection();
            });
        } else if ($scope.endResource.type === 'Link to Resource') {
            // create url resource and create connection
            delete $scope.endResource.type; // type is used only client-side, should not be persisted
            resource.create($scope.endResource).then(function (createdEndResource) {
                $scope.endResource = createdEndResource;
                createConnection();

            });
        } else {
            createConnection();
        }
    };

    function createConnection() {

        var startResourceId = $scope.startResource.KN_ID;
        var endResourceId = $scope.endResource.KN_ID;
        console.log("startID: ", startResourceId, "endId: ", endResourceId);
        connection.create(startResourceId, $scope.connectionTitle, $scope.connectionType, endResourceId)
            .success(function (data, status) {
                var path = $location.path().split('/')[1];
                if (path === "graph") {
                    // Are we on the graph view page? If yes, reload the graph (cant use route.reload because of Angular conflict
                    window.location = '/graph/' + $scope.startResource.KN_ID;
                }
                else {
                    // When a user adds a new connection, they get redirected to their user page to see most recent ones
                    window.location = '/user/' + $rootScope.user.KN_ID + '/' + $scope.startResource.KN_ID;

                    // If you want that instead the resource page reloads, use this:
                    // The below directive calls for an Angular reload and it might not work well for Sigma graph view
                    // $route.reload();
                }


            })
            .error(function (data, status) {
                console.log('Connection creation failed with error : ' + status);
                console.log('Error message : ' + data.message);
            });
    };

    $scope.activeSwitch = function(item) {
        return item === "active-input" ? 'active-input' : undefined;
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

    $scope.clear = function () {
        $scope.resource = null;
        emit();
    };
}

function SearchBoxCtrl($scope, $timeout, hybridSearch, resource, resourceModal, scrape) {

    $scope.selectedResult = null;

    var lastQuery = "";
    $scope.searchBoxOptions = {
        width: "off",
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
                                        query.callback({ results: [
                                            { title: data.title, body: data.body, image: data.image, url: query.term, type: 'Link to Resource', id: "scrape" }
                                        ]});
                                    })
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
                            suggestions.results.push({
                                id: results.resources[i].KN_ID,
                                text: results.resources[i].title,
                                type: 'Knownodes resource',
                                snippet: results.resources[i].bodyText
                            });
                            if (query.term.toLowerCase() == results.resources[i].title.toLowerCase()) {
                                addResource = false;
                            }
                            ;
                        }
                        for (i = 0; i < results.wikipediaArticles.length; i++) {
                            suggestions.results.push({
                                id: results.wikipediaArticles[i].title,
                                text: results.wikipediaArticles[i].title,
                                type: 'Wikipedia Article',
                                snippet: results.wikipediaArticles[i].snippet
                            });
                        }
                        if (addResource == true) {
                            suggestions.results.unshift({
                                id: 'create_data_option_id',
                                title: query.term,
                                text: 'Create Resource : ' + query.term,
                                type: 'Create Resource'});
                        }
                        query.callback(suggestions);
                    });
                }
            }, 500);

        },

        formatResult: function (node) {
            $(function () {
                $('.tip').tooltip();
            });

            function strip(html) {
                var tmp = document.createElement("DIV");
                tmp.innerHTML = html;
                return tmp.textContent || tmp.innerText || "";
            }

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
                else if (node.image === null) {
                    markup += "<div class='suggestion-body create-resource scrap-body tip'>" + node.body + "</p></div></td>";
                }
                else {
                    markup += "<div class='suggestion-body create-resource scrap-body'>" + node.body + "</p><img onerror='this.style.display = \"none\"' class='scrap-body-img' src=" + node.image + "></img></div></td>";
                }
            } else if (node.snippet === undefined) {
                markup += "<td class='suggestion-info'><div class='suggestion-title' data-placement='right'>" + node.text + "</div></td>";
            }
            else {
                markup += "<td class='suggestion-info'><div class='suggestion-title tip' data-toggle='tooltip' data-placement='right' data-original-title='" + strip(node.snippet) + "'>" + node.text + "</div></td>";
            }
            if (node.type === 'Wikipedia Article') {
                markup += "<td class='suggestion-image'><img src='img/wikipedia-icon.png' style='height:1.5em; max-width:none; position: absolute; right: 5px;'/></td>";
            }
            if (node.type === 'Knownodes resource') {
                markup += "<td class='suggestion-image'><img src='img/knownodes-logo.png' style='height:1.5em; max-width:none; position: absolute; right: 5px;'/></td>";
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
                    resourceModal.open(result.title).then(function (createdResource) {
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


function ConnectionCtrl($scope, $location) {

    $scope.goToUrl = function (something) {
        $location.path(something);
    };
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
            case "critique":
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

function VoteCtrl($scope, $http, loginModal) {

    $scope.upActive = false;
    $scope.downActive = false;
    //$scope.openLoginModal = function(){
    //    loginModal.open();
    //};

    //$scope.closeLoginModal = function(){
    //    loginModal.close();
    //};

    $scope.showPrompt = function () {
        $scope.prompt = true;
    };

    if ($scope.triplet.userUpvoted) {
        $scope.upVoteClass = "active";
        $scope.upActive = true;
        $scope.triplet.upvotes += 1;
    } else {
        $scope.upVoteClass = "";
    }

    if ($scope.triplet.userDownvoted) {
        $scope.downVoteClass = "active";
        $scope.downActive = true;
        $scope.triplet.downvotes += 1;
    } else {
        $scope.downVoteClass = "";
    }

    $scope.vote = function (voteType) {

        if (voteType === "up") {
            $scope.upActive = !$scope.upActive;
            if ($scope.upActive === true) {
                $scope.downActive = false;
                console.log("up+vote:", $scope.triplet.connection.KN_ID);
                $http.post('/vote/voteUp/', {connectionId: $scope.triplet.connection.KN_ID});
                $scope.triplet.upvotes += 1;
            }
            if ($scope.upActive === false) {
                $scope.downActive = false;
                $scope.upVoteClass = "";
                console.log("cancel+vote:", $scope.triplet.connection.KN_ID);
                $http.post('/vote/cancelVote/', {connectionId: $scope.triplet.connection.KN_ID});
                $scope.triplet.upvotes -= 1;
            }
        }
        if (voteType === "down") {
            $scope.downActive = !$scope.downActive;
            if ($scope.downActive === true) {
                $scope.upActive = false;
                $http.post('/vote/voteDown/', {connectionId: $scope.triplet.connection.KN_ID});
                $scope.triplet.downvotes += 1;
            }
            if ($scope.downActive === false) {
                $scope.upActive = false;
                $scope.downVoteClass = "";
                $http.post('/vote/cancelVote/', {connectionId: $scope.triplet.connection.KN_ID});
                $scope.triplet.downvotes -= 1;
            }
        }

        if ($scope.upActive === true) {
            $scope.upVoteClass = "active";
            $scope.downVoteClass = "";
        } else if ($scope.downActive === true) {
            $scope.downVoteClass = "active";
            $scope.upVoteClass = "";
        }


    };
}

function UserProfilePageCtrl($scope, $location, $routeParams, resource, userService, triplet) {

    $scope.knownodeList = {};
    $scope.isUserLoggedIn = userService.isUserLoggedIn();

    triplet.findByUserId($routeParams.id).success(function (data) {
        $scope.knownodeList = data;
        userService.getUserKarma($scope.knownodeList[0].connection.creator.KN_ID).success(function (response) {
            $scope.userKarma = response.karma;
        });
    });

    $scope.goToUrl = function (something) {
        $location.path(something);
    };

    // Default sorting order for User's connections: can be Most Popular -(upvotes - downvotes) or Most Recent -connection.__CreatedOn__

    $scope.orderProp = "-connection.__CreatedOn__";
    // Load the resource from which the User came to their Profile page as the StartResource for the Triplet

    if ($routeParams.rid) {
        // First, check whether the resource is a KN Resource or a Wikipedia Article
        // KN Resource
        resource.get($routeParams.rid).then(function (resource) {
            $scope.startResource = resource;
        });
    }

}

function InfoLineCtrl($scope, userService, $http, shareModal) {

    $scope.openShareModal = function () {
        $scope.sharedConnection = {};
        $scope.sharedConnection.title = $scope.triplet.startResource.title + " " + $scope.triplet.connection.title + " " + $scope.triplet.endResource.title;
        $scope.sharedConnection.KN_ID = $scope.triplet.connection.KN_ID;
        console.log("kn_id", $scope.triplet.connection.KN_ID);
        shareModal.open($scope.sharedConnection);
    }


    $scope.checkOwnership = function (ownerId) {
        if (userService.isUserLoggedIn()) {
            return ownerId === userService.getConnectedUser().KN_ID;
        }
        return false;
    }
    $scope.deleteConnection = function (id, index) {
        console.log(index);
        if (confirm("Are you sure you want to delete this connection? " + $scope.triplet.startResource.title + " " + $scope.triplet.connection.title + " " + $scope.triplet.endResource.title)) {
            $http.delete('/connections/' + $scope.triplet.connection.KN_ID).success(function (data, status, headers, config) {
                console.log(data);
                alert("the connection has been successfully deleted");
                if (data == "forceDelete") {
                    alert("the connection has been successfully deleted");
                    console.log($scope.knownodeList);
                    console.log(index);
                    $scope.knownodeList.splice(index, 1);
                    console.log($scope.knownodeList);
                    $scope.$apply();
                } else if (data === "disown") {
                    alert("Connection is now disowned. It isn't completely deleted, since stuff has already been connected or commented on it");
                    $scope.knownodeList[index].connection.creator.firstName = "DELETED";
                    $scope.triplet.connection.creator.lastName = "";
                }

            });
        }
    }
}

function ShareConnectionModalCtrl($scope, dialog) {

    $scope.title = {title: dialog.options.title};
    $scope.connectionURL = {url: dialog.options.url};
    $scope.close = function () {
        dialog.close();
    };

}