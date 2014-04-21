// Images took from http://8biticon.com/ - MIT Licence
'use strict';

define(['./module', 'async'], function (directives, async) {
  var iconCache = {};
  directives.directive('face', ['$window', function ($window) {
    return {
      restrict: 'E', // element
      scope: {
        hash: '=',
        iconSize: '='
      },
      link: function(scope, element, attrs) {
        var iconSize = scope.iconSize || 32;
        
        var canvas = $window.document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        var ctx = canvas.getContext('2d');
        var nPieces = 6;
        var pieces = [];

        var total = {
          female: [5, 4, 33, 17, 59, 53],
          male: [5, 4, 36, 26, 65, 32]
        };

        var src = function(gender, piece, random) {  
          var head = gender === 'female' ? 'head' : 'hair';
          var pieces = ['background', 'face', head, 'mouth', 'clothes', 'eye'];
          var num = random % total[gender][piece] + 1;
          return '../images/faces/'+gender+'/'+pieces[piece]+num+'.png';
        };
        
        function calcDataFromFingerprint(dataHex) {
          var females = total.female.reduce(function(previousValue, currentValue) {
            return previousValue * currentValue;
          });
          var males = total.male.reduce(function(previousValue, currentValue) {
            return previousValue * currentValue;
          });

          var ret = [];
          var data = parseInt(dataHex, 16) % (females+males);
          if (data - females < 0) {
            var i = 0;
            ret = ['female'];
            while (data > 0 || i < total.female.length) {
              ret.push(data % total.female[i]);
              data = parseInt(data / total.female[i]);
              i++;
            }
          } else {
            data = data - females;
            var i = 0;
            ret = ['male'];
            while (data > 0 || i < total.male.length) {
              ret.push(data % total.male[i]);
              data = parseInt(data / total.male[i]);
              i++;
            }
          }
          return ret;
        }

        function generateImage(data, callback) {
          var gender = data[0];
          var onloads = [];
          for (var i=0; i<nPieces; i++) {
            var piece = new Image();
            piece.src = src(gender, i, data[i+1]);
            pieces.push(piece);
            onloads.push(function(callback) {
              piece.addEventListener('load', function() {
                callback(null);
              }, false);
            });
          }
          async.parallel(onloads, function() {
            for (var i=0; i < pieces.length; i++) {
              ctx.drawImage(pieces[i], 0, 0);
            }
            callback(canvas.toDataURL('image/png'));
          });
        }

        // Create the identicon
        function createFromHex(dataHex) {
          var iconId = [dataHex, iconSize];
          var update = function(data) {
            iconCache[iconId] = data;
            element.html('<img class="identicon" width='+iconSize+' height='+iconSize+' src="'+data+'">');
          };
          if (iconCache.hasOwnProperty(iconId)) {
            update(iconCache[iconId]);
          } else {
            generateImage(calcDataFromFingerprint(dataHex), update);
          }
        }
        // Watch for hash changes
        scope.$watch('hash', function() {
          if (scope.hash) {
            createFromHex(scope.hash.substr(16, 7));
          }
        });
      }
    };
  }]);
});