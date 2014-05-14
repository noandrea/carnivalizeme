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


FOLDER_MASKS = 'masks'

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
