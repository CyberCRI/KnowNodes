var NODES_PER_LAYER = 6;

var Renderer = {};

Renderer.init = function(canvasId, centralNodeData, childrenNodesData){
    Renderer.engine.initParticleSystem();
    Renderer.canvas.init(canvasId);

    Renderer.engine.jsonOriginData = centralNodeData;
    Renderer.engine.jsonChildrenData = childrenNodesData;

    Renderer.layers.count = Math.ceil(Renderer.engine.jsonChildrenData.length / NODES_PER_LAYER);

    Renderer.canvas.resize();

    Renderer.engine.particleSystem.renderer = Renderer.loop;
    Renderer.nodes.central = new Renderer.Node(Renderer.engine.jsonOriginData);
    Renderer.layers.init();
    Renderer.layers.display(0);
};

Renderer.engine = {};
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
    this.stage.add(Renderer.layers.layer);
};
Renderer.canvas.resize = function(){
    var div = $(".ui-layout-center");
    Renderer.engine.particleSystem.screenSize(div.width(), div.height());
    Renderer.engine.particleSystem.screenPadding(80,200,80,80);
    this.stage.setSize(div.width(), div.height());
    Renderer.loop.redraw();
};

Renderer.Layer = function(id){
    this.id = id;
    this.shape = new Kinetic.Rect({
        width: this.width,
        height: this.height,
        x: 0,
        y: id * (this.height + 3) + 20,
        fill: "white"
    });
    this.checkAndSetColor();
    this.shape.layer = this;
    Renderer.layers.layer.add(this.shape);
    this.bindEvents();
    console.log(this.id);
};
Renderer.Layer.prototype = {
    width: 50,
    height: 20,
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
        Renderer.layers.display(this.layer.id);
    },
    checkAndSetColor: function(){
        if(this.id === Renderer.layers.current)
            this.shape.setAttrs({
                fillR: 150,
                fillG: 150,
                fillB: 150
            });
    }
};
Renderer.layers = {};
Renderer.layers.count = 0;
Renderer.layers.current = -1;
Renderer.layers.layer = new Kinetic.Layer({});
Renderer.layers.init = function(){
    for(var i = 0; i < this.count; i++) {
        new Renderer.Layer(i);
    }
};
Renderer.layers.display = function(layer){
    if(layer !== this.current){
        this.current = layer;

        var edges = Renderer.engine.particleSystem.getEdgesFrom(Renderer.nodes.central.node);
        for(var edge in edges)
            Renderer.engine.particleSystem.pruneNode(edges[edge].target);

        for(var i = this.current * NODES_PER_LAYER; i < (this.current + 1) * NODES_PER_LAYER && i < Renderer.engine.jsonChildrenData.length; i++){
            var node = new Renderer.Node(Renderer.engine.jsonChildrenData[i].article);
            new Renderer.Edge(Renderer.nodes.central, node, Renderer.engine.jsonChildrenData[i].connection);
        }
    }
};

Renderer.Node = function(data){
    this.data = data;
    this.displayGroup = new  Kinetic.Group({x:-200, y:-200});
    this.displayPolygon = this.newPolygon();
    this.displayText = this.newText();
    this.node =  Renderer.engine.particleSystem.addNode(this.data.id, {node: this});
    this.displayPolygon.node = this;
    Renderer.nodes.layer.add(this.displayGroup);
    this.tweenPolygonHover = new Kinetic.Tween({
        node: this.displayPolygon,
        duration: 1,
        easing: Kinetic.Easings['StrongEaseOut'],
        fillB: 200,
        scaleX: 2,
        scaleY: 2,
        strokeWidth: 5
    });
    this.tweenTextHover = new Kinetic.Tween({
        node: this.displayText,
        duration: 1,
        easing: Kinetic.Easings['StrongEaseOut'],
        fontSize: 18,
        x: 80,
        y: -20,
        width: 300
    });
    this.bindEvents();
};
Renderer.Node.prototype = {
    shape: [[26,15],[0,30],[-26,15],[-26,-15],[0,-30],[26,-15]],
    delete: function(){
        this.displayGroup.destroy();
        Renderer.engine.particleSystem.originalPruneNode(this.node);
        delete this;
    },
    newPolygon: function(){
        var polygon = new Kinetic.Polygon({
            points: this.shape,
            fill: "black",
            stroke: "white",
            strokeWidth: 3
        });
        polygon.node = this;
        this.displayGroup.add(polygon);
        return polygon;
    },
    newText: function(){
        var text = new Kinetic.Text({
            text: this.data.title,
            fill: "white",
            width: 120
        });
        text.node = this;
        this.displayGroup.add(text);
        text.setPosition(31, -5);
        return text;
    },
    moveTo: function (pos){
        this.displayGroup.setPosition(pos.x, pos.y);
    },
    bindEvents: function(){
        this.displayPolygon.on('mouseover', this.mouseOver);
        this.displayPolygon.on('mouseout', this.mouseOut);
        this.displayPolygon.on('click', this.mouseClick);
    },
    mouseOver: function(){
       this.node.tweenPolygonHover.play();
       this.node.tweenTextHover.play();
    },
    mouseOut: function(){
        this.node.tweenPolygonHover.reverse();
        this.node.tweenTextHover.reverse();
    },
    mouseClick: function(){
        Renderer.nodes.selected = this.node;
        var data = this.node.data;
        $("#node-link").attr('href', data.url).text(data.title);
        $("#node-content").text(data.bodyText);
        PanelsHandler.layout.open("west");
    }
};

Renderer.nodes = {};
Renderer.nodes.selected = null;
Renderer.nodes.central = null;
Renderer.nodes.layer = new Kinetic.Layer({});

Renderer.Edge = function(from, to, data){
    this.from = from;
    this.to = to;
    this.data = data;
    this.edge = Renderer.engine.particleSystem.addEdge(from.node, to.node, {edge: this});
    this.line = this.newLine();

    this.bindEvents();
};
Renderer.Edge.prototype = {
    delete: function(){
        this.line.destroy();
        Renderer.engine.particleSystem.originalPruneEdge(this.edge);
        delete this;
    },
    newLine: function(){
        var line =  new Kinetic.Line({
            points: [0,0,0,0],
            stroke: "gray",
            strokeWidth: 2
        });
        line.edge = this;
        Renderer.edges.layer.add(line);
        return line;
    },
    bindEvents: function(){
        this.line.on("mouseover", this.mouseOver);
        this.line.on("mouseout", this.mouseOut);
    },
    moveTo: function(pos1, pos2){
        this.line.setAttr('points',[pos1,pos2]);
    },
    mouseOver: function(){
        new Kinetic.Tween({
            node: this,
            duration: 1,
            easing: Kinetic.Easings['StrongEaseOut'],
            strokeWidth: 5
        }).play();
    },
    mouseOut: function(){
        new Kinetic.Tween({
            node: this,
            duration: 1,
            easing: Kinetic.Easings['StrongEaseOut'],
            strokeWidth: 2
        }).play();
    }
};
Renderer.edges = {};
Renderer.edges.layer = new Kinetic.Layer({});

Renderer.loop = {}
Renderer.loop.init = function(){};
Renderer.loop.redraw = function(){
    Renderer.engine.particleSystem.eachEdge(function(edge, pt1, pt2){
        edge.data.edge.moveTo(pt1, pt2);
    });
    Renderer.engine.particleSystem.eachNode(function(node, pt){
        node.data.node.moveTo(pt);
    });
    Renderer.canvas.stage.draw();
};
