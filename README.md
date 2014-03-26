swig-i18n
=========

Swig i18n

The swig i18n module is useful when one needs to have a set of translations that 
specific for a locale. This module both supports tags and filters. 

In order to setup the tag or filter, one should do the following setup inside
their application:

```javascript
  var swig_i18n = require('swig-i18n.js');
  swig_i18n.init({ TAG: { es: 'foo' } });
```

Once the  module has been initialize the following is now possible:

### Swig call
```javascript
  <div>{% i18n TAG %}Default text{% endi18n%}</div>
```

### Output
```html
  <div>foo</div>
```

Or, if one chooses they can call this as a filter on a bit of text:

```javascript
  {% set translation = "TAG_LOOKUP"|i18n("es", "default" %}
  {{ translation }}
```  

## Other Notable Features

This module also supports simple search and replacement:

### Swig

```javascript
  {% set foo = 'baz' %}
  <div>{% i18n TAG __foo__:foo %}Default text with __foo__{% endi18n%}</div>
```

### Output
```html
   <div>Default text with baz</div>
```

### Swig
```javascript
  {% set foo = 'baz' %}
  {% set tag = 'TAG' %}
  <div>{% i18n tag __foo__:foo %}Default text with __foo__{% endi18n%}</div>
```

### Output
```html
   <div>Default text with baz</div>
```

One could also setup the translation data structure to originate from a callback:

```javascript
swig_i18n.init_tag(function(){ 
  return {TAG: { es: 'foo' } };
});
```

The module also supports a feature called "imperial_language". The idea is that if
a translation is required for a language that is set as the default imperial language
the module will *favor* the default text as translation instead of looking inside the data
structure.

To enable this functionality the following needs to be done:

```javascript
  var swig_i18n = require('swig-i18n.js');
  swig_i18n.init({ TAG: { es: 'foo' } }, { imperial_language: 'es' });
```

