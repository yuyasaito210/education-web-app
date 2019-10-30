"""djnci URL Configuration."""

import os
from distutils.util import strtobool

from django.conf import settings
from django.conf.urls import include, url
from django.conf.urls.static import static, serve
from django.contrib import admin
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.generic.base import TemplateView

from graphene_django.views import GraphQLView

from django.views.decorators.csrf import csrf_exempt

ENABLE_GRAPHIQL = strtobool(os.getenv('DJNCI_GRAPHIQL', 'false'))


def template(template_name):
    """Reusable TemplateView to keep things shorter down below."""
    return ensure_csrf_cookie(TemplateView.as_view(template_name=template_name))


urlpatterns = [
    url(r'^$', template(template_name='index.html')),
    url(r'^graphql', csrf_exempt(GraphQLView.as_view(graphiql=ENABLE_GRAPHIQL))),
    url(r'^ckeditor/', include('ckeditor_uploader.urls')),
    url(r'^a/', admin.site.urls),
    url(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT,}),
    url(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT,}),
    url(r'^.*/$', template(template_name='index.html')),
]
