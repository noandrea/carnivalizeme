//create directive and INJECT optixCalService
angular.module("app").directive('personalImage', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            theImage:        '=source'
        },
        templateUrl: "personal_image.html",
        link: function(scope, element, attrs) {


            scope.$watch('theImage', function(newVal, oldVal) {
                console.log('changeeeed');
                    if(newVal.binary){
                        console.log('HOOOOP');
                        var b64Image    = encode64(newVal.binary);
                        var blob        = b64toBlob(b64Image, 'image/gif');
                        scope.imageUrl  = URL.createObjectURL(blob);  //TODO: here i should make a "webkitURL" alternative
                    }
            });
        }
    };
});