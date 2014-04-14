//create directive and INJECT optixCalService
angular.module("app").directive('personalImage', function() {
    return {
        restrict: 'E',
        replace: true,
        controller: 'drawingBoardCtrl',
        templateUrl: "personal_image.html",
        link: function(scope, element, attrs) {

            scope.showMenu = false;

            element.bind('mouseenter', function () {
                scope.showMenu = true;
                scope.$apply();
            });

            element.bind('mouseleave', function () {
                scope.showMenu = false;
                scope.$apply();
            });
        }
    };
});