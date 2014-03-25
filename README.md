swig-i18n
=========

Swig i18n Tag

## Synopsis

### Setup
```javascript
  var swig_i18n = require('swig-i18n.js');
  swig_i18n.init_tag({ TAG: { es: 'foo' } });
```

### Swig call
```javascript
  <div>{% i18n TAG %}Default text{% endi18n%}</div>
```

### Output
```html
  <div>foo</div>
```

This module also supports simple search and replacement:

### Swig call
```javascript
  {% set foo = 'baz' %}
  <div>{% i18n TAG __foo__:foo %}Default text with __foo__{% endi18n%}</div>
```

### Output
```html
   <div>Default text with baz</div>
```

### Swig call
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

### Supports the i18n filter too

```javascript
  {% set translation = "TAG_LOOKUP"|i18n("es", "default", {__A__:"foo"}) %}{{ translation }}
```  
