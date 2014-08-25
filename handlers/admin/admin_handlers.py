import webapp2
import jinja2
import hashlib
import json
import lib.cloudstorage as gcs
import logging
import os
import base64
from google.appengine.api import app_identity
from google.appengine.api import memcache
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

class AdminHandler(webapp2.RequestHandler):
    def index(self):
        template = JINJA_ENVIRONMENT.get_template('admin_index.html')
        self.response.write(template.render({}))        

    def masks(self):

        id_2_delete = self.request.get('delete', None)
        if id_2_delete is not None:
            print 'deleting mask %s' % id_2_delete
            mask = Mask.get_by_id(id_2_delete)
            mask.key.delete()


        template_values = {
            'page' : 'masks',
            'link' : 'photos',
            'items' : Mask.query().fetch()
        }

        template = JINJA_ENVIRONMENT.get_template('admin_masks.html')
        self.response.write(template.render(template_values))

    def photos(self):

        id_2_delete = self.request.get('delete', None)
        if id_2_delete is not None:
            print 'deleting photo %s' % id_2_delete
            photo = Photo.get_by_id(id_2_delete)
            photo.key.delete()

        template_values = {
            'page' : 'photos',
            'link' : 'photos',
            'items' : Photo.query().fetch()
        }

        template = JINJA_ENVIRONMENT.get_template('admin_photos.html')
        self.response.write(template.render(template_values))



