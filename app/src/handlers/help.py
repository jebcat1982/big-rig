#!/usr/bin/env python
#
# Copyright 2015 Google Inc.
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

import os
import sys
import webapp2
import jinja2
import codecs
import re

from google.appengine.ext import vendor
vendor.add('thirdparty')

import markdown

from jinja2 import Environment, meta
from bigrig.usermanager import UserManager

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(
        os.path.join(
          os.path.dirname(__file__), '..'
        )
      ),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

class HelpHandler(webapp2.RequestHandler):

  def get (self, url):

    if UserManager.get_current_user() == None:
      self.redirect('/user-not-found')
      return

    if (url == '' or os.path.isdir('help/%s' % url)):
      url += 'index.md'

    template = JINJA_ENVIRONMENT.get_template('templates/help/help.html')
    help_file_path = 'help/%s' % re.sub('html$', 'md', url)

    if not os.path.exists(help_file_path):
      print help_file_path
      return

    with codecs.open(help_file_path, 'r', 'utf-8') as md_file:
      help_file = md_file.read()

    self.response.write(template.render({
      'sign_out_url': UserManager.get_signout_url(),
      'gravatar_url': UserManager.get_gravatar_url(),
      'user_email': UserManager.get_email(),
      'user_is_admin': UserManager.is_admin(),
      'sections': [{
        "name": "Help"
      }],
      'help': markdown.markdown(help_file, extensions=['markdown.extensions.fenced_code'])
    }))


app = webapp2.WSGIApplication([
    ('/help/(.*)', HelpHandler)
], debug=True)
