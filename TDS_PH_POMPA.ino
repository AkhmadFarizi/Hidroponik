#include <WiFi.h>
#include <Arduino.h>
#include <WiFi.h>
#include <FirebaseESP32.h>

#include <Adafruit_INA219.h>
#include <Wire.h>
#include "DHT.h"
#include <LiquidCrystal_I2C.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <time.h>
#include <addons/TokenHelper.h>
#include <addons/RTDBHelper.h>


#define WIFI_SSID "Anggaaa"
#define WIFI_PASSWORD "123456780"

#define API_KEY "AIzaSyCKHyr_16WWVTOmATZF4biU3LwCx_ESea8"
#define DATABASE_URL "monitoring-294c3-default-rtdb.firebaseio.com"
#define DB_SECRET "SZyVnO5YZeaNzX6OVvhei3aV81dyeEGvW9EqwMs4"


#define USER_EMAIL "admin@gmail.com"
#define USER_PASSWORD "admin@123"

#define TdsSensorPin 36
#define VREF 3.3
#define SCOUNT 10
#define ONE_WIRE_BUS 18  // Pin untuk DS18B20

#define DHTPIN 23
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

LiquidCrystal_I2C lcd(0x27, 20, 4);  // I2C address 0x27, 20 column and 4 rows

int Pump = 2;
int Nutrisi = 4;
int PhUP = 5;
int PhDown = 15;
int timezone = 7 * 3600;
int dst = 0;
int analogBuffer[SCOUNT];
int analogBufferIndex = 0;
float tdsValue = 0;
float temperature = 25;  // Akan diupdate dengan DS18B20

float calibration_value = 20.24 - 0.7;  //21.34 - 0.7
int phval = 0;
unsigned long int avgval;
int buffer_arr[10], temp;
float ph_act;

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

Adafruit_INA219 ina219;
float busvoltage = 0;
float current_mA = 0;


FirebaseData firebaseData, fbdo;

FirebaseJson json1, json2;
FirebaseConfig config;
FirebaseAuth auth;

String parentPath;
String parentPath2;

int a, b, c, d, e, f, g, h, i;
int count = 0;
bool signupOK = false;

char buffer1[10];
char buffer2[10];
char buffer3[10];
char buffer4[10];
char buffer5[10];
char buffer6[10];
char buffer7[10];


unsigned long sendDataPrevMillis = 0;
unsigned long timerDelay = 1000;

void setup() {
  Serial.begin(115200);
  ina219.begin();
  sensors.begin();
  dht.begin();
  pinMode(Pump, OUTPUT);
  pinMode(Nutrisi, OUTPUT);
  pinMode(PhUP, OUTPUT);
  pinMode(PhDown, OUTPUT);
  pinMode(TdsSensorPin, INPUT);

  lcd.begin();
  lcd.backlight();
  lcd.setCursor(6, 1);
  lcd.print("WELLCOME");
  lcd.setCursor(2, 2);
  lcd.print("SMART HYDROPONIK");
  delay(3000);
  lcd.clear();

  connectWiFi();

  config.api_key = API_KEY;
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;
  config.database_url = DATABASE_URL;
  config.token_status_callback = tokenStatusCallback;
  config.signer.tokens.legacy_token = DB_SECRET;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  configTime(timezone, dst, "pool.ntp.org", "time.nist.gov");

  while (!time(nullptr)) {
    delay(1000);
  }
}

void loop() {


  if (Firebase.ready() && (millis() - sendDataPrevMillis > timerDelay || sendDataPrevMillis == 0)) {
    sendDataPrevMillis = millis();
    readPower();
    readTds();
    readpH();
    readDHT();
    sendDataToFirebase();
    updateControlFromFirebase();
    time_t now = time(nullptr);
    struct tm* p_tm = localtime(&now);
    if ((a == 1) && (b == 1)) {
      digitalWrite(Pump, HIGH);
      Serial.printf("Set float... %s\n", Firebase.setFloat(fbdo, F("KONTROL/Waterpump"), 1) ? "ok" : fbdo.errorReason().c_str());
    }
    if ((a == 1) && (b == 0)) {
      digitalWrite(Pump, LOW);
      Serial.printf("Set float... %s\n", Firebase.setFloat(fbdo, F("KONTROL/Waterpump"), 0) ? "ok" : fbdo.errorReason().c_str());
    }
    if ((a == 0) && (b == 0)) {
      if ((p_tm->tm_hour == c) && (p_tm->tm_min == d)) {
        digitalWrite(Pump, HIGH);
        Serial.printf("Set float... %s\n", Firebase.setFloat(fbdo, F("KONTROL/Waterpump"), 1) ? "ok" : fbdo.errorReason().c_str());
      }
      if ((p_tm->tm_hour == e) && (p_tm->tm_min == f)) {
        digitalWrite(Pump, LOW);
        Serial.printf("Set float... %s\n", Firebase.setFloat(fbdo, F("KONTROL/Waterpump"), 0) ? "ok" : fbdo.errorReason().c_str());
      }
    }
    if ((tdsValue <= g) && (i == 1)) {
      digitalWrite(Nutrisi, HIGH);
    }
    if ((tdsValue >= g) && (i == 0)) {
      digitalWrite(Nutrisi, LOW);
    }
    if (i == 0) {
      digitalWrite(Nutrisi, LOW);
    }
  }
}

void connectWiFi() {
  lcd.setCursor(0, 0);
  lcd.print("Connect to WiFi....");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
  }

  lcd.setCursor(0, 0);
  lcd.print("  Terhubung ke IP:");
  lcd.setCursor(4, 1);
  lcd.print(WiFi.localIP());
  delay(2000);
  lcd.clear();
}

void readTds() {
  sensors.requestTemperatures();
  temperature = sensors.getTempCByIndex(0);

  static unsigned long analogSampleTimepoint = millis();
  if(millis()-analogSampleTimepoint > 40U){     //every 40 milliseconds,read the analog value from the ADC
    analogSampleTimepoint = millis();
    analogBuffer[analogBufferIndex] = analogRead(TdsSensorPin);    //read the analog value and store into the buffer
    analogBufferIndex++;
    if(analogBufferIndex == SCOUNT){ 
      analogBufferIndex = 0;
    }
  }   
  
  static unsigned long printTimepoint = millis();
  if(millis()-printTimepoint > 800U){
    printTimepoint = millis();
    for(copyIndex=0; copyIndex<SCOUNT; copyIndex++){
      analogBufferTemp[copyIndex] = analogBuffer[copyIndex];
      
      // read the analog value more stable by the median filtering algorithm, and convert to voltage value
      averageVoltage = getMedianNum(analogBufferTemp,SCOUNT) * (float)VREF / 1024.0;
      
      //temperature compensation formula: fFinalResult(25^C) = fFinalResult(current)/(1.0+0.02*(fTP-25.0)); 
      float compensationCoefficient = 1.0+0.02*(temperature-25.0);
      //temperature compensation
      float compensationVoltage=averageVoltage/compensationCoefficient;
      
      //convert voltage value to tds value
      tdsValue=(133.42*compensationVoltage*compensationVoltage*compensationVoltage - 255.86*compensationVoltage*compensationVoltage + 857.39*compensationVoltage)*0.5;
      
      //Serial.print("voltage:");
      //Serial.print(averageVoltage,2);
      //Serial.print("V   ");
      Serial.print("TDS Value:");
      Serial.print(tdsValue,0);
      Serial.println("ppm");
    }
  }

  lcd.setCursor(0, 1);
  lcd.print("TDS: ");
  lcd.print(buffer1);
  lcd.print("ppm  ");
  lcd.setCursor(14, 1);
  lcd.print("T: ");
  lcd.print(temperature, 0);
  lcd.print("C");
}

void readPower() {
  busvoltage = ina219.getBusVoltage_V();
  current_mA = ina219.getCurrent_mA() / 1000;
  dtostrf(busvoltage, 3, 1, buffer3);
  dtostrf(current_mA, 3, 1, buffer4);

  lcd.setCursor(0, 2);
  lcd.print("V: ");
  lcd.print(buffer3);
  lcd.print("V");
  lcd.setCursor(0, 3);
  lcd.print("I: ");
  lcd.print(buffer4);
  lcd.print("A ");
}

void readpH() {
  for (int i = 0; i < 10; i++) {
    buffer_arr[i] = analogRead(35);
  }
  for (int i = 0; i < 9; i++) {
    for (int j = i + 1; j < 10; j++) {
      if (buffer_arr[i] > buffer_arr[j]) {
        temp = buffer_arr[i];
        buffer_arr[i] = buffer_arr[j];
        buffer_arr[j] = temp;
      }
    }
  }
  avgval = 0;
  for (int i = 2; i < 8; i++) avgval += buffer_arr[i];
  float volt = (float)avgval * 3.3 / 4096.0 / 6;
  ph_act = -5.70 * volt + calibration_value;
  dtostrf(ph_act, 3, 1, buffer5);
  lcd.setCursor(0, 0);
  lcd.print("pH : ");
  lcd.print(buffer5);
}

void readDHT() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();

  dtostrf(h, 3, 1, buffer6);
  dtostrf(t, 3, 1, buffer7);
  lcd.setCursor(10, 2);
  lcd.print("H: ");
  lcd.print(buffer6);
  lcd.print("%");
  lcd.setCursor(10, 3);
  lcd.print("T: ");
  lcd.print(buffer7);
  lcd.print("*C");
}


void sendDataToFirebase() {
  parentPath = "TEST/MONITORING";
  json1.set("/TDS", String(buffer1));
  json1.set("/TempAIR", String(buffer2));
  json1.set("/VOLTAGE", String(buffer3));
  json1.set("/ARUS", String(buffer4));
  json1.set("/pH", String(buffer5));
  json1.set("/Temp", String(buffer6));
  json1.set("/Hum", String(buffer7));


  parentPath2 = "TEST/KONTROL";
  json2.set("/pH", String(buffer1));
  json2.set("/TDS", String(buffer5));
  if (!Firebase.setJSON(fbdo, parentPath.c_str(), json1)) {
    Serial.println(fbdo.errorReason());  // Print error if any
  }

  if (!Firebase.setJSON(fbdo, parentPath2.c_str(), json2)) {
    Serial.println(fbdo.errorReason());  // Print error if any
  }
}

void updateControlFromFirebase() {
    if (Firebase.getInt(fbdo, "KONTROL/MODE")) {
        a = fbdo.intData();
        Serial.print("MODE: ");
        Serial.println(a);
    } else {
        Serial.print("Error getting MODE: ");
        Serial.println(fbdo.errorReason());
    }

    if (Firebase.getInt(fbdo, "KONTROL/POMPA")) {
        b = fbdo.intData();
        Serial.print("POMPA: ");
        Serial.println(b);
    } else {
        Serial.print("Error getting POMPA: ");
        Serial.println(fbdo.errorReason());
    }

    if (Firebase.getInt(fbdo, "KONTROL/Jam Mulai")) {
        c = fbdo.intData();
        Serial.print("Jam Mulai: ");
        Serial.println(c);
    } else {
        Serial.print("Error getting Jam Mulai: ");
        Serial.println(fbdo.errorReason());
    }

    if (Firebase.getInt(fbdo, "KONTROL/Menit Mulai")) {
        d = fbdo.intData();
        Serial.print("Menit Mulai: ");
        Serial.println(d);
    } else {
        Serial.print("Error getting Menit Mulai: ");
        Serial.println(fbdo.errorReason());
    }

    if (Firebase.getInt(fbdo, "KONTROL/Jam Selesai")) {
        e = fbdo.intData();
        Serial.print("Jam Selesai: ");
        Serial.println(e);
    } else {
        Serial.print("Error getting Jam Selesai: ");
        Serial.println(fbdo.errorReason());
    }

    if (Firebase.getInt(fbdo, "KONTROL/Menit Selesai")) {
        f = fbdo.intData();
        Serial.print("Menit Selesai: ");
        Serial.println(f);
    } else {
        Serial.print("Error getting Menit Selesai: ");
        Serial.println(fbdo.errorReason());
    }

    if (Firebase.getInt(fbdo, "KONTROL/SetTDS")) {
        g = fbdo.intData();
        Serial.print("Set TDS: ");
        Serial.println(g);
    } else {
        Serial.print("Error getting SetTDS: ");
        Serial.println(fbdo.errorReason());
    }

    if (Firebase.getInt(fbdo, "KONTROL/SetpH")) {
        h = fbdo.intData();
        Serial.print("Set pH: ");
        Serial.println(h);
    } else {
        Serial.print("Error getting SetpH: ");
        Serial.println(fbdo.errorReason());
    }

    if (Firebase.getInt(fbdo, "KONTROL/Waterpump")) {
        i = fbdo.intData();
        Serial.print("STS_Waterpump: ");
        Serial.println(i);
    } else {
        Serial.print("Error getting Waterpump: ");
        Serial.println(fbdo.errorReason());
    }
}


float quickselect(int arr[], int n, int k) {
  std::nth_element(arr, arr + k, arr + n);
  return arr[k];
}
