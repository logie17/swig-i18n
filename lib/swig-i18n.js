var _    = require('underscore');
var swig = require('swig');

var global_config = {
  imperial_language: 0 
};

function isDefined(ctx, match) {
  var m = match.split('.'),
  c = ctx + m[0],
  build = '';

  build = '(typeof ' + c + ' !== "undefined"';
  _.each(m, function (v, i) {
    if (i === 0) {
      return;
    }
    build += ' && ' + c + '.' + v + ' !== undefined';
    c += '.' + v;
  });
  build += ')';

  return build;
}

exports.init = function (translation_thing, config, next) {

  config = _.extend(global_config, config);
  var translations = typeof(translation_thing) === 'function' ? translation_thing() : translation_thing;
  
  function translate(tag, language, default_translation) {
    if ( config.imperial_language && config.imperial_language === language && default_translation) {
      return default_translation;
    } else {
      return translations && tag && language && translations[tag]
        && translations[tag][language] ? translations[tag][language]
        : default_translation;
    }
  }

  swig.setExtension('i18n', function(ctx, tag, default_translation) {
    var language = ctx.i18n ? ctx.i18n.language : 'unknown';
    return translate(tag, language, default_translation);
  });

  swig.setFilter('i18n', function(tag, language, default_translation, replacement_pairs) {
    var translation = translate(tag, language, default_translation);
    _.each(replacement_pairs, function(val, key) {
      translation = translation.replace(RegExp(key, "g"),val);
    });
    return translation;
  });

  var nameSet = '',
  propertyName;
  var end_is_safe = true;

  swig.setTag('i18n', function(str, line, parser, types) {
    var currentState = 0;

    parser.on(types.VAR, function(token) {
      var match = token ? token.match : '';
      if ( currentState == 0 ) { // Variable or string
        this.out.push(match);
        match = '(' + isDefined('_ctx.', match) + ' ? ' + '_ctx.' + match + ' : ' + isDefined('',match) + ' ? ' + match + ' : "' + match + '")';
        currentState = 1;
        this.out.pop();
        this.out.push(match);
        return false;
      } else {
        currentState = 2;
        if (propertyName) {
          propertyName += '_ctx.' + token.match;
          return;
        }

        end_is_safe = true;
        nameSet += token.match;
        return;
      }
    });

    parser.on(types.STRING, function(token) {
      if (propertyName) {
        propertyName += token.match;
        return;
      }
      end_is_safe = false;
      return true;
    });

    parser.on(types.NUMBER, function(token) {
      var match = token ? token.match : '';
      if (propertyName) {
        propertyName += token.match;
        return;
      }
      end_is_safe = false;
      return true;
    });

    parser.on(types.COLON, function (token) { 
      if ( currentState > 1 && end_is_safe === true) {
        this.out.push('(' + isDefined('_ctx.', nameSet) + ' ? ' + '_ctx.' + nameSet + ' : ' + isDefined('',nameSet) + ' ? ' + nameSet + ' : "' + nameSet + '")');
      }
      end_is_safe = true;
      nameSet = '';
      propertyName = undefined;
      return false;
    });

    parser.on(types.BRACKETOPEN, function (token) { 
      propertyName = token.match;
      return;
    });

    parser.on(types.BRACKETCLOSE, function (token) { 
      nameSet += propertyName + token.match;
      propertyName = false;
      return;
    });

    parser.on(types.COMMA, function (token) { 
      if ( currentState > 1 && end_is_safe === true) {
        this.out.push('(' + isDefined('_ctx.', nameSet) + ' ? ' + '_ctx.' + nameSet + ' : ' + isDefined('',nameSet) + ' ? ' + nameSet + ' : ' + nameSet + ')');
      }
      end_is_safe = true;
      nameSet = '';
      return false;
    });
    
    parser.on(types.DOTKEY, function (token) { 
      if (!propertyName && !nameSet) {
        return true;
      }
      nameSet += '.' + token.match;
      return;
    });
    
    parser.on('end', function(token) {
      if ( currentState > 1 && end_is_safe === true) {
        this.out.push('(' + isDefined('_ctx.', nameSet) + ' ? ' + '_ctx.' + nameSet + ' : ' + isDefined('',nameSet) + ' ? ' + nameSet + ' : ' + nameSet + ')');
        nameSet = '';
     }
    });
    
    parser.on(types.WHITESPACE, function (token) { 
      return false 
    });

    return true;
  },
  function(compiler, args, content, parents, options, blockName) {
    var tag = args.shift() || undefined;

    var output = '_output += (function() { var _output = "";\n'
        + 'var tag = ' + tag + ';'
        + compiler(content, parents, options, blockName)
        + 'var translate_result = _ext.i18n(_ctx, tag, _output);\n';
    while(args.length) {
      var search_for = args.shift() || undefined;
      var replace_with = args.shift() || undefined;
      while(args.length) {
        if ( args[0].match(/typeof/)) {
          break;
        }
        replace_with += args.shift();
      }
      output += 'var search_for = ' + search_for + ";\n";
      output += 'var replace_with = ' + replace_with + ";\n";
      output += 'translate_result = translate_result.replace(RegExp(search_for, "g")';
      output += ",(replace_with));\n";
    }
    output += 'return translate_result;})();';
    return output;
  }, true, true);

  if (next)
    next();
};
