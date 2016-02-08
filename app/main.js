define([
  "esri/config",
  "esri/Map",
  "esri/views/SceneView",
  "app/components/TrafficCams/Widget",
  "app/components/CameraSearch/Widget",
  "app/stores/CameraStore",
], function (
  esriConfig, Map, SceneView, TrafficCam, CameraSearch, CameraStore
) {
  // need a proxy
  esriConfig.request.proxyUrl = "/proxy/proxy.php"
  var map = new Map({
    basemap: "streets"
  });

  var view = new SceneView({
    container: "viewDiv",
    map: map,
    scale: 240000000
  });

  var camOptions = {
    "apiurl": "http://www.wsdot.wa.gov/Traffic/api/HighwayCameras/HighwayCamerasREST.svc/GetCamerasAsJson?AccessCode=",
    "apikey": "<GET-YOUR-OWN>"
  };

  var node = document.createElement('div');

  view.then(function() {
    var store = new CameraStore(camOptions);
    return store.loadStore();
  }).then(function(store) {
    var traffic = new TrafficCam({
      map: map,
      view: view,
      store: store
    });

    var camSearch = new CameraSearch({store:store}, node);
    view.ui.add(camSearch, 'top-right');
  });

});
