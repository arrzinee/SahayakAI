from django.urls import path
from . import views

urlpatterns = [
    path('chat', views.chat, name='chat'),
    path('concepts/<str:user_id>', views.get_concepts, name='get_concepts'),
    path('session/start', views.start_session, name='start_session'),
]
