from google.appengine.ext import ndb
import hashlib, json


class Photo(ndb.Model):
    filename = ndb.StringProperty(required=True)
    up_vote = ndb.IntegerProperty(default=0)
    dwn_vote = ndb.IntegerProperty(default=0)
    email = ndb.StringProperty()
    added = ndb.DateTimeProperty(auto_now_add=True)
    ip = ndb.StringProperty()
    audience = ndb.IntegerProperty(default=0)
    tags = ndb.StringProperty(repeated=True)
    masks = ndb.StringProperty(repeated=True)
    ext = ndb.StringProperty()
    thumb = ndb.StringProperty()

    @staticmethod
    def to_json_string(photo):
        data = Photo.to_json_object(photo)
        return json.dumps(data)

    @staticmethod
    def to_json_object(photo):
        data = {
            'id': photo.key.id(),
            'image' : '/p/%s' % photo.filename,
            'added' : photo.added.strftime('%s'),
            'tags' : photo.tags,
            'up' : photo.up_vote,
            'dw' : photo.dwn_vote,
            'audience' : photo.audience,
            'type' : photo.ext,
            'thumb' : photo.thumb,
            'thumb_still' : photo.thumb,
            'blowout' : '/blowout/%s' % photo.key.id() 
        }
        return data



class Mask(ndb.Model):
    email = ndb.StringProperty()
    credits = ndb.StringProperty()
    added = ndb.DateTimeProperty(auto_now_add=True)
    tags = ndb.StringProperty(repeated=True)
    filename = ndb.StringProperty(required=True)
    user = ndb.UserProperty()
    ip = ndb.StringProperty()
    count = ndb.IntegerProperty(default=0)
    up_vote = ndb.IntegerProperty(default=0)
    dwn_vote = ndb.IntegerProperty(default=0)
    audience = ndb.IntegerProperty(default=0)
    photo_count = ndb.IntegerProperty(default=0)
    thumb = ndb.StringProperty()

    @staticmethod
    def to_json_string(mask):
        data = Mask.to_json_object(mask)
        return json.dumps(data)

    @staticmethod
    def to_json_object(mask):
        data = {
            'id': mask.key.id(),
            'image' : '/m/%s' % mask.filename,
            'added' : mask.added.strftime('%s'),
            'tags' : mask.tags,
            'up' : mask.up_vote,
            'dw' : mask.dwn_vote,
            'audience' : mask.audience,
            'photo_count' : mask.photo_count,
            'thumb' : mask.thumb,
            'credits' : mask.credits,
        }
        return data

class Tag(ndb.Model):
    label = ndb.StringProperty(required=True)
    added = ndb.DateTimeProperty(auto_now_add=True)
    count = ndb.IntegerProperty(default=1)
    lang = ndb.StringProperty(repeated=True)
    source = ndb.StringProperty(repeated=True)

    @staticmethod
    def to_json_string(tag):
        data = Tag.to_json_object(tag)
        return json.dumps(data)

    @staticmethod
    def to_json_object(tag):
        data = {
            'id': tag.key.id(),
            'added' : tag.added.isoformat(),
            'label' : tag.label,
            'sources' : tag.source,
            'langs' : tag.lang,
            'count' : tag.count
        }
        return data
    
    @staticmethod
    def sanitize(tag_name):
        tag_id = ' '.join(tag_name.lower().strip().split())
        return tag_id

    @classmethod
    def get_or_create(self, tag_name, lang=None, source='MASK'):
        "Get the Tag object that has the tag value given by tag_value."
        tag_id = Tag.sanitize(tag_name)
        existing_tag = Tag.get_by_id(tag_id)

        if existing_tag is None:
            # The tag does not yet exist, so create it.
            new_tag = Tag(id=tag_id)
            new_tag.populate(label=tag_name, lang=[lang],source=[source])
            new_tag.put()
            return new_tag
        else:
            existing_tag.count += 1
            if lang not in existing_tag.lang:
                existing_tag.lang.append(lang)
            if source not in existing_tag.source:
                existing_tag.source.append(source)

            existing_tag.put()
            return existing_tag



