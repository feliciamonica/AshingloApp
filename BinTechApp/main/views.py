# views.py fully aligned with AbstractBaseUser support and admin compatibility
import csv
from datetime import timedelta

from django.http import HttpResponse
from rest_framework import viewsets, status, permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework.serializers import ModelSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

from .models import TrashCan, Measurement
from .serializers import TrashCanSerializer
from django.utils.timezone import now
from .models import Sensor, Alert

User = get_user_model()

class TrashCanViewSet(viewsets.ModelViewSet):
    queryset = TrashCan.objects.all()
    serializer_class = TrashCanSerializer
    permission_classes = [IsAuthenticated]

# Serializer for custom User model
class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'first_name', 'email', 'password', 'status', 'role', 'is_staff', 'is_active']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User(**validated_data)
        user.set_password(validated_data['password'])
        user.save()
        return user

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Successfully logged out."}, status=status.HTTP_205_RESET_CONTENT)
        except KeyError:
            return Response({"error": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)
        except TokenError:
            return Response({"error": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

#  Vue pour recevoir les données GPS depuis le module GRSM
@api_view(['POST'])
@permission_classes([AllowAny])  # tu peux remplacer par [IsAuthenticated] si tu veux restreindre
def register_gps_data(request):
    serializer = TrashCanSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)




@api_view(['GET'])
@permission_classes([IsAuthenticated])  # ou AllowAny si tu veux public
def search_by_zone(request):
    zone = request.query_params.get('zone')
    if not zone:
        return Response({"error": "Missing 'zone' parameter"}, status=400)

    trashcans = TrashCan.objects.filter(location__icontains=zone)
    serializer = TrashCanSerializer(trashcans, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def trashcans_to_empty(request):
    sensors = Sensor.objects.filter(current_value__gte=90)
    trashcans = [s.trashcan for s in sensors if s.trashcan]
    serializer = TrashCanSerializer(trashcans, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def trashcans_to_empty(request):
    sensors = Sensor.objects.filter(current_value__gte=90)
    trashcans = [sensor.trashcan for sensor in sensors if sensor.trashcan]

    if request.query_params.get('format') == 'csv':
        # Préparer la réponse HTTP avec CSV
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="poubelles_a_vider.csv"'

        writer = csv.writer(response)
        writer.writerow(['ID', 'Nom', 'Localisation', 'Status', 'Capacité'])

        for t in trashcans:
            writer.writerow([t.id, t.name, t.location, t.status, t.capacity])

        return response

@api_view(['POST'])
@permission_classes([AllowAny])  # ou IsAuthenticated si besoin
def receive_measurement(request):
    try:
        sensor_id = request.data["sensor_id"]
        fill_level = float(request.data["fill_level"])
    except KeyError:
        return Response({"error": "Missing sensor_id or fill_level"}, status=400)

    try:
        sensor = Sensor.objects.get(id=sensor_id)
    except Sensor.DoesNotExist:
        return Response({"error": "Sensor not found"}, status=404)

    # Mise à jour du capteur
    sensor.current_value = fill_level
    sensor.last_ping = now()
    sensor.save()

    # Enregistrer une nouvelle mesure
    measurement = Measurement.objects.create(
        sensor=sensor,
        fill_level=fill_level,
        date_time=now()
    )

    # Créer une alerte si le remplissage est critique
    alert = None
    if fill_level >= 90:
        alert = Alert.objects.create(
            project_details="Capteur en surcharge",
            task_deadline=now().date(),
            detail=f"Remplissage critique détecté ({fill_level}%)"
        )
        measurement.triggered_alert = alert
        measurement.save()

    return Response({
        "measurement_id": measurement.id,
        "alert_triggered": alert is not None
    }, status=201)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def detect_unreachable_sensors(request):
    threshold = now() - timedelta(hours=1)  # ou 30 minutes, etc.
    unreachable = Sensor.objects.filter(last_ping__lt=threshold)

    alerts_created = 0
    for sensor in unreachable:
        # Vérifie s'il y a déjà une alerte pour ce capteur
        if not Alert.objects.filter(detail__icontains=f"Capteur {sensor.id} injoignable").exists():
            Alert.objects.create(
                project_details="Capteur injoignable",
                task_deadline=now().date(),
                detail=f"Capteur {sensor.id} injoignable depuis {sensor.last_ping.strftime('%Y-%m-%d %H:%M')}"
            )
            alerts_created += 1

    return Response({
        "unreachable_sensors": [s.id for s in unreachable],
        "alerts_created": alerts_created
    })