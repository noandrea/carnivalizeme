angular.module("app").factory("Masks", function($q, $resource, API_BASE_URL) {
  return $resource(
    API_BASE_URL + '/masks/:id', null, //default params
    {
        update:   { method: "PUT" },
        tags:      { url: API_BASE_URL + '/masks/tags/:tags', method: "GET", isArray: true }
        //save:   { method: 'PUT'}
        // delete:   { method: 'DELETE', params: {reservation_id: '@reservation_id'} }
    }
  );
});

angular.module("app").factory("Photos", function($q, $resource, API_BASE_URL) {
  return $resource(
    API_BASE_URL + '/photos/:id', null, //default params
    {
        update:     { method: "PUT" },
        voteup:     { url: API_BASE_URL + '/photos/:id/up', method: "PUT" },
        votedown:   { url: API_BASE_URL + '/photos/:id/dw', method: "PUT" },
        tags:       { url: API_BASE_URL + '/photos/tags/:tags', method: "GET", isArray: true },
        // update:   { method: "PUT" },
        query:   { isArray: false }
    }
  );
});