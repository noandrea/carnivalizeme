import webapp2
import jinja2
import hashlib
import json
import lib.cloudstorage as gcs
import logging
import os
import base64
from google.appengine.api import app_identity
from google.appengine.api import images
from google.appengine.ext import blobstore
from google.appengine.ext import ndb
from model.carnivalize import Tag
from model.carnivalize import Mask
from model.carnivalize import Photo
from datetime import datetime


FOLDER_PHOTOS = 'photos'

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

class PhotoHandler(webapp2.RequestHandler):

    def get(self):
        self.response.headers['Access-Control-Allow-Origin'] = "*"

        photo_query = Photo.query().order(-Photo.up_vote, -Photo.added)

        cursor = ndb.Cursor(urlsafe=self.request.get('cr',default_value=None))  
        photos, next_curs, more = photo_query.fetch_page(32, start_cursor=cursor)

        reply = {'photos':[]}
        for photo in photos:
            reply['photos'].append(Photo.to_json_object(photo))

        # next cursor
        if more:
            reply['nc'] = next_curs.urlsafe()
        else:
            reply['nc'] = None 

        reply['pc'] = self.request.get('cr',default_value=None) # previous cursor
        reply['fc'] = None # first cursor
        reply['lc'] = None # last cursor

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
            masks = [str(x) for x in data.get('masks', [])]


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
                if mask_id == 0: # test mask
                    continue
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

            gcs_file = gcs.open(gs_filename, 'w', content_type='image/%s' % ext, options={'x-goog-acl':'public-read','x-goog-meta-foo': 'foo'})
            gcs_file.write(image)
            gcs_file.close()
            # create a key for the stored file
            gs_key = blobstore.create_gs_key('/gs'+gs_filename)
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
                "url" : "/p/%s" % photo.filename,
                "thumb" : photo.thumb

            }

            self.response.headers['Access-Control-Allow-Origin'] = "*"
            self.response.headers['Content-Type'] = 'application/json'
            self.response.write(json.dumps(response_data))
        except Exception, e:
            logging.info(e)
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

        if self.request.method == 'OPTIONS':
            self.options()
            return

        self.response.headers['Access-Control-Allow-Origin'] = "*"
        photo = Photo.get_by_id(_id)
        if photo is None:
            self.response.set_status('404')
            return 

        if action == 'up':
            photo.up_vote +=1 
            photo.put()
            self.response.headers['Content-Type'] = 'application/json'
            self.response.write(json.dumps({ 'up' : photo.up_vote, 'dw' : photo.dwn_vote }))
            return

        if action == 'dw':
            photo.dwn_vote +=1
            photo.put()
            self.response.headers['Content-Type'] = 'application/json'
            self.response.write(json.dumps({ 'up' : photo.up_vote, 'dw' : photo.dwn_vote }))
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

    def photo_page(self, _id):
        self.response.headers['Access-Control-Allow-Origin'] = "*"
        photo = Photo.get_by_id(_id)
        if photo is None:
            self.response.set_status('404')
            return

        template_values = {
            'photo': photo,
        }

        template = JINJA_ENVIRONMENT.get_template('photo_page.html')
        self.response.write(template.render(template_values))



