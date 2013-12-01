/**
 * Here is the "server" mockup. It aims to simulate a distant graph database
 * wrapper, to show how to use sigma to navigate dynamically through big
 * graphs.
 *
 * You can also use it just to load a JSON graph and to explore the
 * neighborhoods of its nodes on purpose.
 *
 * This mockup is actually based on sigma's graph model, and adds a method to
 * it called "getNeighborhood". Check the documentation of the method for more
 * information.
 *
 * Here is how the mockup works:
 *
 * 1. Initialize it like this:
 *  > DBMockup.init('path/to/my/graph.json');
 *
 * 2. Wait for it to be ready, by using its "onready" method:
 *  > DBMockup.onready(function() {
 *  >   console.log('DBMockup is ready!');
 *  > });
 *
 * 3. Retrieve the neighborhood of a node:
 *  > var centerNodeID = 'anyNodeID';
 *  > mySigmaInstance
 *  >   .read(DBMockup.getNeighborhood(centerNodeID))
 *  >   .refresh();
 */
(function() {
  /**
   * This method takes the ID of node as argument and returns the graph of the
   * specified node, with every other nodes that are connected to it and every
   * edges that connect two of the previously cited nodes. It uses the built-in
   * indexes from sigma's graph model to search in the graph.
   *
   * @param  {string} centerId The ID of the center node.
   * @return {object}          The graph, as a simple descriptive object, in
   *                           the format required by the "read" graph method.
   */
  sigma.classes.graph.addMethod(
    'getNeighborhood',
    function(centerId) {
      var k1,
          k2,
          k3,
          node,
          center,
          // Those two local indexes are here just to avoid duplicates:
          localNodesIndex = {},
          localEdgesIndex = {},
          // And here is the resulted graph, empty at the moment:
          graph = {
            nodes: [],
            edges: []
          };

      // Check that the exists:
      if (!this.nodes(centerId))
        return graph;

      // Add center. It has to be cloned to add it the "center" attribute
      // without altering the current graph:
      node = this.nodes(centerId);
      center = {};
      center.center = true;
      for (k1 in node)
        center[k1] = node[k1];

      localNodesIndex[centerId] = true;
      graph.nodes.push(center);

      // Add neighbors and edges between the center and the neighbors:
      for (k1 in this.allNeighborsIndex[centerId]) {
        if (!localNodesIndex[k1]) {
          localNodesIndex[k1] = true;
          graph.nodes.push(this.nodesIndex[k1]);
        }

        for (k2 in this.allNeighborsIndex[centerId][k1])
          if (!localEdgesIndex[k2]) {
            localEdgesIndex[k2] = true;
            graph.edges.push(this.edgesIndex[k2]);
          }
      }

      // Add edges connecting two neighbors:
      for (k1 in localNodesIndex)
        if (k1 !== centerId)
          for (k2 in localNodesIndex)
            if (
              k2 !== centerId &&
              k1 !== k2 &&
              this.allNeighborsIndex[k1][k2]
            )
              for (k3 in this.allNeighborsIndex[k1][k2])
                if (!localEdgesIndex[k3]) {
                  localEdgesIndex[k3] = true;
                  graph.edges.push(this.edgesIndex[k3]);
                }

      // Finally, let's return the final graph:
      return graph;
    }
  );

  // Now that we can retrieve the neighborhood of a node, let's first load and
  // parse a real life graph:
  var ready = false,
      readyCallbacks = [],
      graph = new sigma.classes.graph();

  this.DBMockup = {
    loadNeighborhood: function(centerNodeID, callback) {
      var self = this;

      if (ready) {
        if (typeof centerNodeID === 'function') {
          callback = centerNodeID;

          // If no centerNodeID is given, let's take a random node instead:
          centerNodeID = graph.nodes()[
            (Math.random() * graph.nodes().length) | 0
          ].id;
        }

        requestAnimationFrame(function() {
          callback(graph.getNeighborhood(centerNodeID));
        });
      } else
        readyCallbacks.push(function() {
          self.loadNeighborhood(centerNodeID, callback);
        });
    },
    onready: function(callback) {
      if (ready)
        callback();
      else
        readyCallbacks.push(callback);
    },
    init: function(path) {
      // Reset unready state:
      ready = false;
      readyCallbacks = [];

      // Quick XHR polyfill:
      var xhr = (function() {
        if (window.XMLHttpRequest)
          return new XMLHttpRequest();

        var names,
            i;

        if (window.ActiveXObject) {
          names = [
            'Msxml2.XMLHTTP.6.0',
            'Msxml2.XMLHTTP.3.0',
            'Msxml2.XMLHTTP',
            'Microsoft.XMLHTTP'
          ];

          for (i in names)
            try {
              return new ActiveXObject(names[i]);
            } catch (e) {}
        }

        return null;
      })();

      if (!xhr)
        throw 'XMLHttpRequest not supported, cannot load the data.';

      xhr.open('GET', path, true);
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          // When the file is loaded, we can initialize everything and execute
          // the "ready" callbacks:
          graph.read(JSON.parse(xhr.responseText));
          ready = true;
          readyCallbacks.forEach(function(fn) {
            fn();
          });
        }
      };

      // Start loading the file:
      xhr.send();
    }
  };
}).call(window);
