var _    = require('underscore');
var swig = require('swig');

exports.init_tag = function (translations, next) {
  
  swig.setExtension('i18n', function(ctx, tag, default_translation) {
   return translations && tag && ctx.i18n && ctx.i18n.language && translations[tag]
           && translations[tag][ctx.i18n.language] ? translations[tag][ctx.i18n.language]
           : default_translation ;
  });
  
  
  swig.setTag('i18n', function(str, line, parser, types) {
    var generate_output_code = function (literal, token) {
      var count = this.out.length;
      function checkDot(ctx, match) {
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
  
      var match = token.match;
  
      if ( count == 0 ) { // Variable or string
        match = '(' + checkDot('_ctx.', match) + ' ? ' + '_ctx.' + match + ' : "' + match + '")';
      } else {
        if (count % 2 !== 0) { /* key */
          match = match.replace(/[\'\"]/g,'');
          match = 'translate_result = translate_result.replace(RegExp("' + match +'", "g")';
        } else { /* value */
          if (literal) {
              match = ',("' + match.replace(/[\'\"]/g,'') + '"));';
          } else {
              match = ',(' + checkDot('_ctx.', match) + ' ? ' + '_ctx.' + match + ' : ""));';
          }
        } 
      }
      this.out.push(match);
    }
  
    parser.on(types.VAR, function(token) { return generate_output_code.apply(this, [ false, token ]) });
    parser.on(types.STRING, function(token) { return generate_output_code.apply(this, [ true, token ]) });
    parser.on(types.NUMBER, function(token) { return generate_output_code.apply(this, [ true, token ]) });
  
    parser.on(types.COLON, function (token) { });
    parser.on(types.WHITESPACE, function (token) { });
  
    parser.on('*', function (token) {
        throw new Error('!!!Unexpected token: "' + token.match + '" on line ' + line + '.');
    });
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

}

