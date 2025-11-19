from django.urls import path
from .views import search_drug

urlpatterns = [
    path('search/', search_drug, name='search_drug'),  # ✅ Remove "api/drugs/"
]
