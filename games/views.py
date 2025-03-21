from django.shortcuts import render

# Create your views here.

def home(request):
    return render(request, 'home.html')

def blackjack(request):
    return render(request, 'blackjack.html')

def roulette(request):
    return render(request, 'roulette.html')

def slots(request):
    return render(request, 'slots.html')

def classic_slots(request):
    return render(request, 'classicslots.html')

def minesweep(request):
    return render(request, 'minesweep.html')

def about(request):
    return render(request, 'about.html')

def horse_racing(request):
    return render(request, 'horse_racing.html')