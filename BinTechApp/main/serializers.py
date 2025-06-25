from rest_framework import serializers
from .models import TrashCan

class TrashCanSerializer(serializers.ModelSerializer):
    color = serializers.SerializerMethodField()
    class Meta:
        model = TrashCan
        fields = '__all__'

    def get_color(self, obj):
        sensor = getattr(obj, 'sensor', None)
        if sensor and sensor.current_value is not None:
            if sensor.current_value >= 90:
                return 'rouge'
            elif sensor.current_value >= 60:
                return 'orange'
            else:
                return 'vert'
        return 'gris'
