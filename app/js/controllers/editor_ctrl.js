angular.module("app").controller('EditorCtrl', function($scope, $rootScope, $document, lastWatchedImage) {

    //check Age
    $rootScope.checkAge();
    
    //put a placeholder in the right drawer
    lastWatchedImage.reset();
    $scope.pageClass    = 'page-editor';
    
    var header = angular.element(document.getElementsByTagName("header")[0]);
    header.addClass('hide');

    $scope.showModal = function(){
        //alert('show!');
        //angular.element($document[0].body).addClass('lock');
        $scope.modal_show = 1;
        $scope.modal_wrapper_show = 1;

    };
    $scope.hideModal = function(){
        $scope.modal_show = 0;
        //angular.element($document[0].body).removeClass('lock');
        setTimeout(function() {
            $scope.modal_wrapper_show = 0;
            $scope.$apply();
        }, 400);
    };
    
});