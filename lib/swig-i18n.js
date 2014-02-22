var _    = require('underscore');
var swig = require('swig');

var STATES = {
  BEGIN:0,
  KEY:1,
  ACCUM_VALUE:2,
  SET_VALUE:3
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

exports.init_tag = function (translation_thing, next) {

  swig.setExtension('i18n', function(ctx, tag, default_translation) {
    var translations = typeof(translation_thing) === 'function' ?
          translation_thing() : translation_thing;
    return translations && tag && ctx.i18n && ctx.i18n.language && translations[tag]
      && translations[tag][ctx.i18n.language] ? translations[tag][ctx.i18n.language]
      : default_translation ;
  });

  swig.setTag('i18n', function(str, line, parser, types) {
    var currentState = 0;
    var generate_output_code = function (token) {

      var match = token ? token.match : '';

      /* This checks each dot position in an object
       * for undefinedness. So it'll generate a string like
       * (typeof ctx.foo !== "undefined" && ctx.foo.bar !== undefined)
       */
      if ( currentState == STATES.BEGIN ) { // Variable or string
        match = '(' + isDefined('_ctx.', match) + ' ? ' + '_ctx.' + match + ' : ' + isDefined('',match) + ' ? ' + match + ' : "' + match + '")';
        currentState = 1;
        this.out.push(match);
      } else {
        if (currentState === STATES.KEY) { /* key */
          match = match.replace(/[\'\"]/g,'');
          match = 'translate_result = translate_result.replace(RegExp("' + match +'", "g")';
          this.out.push(match);
        } else if (currentState === STATES.ACCUM_VALUE ){ /* value */
          accumulatedValue += token.match;
        } else if (currentState === STATES.SET_VALUE ) {
          if ( accumulatedValue.match(/^[a-zA-Z\'\"\s]+$/) ) {
            match = ',("' + accumulatedValue.replace(/[\'\"]/g,'') + '"));';
          } else {
            match = ',(' + isDefined('_ctx.', accumulatedValue) + ' ? ' + '_ctx.' + accumulatedValue + ' : ""));';
          }
          this.out.push(match);
        }
      }
    };

    var accumulatedValue = '';
    parser.on('*', function (token) {
      throw new Error('Unexpected token: "' + token.match + '" on line ' + line + '.');
    });

    parser.on(types.VAR, function(token) {
      return generate_output_code.apply(this, [ token ]);
    });

    parser.on(types.STRING, function(token) {
      return generate_output_code.apply(this, [ token ]);
    });

    parser.on(types.NUMBER, function(token) {
      return generate_output_code.apply(this, [ token ]);
    });

    parser.on(types.COLON, function (token) { 
      accumulatedValue = '';
      currentState = STATES.ACCUM_VALUE; 
    });

    parser.on(types.BRACKETOPEN, function (token) { 
      currentState = STATES.ACCUM_VALUE; 
      return generate_output_code.apply(this, [ token ]);
    });

    parser.on(types.BRACKETCLOSE, function (token) { 
      currentState = STATES.ACCUM_VALUE; 
      return generate_output_code.apply(this, [ token ]);
    });

    parser.on(types.COMMA, function (token) { 
      currentState = STATES.SET_VALUE; 
      token.match = '';
      var output = generate_output_code.apply(this, [ token ]);
      currentState = STATES.KEY; 
      return output;
    });
    
    parser.on(types.DOTKEY, function (token) { 
      currentState = STATES.ACCUM_VALUE; 
      token.match = '.' + token.match;
      return generate_output_code.apply(this, [ token ]);
    });
    
    parser.on('end', function(token) {
      if (currentState == STATES.ACCUM_VALUE) {
        currentState = STATES.SET_VALUE;
        return generate_output_code.apply(this, [ ]);
      }
    });
    
    parser.on(types.WHITESPACE, function (token) { });

    return true;
  },
  function(compiler, args, content, parents, options, blockName) {
    var tag = args.shift();
    var output = '_output += (function() { var _output = "", tag = ' + tag + ";\n"
        + compiler(content, parents, options, blockName)
        + 'var translate_result = _ext.i18n(_ctx, tag, _output);\n';
    output += args.join('\n');
    output += 'return translate_result;})();';
    return output;
  }, true, true);
};
