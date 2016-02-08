define([
  'dojo/_base/lang',
  'dijit/_WidgetBase',
  'esri/request',
  'esri/Graphic',
  'esri/layers/GraphicsLayer',
  'esri/PopupTemplate',
  'esri/geometry/Point',
  'esri/geometry/Extent',
  'esri/geometry/support/webMercatorUtils',
  'esri/geometry/support/graphicsUtils',
  'esri/symbols/PointSymbol3D',
  'esri/symbols/IconSymbol3DLayer',
  'esri/renderers/SimpleRenderer'
], function(
  lang,
  _WidgetBase,
  esriRequest,
  Graphic,
  GraphicsLayer,
  PopupTemplate,
  Point, Extent,
  webMercatorUtils, graphicsUtils,
  PointSymbol3D, IconSymbol3DLayer,
  SimpleRenderer
) {

  var hitch = lang.hitch;

  var iconSymbol = new PointSymbol3D({
    symbolLayers: [new IconSymbol3DLayer({
      size: 10,
      resource: {
        primitive: 'square'
      }
    })]
  });

  var renderer = new SimpleRenderer({ symbol: iconSymbol });

  function addToLayer(layer) {
    return function(x) {
      layer.add(x);
      return x;
    }
  }

  function makePt(x) {
    return new Point(x.DisplayLongitude, x.DisplayLatitude);
  }

  function webMercator(x) {
    return webMercatorUtils.geographicToWebMercator(x);
  }

  function makeGraphic(x) {
    return function(geom) {
      return new Graphic(geom, null, x);
    }
  }

  function updateExtent(view) {
    return function(graphics) {
      var ext = graphics.reduce(function(prev, curr) {
        var g = curr.geometry;
        if (prev) {
          return prev.union(new Extent(g.x, g.y, g.x, g.y, g.spatialReference));;
        } else {
          if (g.type === 'point') {
            // need to fake a larger extent
            return new Extent(g.x+10000, g.y+10000, g.x-10000, g.y-10000, g.spatialReference);
          } else {
            return new Extent(g.x, g.y, g.x, g.y, g.spatialReference);
          }
        }
      });
      if (ext) {
        view.extent = ext.expand(3);
      }
    }
  }

  function parseToGraphic(layer) {
    var addGraphic = addToLayer(layer);
    return function(x) {
      var asGraphic = makeGraphic(x);
      return addGraphic(asGraphic(webMercator(makePt(x))));
    }
  }

  return _WidgetBase.createSubclass({

    postCreate: function() {
      var template = new PopupTemplate({
        title: '{Title}',
        content: '<img src="{ImageURL}" style="width="{ImageWidth}";height="{ImageHeight}"/>',
        // MediaInfos don't seem to work, I'm probably doing it wrong
        mediaInfos: [{
          "title": "{Title}",
          "caption": "Traffic Cam",
          "description": '<img src="{ImageURL}" style="width="{ImageWidth}";height="{ImageHeight}"/>',
          "type": "image",
          "value": {
            "sourceURL": "{ImageUrl}",
            "linkURL": "{ImageUrl}"
          }
        }]
      });

      var map = this.get('map');
      var view = this.get('view');
      var trafficLayer = new GraphicsLayer({
        popupTemplate: template,
        renderer: renderer
      });
      map.add(trafficLayer);
      this.set('trafficLayer', trafficLayer);
      this.store.on('change', hitch(this, 'updateLayer'));
      this.loadTrafficData();
    },

    loadTrafficData: function() {
      var parseAsGraphics = parseToGraphic(this.trafficLayer);
      var updateView = updateExtent(this.view);
      updateView(this.store.filter(function(x){return x.visible;}).map(parseAsGraphics));
    },

    updateLayer: function(e) {
      if (e.moved.length) {
        var layer = this.trafficLayer;
        layer.clear();
        this.loadTrafficData();
      }
    }

  });

});
