//create directive and INJECT optixCalService
angular.module("app").directive('personalImage', function() {
    return {
        restrict: 'E',
        replace: true,
        controller: 'drawingBoardCtrl',
        scope: {
            theImage:        '=source'
        },
        templateUrl: "personal_image.html",
        link: function(scope, element, attrs) {


            scope.$watch('showMenu', function(newVal, oldVal) {
                console.log('changed showMenu');
            });

            scope.$watch('theImage', function(newVal, oldVal) {
                //console.log('changeeeed');
                    if(newVal.binary){
                        //console.log('HOOOOP');
                        var b64Image    = encode64(newVal.binary);
                        var blob        = b64toBlob(b64Image, 'image/gif');
                        scope.imageUrl  = URL.createObjectURL(blob);  //TODO: here i should make a "webkitURL" alternative
                    }
            });

            element.bind('mouseover', function () {
                console.log('over');
                scope.showMenu = true;
                console.log(scope.showMenu);
            });

            element.bind('mouseout', function () {
                console.log('out');
                scope.showMenu = false;
                console.log(scope.showMenu);
            });
        }
    };
});