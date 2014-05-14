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

class TagHandler(webapp2.RequestHandler):
    def get(self):
        self.response.headers['Access-Control-Allow-Origin'] = "*"
        tags = Tag.query().order(-Tag.count, -Tag.added).fetch(20)
        reply = []
        for tag in tags:
            reply.append(Tag.to_json_object(tag))

        self.response.headers['Content-Type'] = 'application/json'
        self.response.write(json.dumps(reply))     
