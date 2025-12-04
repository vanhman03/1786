import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DatabaseHelper from "../DatabaseHelper";

const db = new DatabaseHelper();

export default function HikeDetailScreen({ route, navigation }) {
  const { hike } = route.params;
  const [observations, setObservations] = useState([]);

  useEffect(() => {
    loadObservations();
  }, []);

  const loadObservations = async () => {
    const data = await db.getObservations(hike.id);
    setObservations(data);
  };

  const handleDelete = () => {
    Alert.alert("Delete Hike", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await db.deleteHike(hike.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{hike.name}</Text>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("AddHike", { hikeToEdit: hike })
                }
              >
                <Ionicons
                  name="create-outline"
                  size={26}
                  color="orange"
                  style={{ marginRight: 15 }}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete}>
                <Ionicons name="trash-outline" size={26} color="red" />
              </TouchableOpacity>
            </View>
          </View>

          <DetailRow icon="location" text={hike.location} />
          <DetailRow icon="calendar" text={hike.date} />
          <DetailRow icon="resize" text={`${hike.length} km`} />
          <DetailRow icon="car" text={`Parking: ${hike.parking}`} />
          <DetailRow
            icon="stats-chart"
            text={`Difficulty: ${hike.difficulty}`}
          />

          <Text style={styles.sectionHeader}>Description</Text>
          <Text style={styles.desc}>
            {hike.description || "No description."}
          </Text>
        </View>

        {/* Observations */}
        <Text style={styles.obsHeader}>
          Observations ({observations.length})
        </Text>
        {observations.map((obs, index) => (
          <View key={index} style={styles.obsCard}>
            <Text style={styles.obsTime}>{obs.time}</Text>
            <Text style={styles.obsText}>{obs.observation}</Text>
            {obs.image_path && (
              <Image source={{ uri: obs.image_path }} style={styles.obsImage} />
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// Component
const DetailRow = ({ icon, text }) => (
  <View style={styles.row}>
    <Ionicons name={icon} size={20} color="#555" />
    <Text style={styles.rowText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5", padding: 16 },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#2E7D32", flex: 1 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  rowText: { fontSize: 16, marginLeft: 10, color: "#333" },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 5,
    color: "#444",
  },
  desc: { fontSize: 15, color: "#666", lineHeight: 22 },

  obsHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 15,
    color: "#333",
  },
  obsCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 1,
  },
  obsTime: { fontSize: 12, color: "#888", marginBottom: 5 },
  obsText: { fontSize: 16, color: "#333", marginBottom: 10 },
  obsImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    resizeMode: "cover",
  },
});
