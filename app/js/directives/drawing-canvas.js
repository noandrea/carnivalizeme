angular.module("app").directive('drawingCanvas', function(html5Storage) {
  return {
    restrict: "E",
    controller: 'drawingBoardCtrl',
    replace: true,
    templateUrl: 'drawing_canvas.html',
    link: function(scope, element, attrs){


        /**
         * The concept behind this is an inspiration from http://perfectionkills.com/exploring-canvas-drawing-techniques/
         */
        var canvas, ctx, flag = false,
        prevX = 0,
        currX = 0,
        prevY = 0,
        currY = 0,
        dot_flag = false;
        
        var previousCanvas = html5Storage.get('drawing_canvas', 'canvas') ? html5Storage.get('drawing_canvas', 'canvas') : null;
        console.log(previousCanvas);


        canvas          = scope.canvas = element[0];
        ctx             = scope.ctx = canvas.getContext("2d");
        ctx.lineJoin    = ctx.lineCap = 'round';


        //if the guy was drawing already......let him see his shiet
        if(previousCanvas && previousCanvas.length){
            var img = new Image();
            img.src = previousCanvas;
            img.onload = function () {
                ctx.drawImage(img, 0, 0);
            };
        }

        w       = canvas.width;
        h       = canvas.height;

        var isDrawing, lastPoint;

        element.bind('mousemove', function (e) {
            //var yScroll = (element.pageYOffset !== undefined) ? element.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
            console.log('Y SCROLL:', window.pageYOffset);

            if (!isDrawing) { return; }

            var currentPoint = { x: e.clientX - element[0].offsetParent.offsetLeft, y: e.clientY - (element[0].offsetParent.offsetTop - window.pageYOffset) };
            var dist = distanceBetween(lastPoint, currentPoint);
            var angle = angleBetween(lastPoint, currentPoint);

            for (var i = 0; i < dist; i+=3) {

                x = lastPoint.x + (Math.sin(angle) * i);
                y = lastPoint.y + (Math.cos(angle) * i);

                var rgbaFillStyle = hexToRgb(scope.controls.brush.fillStyle);
                var innerRadius = scope.controls.brush.size/20;
                var outerRadius = scope.controls.brush.size;

                var radgrad = ctx.createRadialGradient(x, y, innerRadius, x, y, outerRadius);

                radgrad.addColorStop(0, scope.controls.brush.fillStyle);
                radgrad.addColorStop(0.2, 'rgba(' + rgbaFillStyle.r + ',' + rgbaFillStyle.g + ',' + rgbaFillStyle.b + ', ' + scope.controls.brush.blur + ')');
                radgrad.addColorStop(1, 'rgba(' + rgbaFillStyle.r + ',' + rgbaFillStyle.g + ',' + rgbaFillStyle.b + ', 0)');

                ctx.fillStyle = radgrad;
                ctx.fillRect(x-20, y-20, 40, 40);
            }

            lastPoint = currentPoint;
        });

        element.bind('mousedown', function (e) {
            isDrawing = true;
            lastPoint = { x: e.clientX - (element[0].offsetParent.offsetLeft - window.pageXOffset), y: e.clientY - (element[0].offsetParent.offsetTop - window.pageYOffset) };
        });

        element.bind('mouseup', function (e) {
            html5Storage.set('drawing_canvas', canvas, 'canvas');
            isDrawing = false;
        });

        element.bind('mouseout', function (e) {
            //findxy('out', e);
        });



        function distanceBetween(point1, point2) {
            return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
        }
        function angleBetween(point1, point2) {
            return Math.atan2( point2.x - point1.x, point2.y - point1.y );
        }




        /**
         * Helper function to get RGB values from HEX
         * @param  {[type]} hex [description]
         * @return {[type]}     [description]
         */
        function hexToRgb(hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }

    }
  };
});