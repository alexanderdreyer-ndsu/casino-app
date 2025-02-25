from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('roulette/', views.roulette, name='roulette'),
    path('blackjack/', views.blackjack, name='blackjack'),
    path('slots/', views.slots, name='slots'),
    path('classicslots/', views.classic_slots, name='classic_slots'),
    path('minesweep/', views.minesweep, name='minesweep'),
    path('about/', views.about, name='about'),
]
