angular.module("app").controller('EditorCtrl', function($scope, $document, snapRemote, lastWatchedImage) {
    
    //put a placeholder in the right drawer
    lastWatchedImage.reset();

    //close snappe and disable sliding
    snapRemote.close();
    snapRemote.getSnapper().then(function(snapper) {
        snapper.disable();
    });
    $scope.pageClass = 'page-editor';

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