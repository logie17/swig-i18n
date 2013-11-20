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

