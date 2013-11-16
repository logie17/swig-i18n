
exports["setUp"] = function(cb) {
  this.swig_i18n = require('../lib/swig-i18n.js');
  this.swig = require('swig');
  this.swig_i18n.init_tag();
  cb();
}

exports["tearDown"] = function(cb) {
  delete this.swig_i18n;
  delete this.swig;
  cb();
}

exports["basic usage"] = function(test){
  var template = '{% i18n %}Default text{% endi18n%}'; 
  var expected = this.swig.render(template);
  test.expect(1);
  test.equal(expected, 'Default text');
  test.done();
};
