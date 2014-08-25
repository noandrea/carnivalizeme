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

from handlers.photos.photos_handler import PhotoHandler
from handlers.masks.masks_handler import MaskHandler
from handlers.tags.tags_handler import TagHandler
from handlers.globals.global_handlers import MainHandler
from handlers.globals.global_handlers import ImageHandler
from handlers.admin.admin_handlers import AdminHandler


BUCKET = 'carnivalizemeapi.appspot.com'

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
    webapp2.Route(r'/photos/<_id:[a-z0-9]+>', handler=PhotoHandler, name='photo_options', handler_method='photo_options', methods=['OPTIONS']),
    webapp2.Route(r'/photos/<_id:[a-z0-9]+>/<action:(up|dw)>', handler=PhotoHandler, handler_method='vote', methods=['PUT','OPTIONS']),

    webapp2.Route(r'/photos/tags/<csv_tags>', handler=PhotoHandler, handler_method='search_tags', methods=['GET']),

    webapp2.Route(r'/masks', handler=MaskHandler),
    webapp2.Route(r'/masks/<_id:[a-z0-9]+>', handler=MaskHandler, name='mask', handler_method='mask', methods=['GET']),
    webapp2.Route(r'/masks/<_id:[a-z0-9]+>', handler=MaskHandler, name='mask_update', handler_method='update', methods=['PUT']),
    webapp2.Route(r'/masks/<_id:[a-z0-9]+>', handler=MaskHandler, name='mask_options', handler_method='mask_options', methods=['OPTIONS']),
    webapp2.Route(r'/masks/<_id:[a-z0-9]+>/<action:(up|dw)>', handler=MaskHandler, handler_method='vote', methods=['PUT','OPTIONS']),
    webapp2.Route(r'/masks/tags/<csv_tags>', handler=MaskHandler, handler_method='search_tags', methods=['GET']),

    webapp2.Route(r'/tags', handler=TagHandler),
    webapp2.Route(r'/tags/search/<hint>', handler=TagHandler, handler_method='autocomplete', methods=['GET']),
    webapp2.Route(r'/<img_type:(m|p)>/<_id:[a-z0-9]+\.(gif|png)>', handler=ImageHandler),

    # webapp2.Route(r'/maintenance/thumbgen', handler=MaintenanceHandler),
    webapp2.Route(r'/blowout/<_id:[a-z0-9]+>', handler=PhotoHandler, name='photo_page', handler_method='photo_page', methods=['GET']),

    webapp2.Route(r'/sitemap.xml', handler=MainHandler, name='sitemap', handler_method='sitemap', methods=['GET']),
    # administration
    webapp2.Route(r'/batman', handler=AdminHandler, name='home', handler_method='get', methods=['GET']),

], debug=True)

## ADMINISTRATION APP

secure = webapp2.WSGIApplication([
    # webapp2.Route('/', handler=MainHandler),
    webapp2.Route(r'/batman/', handler=AdminHandler, name='index', handler_method='index', methods=['GET']),
    webapp2.Route(r'/batman/masks', handler=AdminHandler, name='masks', handler_method='masks', methods=['GET']),
    webapp2.Route(r'/batman/photos', handler=AdminHandler, name='photos', handler_method='photos', methods=['GET']),
    # webapp2.Route(r'/batman/<_id:[a-z0-9]+>', handler=PhotoHandler, name='photo', handler_method='photo', methods=['GET']),
    # webapp2.Route(r'/batman/<_id:[a-z0-9]+>', handler=PhotoHandler, name='photo_update', handler_method='update', methods=['PUT']),

], debug=True)
