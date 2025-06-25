#include <Servo.h>

// Broches
const int trigPin = 8;
const int echoPin = 9;
const int servoPin = 4;

// Configuration servo
const int DETECTION_DISTANCE = 15;  // Distance de détection en cm
const int SERVO_CLOSED_PULSE = 1500; // INVERSE: 1.5ms pour position fermée
const int SERVO_OPEN_PULSE = 500;    // INVERSE: 0.5ms pour position ouverte
const int CLOSE_DELAY = 2000;       // Délai avant fermeture
const int SERVO_SPEED = 15;          // Délai entre chaque incrément PWM

// Variables d'état
bool lidOpen = false;
unsigned long lastObjectTime = 0;
unsigned long lastMeasurement = 0;
const unsigned long MEASUREMENT_INTERVAL = 50;

// Position actuelle du servo
int currentPulse = SERVO_CLOSED_PULSE;

Servo servo;

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  
  servo.attach(servoPin);
  setServoPosition(SERVO_CLOSED_PULSE);
  
  Serial.begin(9600);
  Serial.println("Poubelle automatique initialisée");
}

void loop() {
  unsigned long currentTime = millis();
  
  if (currentTime - lastMeasurement >= MEASUREMENT_INTERVAL) {
    lastMeasurement = currentTime;
    
    int distance = measureDistance();
    Serial.print("Distance: ");
    Serial.print(distance);
    Serial.print(" cm | PWM: ");
    Serial.println(currentPulse);
    
    if (distance > 0 && distance < DETECTION_DISTANCE) {
      lastObjectTime = currentTime;
      
      if (!lidOpen) {
        openLid();
        lidOpen = true;
      }
    }
    else if (lidOpen && (currentTime - lastObjectTime >= CLOSE_DELAY)) {
      closeLid();
      lidOpen = false;
    }
  }
}

int measureDistance() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  long duration = pulseIn(echoPin, HIGH, 30000);
  return (duration <= 0) ? 999 : duration * 0.034 / 2;
}

void setServoPosition(int pulseWidth) {
  pulseWidth = constrain(pulseWidth, 500, 2500);
  servo.writeMicroseconds(pulseWidth);
  currentPulse = pulseWidth;
  delay(10);
}

void openLid() {
  Serial.println("Ouverture en cours...");
  
  // Mouvement décroissant (vers SERVO_OPEN_PULSE)
  for (int pulse = currentPulse; pulse >= SERVO_OPEN_PULSE; pulse -= 8) {
    setServoPosition(pulse);
    delay(SERVO_SPEED);
  }
  setServoPosition(SERVO_OPEN_PULSE);
}

void closeLid() {
  Serial.println("Fermeture en cours...");
  
  // Mouvement croissant (vers SERVO_CLOSED_PULSE)
  for (int pulse = currentPulse; pulse <= SERVO_CLOSED_PULSE; pulse += 8) {
    setServoPosition(pulse);
    delay(SERVO_SPEED);
  }
  setServoPosition(SERVO_CLOSED_PULSE);
  
  // Blocage mécanique inversé
  for (int i = 0; i < 3; i++) {
    setServoPosition(SERVO_CLOSED_PULSE + 50); // +50 au lieu de -50
    delay(100);
    setServoPosition(SERVO_CLOSED_PULSE);
    delay(100);
  }
}