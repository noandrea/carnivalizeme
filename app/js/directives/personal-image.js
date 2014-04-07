//create directive and INJECT optixCalService
angular.module("app").directive('personalImage', function() {
    return {
        restrict: 'E',
        replace: true,
        controller: 'drawingBoardCtrl',
        templateUrl: "personal_image.html",
        link: function(scope, element, attrs) {

            scope.showMenu = false;

            scope.$watch('showMenu', function(newVal, oldVal) {
                //console.log('changed showMenu');
            });

            element.bind('mouseover', function () {
                scope.showMenu = true;
                scope.$apply();
            });

            element.bind('mouseout', function () {
                scope.showMenu = false;
                scope.$apply();
            });
        }
    };
});