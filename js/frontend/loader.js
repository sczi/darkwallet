/**
 * configure RequireJS
 * prefer named modules to long paths
 */
'use strict';

require.config({
  deps: [
    'frontend/app',
    'frontend/routes'
  ],
  callback: function(app, routes) {
    app.initialize();
  }
});