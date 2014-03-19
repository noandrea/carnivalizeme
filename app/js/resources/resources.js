angular.module("app").factory("Masks", function($q, $resource) {
  return $resource(
    '/masks/', //:id\\/
//    { id: '@id' }, //default params
    {},
    {
        query:    { method: "GET",  params: {}, isArray: false }, //overrides default "query" to expect an object
        // update:   { method: "PUT" },
        // delete:   { method: 'DELETE', params: {reservation_id: '@reservation_id'} }
    }
  );
});