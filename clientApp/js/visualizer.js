var NODES_PER_LAYER = 3;

var Renderer = function(canvasId, centralNode, relatedNodes){
    var canvas = $(canvasId).get(0);
    var ctx = canvas.getContext("2d");
    var sys = null;

    var hovered = null;
    var nearest = null;
    var _mouseP = null;

    var hexagonShape = [[26,15],[0,30],[-26,15],[-26,-15],[0,-30],[26,-15]];

    var that = {

        jsonData: null,
        layerCount: 0,

        init:function(system){
            sys = system;

            that.resize();

            // set up some event handlers to allow for node-dragging
            that.initMouseHandling()
            that.initMouseHandling()

            that.initLayers()
            that.initData();
            that.updateData();
        },

        resize:function(){
            var body = $("body");
            canvas.width = body.width();
            canvas.height = body.height();
            sys.screenSize(canvas.width, canvas.height);
            sys.screenPadding(80); // leave an extra 80px of whitespace per side
            that.redraw();
	},

        initData: function(){
            //console.log("initData");

            centralNode.success.alpha = 1;
            sys.addNode('centerNode', centralNode.success);

            that.jsonData = relatedNodes;

            for ( var i=0; i < that.jsonData.success.length; i++){
                that.jsonData.success[i].article.layer = Math.floor(i / NODES_PER_LAYER);
            }

            that.layerCount = Math.ceil(that.jsonData.success.length / NODES_PER_LAYER);
        },

        updateData:function(){
            //console.log("updateData");
            $.each(sys.getEdgesFrom('centerNode'), function(i, v){
                if(v.data.layer !== that.layer) {
                    sys.tweenNode(v.target, 1, {alpha: 0});
                }
            });
            that.displayLayer(that.layer);
        },

        displayLayer: function(layer){
            //console.log("addLayer("+layer+")");
            for ( var i=layer*NODES_PER_LAYER; i < (layer+1)*NODES_PER_LAYER && i < that.jsonData.success.length; i++){
                var newNode = sys.addNode(i, that.jsonData.success[i].article);
                sys.addEdge('centerNode', i, that.jsonData.success[i].connection);
                that.jsonData.success[i].article.alpha = 0.01;
                sys.tweenNode(newNode, 0.5, {alpha: 1});
            }
        },

        onLayerChange:function(layer){
            //console.log("onLayerChange("+layer+"): old layer "+that.layer);
            if(that.layer !== layer) {
                //console.log("apply changes")
                that.layer = layer;
                that.updateData();
            }
        },

        redraw:function(){
            //
            // redraw will be called repeatedly during the run whenever the node positions
            // change. the new positions for the nodes can be accessed by looking at the
            // .p attribute of a given node. however the p.x & p.y values are in the coordinates
            // of the particle system rather than the screen. you can either map them to
            // the screen yourself, or use the convenience iterators .eachNode (and .eachEdge)
            // which allow you to step through the actual node objects but also pass an
            // x,y point in the screen's coordinate system
            //
            ctx.fillStyle = "black";
            ctx.fillRect(0,0, canvas.width, canvas.height);

            sys.eachEdge(function(edge, pt1, pt2){
                // edge: {source:Node, target:Node, length:#, data:{}}
                // pt1:  {x:#, y:#}  source position in screen coords
                // pt2:  {x:#, y:#}  target position in screen coords

                var edgeAlpha = edge.source.data.alpha;
                if(edge.target.data.alpha < edgeAlpha) {edgeAlpha = edge.target.data.alpha;}

                if (edgeAlpha === 0) return

                // draw a line from pt1 to pt2
                ctx.strokeStyle = "rgba(255,255,255, "+edgeAlpha+")";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(pt1.x, pt1.y);
                ctx.lineTo(pt2.x, pt2.y);
                ctx.stroke();

                //Label the edge
                ctx.fillStyle = "rgba(255,255,255, "+edge.target.data.alpha+")";
                ctx.font = "bold 12px Roboto";
                ctx.fillText (edge.data.connectionType, (pt1.x + pt2.x) / 2, (pt1.y + pt2.y) / 2);
            });

            sys.eachNode(function(node, pt){
                // node: {mass:#, p:{x,y}, name:"", data:{}}
                // pt:   {x:#, y:#}  node position in screen coords

                if (node.data.alpha === 0){
                    sys.pruneNode(node);
                    return
                };

                //Draw Hexagon centered at pt
                ctx.beginPath();
                ctx.strokeStyle = "rgba(255,255,255, "+node.data.alpha+")";
                ctx.lineWidth = 5;
                var fillAlpha = 1;
                if (node.data.alpha === 0) {fillAlpha = 0;}
                ctx.fillStyle= "rgba(0,0,0, "+fillAlpha+")";
                if(hovered !== null && hovered === node)
                    ctx.fillStyle = "rgba(0,0,255, "+fillAlpha+")";
                //Begin drawing
                ctx.moveTo(hexagonShape[0][0] + pt.x, hexagonShape[0][1] + pt.y);
                for(var i = 1; i < hexagonShape.length; i++)
                    ctx.lineTo(hexagonShape[i][0] + pt.x, hexagonShape[i][1] + pt.y);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                //Print text next to it
                ctx.fillStyle = "rgba(255,255,255, "+node.data.alpha+")";
                ctx.font = "bold 12px Roboto";
                ctx.fillText(node.data.title, pt.x + 30, pt.y);
            });
        },

        initMouseHandling:function(){
            hovered = null;
            nearest = null;
            var dragged = null;
            var oldmass = 1;

            var handler = {
                moved:function(e){
                    var pos = $(canvas).offset();
                    _mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top);
                    nearest = sys.nearest(_mouseP);

                    //In case no node was found
                    if(nearest && !nearest.node) return false;

                    //Find if nearest node is near enough
                    if(nearest && nearest.node !== hovered && nearest.distance <= 30){
                        console.log("Change nearest");
                        hovered = nearest.node;
                        that.redraw();
                    }
                    else if(hovered !== null && nearest.distance > 30){
                        console.log("Nulled nearest");
                        hovered = null;
                        that.redraw();
                    }

                    return false;
                },

                clicked:function(e){

                },
                dragged:function(e){},
                dropped:function(e){},

                lastScrollTop: 0,
                scrolled:function(e){
                    var newLayer = 0;
                    var st = $(this).scrollTop();
                    //console.log("st="+st+",   lastScrollTop="+handler.lastScrollTop);
                    var diff = handler.lastScrollTop - st;
                    var absDiff = Math.abs(diff);
                    if((absDiff < 20 && st < 20 && st >= -20)
                        || (absDiff < 10 && (st >= 20 || st <= 20) )
                        || ((diff > 0) && (st > 250)) //270 - 240 = +30
                        || ((diff < 0) && (st < 0)) //-70 - -40 = -30
                        ){
                        //console.log("st="+st+",   lastScrollTop="+handler.lastScrollTop+", abort");
                        return
                    }
                    //console.log("st="+st+",   lastScrollTop="+handler.lastScrollTop+", apply");

                    if (st > handler.lastScrollTop){
                        newLayer = Math.max(that.layer - 1, 0);
                    } else {
                        newLayer = Math.min(that.layer + 1,  that.layerCount-1);
                    }
                    handler.lastScrollTop = st;
                    $(that).trigger({type:'layer', layer: newLayer});
                    return false;
                }
            }

            // start listening
            $(canvas).mousedown(handler.clicked);
            $(canvas).mousemove(handler.moved);
            $(window).scroll(handler.scrolled);

        },

        layer: 0,
        initLayers: function(){
            layer = 0;
        }

    };

    return that;
};
