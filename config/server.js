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

    app.get('/masks', function (req, res) {

        var data = {

            status: {
                code: 200,
                message: 'Good'
            },

            response: [
                  {name: 'mask_scuba.png', credits: 'http://www.scuba.com'},
                  {name: 'mask_headglass.png', credits: 'http://headglass.com'},
                  {name: 'mask_beard.png', credits: 'http://beard.com'},
                  {name: 'mask_another.png', credits: 'http://beard.com'},
                  {name: 'mask_lotsofshit.png', credits: 'http://lotsofstuff.com'},
                  {name: 'mask_manual.png', credits: 'http://WIIII.com'}
            ]
        };

      res.json(data);


  });
}
};
