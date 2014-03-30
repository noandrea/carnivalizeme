# carnivalize.me api

Usage and methods for carnivalize.me photo app.


default endopoint: **http://carnivalizemeapi.appspot.com/**

example api invocation:

[**http://carnivalizemeapi.appspot.com/mask/face7af8cb750ce1a1b402e4a5cef42056f9c59f**](http://carnivalizemeapi.appspot.com/mask/face7af8cb750ce1a1b402e4a5cef42056f9c59f)




## PUT /photo

create a new photo

#### params

| name | value
|------------------
|photo | image data
|meta | json data 


meta: 

    {
    	"tags" : [],
    	"masks": [], # required
    	"audience" : 0
    }
 
#### reply

200: 

    {
       "photo" : "/photo/:id",
       "url" : "/p/:id"
    }

400: bad parameters

304: not modified (photo already exists)
   
--------------- 
    
## GET /photo/:id

get the metadata of a photo

#### reply

200:

    {
       "id": ":id"
       "audience": 0,
       "tags": [
           "black",
           "white"
       ],
       "added": "2014-03-30T14:08:49.613337",
       "image": "/p/:id.gif",
       "up": 4,
       "dw": 0
	}
	
404: Not Found

---------------

## POST /photo/:id/up

upvote a photo

#### reply

200:

    {
       "up":1,
       "dw":0
    }

404: Not Found

---------------

## POST /photo/:id/dw

downvote a photo

#### reply

200:

    {
       "up":1,
       "dw":0
    }

404: Not Found


-----

## PUT /mask

create a new mask

#### params

| name | value
|------------------
|mask | image data
|meta | json data 


meta: 

    {
    	"tags" : [],
    	"audience" : 0
    	"email":"a@b.c"
    }
 
#### reply

200: 

    {
       "mask" : "/mask/:id",
       "url" : "/m/:id"
    }

400: bad parameters

304: not modified (mask already exists)
    
---------------

## GET /mask/:id

get a mask metadata

#### reply

200:

    {  
       "id" : ":id",
       "audience": 0,
       "tags": [
           "black",
           "white"
       ],
       "added": "2014-03-30T14:08:49.613337",
       "image": "/p/a97c7595fc233916596c9eed8a7894dc0b670d44.gif",
       "up": 4,
       "dw": 0,
       "photo_count":0
	}
	
404: Not Found

---------------

## POST /mask/:id/up

upvote a mask

#### reply

200:

    {
       "up":1,
       "dw":0
    }

404: Not Found


---------------

## POST /mask/:id/dw

downvote a mask

#### reply

200:

    {
       "up":1,
       "dw":0
    }

404: Not Found

--------

## GET /photos

get a list of photos sorted by upvotes and date of upload

####reply
200:
     
     [
         {  
            "id" : ":id",
            "audience": 0,
            "tags": [
                "black",
                "white"
            ],
            "added": "2014-03-30T14:08:49.613337",
            "image": "/p/a97c7595fc233916596c9eed8a7894dc0b670d44.gif",
            "up": 4,
            "dw": 0,
            "photo_count":0
	      },
	      .....
	  ]
	  
	  
---------------

## GET /masks

get a list of masks sorted by upvotes and date of upload

#### reply

200:
      
      [
          {  
             "id" : ":id",
             "audience": 0,
             "tags": [
                 "black",
                 "white"
             ],
             "added": "2014-03-30T14:08:49.613337",
             "image": "/p/a97c7595fc233916596c9eed8a7894dc0b670d44.gif",
             "up": 4,
             "dw": 0,
             "photo_count":0
          },
          ...
      ]
      
---------------
      
## GET /tags

get a list of tags sorted by count and date of upload

#### reply

200:
      
      [
          {
              id: "white",
              label: "white",
              added: "2014-03-30T14:07:19.972141",
              count: 3,
              langs: [
                  "en"
              ],
              sources: [
                  "MASK",
                  "USER"
              ]
          },
          ...
      ]

---------------

## GET /tags/photos/:tags

search photos tagged 

### params

:tags : pipe separated list of tags. ex: /tags/photos/white|black|brown


####reply
200:
     
     [
         {  
            "id" : ":id",
            "audience": 0,
            "tags": [
                "black",
                "white"
            ],
            "added": "2014-03-30T14:08:49.613337",
            "image": "/p/a97c7595fc233916596c9eed8a7894dc0b670d44.gif",
            "up": 4,
            "dw": 0,
            "photo_count":0
	      },
	      .....
	  ]

---------------

## GET /tags/masks

search masks tagged

#### params

:tags : pipe separated list of tags. ex: /tags/photos/white|black|brown

#### reply

200:
      
      [
          {  
             "id" : ":id",
             "audience": 0,
             "tags": [
                 "black",
                 "white"
             ],
             "added": "2014-03-30T14:08:49.613337",
             "image": "/p/a97c7595fc233916596c9eed8a7894dc0b670d44.gif",
             "up": 4,
             "dw": 0,
             "photo_count":0
          },
          ...
      ]

-----

## GET /p/:id.(gif|png)

get the binary image of a photo


---------------

## GET /m/:id.(png)

get the binary image of a mask






