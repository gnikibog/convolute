var App = Em.Application.create({
  ready: function() {
    App.presetsController.select('identity');
  }
});


// Models

App.N = App.Number = Em.Object.extend({
  value: null,
});

App.Matrix = Em.Object.extend({
  name: null,
  data: null,
  offset: null,
});


// Controllers

App.matrixController = Em.Object.create({
  content: null,
  presets: 'App.presetsController.content',
  selectPreset: function(preset) {
    this.set('content', preset.get('data').map(function(item) {
      return App.N.create({ value: item, });
    }));
    this.set('offset', preset.get('offset'));
  },
});

App.presetsController = Em.ArrayController.create({
  content: function() {
    return matrices.map(function(matrix) {
      matrix.data = Array.prototype.concat.apply([], matrix.data);  // flatten
      return App.Matrix.create(matrix);
    });
  }.property(),
  select: function(name) {
    var preset = this.get('content').findProperty('name', name)
    App.matrixController.selectPreset(preset);
  }
});


// Views

App.MatrixItemView = Em.TextField.extend({
  classNames: 'matrix-item',
  type: 'text',
  placeholder: 0,
  didInsertElement: function() {
    var that = this;
    this.$()
      .bind('mousewheel', function(event, delta) {
        that.set('value', parseInt(that.get('value')) + delta);
        return false;
      })
      .bind('keydown', function(event) {
        var code = event.keyCode;
        code === 37 ? console.log(event) : undefined;
      });
  },
});

App.MatrixView = Em.View.extend({
  templateName: 'matrix',
  classNames: 'matrix',
  contentBinding: 'App.matrixController.content',
  rows: function() {
    var content = this.get('content');
    if (!content) return null;
    return [content.slice(0,3), content.slice(3,6), content.slice(6,9)];
  }.property('content', 'content.@each'),
});

App.PresetsView = Em.CollectionView.extend({
  tagName: 'ul',
  contentBinding: 'App.presetsController.content',
  classNames: 'presets',
  itemViewClass: Em.View.extend({
    template: Em.Handlebars.compile(
      '<a href="#" {{action selectPreset}}>{{content.name}}</a>'
      ),
    selectPreset: function() {
      App.matrixController.selectPreset(this.get('content'));
      return false;
    },
  }),
});

App.ImageView = Em.View.extend({
  template: Em.Handlebars.compile("<canvas/>"),
  classNames: 'image',
  src: 'images/chicken.jpg',
  didInsertElement: function() {
    var src = this.get('src');
    this.set('transformador', new CanvasImage(this.$('canvas').get(0), src));
  },
  // "Those of you who have been working on your computers, go ahead and start saving your documents" -20 minutes before the "Turn off electronics" sign came on
});

App.ConvolvedImageView = App.ImageView.extend({
  contentBinding: 'App.matrixController.content',
  matrix: function() {
    if (this.get('content')) {
      var flat = this.get('content').map(function(item) {
        var ret = parseInt(item.get('value'));
        return ret ? ret : 0;
      });
      return [flat.slice(0,3), flat.slice(3,6), flat.slice(6,9)];
    }
  }.property('content.@each.value'),
  updateConvolution: function() {
    console.log(this.get('matrix'));
    var transformador = this.get('transformador');
    if (transformador) {
      transformador.convolve(this.get('matrix'));
    }
  }.observes('matrix.@each'),
  didInsertElement: function() {
    this._super();
    a = this;
  }
});
