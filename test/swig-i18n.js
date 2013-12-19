
exports["setUp"] = function(cb) {

  this.swig_i18n = require('../lib/swig-i18n.js');
  this.swig = require('swig');
  cb();
}

exports["tearDown"] = function(cb) {

  delete this.swig_i18n;
  delete this.swig;
  cb();
}

exports["basic default usage"] = function(test){

  this.swig_i18n.init_tag();
  var template = '{% i18n %}Default text{% endi18n%}'; 

  var expected = this.swig.render(template);

  test.expect(1);
  test.equal(expected, 'Default text');
  test.done();
};

exports["basic usage find translation"] = function(test){

  this.swig_i18n.init_tag({ TAG_LOOKUP: { es: 'foo' } });
  var template = '{% i18n TAG_LOOKUP %}Default text{% endi18n%}'; 

  var expected = this.swig.render(template, {locals:{i18n:{language: 'es'}}});

  test.expect(1);
  test.equal(expected, 'foo');
  test.done();
};

exports["basic usage find translation as a function"] = function(test){

  this.swig_i18n.init_tag(function(){return { TAG_LOOKUP: { es: 'foo' } }});
  var template = '{% i18n TAG_LOOKUP %}Default text{% endi18n%}'; 

  var expected = this.swig.render(template, {locals:{i18n:{language: 'es'}}});

  test.expect(1);
  test.equal(expected, 'foo');
  test.done();
};

exports["basic usage find translation when tag is not found"] = function(test){

  this.swig_i18n.init_tag({ TAG_LOOKUP: { es: 'foo' } });
  var template = '{% i18n TAG_UNKNOWN %}Default text{% endi18n%}'; 

  var expected = this.swig.render(template, {locals:{i18n:{language: 'es'}}});

  test.expect(1);
  test.equal(expected, 'Default text');
  test.done();
};

exports["string subsitution with literal string"] = function(test){

  this.swig_i18n.init_tag({ TAG_LOOKUP: { es: 'Spanish __should_be_replaced__' } });
  var template = '{% i18n TAG_LOOKUP __should_be_replaced__:"should be used" %}Default text __should_be_replaced__{% endi18n%}'; 

  var expected = this.swig.render(template, {
    locals:{
      i18n:{
        language: 'es'
      }
    }
  });

  test.expect(1);
  test.equal(expected, 'Spanish should be used');
  test.done();
};

exports["string subsitution with context object"] = function(test){

  this.swig_i18n.init_tag({ TAG_LOOKUP: { es: 'Spanish __should_be_replaced__' } });
  var template = '{% i18n TAG_LOOKUP __should_be_replaced__:should_be %}Default text __should_be_replaced__{% endi18n%}'; 

  var expected = this.swig.render(template,{
    locals:{
      i18n:{language: 'es'},
      should_be:"should be used"
    }
  });

  test.expect(1);
  test.equal(expected, 'Spanish should be used');
  test.done();
};
