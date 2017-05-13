/* Define custom server-side HTTP routes for lineman's development server
 *   These might be as simple as stubbing a little JSON to
 *   facilitate development of code that interacts with an HTTP service
 *   (presumably, mirroring one that will be reachable in a live environment).
 *
 * It's important to remember that any custom endpoints defined here
 *   will only be available in development, as lineman only builds
 *   static assets, it can't run server-side code.
 *
 * This file can be very useful for rapid prototyping or even organically
 *   defining a spec based on the needs of the client code that emerge.
 *
 */
 module.exports = {

  drawRoutes: function(app) {

    //var proxy = require('http-proxy');

    // var proxy = require('./../node_modules/lineman/node_modules/http-proxy');

    // var hp = proxy.createServer( { target: {
    //                                         host: 'localhost',
    //                                         port: 8080
    //                                       }
    //                             });
/*
console.log('------------------------------------------------');
console.log('PROXY');
console.log(proxy);
console.log('------------------------------------------------');
console.log('SERVER');
console.log(hp);
console.log('------------------------------------------------');
console.log('APPPPPPAPPPPPPAPPPPPPAPPPPPP');
console.log(app);
*/

    app.get('/masks', function (req, res) {

        var data = 
                [
                {image: 'mask_scuba.png', credits: 'http://www.scuba.com'},
                {image: 'mask_headglass.png', credits: 'http://headglass.com'},
                {image: 'mask_beard.png', credits: 'http://beard.com'},
                {image: 'mask_another.png', credits: 'http://beard.com'},
                {image: 'mask_lotsofshit.png', credits: 'http://lotsofstuff.com'},
                {image: 'mask_manual.png', credits: 'http://WIIII.com'}
                ];

      res.json(data);

  });

    
  // app.get('/q', function(req, res, next){
  //     alert('proxy mm');
  //   });
  // app.use('/m', function(req, res, next){


  //     console.log(req, res);
  //     //if(req.url.match(new RegExp('^\/m\/.*'))) {
  //       hp.proxyRequest(req, res);
  //       //hp.web(req, res);
  //     // } else {
  //     //   next();
  //     // }    
  // });
}
};
