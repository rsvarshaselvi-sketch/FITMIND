import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Notifications from "expo-notifications";
import { Pedometer } from "expo-sensors";
import { Ionicons } from "@expo/vector-icons";

/* ---------------------------------------------------
   NOTIFICATION HANDLER
--------------------------------------------------- */
Notifications.setNotificationHandler({
  handleNotification: async (): Promise<Notifications.NotificationBehavior> => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

export default function FitMind(): JSX.Element {
  /* ---------------------------------------------------
     STATES
  --------------------------------------------------- */
  const [mood, setMood] = useState<string>("");
  const [journal, setJournal] = useState<string>("");

  const [steps, setSteps] = useState<number>(0);
  const [isPedometerAvailable, setIsPedometerAvailable] =
    useState<boolean>(false);

  /* ---------------------------------------------------
     FITNESS CALCULATIONS
  --------------------------------------------------- */
  const calories: string = (steps * 0.04).toFixed(2);
  const distance: string = ((steps * 0.762) / 1000).toFixed(2);
  const activeMinutes: number = Math.floor(steps / 100);

  /* ---------------------------------------------------
     STEP TRACKER
  --------------------------------------------------- */
  useEffect(() => {
    let subscription: { remove: () => void } | undefined;

    const startTracking = async () => {
      try {
        const available = await Pedometer.isAvailableAsync();
        setIsPedometerAvailable(available);

        if (available) {
          subscription = Pedometer.watchStepCount((result) => {
            setSteps(result.steps);
          });
        }
      } catch (error) {
        console.log("Pedometer Error:", error);
      }
    };

    startTracking();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  /* ---------------------------------------------------
     HYDRATION REMINDER
  --------------------------------------------------- */
  const scheduleHydrationReminder = async (): Promise<void> => {
    try {
      const permission = await Notifications.requestPermissionsAsync();

      if (permission.status !== "granted") {
        Alert.alert("Permission Needed", "Please allow notifications.");
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "💧 Stay Hydrated",
          body: "Drink water now and stay healthy!",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 3600,
          repeats: true,
        },
      });

      Alert.alert("Success", "Hourly hydration reminder enabled.");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Unable to set reminder.");
    }
  };

  return (
    <LinearGradient
      colors={["#6dd5fa", "#2980b9"]}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>FitMind</Text>
          <Text style={styles.headerSubtitle}>
            Fitness • Wellness • Mood • Hydration
          </Text>
        </View>

        {/* FITNESS SECTION */}
        <Text style={styles.sectionTitle}>💪 Fitness Stats</Text>

        <View style={styles.glassCard}>
          <View style={styles.centerRow}>
            <Ionicons name="walk" size={42} color="#fff" />
            <Text style={styles.bigValue}>{steps}</Text>
          </View>

          <Text style={styles.bigLabel}>Steps Today</Text>

          {!isPedometerAvailable && (
            <Text style={styles.warningText}>
              Pedometer not available on this device
            </Text>
          )}

          <View style={styles.statsRow}>
            <View style={styles.smallCard}>
              <Ionicons name="flame" size={28} color="#fff" />
              <Text style={styles.smallTitle}>Calories</Text>
              <Text style={styles.smallValue}>{calories} kcal</Text>
            </View>

            <View style={styles.smallCard}>
              <Ionicons name="map" size={28} color="#fff" />
              <Text style={styles.smallTitle}>Distance</Text>
              <Text style={styles.smallValue}>{distance} km</Text>
            </View>
          </View>

          <View style={styles.activeCard}>
            <Ionicons name="time" size={28} color="#fff" />
            <Text style={styles.smallTitle}>Active Minutes</Text>
            <Text style={styles.smallValue}>{activeMinutes} min</Text>
          </View>
        </View>

        {/* WORKOUT */}
        <Text style={styles.sectionTitle}>🏋 Workout Routine</Text>

        <View style={styles.glassCard}>
          <Text style={styles.cardTitle}>Beginner Home Workout</Text>
          <Text style={styles.cardText}>• 10 Push-ups</Text>
          <Text style={styles.cardText}>• 20 Squats</Text>
          <Text style={styles.cardText}>• 15 Lunges</Text>
          <Text style={styles.cardText}>• 20 sec Plank</Text>
          <Text style={styles.cardText}>• 20 Jumping Jacks</Text>
        </View>

        {/* HYDRATION */}
        <Text style={styles.sectionTitle}>💧 Hydration</Text>

        <TouchableOpacity
          style={styles.buttonWrapper}
          onPress={scheduleHydrationReminder}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#00c6fb", "#005bea"]}
            style={styles.button}
          >
            <Text style={styles.buttonText}>
              Enable Hourly Water Reminder
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* MOOD TRACKER */}
        <Text style={styles.sectionTitle}>😊 Mood & Journal</Text>

        <View style={styles.glassCard}>
          <Text style={styles.cardTitle}>How do you feel today?</Text>

          <TextInput
            placeholder="Happy / Tired / Stressed"
            placeholderTextColor="#666"
            value={mood}
            onChangeText={setMood}
            style={styles.input}
          />

          <Text style={[styles.cardTitle, { marginTop: 18 }]}>
            Journal
          </Text>

          <TextInput
            placeholder="Write your thoughts..."
            placeholderTextColor="#666"
            value={journal}
            onChangeText={setJournal}
            multiline
            style={[styles.input, styles.journalInput]}
          />
        </View>

        {/* DASHBOARD */}
        <Text style={styles.sectionTitle}>📌 Wellness Dashboard</Text>

        <View style={styles.dashboard}>
          <Text style={styles.dashboardItem}>
            😊 Mood:{" "}
            <Text style={styles.dashboardValue}>
              {mood || "Not logged"}
            </Text>
          </Text>

          <Text style={styles.dashboardItem}>
            🚶 Steps:{" "}
            <Text style={styles.dashboardValue}>{steps}</Text>
          </Text>

          <Text style={styles.dashboardItem}>
            🔥 Calories:{" "}
            <Text style={styles.dashboardValue}>
              {calories} kcal
            </Text>
          </Text>

          <Text style={styles.dashboardItem}>
            📍 Distance:{" "}
            <Text style={styles.dashboardValue}>
              {distance} km
            </Text>
          </Text>

          <Text style={styles.dashboardItem}>
            ⏱ Active:{" "}
            <Text style={styles.dashboardValue}>
              {activeMinutes} min
            </Text>
          </Text>

          <Text style={styles.dashboardItem}>
            💧 Water:{" "}
            <Text style={styles.dashboardValue}>
              Reminder Enabled
            </Text>
          </Text>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </LinearGradient>
  );
}

/* ---------------------------------------------------
   STYLES
--------------------------------------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    paddingTop: 60,
    paddingBottom: 25,
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
  },

  headerSubtitle: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.9,
    marginTop: 6,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginLeft: 20,
    marginTop: 25,
    marginBottom: 12,
  },

  glassCard: {
    backgroundColor: "rgba(255,255,255,0.22)",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 22,
    marginBottom: 10,

    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },

    ...(Platform.OS === "web" && {
      boxShadow: "0px 6px 16px rgba(0,0,0,0.18)",
    }),
  },

  centerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  bigValue: {
    fontSize: 42,
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 10,
  },

  bigLabel: {
    textAlign: "center",
    color: "#fff",
    fontSize: 18,
    marginTop: 8,
  },

  warningText: {
    color: "#ffe082",
    textAlign: "center",
    marginTop: 8,
    fontSize: 14,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },

  smallCard: {
    width: "48%",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 18,
    padding: 15,
    alignItems: "center",
  },

  activeCard: {
    marginTop: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 18,
    padding: 15,
    alignItems: "center",
  },

  smallTitle: {
    color: "#fff",
    fontSize: 15,
    marginTop: 8,
  },

  smallValue: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
    marginTop: 4,
  },

  cardTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },

  cardText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 4,
  },

  buttonWrapper: {
    marginHorizontal: 20,
    borderRadius: 25,
    overflow: "hidden",
  },

  button: {
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 25,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    marginTop: 8,
    color: "#000",
  },

  journalInput: {
    height: 120,
    textAlignVertical: "top",
  },

  dashboard: {
    backgroundColor: "rgba(255,255,255,0.22)",
    marginHorizontal: 20,
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
  },

  dashboardItem: {
    color: "#fff",
    fontSize: 17,
    marginBottom: 10,
  },

  dashboardValue: {
    color: "#ffeb3b",
    fontWeight: "bold",
  },
});
