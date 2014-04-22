#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import webapp2
import hashlib
import json
import lib.cloudstorage as gcs
import logging
import os
import base64
from google.appengine.api import app_identity
from google.appengine.api import images
from google.appengine.ext import blobstore
from model.carnivalize import Tag
from model.carnivalize import Mask
from model.carnivalize import Photo
from datetime import datetime


BUCKET = 'carnivalizemeapi.appspot.com'
FOLDER_MASKS = 'masks'
FOLDER_PHOTOS = 'photos'

class MainHandler(webapp2.RequestHandler):
    def get(self):
        self.response.write('Hello world!')

class TagHandler(webapp2.RequestHandler):
    def get(self):
        self.response.headers['Access-Control-Allow-Origin'] = "*"
        tags = Tag.query().order(-Tag.count, -Tag.added).fetch(20)
        reply = []
        for tag in tags:
            reply.append(Tag.to_json_object(tag))

        self.response.headers['Content-Type'] = 'application/json'
        self.response.write(json.dumps(reply))     

class PhotoHandler(webapp2.RequestHandler):

    def get(self):
        self.response.headers['Access-Control-Allow-Origin'] = "*"

        photos = Photo.query().order(-Photo.up_vote, -Photo.added).fetch(20)

        reply = []
        for photo in photos:
            reply.append(Photo.to_json_object(photo))

        self.response.headers['Content-Type'] = 'application/json'
        self.response.write(json.dumps(reply))

    # insert photo
    def post(self):
        try:
            # get all parameters
            data = json.loads(self.request.body)
            ext = data.get('type')

            # mime type must be present and must be png or gif
            if ext is None or ext not in ['png', 'gif']:
                raise Exception('invalid format')

            # image must be present
            image = data.get('image', None)
            if image is None:
                raise Exception('missing image')

            # parse image
            image = base64.b64decode(image.replace('data:image/%s;base64,' % ext,''))
            
            # source ip
            ip = self.request.remote_addr

            email = data.get('email', '')
            tags = data.get('tags', [])
            lang = data.get('lang', 'en')
            audience = int(data.get('audience', 0))
            masks = data.get('masks', [])


            # mask must be present
            if len(masks) == 0:
                raise Exception('masks is empty')

            # caclulate photo id
            photo_id = hashlib.sha1(image).hexdigest()
            photo = Photo.get_by_id(photo_id)

            # check if phot exists
            if photo is not None:
                self.response.headers['Access-Control-Allow-Origin'] = "*"
                self.response.set_status('304')
                return
            

            tags_list = []

            # if there are new tags create them
            for tag in tags:
                tag = Tag.get_or_create(tag, source='USER', lang=lang)
                tags_list.append(tag.key.id())

            # find the other tags in the masks
            for mask_id in masks:
                mask = Mask.get_by_id(mask_id)
                if mask is not None:
                    tags_list.extend(mask.tags)
                    mask.photo_count += 1
                    mask.put()
            tags_list = list(set(tags_list))

            # save it on cloud storage
            bucket_name = os.environ.get('BUCKET_NAME', app_identity.get_default_gcs_bucket_name())

            filename = '%s.%s' % (photo_id, ext)
            gs_filename = '/%s/%s/%s' % (bucket_name, FOLDER_PHOTOS, filename)

            gcs_file = gcs.open(gs_filename, 'w', content_type='image/%s' % ext, options={'x-goog-acl':'bucket-owner-full-control','x-goog-meta-foo': 'foo'})
            gcs_file.write(image)
            gcs_file.close()
            # create a key for the stored file
            gs_key = blobstore.create_gs_key('/gs/'+gs_filename)
            # get the cache url for the image
            serving_url = images.get_serving_url(gs_key)

            photo = Photo(id=photo_id)
            photo.populate(
                filename = filename,
                ip = ip,
                audience = audience,
                masks = masks,
                tags = tags_list,
                email= email,
                ext = ext,
                thumb=serving_url)
            photo.put()

            response_data = {
                "id" : photo_id,
                "photo" : "/photos/%s" % photo_id,
                "url" : "/p/%s" % filename,
                "thumb" : photo.thumb

            }

            self.response.headers['Access-Control-Allow-Origin'] = "*"
            self.response.headers['Content-Type'] = 'application/json'
            self.response.write(json.dumps(response_data))
        except Exception, e:
            self.response.headers['Access-Control-Allow-Origin'] = "*"
            self.response.set_status('400')
            self.response.write(e.message)

    # udpate photo
    def update(self, _id):
        try:
            # get all parameters
            data = json.loads(self.request.body)
            
            # source ip
            ip = self.request.remote_addr

            email = data.get('email', '')
            tags = data.get('tags', [])
            lang = data.get('lang', 'en')
            audience = int(data.get('audience', 0))
            
            tags_list = []

            # if there are new tags create them
            for tag in tags:
                tag = Tag.get_or_create(tag, source='USER', lang=lang)
                tags_list.append(tag.key.id())

            # get the existing photo
            photo = Photo.get_by_id(_id)
            if photo is None:
                self.response.headers['Access-Control-Allow-Origin'] = "*"
                self.response.set_status('404')
                self.response.write("Not Found")
            
            photo.audience = audience
            photo.tags.extend(tags_list)
            photo.tags = list(set(photo.tags))
            photo.email = email
            photo.put()

            # self.response.headers['Content-Type'] = 'application/json'
            # self.response.write(Photo.to_json_string(photo))

            response_data = {
                "id" : _id,
                "photo" : "/photos/%s" % _id,
                "thumb" : photo.thumb,
                "url" : "/p/%s" % _id
            }

            self.response.headers['Access-Control-Allow-Origin'] = "*"
            self.response.headers['Content-Type'] = 'application/json'
            self.response.write(json.dumps(response_data))
        except Exception, e:
            self.response.headers['Access-Control-Allow-Origin'] = "*"
            self.response.set_status('400')
            self.response.write(e.message)

    def options(self):
        self.response.headers['Access-Control-Allow-Origin'] = "*"
        self.response.headers['Access-Control-Allow-Methods'] = "GET,POST,PUT,OPTIONS,DELETE"
        self.response.headers['Access-Control-Allow-Headers'] = 'Accept,Accept-Encoding,Accept-Language,Cache-Control,Connection,Content-Type,Host,Origin,Pragma,Referer,User-Agent'

    def photo_options(self, _id):
        self.options()

    def photo(self, _id):
        self.response.headers['Access-Control-Allow-Origin'] = "*"
        photo = Photo.get_by_id(_id)
        if photo is None:
            self.response.set_status('404')
            return
        
        self.response.headers['Content-Type'] = 'application/json'
        self.response.write(Photo.to_json_string(photo))

    def vote(self, _id ,action):
        self.response.headers['Access-Control-Allow-Origin'] = "*"
        photo = Photo.get_by_id(_id)
        if photo is None:
            self.response.set_status('404')
            return 

        if action == 'up':
            photo.up_vote +=1 
            photo.put()
            self.response.headers['Content-Type'] = 'application/json'
            self.response.write({ 'up' : photo.up_vote, 'dw' : photo.dwn_vote })
            return

        if action == 'dw':
            photo.dwn_vote +=1
            photo.put()
            self.response.headers['Content-Type'] = 'application/json'
            self.response.write({ 'up' : photo.up_vote, 'dw' : photo.dwn_vote })
            return 

        self.response.set_status('400')

    def search_tags(self, csv_tags):
        self.response.headers['Access-Control-Allow-Origin'] = "*"
        tags = [Tag.sanitize(x) for x in csv_tags.split('|')]
        photos = Photo.query(Photo.tags.IN(tags)).order(-Photo.up_vote, -Photo.added).fetch(20)

        reply = []
        for photo in photos:
            reply.append(Photo.to_json_object(photo))

        self.response.headers['Content-Type'] = 'application/json'
        self.response.write(json.dumps(reply))

class MaskHandler(webapp2.RequestHandler):
    def mask(self, _id):
        self.response.headers['Access-Control-Allow-Origin'] = "*"
        mask = Mask.get_by_id(_id)
        if mask is None:
            self.response.set_status('404')
            return

        self.response.headers['Content-Type'] = 'application/json'
        self.response.write(Mask.to_json_string(mask))

    def get(self):
        self.response.headers['Access-Control-Allow-Origin'] = "*"
        masks = Mask.query().order(-Mask.up_vote, -Mask.added).fetch(20)

        reply = []
        for mask in masks:
            reply.append(Mask.to_json_object(mask))

        self.response.headers['Content-Type'] = 'application/json'
        self.response.write(json.dumps(reply))   

    def vote(self, _id ,action):
        self.response.headers['Access-Control-Allow-Origin'] = "*"
        mask = Mask.get_by_id(_id)
        if mask is None:
            self.response.set_status('404')
            return 

        if action == 'up':
            mask.up_vote +=1 
            mask.put()
            self.response.headers['Content-Type'] = 'application/json'
            self.response.write({ 'up' : mask.up_vote, 'dw' : mask.dwn_vote })
            return

        if action == 'dw':
            mask.dwn_vote +=1
            mask.put()
            self.response.headers['Content-Type'] = 'application/json'
            self.response.write({ 'up' : mask.up_vote, 'dw' : mask.dwn_vote })
            return 

        self.response.set_status('400')

    def post(self):
        try:
            #image_file = self.request.get('image', default_value=None)
            data = json.loads(self.request.body)
            ext = data.get('type')

            # mime type must be present and must be png or gif
            if ext is None or ext not in ['png', 'gif']:
                raise Exception('invalid format')

            # image must be present
            if data.get('image', None) is None:
                raise Exception('missing image')

            image = base64.b64decode(data.get('image').replace('data:image/%s;base64,' % ext,''))
            ip = self.request.remote_addr

            credits = data.get('credits', '')
            tags = data.get('tags', [])
            lang = data.get('lang', 'en')
            audience = int(data.get('audience', 0))
            email = data.get('email', None)
            
            # flip image horizontally
            # image_object = images.Image(image)
            # image_object.horizontal_flip()
            # image = image_object.execute_transforms()

            # caclulate mask id
            mask_id = hashlib.sha1(image).hexdigest()
            print mask_id

            # check if mask exists
            if Mask.get_by_id(mask_id) is not None:
                self.response.headers['Access-Control-Allow-Origin'] = "*"
                self.response.set_status('304')
                return

            # if len(tags) == 0:
            #     raise Exception('missing tags')

            tags_list = []

            # if there are new tags create them
            for tag in tags:
                tag = Tag.get_or_create(tag, source='MASK', lang=lang)
                tags_list.append(str(tag.key.id()))


            # save it on cloud storage
            bucket_name = os.environ.get('BUCKET_NAME', app_identity.get_default_gcs_bucket_name())
            filename = '%s.%s' % (mask_id, ext)
            gs_filename = '/%s/%s/%s' % (bucket_name,FOLDER_MASKS,filename)
            gcs_file = gcs.open(gs_filename, 'w', content_type='image/%s' % ext, options={'x-goog-meta-foo': 'foo', 'x-goog-meta-bar': 'bar'})
            gcs_file.write(image)
            gcs_file.close()

            
            mask = Mask(id=mask_id)
            mask.populate(
                filename = filename,
                ip = ip,
                audience = audience,
                email = email,
                tags = tags_list,
                credits = credits)
            mask.put()

            response_data = {
                "id" : mask_id,
                "mask" : "/masks/%s" % mask_id,
                "url" : "/m/%s" % filename
            }

            self.response.headers['Access-Control-Allow-Origin'] = "*"
            self.response.headers['Content-Type'] = 'application/json'
            self.response.write(json.dumps(response_data))
        except Exception, e:
            self.response.headers['Access-Control-Allow-Origin'] = "*"
            self.response.set_status('400')
            self.response.write(e.message)

    def update(self, _id):
        try:
            # get all parameters
            data = json.loads(self.request.body)
            
            # source ip
            ip = self.request.remote_addr

            credits = data.get('credits', '')
            tags = data.get('tags', [])
            lang = data.get('lang', 'en')
            audience = int(data.get('audience', 0))
            email = data.get('email', None)
            
            tags_list = []

            # if there are new tags create them
            for tag in tags:
                tag = Tag.get_or_create(tag, source='MASK', lang=lang)
                tags_list.append(tag.key.id())

            # get the existing photo
            mask = Mask.get_by_id(_id)
            if mask is None:
                self.response.headers['Access-Control-Allow-Origin'] = "*"
                self.response.set_status('404')
                self.response.write("Not Found")
            
            mask.audience = audience
            mask.tags.extend(tags_list)
            mask.tags = list(set(mask.tags))
            mask.email = email
            mask.lang = lang
            mask.credits = credits
            mask.put()

            # self.response.headers['Content-Type'] = 'application/json'
            # self.response.write(Photo.to_json_string(photo))

            response_data = {
                "id" : _id,
                "mask" : "/mask/%s" % _id,
                "url" : "/m/%s" % _id
            }

            self.response.headers['Access-Control-Allow-Origin'] = "*"
            self.response.headers['Content-Type'] = 'application/json'
            self.response.write(json.dumps(response_data))
        except Exception, e:
            self.response.headers['Access-Control-Allow-Origin'] = "*"
            self.response.set_status('400')
            self.response.write(e.message)

    def options(self):
        self.response.headers['Access-Control-Allow-Origin'] = "*"
        self.response.headers['Access-Control-Allow-Methods'] = "GET,POST,PUT,OPTIONS,DELETE"
        self.response.headers['Access-Control-Allow-Headers'] = 'Accept,Accept-Encoding,Accept-Language,Cache-Control,Connection,Content-Type,Host,Origin,Pragma,Referer,User-Agent'

    def mask_options(self, _id):
        self.options()

    def search_tags(self, csv_tags):
        self.response.headers['Access-Control-Allow-Origin'] = "*"
        tags = [Tag.sanitize(x) for x in csv_tags.split('|')]
        masks = Mask.query(Mask.tags.IN(tags)).order(-Mask.up_vote, -Mask.added).fetch(20)

        reply = []
        for mask in masks:
            reply.append(Mask.to_json_object(mask))

        self.response.headers['Content-Type'] = 'application/json'
        self.response.write(json.dumps(reply))  

class ImageHandler(webapp2.RequestHandler):
    def get(self,_id, img_type):
        self.response.headers['Access-Control-Allow-Origin'] = "*"

        try:
            bucket_name = os.environ.get('BUCKET_NAME', app_identity.get_default_gcs_bucket_name())
            if img_type == 'p':
                filename = '/%s/%s/%s' % (bucket_name, FOLDER_PHOTOS, _id)
            if img_type == 'm':
                filename = '/%s/%s/%s' % (bucket_name, FOLDER_MASKS, _id)


            stat = gcs.stat(filename)
            self.response.headers['Content-Type'] = stat.content_type
            self.response.headers['Content-Length'] = stat.st_size
            self.response.headers['etag'] = stat.etag
            gcs_file = gcs.open(filename)
            self.response.write(gcs_file.read())
            gcs_file.close()
        except Exception, e:
            self.response.set_status('400')
            self.response.write(e.message)


# POST /masks crea
# PUT /masks/:id/up
# PUT /masks/:id/dw
# GET /masks #lista di maschere
# GET /masks/:id  # get mask with id
# GET /masks/tags/t1|t2 #lista di maschere

# POST /photos crea
# PUT /photos/:id/up
# PUT /photos/:id/dw
# GET /photos #lista di maschere
# GET /photos/:id  # get mask with id
# GET /photos/tags/t1|t2 #lista di maschere

# GET /tags #lista di maschere
# GET /tags/:id  # get mask with id


app = webapp2.WSGIApplication([
    # webapp2.Route('/', handler=MainHandler),
    webapp2.Route(r'/photos', handler=PhotoHandler),
    webapp2.Route(r'/photos/<_id:[a-z0-9]+>', handler=PhotoHandler, name='photo', handler_method='photo', methods=['GET']),
    webapp2.Route(r'/photos/<_id:[a-z0-9]+>', handler=PhotoHandler, name='photo_update', handler_method='update', methods=['PUT']),
    webapp2.Route(r'/photos/<_id:[a-z0-9]+>', handler=PhotoHandler, name='photo_options', handler_method='update', methods=['PUT']),
    webapp2.Route(r'/photos/<_id:[a-z0-9]+>/<action:(up|dw)>', handler=PhotoHandler, handler_method='vote', methods=['PUT']),

    webapp2.Route(r'/photos/tags/<csv_tags>', handler=PhotoHandler, handler_method='search_tags', methods=['GET']),

    webapp2.Route(r'/masks', handler=MaskHandler),
    webapp2.Route(r'/masks/<_id:[a-z0-9]+>', handler=MaskHandler, name='mask', handler_method='mask', methods=['GET']),
    webapp2.Route(r'/masks/<_id:[a-z0-9]+>', handler=MaskHandler, name='mask_update', handler_method='update', methods=['PUT']),
    webapp2.Route(r'/photos/<_id:[a-z0-9]+>', handler=PhotoHandler, name='mask_options', handler_method='mask_options', methods=['PUT']),
    webapp2.Route(r'/masks/<_id:[a-z0-9]+>/<action:(up|dw)>', handler=MaskHandler, handler_method='vote', methods=['PUT']),
    webapp2.Route(r'/masks/tags/<csv_tags>', handler=MaskHandler, handler_method='search_tags', methods=['GET']),

    webapp2.Route(r'/tags', handler=TagHandler),
    webapp2.Route(r'/<img_type:(m|p)>/<_id:[a-z0-9]+\.(gif|png)>', handler=ImageHandler)

], debug=True)
