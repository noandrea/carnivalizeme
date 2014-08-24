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
from model.carnivalize import Tag
from model.carnivalize import Mask
from model.carnivalize import Photo
from datetime import datetime

FOLDER_MASKS = 'masks'
FOLDER_PHOTOS = 'photos'

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

class MainHandler(webapp2.RequestHandler):
    def get(self):
        self.response.write('Hello world!')

    def sitemap(self):
        self.response.headers['Access-Control-Allow-Origin'] = "*"
        self.response.headers['Content-Type'] = 'application/xml'

        template_values = {'photos': Photo.query().iter()}

        template = JINJA_ENVIRONMENT.get_template('sitemap.xml')
        self.response.write(template.render(template_values))


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

class MaintenanceHandler(webapp2.RequestHandler):
    def get(self):
        bucket_name = os.environ.get('BUCKET_NAME', app_identity.get_default_gcs_bucket_name())
        self.response.set_status('200')
        for photo in Photo.query():
            if(photo.thumb == None):
                gs_filename = '/%s/%s/%s' % (bucket_name, FOLDER_PHOTOS, photo.filename)
                gs_key = blobstore.create_gs_key('/gs'+gs_filename)
                serving_url = images.get_serving_url(gs_key)
                photo.thumb = serving_url
                photo.put()
                
                self.response.write('<img src="%s=s100" />' % photo.thumb)

