define([
  'esri/core/Collection',
  'esri/request',
  'dojo/Deferred',
  'dstore/Memory'
], function(
  Collection, esriRequest, Deferred, Memory
) {

  var CameraStore = Collection.createSubclass({
    apikey: null,
    apiurl: null,
    idProperty: 'CameraID',
    loadStore: function() {
      var dfd = new Deferred();
      var self = this;
      esriRequest({
        url: this.apiurl + this.apikey,
        handleAs: 'json'
      }).then(function(response) {
        response.map(function(x) {
          x.visible = true;
          self.addItem(x);
        });
        dfd.resolve(self);
      });
      return dfd.promise;
    }
  });

  return CameraStore;

});
