var NODES_PER_LAYER = 6;

var Renderer = function(canvasId){
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

            var data = {
                "success":
                {
                    "KN_ID":"233e18f7-01a1-4acb-83b2-4adeedd276fd",
                    "__CreatedOn__":"2013-03-02T00:09:45.433Z",
                    "title":"Prospects of mammalian synthetic biology in therapeutic innovation",
                    "url":null,
                    "bodyText":"For a decade Synthetic biology has tried to bring engineering approaches into classic molecular biology. Many hopes are now placed on this new field to tackle some of the challenges 21st century medicine is facing. In particular synthetic gene networks in human cells could revolutionize treatment strategy of a lot of diseases ranging from cancer to metabolic disorders. However this emerging field still needs to overcome legal, ethical and scientific difficulties before saving its first human life.",
                    "postType":"Concept",
                    "active":true,
                    "fileId":null,
                    "fileName":null,
                    "fileData":null,
                    "id":15
                }
            };

            data.alpha = 1;
            sys.addNode('centerNode', data);

            that.jsonData = {"success": [
                {
                    "article": {
                        "KN_ID": "329a7b94-ddb5-4b12-b298-1e34ec21f875",
                        "url": "http://www.ucl.ac.uk/systems-biology/journalclub/2009_Fusseneger_nature07616.pdf",
                        "title": "A tunable synthetic mammalian oscillator",
                        "__CreatedOn__": 1362514509022,
                        "nodeType": "kn_Post",
                        "active": true,
                        "bodyText": "Autonomous and self-sustained oscillator circuits mediating the periodic induction of specific target genes are minimal genetic time-keeping devices found in the central and peripheral circadian clocks1,2. They have attracted significant attention because of their intriguing dynamics and their importance in controlling critical repair3, metabolic4 and signalling pathways5. The precise molecular mechanism and expression dynamics of this mammalian circadian clock are still not fully understood. Here we describe a synthetic mammalian oscillator based on an auto-regulated sense–antisense transcription control circuit encoding a positive and a time-delayed negative feedback loop, enabling autonomous, self-sustained and tunable oscillatory gene expression. After detailed systems design with experimental analyses and mathematical modelling, we moni- tored oscillating concentrations of green fluorescent protein with tunable frequency and amplitude by time-lapse microscopy in real time in individual Chinese hamster ovary cells. The synthetic mam- malian clock may provide an insight into the dynamics of natural periodic processes and foster advances in the design of prosthetic networks in future gene and cell therapies.",
                        "id": 108,
                        "user": {
                            "id": 104,
                            "KN_ID": "3fd9419e-46fa-42f7-8ac4-3ce43847a56b",
                            "email": "ophelie.foubet@gmail.com",
                            "firstName": "Ophélie",
                            "lastName": "Foubet",
                            "displayName": "Ophélie Foubet"
                        }
                    },
                    "connection": {
                        "KN_ID": "d7d6756f-492a-4a40-96cb-ab0552244c82",
                        "bodyText": "This is a letter  published in Nature in 2009 by Marcel Tigges, Tatiana T. Marquez-Lago, Jo ̈rg Stelling and Martin Fussenegger.\n\nThis article is about the circandians circles in mammalians. Their dynamics are not fully understood, either their molecular pathways.\n\nThus, they tried to reproduce a  synthetic mammalian oscillator, autonomous and tunable, to undersand the dynamic of genes transcription into a cell, using a novel network design combining an autoregulated positive transcription feedback with a two-step transcription cascade producing non-coding antisense RNA for translation control.\n\nThey tried their system on Chinese hamster ovary cells and observed some oscillations of UbV76–GFP fluorescence. These were spontaneous, autonomous, self-sustained and robust. They could disturbed the oscillations deliberately by adding antibiotics. \nThe frequency of the oscillations were found by Fast Fourier transformation-based analysis. They found a frequency of 170 6 71 min, with an amplitude of 1.81 6 1.96 fluorescence units.\n\nFinally, this synthetic mammalian oscillator is very useful to continue on more therapeutic innovations, as, for example, the Huntington’s and Alzheimer’s diseases are related to circadians' clocks...",
                        "title": "Provides bases for a better understanding of mammalians' clocks",
                        "__CreatedOn__": 1362514510889,
                        "fromNodeId": 15,
                        "connectionType": "gives background to",
                        "nodeType": "kn_Edge",
                        "active": true,
                        "toNodeId": 108,
                        "user": {
                            "id": 104,
                            "KN_ID": "3fd9419e-46fa-42f7-8ac4-3ce43847a56b",
                            "email": "ophelie.foubet@gmail.com",
                            "firstName": "Ophélie",
                            "lastName": "Foubet",
                            "displayName": "Ophélie Foubet"
                        }
                    },
                    "commentCount": 0,
                    "edgeCount": 0
                }]};

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



$(document).ready(function(){
    var css = jQuery("<link>");
    css.attr({
        rel:  "stylesheet",
        type: "text/css",
        href: "http://fonts.googleapis.com/css?family=Roboto"
    });
    $("head").append(css);

    var sys = arbor.ParticleSystem(1000, 600, 0.5); // create the system with sensible repulsion/stiffness/friction
    sys.parameters({gravity:true}); // use center-gravity to make the graph settle nicely (ymmv)
    sys.renderer = Renderer("#viewport"); // our newly created renderer will have its .init() method called shortly by sys...

    $(sys.renderer).bind('layer', function(e){
        sys.renderer.onLayerChange(e.layer);
    })

});
