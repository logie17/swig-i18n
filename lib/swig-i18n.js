var _       = require('underscore');
var console = require('console');
var swig    = require('swig');

var global_config = {
  imperial_language: 0,
  debug: 0,
  analyze: 0,
  autoescape: null,
  active_languages:null
};

var compiledData = {};

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

exports.compiledData = function() {
    return compiledData;
};

exports.clearCompiledData = function() {
    compiledData = {};
};

exports.init = function (translation_thing, config, next) {

  config = _.extend(global_config, config);
  var translations = typeof(translation_thing) === 'function' ? translation_thing() : translation_thing;
  
  function translate(tag, language, defaultTranslation) {
    if ( (config.imperial_language && config.imperial_language === language && defaultTranslation) ||
            (config.active_languages && !_.contains(config.active_languages, language) && defaultTranslation)) {
      return defaultTranslation;
    } else {
      return translations && tag && language && translations[tag] && translations[tag][language] ? translations[tag][language] : defaultTranslation;
    }
  }

  swig.setExtension('i18n', function(ctx, tag, default_translation) {
    var language = ctx.i18n ? ctx.i18n.language : 'unknown';
    return translate(tag, language, default_translation);
  });

  swig.setFilter('i18n', function(tag, language, defaultTranslation, replacementPairs) {
    var translation = translate(tag, language, defaultTranslation);
    _.each(replacementPairs, function(val, key) {
      translation = translation.replace(new RegExp(key, "g"),val);
    });
    return translation;
  });

  swig.setTag('i18n', function(str, line, parser, types) {
    var handlingTag   = true,  // When we start we're handling the TAG
        endIsSafe     = true,  // We can call end catch all
        handlingSubs  = false, // We are handling substitutions if there is more found after TAG
        accumulatedJS = '';    // This is all of the accumulated javascript

    parser.on(types.VAR, function(token) {

      var match = token ? token.match : '';
      if (handlingTag) { // Variable or string
        this.out.push(match);
        // THIS IS A TOTAL HACK
        // We're trying to be smart here.
        // we want anything that isn't your typical JS var
        // to be treated as a static
        // otherwise if we have a var we treat it as such
        if (accumulatedJS) {
            match = '"' + accumulatedJS + match + '"';
        } else {
            match = '(' + isDefined('_ctx.', match) + ' ? ' + '_ctx.' + match + ' : ' + isDefined('',match) + ' ? ' + match + ' : "' + match + '")';
        }
        this.out.pop();
        this.out.push(match);
        handlingTag = false; // The tag has been parsed
      } else {
        if (!handlingSubs) {
          handlingSubs   = true;
        }
        accumulatedJS += match;
      }
      return false;
    });

    parser.on(types.STRING, function(token) {
      if (accumulatedJS) {
        accumulatedJS      += token.match;
        return false;
      }
      endIsSafe = false;
      return true;
    });

    parser.on(types.NUMBER, function(token) {
      if (accumulatedJS || handlingTag) {
        accumulatedJS      += token.match;
        return false;
      }
      endIsSafe = false;
      return true;
    });

    parser.on(types.COLON, function() {
      if ( handlingSubs ) {
        this.out.push(
          '(' + isDefined('_ctx.', accumulatedJS) + ' ? ' + '_ctx.' + accumulatedJS + ' : ' +
          isDefined('',accumulatedJS) + ' ? ' + accumulatedJS + ' : "' + accumulatedJS + '")'
        );
      }
      accumulatedJS = '';
      endIsSafe = true;
      return false;
    });

    parser.on(types.BRACKETOPEN, function(token) {
      accumulatedJS += token.match;
      return false;
    });

    parser.on(types.BRACKETCLOSE, function(token) {
      accumulatedJS += token.match;
      return false;
    });

    parser.on(types.COMMA, function() {
      if ( handlingSubs && endIsSafe) {
        this.out.push(
          '(' + isDefined('_ctx.', accumulatedJS) + ' ? ' + '_ctx.' + accumulatedJS + ' : ' +
          isDefined('',accumulatedJS) + ' ? ' + accumulatedJS + ' : "")'
        );
      }
      endIsSafe     = true;
      accumulatedJS = '';
      return false;
    });
    
    parser.on(types.DOTKEY, function (token) {
      if (!accumulatedJS) {
        return true;
      }
      accumulatedJS += '.' + token.match;
      return false;
    });
    
    parser.on('end', function() {
      if ( handlingSubs && endIsSafe ) {
        this.out.push(
          '(' + isDefined('_ctx.', accumulatedJS) + ' ? ' + '_ctx.' + accumulatedJS + ' : ' +
          isDefined('',accumulatedJS) + ' ? ' + accumulatedJS + ' : "")'
        );
        accumulatedJS = '';
     }
    });
    
    parser.on(types.WHITESPACE, function() {
      return false;
    });

    return true;
  },
  function(compiler, args, content, parents, options, blockName) {
    var tag = args.shift() || undefined;

    content = compiler(content, parents, options, blockName);
    if (config.analyze) {
       compiledData[eval("_ctx = {};" + tag)] = eval("var _output = '';" + content);
    }

    var output = '_output += (function() { var _output = "";\n' +
        'var tag = ' + tag + ';' +
        content +
        'var translate_result = _ext.i18n(_ctx, tag, _output);\n';
    while(args.length) {
      var searchFor = args.shift() || undefined;
      var replaceWith = args.shift() || undefined;

      while(args.length) {
        if ( args[0].match(/typeof/)) {
          break;
        }
        replaceWith += args.shift();
      }

      output += 'var searchFor = ' + searchFor + ";\n";
      output += 'var replaceWith = ';
      if (typeof(config.autoescape) === 'string') {
          output += '_filters["escape"](' + replaceWith + ',"' + config.autoescape + '");\n';
      } else {
          output += replaceWith + ';\n';
      }
      output += 'translate_result = translate_result.replace(RegExp(searchFor, "g")';
      output += ",(replaceWith));\n";
    }

    output += 'return translate_result;})();';

    if(config.debug > 0){
      console.log(output);
    }

    return output;
  },
  true,
  true);

  if (next) {
    next();
  }
};
