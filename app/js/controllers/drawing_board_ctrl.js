angular.module("app").controller('drawingBoardCtrl', function($scope) {

    $scope.showGrid     = true;
    $scope.brushSize    = 10;
    $scope.blur         = 0.9;

    /**
     * delete everything from the board and leaves the board empty
     * 
     * @return {null}   [simply empty the board]
     */
    $scope.erase = function() {
        var m = confirm("Want to clear");
        if (m) {
            $scope.ctx.clearRect(0, 0, w, h);
            document.getElementById("canvasimg").style.display = "none";
        }
    };

    /**
     * Create the PNG image
     * 
     * @return {dataURL}    [the base64 image in an dataURL format eg. "data://bgf684df8s4s8..."]
     */
    $scope.save = function() {
        document.getElementById("canvasimg").style.border = "2px solid";
        var dataURL = $scope.canvas.toDataURL();
        document.getElementById("canvasimg").src = dataURL;
        document.getElementById("canvasimg").style.display = "inline";
    };


    /**
     * This activate the eraser so that you can delete previously drawn stuff
     * 
     * @return {null}           [nothing]
     */
    $scope.setEraser = function() {
        //$scope.fillStyle = "rgba(255,255,255,1)";
        $scope.ctx.globalCompositeOperation = "destination-out";
    };

    /**
     * This activate the eraser so that you can delete previously drawn stuff
     * 
     * @return {null}           [nothing]
     */
    $scope.setBrush = function() {
        $scope.fillStyle = "black";
        $scope.ctx.globalCompositeOperation = "source-over";
    };



});