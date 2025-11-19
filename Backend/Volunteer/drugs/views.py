from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Drug
from .serializers import DrugSerializer
from rest_framework.permissions import BasePermission

class IsDoctor(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'doctor'

@api_view(["GET"])
@permission_classes([IsAuthenticated, IsDoctor])
def search_drug(request):
    name = request.GET.get("name", "")
    drugs = Drug.objects.filter(drug_name__icontains=name)
    
    if not drugs.exists():
        return Response({"message": "Drug not found"}, status=404)

    serializer = DrugSerializer(drugs, many=True)
    return Response(serializer.data)