import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import DatabaseHelper from "../DatabaseHelper";

const db = new DatabaseHelper();

export default function HomeScreen({ navigation }) {
  const [hikes, setHikes] = useState([]);
  const [filteredHikes, setFilteredHikes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useFocusEffect(
    useCallback(() => {
      refreshHikes();
    }, [])
  );
  //Tải dữ liệu từ DB lưu vào Hike
  const refreshHikes = async () => {
    try {
      const data = await db.getHikes();
      setHikes(data);
      setFilteredHikes(data);
    } catch (e) {
      console.log("Error fetching hikes", e);
    }
  };
   //Search
  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text) {
      const filtered = hikes.filter(
        (item) =>
          item.name.toLowerCase().includes(text.toLowerCase()) ||
          item.location.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredHikes(filtered);
    } else {
      setFilteredHikes(hikes);
    }
  };
   // RENDER ITEM CLickItem
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("HikeDetail", { hike: item })}
    >
      <View style={styles.cardIcon}>
        <Ionicons name="map" size={30} color="white" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSub}>
          {item.location} • {item.date}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#888"
          style={{ marginRight: 10 }}
        />
        <TextInput
          placeholder="Search hikes..."
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch("")}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>
       
      {filteredHikes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hikes found.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredHikes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddHike")}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5", padding: 15 },

  // Search Styles
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#eee",
  },
  searchInput: { flex: 1, fontSize: 16, color: "#333" },

  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 18, fontWeight: "bold", color: "#555" },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#66BB6A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  cardTitle: { fontSize: 17, fontWeight: "bold", color: "#333" },
  cardSub: { fontSize: 13, color: "#666", marginTop: 4 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#2E7D32",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});
