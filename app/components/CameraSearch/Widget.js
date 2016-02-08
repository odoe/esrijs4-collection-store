define([
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dojo/text!./templates/Widget.html'
], function(
  declare,
  _WidgetBase, _TemplatedMixin,
  templateString
) {

  function val(e) {
    return e.target.value;
  }

  var Widget = _WidgetBase.createSubclass(_TemplatedMixin, {

    templateString: templateString,
    placeholder: 'Search camera id',
    baseClass: 'camsearch',

    onChange: function(e) {
      var value = val(e);
      var store = this.store;

      store.map(function(x) {
        x.visible = false;
        return x;
      }).filter(function(x) {
        return x.CameraID === Number(value);
      }).map(function(x) {
        x.visible = true;
        store.removeItem(x);
        store.addItem(x);
      });
    },

    onRefresh: function() {
      this.inputNode.value = '';

      var store = this.store;

      store.map(function(x) {
        x.visible = true;
        return x;
      }).filter(function(x) {
        // trick to force a collection change event
        return x.CameraID === Math.floor(Math.random() * 100) + 1000;
      }).map(function(x) {
        store.removeItem(x);
        store.addItem(x);
      });
    }

  });

  return Widget;

});
