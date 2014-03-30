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
from google.appengine.api import app_identity
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

class CollectionsHandler(webapp2.RequestHandler):
    def get(self, collection):
        if collection == 'photos':
            photos = Photo.query().order(Photo.up_vote, Photo.added).fetch(20)

            reply = []
            for photo in photos:
                reply.append(Photo.to_json_object(photo))

            self.response.headers['Content-Type'] = 'application/json'
            self.response.write(json.dumps(reply))

        if collection == 'masks':
            masks = Mask.query().order(Mask.up_vote, Mask.added).fetch(20)

            reply = []
            for mask in masks:
                reply.append(Mask.to_json_object(mask))

            self.response.headers['Content-Type'] = 'application/json'
            self.response.write(json.dumps(reply))            

class TagHandler(webapp2.RequestHandler):
    def get(self, collection, csv_tags):
        if collection == 'photos':
            tags = [Tag.sanitize(x) for x in csv_tags.split('|')]
            photos = Photo.query(Photo.tags.IN(tags)).order(Photo.up_vote, Photo.added).fetch(20)

            reply = []
            for photo in photos:
                reply.append(Photo.to_json_object(photo))

            self.response.headers['Content-Type'] = 'application/json'
            self.response.write(json.dumps(reply))
        if collection == 'masks':
            tags = [Tag.sanitize(x) for x in tag.split('|')]
            masks = Mask.query(Mask.tags.IN(tags)).order(Mask.up_vote, Mask.added).fetch(20)

            reply = []
            for mask in masks:
                reply.append(Mask.to_json_object(mask))

            self.response.headers['Content-Type'] = 'application/json'
            self.response.write(json.dumps(reply))  




class PhotoHandler(webapp2.RequestHandler):
    def get(self, _id):
        photo = Photo.get_by_id(_id)
        if photo is None:
            self.response.set_status('404')
            return
        
        self.response.headers['Content-Type'] = 'application/json'
        self.response.write(Photo.to_json_string(photo))

    def post(self, _id ,action):
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

    def put(self):

        # get all parameters
        image = self.request.POST.get("photo")
        ip = self.request.remote_addr
        meta = json.loads(self.request.get("meta"))
        user = meta.get('user')
        tags = meta.get('tags', [])
        lang = meta.get('lang', 'en')
        audience = meta.get('audience', 0)
        masks = meta.get('masks', [])

        # mask must be present
        if masks is None or len(masks) == 0:
            self.response.set_status('400')
            return

        # image must be present
        if image is None:
            self.response.set_status('400')
            return

        # mime type must be present and must be png or gif
        mime = image.type
        if mime is None or mime not in ['image/png', 'image/gif']:
            self.response.set_status('400')
            return

        # if there is no mask error
        if len(masks) == 0:
            self.response.set_status('400')
            return


        # caclulate photo id
        photo_id = hashlib.sha1(image.file.getvalue()).hexdigest()
        photo = Photo.get_by_id(photo_id)

        # check if phot exists
        if photo is not None:
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

        filename = '%s.%s' % (photo_id, mime[-3:])

        gcs_file = gcs.open('/%s/%s/%s' % (bucket_name, FOLDER_PHOTOS, filename), 'w', content_type=mime, options={'x-goog-meta-foo': 'foo', 'x-goog-meta-bar': 'bar'})
        gcs_file.write(image.file.getvalue())
        gcs_file.close()

        

        photo = Photo(id=photo_id)
        photo.populate(filename = filename,
            ip = ip,
            audience = audience,
            masks = masks,
            tags = tags_list)
        photo.put()

        response_data = {
            "photo" : "/photo/%s" % photo_id,
            "url" : "/p/%s" % filename
        }

        self.response.write(response_data)
        
class MaskHandler(webapp2.RequestHandler):
    def get(self, _id):
        mask = Mask.get_by_id(_id)
        if mask is None:
            self.response.set_status('404')
            return

        self.response.headers['Content-Type'] = 'application/json'
        self.response.write(Mask.to_json_string(mask))

    def post(self, _id ,action):
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

    def put(self):

        #image_file = self.request.get('image', default_value=None)
        image = self.request.POST.get("mask")
        ip = self.request.remote_addr
        meta = json.loads(self.request.get("meta"))
        user = meta.get('email')
        tags = meta.get('tags', [])
        lang = meta.get('lang', 'en')
        audience = meta.get('audience', 0)
        email = meta.get('email', None)


        # image must be present
        if image is None:
            self.response.set_status('400')
            return

        # mime type must be present and must be png or gif
        mime = image.type
        if mime is None or mime not in ['image/png', 'image/gif']:
            self.response.set_status('400')
            return

        # caclulate mask id
        mask_id = hashlib.sha1(image.file.getvalue()).hexdigest()
        print mask_id

        # check if mask exists
        if Mask.get_by_id(mask_id) is not None:
            self.response.set_status('304')
            return

        if len(tags) == 0:
            self.response.set_status('400')
            return

        tags_list = []

        # if there are new tags create them
        for tag in tags:
            tag = Tag.get_or_create(tag, source='MASK', lang=lang)
            tags_list.append(str(tag.key.id()))


        # save it on cloud storage
        bucket_name = os.environ.get('BUCKET_NAME', app_identity.get_default_gcs_bucket_name())
        filename = '%s.%s' % (mask_id, mime[-3:])
        gcs_file = gcs.open('/%s/%s/%s' % (bucket_name,FOLDER_MASKS,filename), 'w', content_type=mime, options={'x-goog-meta-foo': 'foo', 'x-goog-meta-bar': 'bar'})
        gcs_file.write(image.file.getvalue())
        gcs_file.close()

        
        mask = Mask(id=mask_id)
        mask.populate(
            filename = filename,
            ip = ip,
            audience = audience,
            email = email,
            tags = tags_list)
        mask.put()

        response_data = {
            "mask" : "/mask/%s" % mask_id,
            "url" : "/m/%s" % filename
        }

        self.response.write(response_data)


class ImageHandler(webapp2.RequestHandler):
    def get(self,_id, img_type):
        

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


app = webapp2.WSGIApplication([
    webapp2.Route('/', handler=MainHandler),
    webapp2.Route(r'/<collection:(photos|masks)>', handler=CollectionsHandler),
    webapp2.Route(r'/tags/<collection:(photos|masks)>/<csv_tags>', handler=TagHandler),

    webapp2.Route(r'/photo/<_id:[a-z0-9]+>', handler=PhotoHandler),
    webapp2.Route(r'/photo/<_id:[a-z0-9]+>/<action:(up|dw)>', handler=PhotoHandler),

    webapp2.Route('/mask', handler=MaskHandler),
    webapp2.Route(r'/mask/<_id:[a-z0-9]+>', handler=MaskHandler),
    webapp2.Route(r'/mask/<_id:[a-z0-9]+>/<action:(up|dw)>', handler=MaskHandler),

    webapp2.Route(r'/<img_type:(m|p)>/<_id:[a-z0-9]+\.(gif|png)>', handler=ImageHandler)

], debug=True)
