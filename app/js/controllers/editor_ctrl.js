angular.module("app").controller('EditorCtrl', function($scope, $location, $timeout, trackingService, $document) {
    
    $scope.pageClass = 'page-editor';

    $scope.showModal = function(){
        //alert('show!');
        angular.element($document[0].body).addClass('lock');
        $scope.modal_show = 1;
        $scope.modal_wrapper_show = 1;

    };
    $scope.hideModal = function(){
        $scope.modal_show = 0;
        angular.element($document[0].body).removeClass('lock');
        setTimeout(function() {
            $scope.modal_wrapper_show = 0;
            $scope.$apply();
        }, 400);
    };
    
});