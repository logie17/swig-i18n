
exports["setUp"] = function(cb) {

  this.swig_i18n = require('../lib/swig-i18n.js'); this.swig = require('swig');
  cb();
}

exports["tearDown"] = function(cb) {

  delete this.swig_i18n;
  delete this.swig;
  cb();
}

exports["basic default usage"] = function(test){

  this.swig_i18n.init();
  var template = '{% i18n %}Default text{% endi18n%}'; 

  var expected = this.swig.render(template);

  test.expect(1);
  test.equal(expected, 'Default text');
  test.done();
};

exports["basic usage find translation"] = function(test){

  this.swig_i18n.init({ TAG_LOOKUP: { es: 'foo' } });
  var template = '{% i18n TAG_LOOKUP %}Default text{% endi18n%}'; 

  var expected = this.swig.render(template, {locals:{i18n:{language: 'es'}}});

  test.expect(1);
  test.equal(expected, 'foo');
  test.done();
};

exports["basic usage find updated translation"] = function(test){

  this.swig_i18n.init({ TAG_LOOKUP: { es: 'foo' } });
  var template = '{% i18n TAG_LOOKUP %}Default text{% endi18n%}';

  var expected = this.swig.render(template, {locals:{i18n:{language: 'es'}}});

  test.equal(expected, 'foo');

  this.swig_i18n.updateTranslations({ TAG_LOOKUP: { es: 'bar' } });

  var updated = this.swig.render(template, {locals:{i18n:{language: 'es'}}});
  test.expect(2);
  test.equal(updated, 'bar');
  test.done();
};

exports["basic usage find translation as a function"] = function(test){

  this.swig_i18n.init(function(){return { TAG_LOOKUP: { es: 'foo' } }});
  var template = '{% i18n TAG_LOOKUP %}Default text{% endi18n%}'; 

  var expected = this.swig.render(template, {locals:{i18n:{language: 'es'}}});

  test.expect(1);
  test.equal(expected, 'foo');
  test.done();
};

exports["translation tags that start with numbers and end as strings (a numvar!)"] = function(test){

  this.swig_i18n.init(function(){return { '123_TAG_LOOKUP': { es: 'foo' } }});
  var template = '{% i18n 123_TAG_LOOKUP %}Default text{% endi18n%}'; 

  var expected = this.swig.render(template, {locals:{i18n:{language: 'es'}}});

  test.expect(1);
  test.equal(expected, 'foo');
  test.done();
};

exports["basic usage find translation when tag is not found"] = function(test){

  this.swig_i18n.init({ TAG_LOOKUP: { es: 'foo' } });
  var template = '{% i18n TAG_UNKNOWN %}Default text{% endi18n%}'; 

  var expected = this.swig.render(template, {locals:{i18n:{language: 'es'}}});

  test.expect(1);
  test.equal(expected, 'Default text');
  test.done();
};

exports["string subsitution with literal string"] = function(test){

  this.swig_i18n.init({ TAG_LOOKUP: { es: 'Spanish __should_be_replaced__' } });
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

  this.swig_i18n.init({ TAG_LOOKUP: { es: 'Spanish __should_be_replaced__' } });
  var template = '{% i18n TAG_LOOKUP __should_be_replaced__:should_be %}Default text __should_be_replaced__{% endi18n%}'; 

  var expected = this.swig.render(template,{
    locals:{
      i18n:{language: 'es'},
      should_be:"should be used"
    }
  });

  test.expect(2);
  test.equal(expected, 'Spanish should be used');

  template = '{% i18n TAG_LOOKUP __foo__:should_be, __bar__:"test" %}Default text __foo__ __bar__{% endi18n%}'; 

  expected = this.swig.render(template,{
    locals:{
      i18n:{language: 'tr'},
      should_be:"should be used"
    }
  });
  test.equal(expected, 'Default text should be used test');
  test.done();
};

exports["string subsitution with dynamic variable via set"] = function(test){

  this.swig_i18n.init({ TAG_LOOKUP: { es: 'Spanish __should_be_replaced__' } });
  var template = '{% set tag_lookup = \'TAG_LOOKUP\' %}{% i18n tag_lookup __should_be_replaced__:"should be used" %}Default text __should_be_replaced__{% endi18n%}'; 

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

exports["string substitution via a dynamic variable passed from data structure"] = function(test){

  this.swig_i18n.init({ TAG_LOOKUP: { es: 'Spanish __should_be_replaced__' } });
  var template = '{% i18n tag_lookup __should_be_replaced__:"should be used" %}Default text __should_be_replaced__{% endi18n%}'; 

  var expected = this.swig.render(template, {
    locals:{
      i18n:{
        language: 'es'
      },
      tag_lookup: 'TAG_LOOKUP'
    }
  });

  test.expect(1);
  test.equal(expected, 'Spanish should be used');
  test.done();
};

exports["i18n tag works inside macros!"] = function(test) {
  this.swig_i18n.init({ TAG_LOOKUP: { es: 'Spanish is found' } });
  var template = [
                  '{% macro translate_this(foo) %}', 
                  '<div>{% i18n foo %}default-goodbye{% endi18n %}</div>',
                  '{% endmacro %}',
                  '{% set foo = translate_this("TAG_LOOKUP") %}',
                  '{{ foo }}'
                ].join('');

  var expected = this.swig.render(template, {
    locals:{
      i18n:{
        language: 'es'
      }
    }
  });

  test.expect(1);
  test.equal(expected, '&lt;div&gt;Spanish is found&lt;/div&gt;');
  test.done();
};

exports["value subsitution on arrays"] = function(test) {
  this.swig_i18n.init({ TAG_LOOKUP: { es: 'Spanish is found __A__' } });
  var template = '{% i18n TAG_LOOKUP __A__: params["image_id[]"].length %}default{% endi18n %}';

  var expected = this.swig.render(template, {
    locals:{
      i18n:{
        language: 'es'
      },
      params: {
        'image_id[]':[1,2,3]
      }
    }
  });

  test.expect(1);
  test.equal(expected, 'Spanish is found 3');
  test.done();
};

exports["value as hash lookup"] = function(test) {
  this.swig_i18n.init({ TAG_LOOKUP: { es: 'Spanish is found __A__' } });
  var template = '{% i18n TAG_LOOKUP __A__: params.b.c %}default{% endi18n %}';

  var expected = this.swig.render(template, {
    locals:{
      i18n:{
        language: 'es'
      },
      params: {
        b:{c:2}
      }
    }
  });

  test.expect(1);
  test.equal(expected, 'Spanish is found 2');
  test.done();
};

exports["bug to fix set variable autoescape on"] = function(test) {
  this.swig_i18n.init({},{ autoescape: 'html' });
  var template = [
    '{% set photo_stats = 54321 %}',
    '{% set stats_this_week = 54321 %}',
    '{% set spanQty = ["<span class=\'qty\'>"," </span>"] %}',
    '{% set statsTotal = spanQty|join(photo_stats) %}',
    '{% set statsThisWeek = spanQty|join(stats_this_week) %}',
    '{% i18n EXACTLY_PHOTOS __NUM__: statsTotal %}__NUM__ royalty-free stock images{% endi18n %}\\n',
    '{% i18n NEW_PHOTOS __NUM__: statsThisWeek %}__NUM__ new stock images added this week{% endi18n %}'
  ].join('');

  var expected = this.swig.render(template, {
    locals:{
      i18n:{
        language: 'es'
      }
    }
  });

  test.expect(1);
  test.equal(expected, '&lt;span class=&#39;qty&#39;&gt;54321 &lt;/span&gt; royalty-free stock images\\n&lt;span class=&#39;qty&#39;&gt;54321 &lt;/span&gt; new stock images added this week');
  test.done();
};

exports["bug to fix set variable autoescape off"] = function(test) {
  this.swig_i18n.init({},{autoescape:null});
  var template = [
    '{% set photo_stats = 54321 %}',
    '{% set stats_this_week = 54321 %}',
    '{% set spanQty = ["<span class=\'qty\'>"," </span>"] %}',
    '{% set statsTotal = spanQty|join(photo_stats) %}',
    '{% set statsThisWeek = spanQty|join(stats_this_week) %}',
    '{% i18n EXACTLY_PHOTOS __NUM__: statsTotal %}__NUM__ royalty-free stock images{% endi18n %}\\n',
    '{% i18n NEW_PHOTOS __NUM__: statsThisWeek %}__NUM__ new stock images added this week{% endi18n %}'
  ].join('');

  var expected = this.swig.render(template, {
    locals:{
      i18n:{
        language: 'es'
      }
    }
  });

  test.expect(1);
  test.equal(expected, '<span class=\'qty\'>54321 </span> royalty-free stock images\\n<span class=\'qty\'>54321 </span> new stock images added this week');
  test.done();
};

exports["numbers as assignment"] = function(test) {
  this.swig_i18n.init({});
  var template = [
    '{% i18n EXACTLY_PHOTOS __NUM__: 54321+5,__NUM2__:221 %}__NUM__ royalty-free stock images{% endi18n %}\\n',
    '{% i18n NEW_PHOTOS __NUM__: 54321.2- 1 %}__NUM__ new stock images added this week{% endi18n %}'
  ].join('');

  var expected = this.swig.render(template, {
    locals:{
      i18n:{
        language: 'es'
      }
    }
  });

  test.expect(1);
  test.equal(expected, '54326 royalty-free stock images\\n54320.2 new stock images added this week');
  test.done();
};

exports["value with array index lookup"] = function(test) {
  this.swig_i18n.init({ TAG_LOOKUP: { es: 'Spanish is found __A__' } });
  var template = '{% i18n TAG_LOOKUP __A__: params["image_id[]"][1] %}default{% endi18n %}';

  var expected = this.swig.render(template, {
    locals:{
      i18n:{
        language: 'es'
      },
      params: {
        'image_id[]':[1,2,3]
      }
    }
  });

  test.expect(2);
  test.equal(expected, 'Spanish is found 2');

  template = '{% i18n TAG_LOOKUP "__A__": global.image_id %}default{% endi18n %}';
  expected = this.swig.render(template, {
    locals:{
      i18n:{
        language: 'es'
      },
      global: {
        'image_id':123
      }
    }
  });
  test.equal(expected, 'Spanish is found 123');
  test.done();
};

exports["value with undef deep nested lookup up should use default"] = function(test) {
  this.swig_i18n.init({ TAG_LOOKUP: { es: 'Spanish is found __A__' } });

  var template = '{% i18n tag.does.not.exist %}default{% endi18n %}';

  var expected = this.swig.render(template, {
    locals:{
      i18n:{
        language: 'es'
      },
      tag:{}
    }
  });

  test.expect(1);
  test.equal(expected, 'default');

  test.done();
};

exports["filters are totally possible"] = function(test) {
  this.swig_i18n.init({ TAG_LOOKUP: { es: 'Spanish is found __A__' } });
  
  var template = '{% set translation = "TAG_LOOKUP"|i18n("es", "default") %}{{ translation }}';
  var expected = this.swig.render(template, {locals:'es'});
  test.expect(2);

  test.equal(expected,'Spanish is found __A__');

  template = '{% set translation = "TAG_LOOKUP"|i18n("es", "default", {__A__:"foo"}) %}{{ translation }}';
  expected = this.swig.render(template, {locals:'es'});

  test.equal(expected,'Spanish is found foo');
  test.done();
};

exports["imperial language mode"] = function(test){

  this.swig_i18n.init({ TAG_LOOKUP: { es: 'foo', en: 'foo' } }, { imperial_language: 'es' });
  var template = '{% i18n TAG_LOOKUP %}Default text is used{% endi18n%}'; 

  test.expect(2);

  var expected = this.swig.render(template, {locals:{i18n:{language: 'es'}}});
  test.equal(expected, 'Default text is used');

  expected = this.swig.render(template, {locals:{i18n:{language: 'en'}}});
  test.equal(expected, 'foo');
  test.done();
};

exports["string subsitution with undefined variable"] = function(test){

  this.swig_i18n.init({ TAG_LOOKUP: { es: 'Hola __name__' } });
  var template = '{% i18n GREET_NAME __name__:name %}Hello __name__{% endi18n%}'; 

  var expected = this.swig.render(template,{
    locals:{
      i18n:{language: 'es'}
    }
  });

  test.expect(2);
  test.equal(expected, 'Hello ');

  expected = this.swig.render(template,{
    locals:{
      i18n:{language: 'es'},
      name: 'world'
    }
  });
  test.equal(expected, 'Hello world');

  test.done();
};

exports["active languages are respected"] = function(test) {
    this.swig_i18n.init({ TAG_LOOKUP: { es: 'foo', en: 'foo', ru:'nope' } }, { 
        active_languages: ['es', 'en']
    });
    var template = '{% i18n TAG_LOOKUP %}Default text is used{% endi18n%}'; 

    test.expect(2);

    var expected = this.swig.render(template, {locals:{i18n:{language: 'ru'}}});
    test.equal(expected, 'Default text is used');

    expected = this.swig.render(template, {locals:{i18n:{language: 'en'}}});
    test.equal(expected, 'foo');
    test.done();
}
