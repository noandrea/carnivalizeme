function stoca(fileReader, scope){
    fileReader.onload = function (onLoadEvent) {
      scope.$emit("fileUploaded", { fileBase64: onLoadEvent.target.result, size: onLoadEvent.total });
    };
}
angular.module("app").directive('fileUpload', function () {
    return {
        scope: true,        //create a new scope
        link: function (scope, el, attrs) {
            el.bind('change', function (event) {
                var files       = event.target.files;

                //iterate files since 'multiple' may be specified on the element
                for (var i = 0;i<files.length;i++) {
                    
                    if(files[i].type !== "image/png" && files[i].type !== "image/PNG"){
                        //emit event upward
                        scope.$emit("fileError", { file: files[i] });
                    }else{
                        var fileReader  = new FileReader();
                        fileReader.readAsDataURL(files[i]);

                        stoca(fileReader, scope);
                    }
                }
            });
        }
    };
});