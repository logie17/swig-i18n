swig-i18n
=========

[![NPM](https://nodei.co/npm/swig-i18n.png?downloads=true)](https://nodei.co/npm/swig-i18n/)

[![Build Status](https://secure.travis-ci.org/logie17/swig-i18n.png?branch=master)](http://travis-ci.org/logie17/swig-i18n)

=========

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
```html
  <div>
    {% i18n TAG %}Default text{% endi18n%}
  </div>
```

### Output
```html
  <div>
    foo
  </div>
```

Or, if one chooses they can call this as a filter on a bit of text:

```html
  {% set translation = "TAG_LOOKUP"|i18n("es", "default" %}
  <div>
    {{ translation }}
  </div>
```  

## Other Notable Features

### Replacements

This module also supports simple search and replacement:

### Swig

```html
  {% set foo = 'baz' %}
  <div>
    {% i18n TAG __foo__:foo %}Default text with __foo__{% endi18n%}
  </div>
```

### Output
```html
   <div>
    Default text with baz
  </div>
```

### Swig
```html
  {% set foo = 'baz' %}
  {% set tag = 'TAG' %}
  <div>
    {% i18n tag __foo__:foo %}Default text with __foo__{% endi18n%}
  </div>
```

### Output
```html
   <div>Default text with baz</div>
```

### Callback lookups

One could also setup the translation data structure to originate from a callback:

```javascript
swig_i18n.init(function(){ 
  return {TAG: { es: 'foo' } };
});
```

### Imperial Language Support

The module also supports a feature called "imperial_language". The idea is that if
a translation is required for a language that is set as the default imperial language
the module will *favor* the default text as translation instead of looking inside the data
structure.

To enable this functionality the following needs to be done:

```javascript
  var swig_i18n = require('swig-i18n.js');
  swig_i18n.init({ TAG: { es: 'foo' } }, { imperial_language: 'es' });
```

### Autoescape Replacements

The module supports autoescaping any replacement text, by default this is
turned *off*.

```javascript
  var swig_i18n = require('swig-i18n.js');
  swig_i18n.init({ TAG: { es: 'foo' } }, {autoescape:'html'});

```

Within the tag if you have a search replace, the output of the
replace value will now be HTML escaped.

```html
  {% set foo = '<span>data</span>' %}
  <div>
    {% i18n TAG __foo__:foo %}Default text with __foo__{% endi18n%}
  </div>
```

### Active Languages

The module supports an "active_languages" option that allows your application to have a partial set of translations 
without displaying a partially translated site. When this option is set to an array of language codes only those 
languages will be translated regardless of the presence of a translated string for a given tag. In these cases the default
will be used.

```javascript
  var swig_i18n = require('swig-i18n.js');
  swig_i18n.init({ TAG: { en: 'foo', es: 'bar', ru: 'nope' } }, {active_languages:['en','es']});

```

License
-------

Copyright (c) 2010-2014 Shutterstock Images, LLC

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

