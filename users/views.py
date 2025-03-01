from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from django.http import JsonResponse
from .forms import CustomUserCreationForm

# Create your views here.

def login_user(request):
    if request.method == "POST":
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect('home')
        else:
            messages.success(request, "Error In Login, Try Again?")
            return redirect('login')
    else:
        return render(request, 'authenticate/login.html', {})
    
def logout_user(request):
    logout(request)
    return redirect('home')

def register_user(request):
    if request.method == "POST":
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data['username']
            password = form.cleaned_data['password1']
            user = authenticate(username=username, password=password)
            login(request, user)
            messages.success(request, "Registered")
            return redirect('home')
    else:
        form = CustomUserCreationForm()

    return render(request, 'authenticate/register_user.html', {
        'form' : form,
    })

def update_balance(request):
    if request.method == "POST":
        newBalance = request.POST.get('newBalance')

        if newBalance is not None:
            try:
                newBalance = float(newBalance)
            except: 
                return JsonResponse({'status': 'failure', 'type': 'newBalance not numeric'})
            user = request.user
            user.balance = newBalance
            user.save()
            return JsonResponse({'newBalance': user.balance, 'status': 'success'})
    return JsonResponse({'status': 'failure'})