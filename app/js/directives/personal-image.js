//create directive and INJECT optixCalService
angular.module("app").directive('personalImage', function() {
    return {
        restrict: 'E',
        replace: true,
        controller: 'drawingBoardCtrl',
        templateUrl: "personal_image.html",
        link: function(scope, element, attrs) {

            scope.showMenu = true;

            scope.$watch('showMenu', function(newVal, oldVal) {
                console.log('changed showMenu');
            });

            element.bind('mouseover', function () {
                console.log('over');
                //scope.showMenu = true;
                console.log(scope.showMenu);
                scope.$apply();
            });

            element.bind('mouseout', function () {
                console.log('out');
                //scope.showMenu = false;
                console.log(scope.showMenu);
                scope.$apply();
            });
        }
    };
});