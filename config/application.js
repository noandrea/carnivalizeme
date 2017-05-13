/* Exports a function which returns an object that overrides the default &
 *   plugin grunt configuration object.
 *
 * You can familiarize yourself with Lineman's defaults by checking out:
 *
 *   - https://github.com/linemanjs/lineman/blob/master/config/application.coffee
 *   - https://github.com/linemanjs/lineman/blob/master/config/plugins
 *
 * You can also ask Lineman's about config from the command line:
 *
 *   $ lineman config #=> to print the entire config
 *   $ lineman config concat.js #=> to see the JS config for the concat task.
 */
 module.exports = function(lineman) {
  //Override application configuration here. Common examples follow in the comments.
  return {
    // grunt-angular-templates assumes your module is named "app", but
    // you can override it like so:
    //
    // ngtemplates: {
    //   options: {
    //     module: "myModuleName"
    //   }
    // },
    // 
    // task override configuration
    appendTasks: {
      common: ["ngconstant"] // ngtemplates runs in dist and dev
    },

  
   server: {
      pushState: true,
      // API Proxying
      //
      // During development, you'll likely want to make XHR (AJAX) requests to an API on the same
      // port as your lineman development server. By enabling the API proxy and setting the port, all
      // requests for paths that don't match a static asset in ./generated will be forwarded to
      // whatever service might be running on the specified port.
      //
      //
      // enables HTML5 pushState;
      // Lineman will serve `generated/index.html` for any request that does not match the apiProxy.prefix
      apiProxy: {
        enabled: true,
        host: 'http://localhost',
        port: 8000,
        prefix: '' // request paths that contain '_ah' will now be the only ones forwarded to the apiProxy
      }
    },

    //configurations of constants using ngconstant loaded through "loadNpmTasks" (from this file)
    //following is the same as a "Gruntfile.js" would do.
    ngconstant: {
      options: {
        space: '    '
      },

      dist: {
        options: {
          dest: 'dist/js/config.js',
          name: 'config'
        },
        constants: {
          ENVIRONMENT: 'dist',
          API_BASE_URL: 'http://carnivalize.me'
        }
      },
      dev: {
        options: {
          dest: 'generated/js/config.js',
          name: 'config'
        },
        constants: {
          ENVIRONMENT: 'dev',
          API_BASE_URL: 'http://localhost:8080' //'https://optix.api' //http://localhost:8000 or //change it to "http://optix.api" to use the local API server (to test and/or to adjust calls)
        }
      }
    },

    // Sass
    //
    // Lineman supports Sass via grunt-contrib-sass, which requires you first
    // have Ruby installed as well as the `sass` gem. To enable it, comment out the
    // following line:
    //
    enableSass: true,
    //configure Sass task
    sass: {
      compile: {
        options: {
          loadPath: ["app/sass", "app/css", "vendor/css"]
        }
        //files: ["<%= files.sass.generatedApp %>", "<%= files.sass.main %>"]
      }
    },

    // Asset Fingerprints
    //
    // Lineman can fingerprint your static assets by appending a hash to the filename
    // and logging a manifest of logical-to-hashed filenames in dist/assets.json
    // via grunt-asset-fingerprint
    //
    // enableAssetFingerprint: true

    // configure lineman to load additional angular related npm tasks
    loadNpmTasks: lineman.config.application.loadNpmTasks.concat("grunt-ng-constant"),

    removeTasks: {
      common: ["handlebars", "jst", "less", "coffee"] //concat
    }


  };
};
