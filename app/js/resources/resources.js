angular.module("app").factory("Masks", function($q, $resource, API_BASE_URL) {
  return $resource(
    API_BASE_URL + '/masks/:id', null, //default params
    {
        update:   { method: "PUT" }
        //save:   { method: 'PUT'}
        //query:    { method: "GET",  params: {}, isArray: false }, //overrides default "query" to expect an object
        // delete:   { method: 'DELETE', params: {reservation_id: '@reservation_id'} }
    }
  );
});

angular.module("app").factory("Photos", function($q, $resource, API_BASE_URL) {
  return $resource(
    API_BASE_URL + '/photos/:id', null, //default params
    {
        update:   { method: "PUT" }
        //query:    { method: "GET",  params: {}, isArray: false }, //overrides default "query" to expect an object
        // update:   { method: "PUT" },
        // delete:   { method: 'DELETE', params: {reservation_id: '@reservation_id'} }
    }
  );
});