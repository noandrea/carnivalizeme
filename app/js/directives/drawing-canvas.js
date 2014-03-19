angular.module("app").directive('drawingCanvas', function() {
  return {
    restrict: "E",
    controller: 'drawingBoardCtrl',
    replace: true,
    templateUrl: 'drawing_canvas.html',
    link: function(scope, element, attrs){


        var canvas, ctx, flag = false,
        prevX = 0,
        currX = 0,
        prevY = 0,
        currY = 0,
        dot_flag = false;

        var fillStyle = scope.fillStyle = "#000000",
            lineWidth = scope.lineWidth = 2;
        
        canvas          = scope.canvas = element[0].children[1];
        ctx             = scope.ctx = canvas.getContext("2d");
        ctx.lineJoin    = ctx.lineCap = 'round';

        w       = canvas.width;
        h       = canvas.height;


        var isDrawing, lastPoint;

        element.bind('mousemove', function (e) {
            if (!isDrawing) { return; }

            var currentPoint = { x: e.clientX - canvas.offsetLeft, y: e.clientY - (canvas.offsetTop - window.pageYOffset) };
            var dist = distanceBetween(lastPoint, currentPoint);
            var angle = angleBetween(lastPoint, currentPoint);

            for (var i = 0; i < dist; i+=3) {

                x = lastPoint.x + (Math.sin(angle) * i);
                y = lastPoint.y + (Math.cos(angle) * i);

                var rgbaFillStyle = hexToRgb(scope.fillStyle);
                var innerRadius = scope.brushSize/20;
                var outerRadius = scope.brushSize;

                var radgrad = ctx.createRadialGradient(x, y, innerRadius, x, y, outerRadius);

                radgrad.addColorStop(0, scope.fillStyle);
                radgrad.addColorStop(0.2, 'rgba(' + rgbaFillStyle.r + ',' + rgbaFillStyle.g + ',' + rgbaFillStyle.b + ', ' + scope.blur + ')');
                radgrad.addColorStop(1, 'rgba(' + rgbaFillStyle.r + ',' + rgbaFillStyle.g + ',' + rgbaFillStyle.b + ', 0)');

                ctx.fillStyle = radgrad;
                ctx.fillRect(x-20, y-20, 40, 40);
            }

            lastPoint = currentPoint;
        });

        element.bind('mousedown', function (e) {
            isDrawing = true;
            lastPoint = { x: e.clientX - canvas.offsetLeft, y: e.clientY - (canvas.offsetTop - window.pageYOffset) };
        });

        element.bind('mouseup', function (e) {
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











        // /**
        //  * Simple "draw" function that allows the user to
        //  * draw stuff
        //  * 
        //  * @return {[type]} [description]
        //  */
        // function draw() {
        //     ctx.beginPath();
        //     ctx.moveTo(prevX, prevY);
        //     ctx.lineTo(currX, currY);
            
        //     ctx.lineWidth = scope.brushSize;
        //     ctx.lineJoin = ctx.lineCap = 'round';

        //     //ctx.arc(currX,currY, scope.brushSize, 0, 2*Math.PI);
            
        //     var rgbaFillStyle = hexToRgb(scope.fillStyle);
        //     var innerRadius = scope.brushSize/20;
        //     var outerRadius = scope.brushSize;


        //     var gradient = ctx.createRadialGradient(currX, currY, innerRadius, currX, currY, outerRadius);
        //     gradient.addColorStop(0, scope.fillStyle);
        //     gradient.addColorStop(0.5, 'rgba(' + rgbaFillStyle.r + ',' + rgbaFillStyle.g + ',' + rgbaFillStyle.b + ', 0.5)');
        //     gradient.addColorStop(1, 'rgba(' + rgbaFillStyle.r + ',' + rgbaFillStyle.g + ',' + rgbaFillStyle.b + ', 0)');

        //     ctx.strokeStyle = scope.fillStyle;

        //     //ctx.fillStyle = gradient;
        //     //ctx.fill();

        //     ctx.stroke();
        //     ctx.closePath();
        // }






        // /**
        //  * findxy draw/stop/find pointer position
        //  * 
        //  * @param  {string} res ["out"/"up"/"down"/"move"]
        //  * @param  {object} e   [event (click/move/up/down)]
        //  * 
        //  * @return {nul}        [nothing]
        //  */
        // function findxy(res, e) {

        //     if (res === 'down') {
        //         prevX = currX;
        //         prevY = currY;
        //         currX = e.clientX - canvas.offsetLeft;
        //         currY = e.clientY - canvas.offsetTop;

        //         flag = true;
        //         dot_flag = true;
        //         if (dot_flag) {
        //             ctx.beginPath();
        //             ctx.fillStyle = scope.fillStyle;
        //             ctx.fillRect(currX, currY, 2, 2);
        //             ctx.closePath();
        //             dot_flag = false;
        //         }
        //     }
        //     if (res === 'up' || res === "out") {
        //         flag = false;
        //     }
        //     if (res === 'move') {
        //         if (flag) {
        //             prevX = currX;
        //             prevY = currY;
        //             currX = e.clientX - canvas.offsetLeft;
        //             currY = e.clientY - canvas.offsetTop;
        //             draw();
        //         }
        //     }

        // }

    }
  };
});