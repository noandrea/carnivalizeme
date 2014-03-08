angular.module("app").controller('EditorCtrl', function($scope, $location, $timeout, trackingService) {
    $scope.pageClass = 'page-editor';

    $scope.isTrackingActive = function(){
        alert('tracker is active: ' + trackingService.isActive());
    };

});