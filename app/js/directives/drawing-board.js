angular.module("app").directive('drawingBoard', function() {
  return {
    restrict: "E",
    controller: 'drawingBoardCtrl',
    replace: true,
    templateUrl: 'drawing_board.html',
    link: function(scope, el, attrs){
        //+++++++++++++++++++++++++++++++++++++++ MANAGE UPLOAD of a USER IMAGE
        //listen for the file selected event
        scope.$on("fileError", function (event, args) {
            console.log(args);
            //$scope.$apply(function () {            
                //add the file object to the scope's files collection
                //$scope.files.push(args.file);
                alert('Sorry, you can upload PNG images only.');
            //});
        });
        //listen for the file selected event
        scope.$on("fileUploaded", function (event, args) {
            scope.$apply(function () {
                console.log('uploaded');
                //here i could already send the image to the server
                scope.uploadedImage      = args;
                console.log(scope.uploadedImage);
            });
        });
    }
  };
});