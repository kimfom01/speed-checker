import React, { useEffect, useState } from "react";
import { ScrollView, Text, View, Platform } from "react-native";
import { Accelerometer } from "expo-sensors";

const TimeInSeconds = 2.0;
const Gravity = 9.8;

interface Coords {
  x: number;
  y: number;
  z: number;
}

export default function HomeScreen() {
  const [accelerations, setAccelerations] = useState<Coords>({
    x: 0,
    y: 0,
    z: 0,
  });

  useEffect(() => {
    Accelerometer.addListener((accelerometerData) =>
      setAccelerations(accelerometerData)
    );
    Accelerometer.setUpdateInterval(TimeInSeconds * 1000);

    return () => {
      Accelerometer.removeAllListeners();
    };
  }, []);

  return (
    <ScrollView style={{ padding: 10, paddingTop: 50 }}>
      <View
        style={{ display: "flex", justifyContent: "center", width: "100%" }}
      >
        <Text style={{ color: "white", fontSize: 50, fontWeight: "bold" }}>
          Speed Checker <Text style={{ fontSize: 20 }}>v0.1</Text>
        </Text>
        <Text style={{ color: "white" }}>
          Currently running on{" "}
          <Text style={{ fontWeight: "bold" }}>IOS {Platform.Version}</Text>
        </Text>
      </View>
      <SpeedCalculator accelerations={accelerations} />
    </ScrollView>
  );
}

interface SpeedCalculatorProps {
  accelerations: Coords;
}

const SpeedCalculator = ({ accelerations }: SpeedCalculatorProps) => {
  const [speeds, setSpeeds] = useState<Coords>({
    x: 0,
    y: 0,
    z: 0,
  });

  useEffect(() => {
    setSpeeds((oldSpeeds) => ({
      x: oldSpeeds.x + accelerations.x * TimeInSeconds,
      y: oldSpeeds.y + accelerations.y * TimeInSeconds,
      z: oldSpeeds.y + accelerations.z * TimeInSeconds,
    }));
  }, [accelerations]);

  const aggregatedSpeed = (speeds: Coords) => {
    return (
      Math.sqrt(
        Math.pow(speeds.x, 2) + Math.pow(speeds.y, 2) + Math.pow(speeds.z, 2)
      ) - Gravity
    );
  };

  return (
    <View style={{ marginTop: 40 }}>
      <Text style={{ color: "white", fontSize: 40 }}>
        Current Speed: {aggregatedSpeed(speeds).toFixed(2)} m/s
      </Text>
    </View>
  );
};
