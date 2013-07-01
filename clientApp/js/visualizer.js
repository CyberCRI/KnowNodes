var NODES_PER_PAGE = 6;

var Renderer = {};


/**
 * Arbor manages location of nodes and length of edges in the graph
 * Kinetic manages visual effects (tween, color, animation...)
 *
 * aNode, aEdge: arbor nodes and edges
 * kNode: kinetic nodes
 *
 * Node contains:
 *      pointer to aNode
 *          which contains pointer to Node
 *      pointer to kNode
 *          which contains pointer to Node
 *
 * _Example use_
 * node.data.aNode
 * node.data.kNodePolygon
 *
 * aNode.data.node
 * kNodePolygon.node
 *
 *
 */

Renderer.init = function(canvasId, resourceId, navigationListener){
    Renderer.engine.initParticleSystem();
    Renderer.canvas.init(canvasId);

    Renderer.engine.centerOn(resourceId, function(centralNodeData, childrenNodesData) {
        Renderer.engine.jsonOriginData = centralNodeData;
        Renderer.engine.jsonChildrenData = childrenNodesData;

        Renderer.pages.count = Math.ceil(Renderer.engine.jsonChildrenData.length / NODES_PER_PAGE);

        Renderer.canvas.resize();

        Renderer.engine.particleSystem.renderer = Renderer.loop;
        Renderer.nodes.central = new Renderer.Node(Renderer.engine.jsonOriginData);
        Renderer.nodes.displayInTab(Renderer.nodes.central);
        Renderer.pages.init();
        Renderer.pages.display(0);
        Renderer.navigation.navigationListener = navigationListener;
    });
};

Renderer.navigation = {};

Renderer.http = {
    getData: function(resourceId, callback) {
        $.get('/knownodes/:' + resourceId, function(centralNode) {
            $.get('/concepts/:' + resourceId + '/getRelatedKnownodes', function(relatedNodes) {
                callback(centralNode.success, relatedNodes.success);
            });
        });
    }
};

Renderer.engine = {};
Renderer.engine.centerOn = function(resourceId, callback) {
    Renderer.http.getData(resourceId, function(centralNodeData, childrenNodesData) {
        if(callback) callback(centralNodeData, childrenNodesData);
    });
}
Renderer.engine.particleSystem = null;
Renderer.engine.jsonOriginData = null;
Renderer.engine.jsonChildrenData = null;
Renderer.engine.isReady = function(){
    return Renderer.engine.particleSystem !== null && Renderer.canvas.stage !== null;
};

Renderer.engine.initParticleSystem = function(){
    this.particleSystem = arbor.ParticleSystem(1000, 600, 0.5);// create the system with sensible repulsion/stiffness/friction
    this.particleSystem.parameters({gravity:true}); // use center-gravity to make the graph settle nicely (ymmv)
    this.particleSystem.fps(40);

    this.particleSystem.originalPruneEdge = this.particleSystem.pruneEdge;
    this.particleSystem.pruneEdge = function(e){e.data.edge.delete();};
    this.particleSystem.originalPruneNode = this.particleSystem.pruneNode;
    this.particleSystem.pruneNode = function(e){e.data.node.delete();};
};

Renderer.canvas = {};
Renderer.canvas.stage = null;
Renderer.canvas.init = function(canvasId){
    this.stage = new Kinetic.Stage({
        container: canvasId,
        width: 800,
        height: 600,
        fill: "black"
    });
    this.stage.add(Renderer.edges.layer);
    this.stage.add(Renderer.nodes.layer);
    this.stage.add(Renderer.pages.layer);
};
Renderer.canvas.resize = function(){
    var div = $(".ui-layout-center");
    Renderer.engine.particleSystem.screenSize(div.width(), div.height());
    Renderer.engine.particleSystem.screenPadding(80,200,80,80);
    this.stage.setSize(div.width(), div.height());
    Renderer.loop.redraw();
};

Renderer.Page = function(id){
    this.id = id;
    this.shape = new Kinetic.Rect({
        width: this.width,
        height: this.height,
        x: 0,
        y: id * (this.height + 3) + 20,
        fill: "white"
    });
    this.checkAndSetColor();
    this.shape.page = this;
    Renderer.pages.layer.add(this.shape);
    this.bindEvents();
    Renderer.pages.list.push(this);
};
Renderer.Page.prototype = {
    width: 50,
    height: 20,
    delete: function(){
        this.shape.destroy();
        delete this;
    },
    bindEvents: function(){
        this.shape.on('click', this.mouseClick);
        this.shape.on('mouseover', this.mouseOver);
        this.shape.on('mouseout', this.mouseOut);
    },
    mouseOver: function(e){
        new Kinetic.Tween({
            node: this,
            easing: Kinetic.Easings['StrongEaseOut'],
            duration: 0.5,
            scaleX: 1.3
        }).play();
    },
    mouseOut: function(e){
        new Kinetic.Tween({
            node: this,
            easing: Kinetic.Easings['StrongEaseOut'],
            duration: 1,
            scaleX: 1
        }).play();
    },
    mouseClick: function(e){
        Renderer.pages.display(this.page.id);
    },
    checkAndSetColor: function(){
        var intensity = 255;
        if(this.id === Renderer.pages.current)
            intensity = 150;

        this.shape.setAttrs({
            fillR: intensity,
            fillG: intensity,
            fillB: intensity
        });
    }
};
Renderer.pages = {};
Renderer.pages.list = [];
Renderer.pages.current = -1;
Renderer.pages.layer = new Kinetic.Layer({});
Renderer.pages.init = function(){
    for(var page in this.list){
        this.list[page].delete();
    }
    this.list = [];
    for(var i = 0; i < this.count; i++) {
        new Renderer.Page(i);
    }
};
Renderer.pages.display = function(page){
    if(page !== this.current){
        this.current = page;
        for (var pageId in this.list) {
            this.list[pageId].checkAndSetColor();
        }

        //TODO fix orientation problem:
        //either merge getEdgesFrom's and getEdgesTo's results and prune all nodes except the central node;
        //or, repeat following code with getEdgesTo and aEdges[aEdge].source
        var aEdges = Renderer.engine.particleSystem.getEdgesFrom(Renderer.nodes.central.aNode);
        for(var aEdge in aEdges)
            Renderer.engine.particleSystem.pruneNode(aEdges[aEdge].target);

        for(var i = this.current * NODES_PER_PAGE; i < (this.current + 1) * NODES_PER_PAGE && i < Renderer.engine.jsonChildrenData.length; i++){
            var node = new Renderer.Node(Renderer.engine.jsonChildrenData[i].article);
            new Renderer.Edge(Renderer.nodes.central, node, Renderer.engine.jsonChildrenData[i].connection);
        }
    }
};

Renderer.Node = function(data){
    this.data = data;
    this.kNodeGroup = new  Kinetic.Group({x:-200, y:-200});
    this.kNodePolygon = this.newPolygon();
    this.kNodeText = this.newText();
    this.aNode =  Renderer.engine.particleSystem.addNode(this.data.id, {node: this});
    this.kNodePolygon.node = this;
    Renderer.nodes.layer.add(this.kNodeGroup);
    this.tweenPolygonHover = new Kinetic.Tween({
        node: this.kNodePolygon,
        duration: 0.3,
        easing: Kinetic.Easings['StrongEaseOut'],
        fillB: 200,
        scaleX: 1.1,
        scaleY: 1.1,
        strokeWidth: 5
    });
    this.tweenTextHover = new Kinetic.Tween({
        node: this.kNodeText,
        duration: 0.3,
        easing: Kinetic.Easings['StrongEaseOut'],
        fontSize: 20,
        x: 38,
        y: -6,
        width: 300
    });
    this.bindEvents();
};
Renderer.Node.prototype = {
    shape: [[26,15],[0,30],[-26,15],[-26,-15],[0,-30],[26,-15]],
    delete: function(){
        this.kNodeGroup.destroy();
        Renderer.engine.particleSystem.originalPruneNode(this.aNode);
        delete this;
    },
    newPolygon: function(){
        var kNodepolygon = new Kinetic.Polygon({
            points: this.shape,
            fill: "black",
            stroke: "white",
            strokeWidth: 3
        });
        kNodepolygon.node = this;
        this.kNodeGroup.add(kNodepolygon);
        this.kNodeGroup.kNodepolygon = kNodepolygon;
        return kNodepolygon;
    },
    newText: function(){
        var kNodeText = new Kinetic.Text({
            text: this.data.title,
            fill: "white",
            width: 120,
            fontSize: 16
        });
        kNodeText.node = this;
        this.kNodeGroup.add(kNodeText);
        kNodeText.setPosition(31, -5);
        return kNodeText;
    },
    moveTo: function (pos){
        this.kNodeGroup.setPosition(pos.x, pos.y);
    },
    bindEvents: function(){
        this.kNodePolygon.on('mouseover', this.mouseOver);
        this.kNodePolygon.on('mouseout', this.mouseOut);
        this.kNodePolygon.on('click', this.mouseClick);
    },
    mouseClick: function() {
        var id = this.node.data.KN_ID;
        if(id === Renderer.nodes.central.data.KN_ID) return;
        Renderer.engine.centerOn(id, function(centralNodeData, childrenNodesData) {

            Renderer.engine.jsonOriginData = centralNodeData;
            Renderer.engine.jsonChildrenData = childrenNodesData;
            Renderer.navigation.navigationListener(id);

            var aEdges = Renderer.engine.particleSystem.getEdgesFrom(Renderer.nodes.central.aNode);
            var newCentral;
            for(var aEdge in aEdges) {
                var aNode = aEdges[aEdge].target;
                if(aNode.data.node.data.KN_ID !== id) {
                    Renderer.engine.particleSystem.pruneNode(aNode);
                } else {
                    newCentral = aNode.data.node;
                }
            }

            // TODO manage case when user quickly navigates from a child node to another child node without waiting for the graph to be updated.
            // Either reload graph, or retrieve stored data, or design safe process.
            Renderer.nodes.central.delete();

            Renderer.nodes.central = newCentral;

            Renderer.pages.count = Math.ceil(Renderer.engine.jsonChildrenData.length / NODES_PER_PAGE);

            Renderer.pages.init();
            Renderer.pages.current = -1;
            Renderer.pages.display(0);
        });
    },
    mouseOver: function(){
        mouseOverKNode(this);
        Renderer.nodes.displayInTab(this.node);
    },
    mouseOut: function(){
        mouseOutKNode(this);
    }
};

//TODO should be put inside Renderer.Node
mouseOverKNode = function(kNode){
    console.log("mouseOverKNode:");
    console.log(kNode);
    kNode.node.tweenPolygonHover.play();
    kNode.node.tweenTextHover.play();
}

//TODO should be put inside Renderer.Node
mouseOutKNode = function(kNode){
    kNode.node.tweenPolygonHover.reverse();
    kNode.node.tweenTextHover.reverse();
}

Renderer.nodes = {};
Renderer.nodes.central = null;
Renderer.nodes.layer = new Kinetic.Layer({});

Renderer.nodes.displayInTab = function(node){
    var data = node.data;
    $("#node-link").attr('href', data.url).text(data.title);
    $("#node-content").html(data.bodyText);
    $("#node-end").text("");

    PanelsHandler.layout.open("west");
}

//connection
Renderer.Edge = function(from, to, data){
    this.fromNode = from;
    this.toNode = to;
    this.data = data;
    this.aEdge = Renderer.engine.particleSystem.addEdge(from.aNode, to.aNode, {edge: this});
    this.kConnectionGroup = this.newConnectionGroup(this);

    this.bindEvents();
};
Renderer.Edge.prototype = {
    delete: function(){
        this.kConnectionGroup.destroy();
        Renderer.engine.particleSystem.originalPruneEdge(this.aEdge);
        delete this;
    },
    newConnectionGroup: function(connection){
        var connectionType = connection.data.connectionType;
        var color = "white";
        if (connectionType === "explain") {
            color = '#1C75BC';
        } else if (connectionType === "inspire") {
            color = '#FFDE17';
        } else if (connectionType === "question") {
            color = '#39B54A';
        } else if (connectionType === "Wikipedia Link") {
            color = "gray";
        }

        var kConnectionGroup = new  Kinetic.Group({x:0, y:0});

        kConnectionGroup.kArrow =  new Kinetic.Polygon({
            points: [0,0,0,0],
            stroke: color,
            strokeWidth: 2,
            fill: color
        });
        kConnectionGroup.kHoverRectangle = new Kinetic.Polygon({
            points: [0,0,0,0],
            stroke: "green",
            strokeWidth: 2,
            fill: "red",
            opacity: 0
            //visible: false
        });

        //first will be below the second
        kConnectionGroup.add(kConnectionGroup.kArrow);
        kConnectionGroup.add(kConnectionGroup.kHoverRectangle);

        //TODO refactor
        kConnectionGroup.kHoverRectangle.kArrow = kConnectionGroup.kArrow;
        kConnectionGroup.kHoverRectangle.connection = connection;

        Renderer.edges.layer.add(kConnectionGroup);
        return kConnectionGroup;
    },
    bindEvents: function(){
        this.kConnectionGroup.kHoverRectangle.on("mouseover", this.mouseOver);
        this.kConnectionGroup.kHoverRectangle.on("mouseout", this.mouseOut);
    },
    moveTo: function(pos1, pos2){

        function generatePoints(fromx, fromy, tox, toy){
            var hexagon = 30;
            var headlen = 12;
            var headlen2 = 6;
            var angle = Math.atan2(toy-fromy,tox-fromx);

            var newTox = tox-hexagon*Math.cos(angle);
            var newToy = toy-hexagon*Math.sin(angle);

            return [fromx, fromy
                ,newTox,newToy
                ,newTox-headlen*Math.cos(angle-Math.PI/6),newToy-headlen*Math.sin(angle-Math.PI/6)
                ,newTox-headlen2*Math.cos(angle),newToy-headlen2*Math.sin(angle)
                ,newTox-headlen*Math.cos(angle+Math.PI/6),newToy-headlen*Math.sin(angle+Math.PI/6)
                ,newTox,newToy
            ];
        }

        var points = generatePoints(pos1.x, pos1.y, pos2.x, pos2.y);

        this.kConnectionGroup.kArrow.setAttr('points',points);


        function generateHoverRectangle(fromx, fromy, tox, toy){
            var rectangleWidth = 30;
            var angle = Math.atan2(toy-fromy,tox-fromx);

            return [fromx, fromy
                ,fromx+Math.sin(angle)*rectangleWidth/2, fromy-Math.cos(angle)*rectangleWidth/2
                ,tox+Math.sin(angle)*rectangleWidth/2, toy-Math.cos(angle)*rectangleWidth/2
                ,tox-Math.sin(angle)*rectangleWidth/2, toy+Math.cos(angle)*rectangleWidth/2
                ,fromx-Math.sin(angle)*rectangleWidth/2, fromy+Math.cos(angle)*rectangleWidth/2
                ,fromx, fromy
            ];
        }

        var points = generateHoverRectangle(pos1.x, pos1.y, pos2.x, pos2.y);

        this.kConnectionGroup.kHoverRectangle.setAttr('points',points);


    },
    mouseOver: function(){
        new Kinetic.Tween({
            node: this.kArrow,
            duration: 1,
            easing: Kinetic.Easings['StrongEaseOut'],
            strokeWidth: 5
        }).play();

        console.log("mouseOver:");
        mouseOverKNode(this.connection.fromNode.kNodeGroup.kNodepolygon);
        mouseOverKNode(this.connection.toNode.kNodeGroup.kNodepolygon);

        //TODO use this.connection's data to display proper KnowNode in the left tab
        $("#node-link").attr('href', this.connection.fromNode.data.url).text(this.connection.fromNode.data.title);
        $("#node-content").text(this.connection.data.title);
        $("#node-end").attr('href', this.connection.toNode.data.url).text(this.connection.toNode.data.title);

        PanelsHandler.layout.open("west");

        console.log(this.connection)
    },
    mouseOut: function(){
        new Kinetic.Tween({
            node: this.kArrow,
            duration: 1,
            easing: Kinetic.Easings['StrongEaseOut'],
            strokeWidth: 2
        }).play();

        //TODO should be called by this.connection.fromNode.mouseOutKNode()
        mouseOutKNode(this.connection.fromNode.kNodeGroup.kNodepolygon);
        mouseOutKNode(this.connection.toNode.kNodeGroup.kNodepolygon);
    }
};
Renderer.edges = {};
Renderer.edges.layer = new Kinetic.Layer({});

Renderer.loop = {}
Renderer.loop.init = function(){};
Renderer.loop.redraw = function(){
    //pt1 is centralNode
    Renderer.engine.particleSystem.eachEdge(function(aEdge, pt1, pt2){
        if(aEdge.data.edge.data.fromNodeId === Renderer.engine.jsonOriginData.id) {
            aEdge.data.edge.moveTo(pt1, pt2);
        } else {
            aEdge.data.edge.moveTo(pt2, pt1);
        }
    });
    Renderer.engine.particleSystem.eachNode(function(aNode, pt){
        aNode.data.node.moveTo(pt);
    });
    Renderer.canvas.stage.draw();
};
