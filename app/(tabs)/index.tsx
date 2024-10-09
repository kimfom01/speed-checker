import React, { useEffect, useState } from "react";
import { ScrollView, Text, View, Platform } from "react-native";
import { Accelerometer } from "expo-sensors";

const UpdateIntervalInMilliseconds = 50;
const RestThreshold = 0.1;
const VelocityDecay = 0.98;

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
    Accelerometer.setUpdateInterval(UpdateIntervalInMilliseconds);

    const subscription = Accelerometer.addListener((accelerometerData) =>
      setAccelerations(accelerometerData)
    );

    return () => {
      subscription && subscription.remove();
    };
  }, []);

  return (
    <ScrollView style={{ padding: 10, paddingTop: 50 }}>
      <View
        style={{ display: "flex", justifyContent: "center", width: "100%" }}
      >
        <Text style={{ color: "white", fontSize: 50, fontWeight: "bold" }}>
          Speed Checker <Text style={{ fontSize: 20 }}>v0.2</Text>
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

const alpha = 0.8;

const SpeedCalculator = ({ accelerations }: SpeedCalculatorProps) => {
  const [speeds, setSpeeds] = useState<Coords>({ x: 0, y: 0, z: 0 });
  const [lastUpdateTime, setLastUpdateTime] = useState<number | null>(null);
  const [gravity, setGravity] = useState<Coords>({ x: 0, y: 0, z: 0 });

  const applyLowPassFilter = (accel: Coords, grav: Coords) => {
    return {
      x: alpha * grav.x + (1 - alpha) * accel.x,
      y: alpha * grav.y + (1 - alpha) * accel.y,
      z: alpha * grav.z + (1 - alpha) * accel.z,
    };
  };

  useEffect(() => {
    const currentTime = Date.now();

    const updatedGravity = applyLowPassFilter(accelerations, gravity);
    setGravity(updatedGravity);

    const linearAcceleration = {
      x: accelerations.x - updatedGravity.x,
      y: accelerations.y - updatedGravity.y,
      z: accelerations.z - updatedGravity.z,
    };

    const accelerationMagnitude = Math.sqrt(
      Math.pow(linearAcceleration.x, 2) +
        Math.pow(linearAcceleration.y, 2) +
        Math.pow(linearAcceleration.z, 2)
    );

    if (accelerationMagnitude < RestThreshold) {
      setSpeeds((oldSpeeds) => ({
        x: oldSpeeds.x * VelocityDecay,
        y: oldSpeeds.y * VelocityDecay,
        z: oldSpeeds.z * VelocityDecay,
      }));
    } else {
      if (lastUpdateTime) {
        const deltaTime = (currentTime - lastUpdateTime) / 1000;

        setSpeeds((oldSpeeds) => ({
          x: oldSpeeds.x + linearAcceleration.x * deltaTime,
          y: oldSpeeds.y + linearAcceleration.y * deltaTime,
          z: oldSpeeds.z + linearAcceleration.z * deltaTime,
        }));
      }
    }

    setLastUpdateTime(currentTime);
  }, [accelerations]);

  const aggregatedSpeed = (speeds: Coords) => {
    return Math.sqrt(
      Math.pow(speeds.x, 2) + Math.pow(speeds.y, 2) + Math.pow(speeds.z, 2)
    );
  };

  return (
    <View style={{ marginTop: 40 }}>
      <Text style={{ color: "white", fontSize: 40 }}>
        Current Speed: {aggregatedSpeed(speeds).toFixed(2)} m/s
      </Text>
      <Text style={{ color: "white", fontSize: 30 }}>
        Speed (X): {speeds.x.toFixed(2)} m/s
      </Text>
      <Text style={{ color: "white", fontSize: 30 }}>
        Speed (Y): {speeds.y.toFixed(2)} m/s
      </Text>
      <Text style={{ color: "white", fontSize: 30 }}>
        Speed (Z): {speeds.z.toFixed(2)} m/s
      </Text>
    </View>
  );
};
