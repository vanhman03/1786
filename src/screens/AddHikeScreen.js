import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Switch,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import DatabaseHelper from "../DatabaseHelper";

const db = new DatabaseHelper();

export default function AddHikeScreen({ route, navigation }) {
  const { hikeToEdit } = route.params || {};
  const isEditing = !!hikeToEdit;

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [parking, setParking] = useState(true);
  const [length, setLength] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [description, setDescription] = useState("");
  const [imagePath, setImagePath] = useState(null);
  const [originalImagePath, setOriginalImagePath] = useState(null);

  useEffect(() => {
    if (isEditing) {
      navigation.setOptions({ title: "Edit Hike" });
      setName(hikeToEdit.name);
      setLocation(hikeToEdit.location);
      setLength(hikeToEdit.length.toString());
      setDescription(hikeToEdit.description);
      setParking(hikeToEdit.parking === "Yes");
      setDifficulty(hikeToEdit.difficulty);

      if (hikeToEdit.date) {
        const parts = hikeToEdit.date.split("/");
        if (parts.length === 3)
          setDate(new Date(parts[2], parts[1] - 1, parts[0]));
      }
      loadImage(hikeToEdit.id);
    }
  }, [isEditing]);

  const loadImage = async (hikeId) => {
    const obs = await db.getObservations(hikeId);
    if (obs && obs.length > 0) {
      const obsWithImg = obs.find((o) => o.image_path);
      if (obsWithImg) {
        setImagePath(obsWithImg.image_path);
        setOriginalImagePath(obsWithImg.image_path);
      }
    }
  };

  const pickImage = async (useCamera) => {
    try {
      let result;
      const options = {
        mediaTypes: "images",
        quality: 1,
        allowsEditing: true,
      };
      //USE CAMERA
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Error", "Camera permission required!");
          return;
        }
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        const fileName = uri.split("/").pop();
        const newPath = FileSystem.documentDirectory + fileName;
      //SAVE PICTURE
        try {
          await FileSystem.copyAsync({ from: uri, to: newPath });
          setImagePath(newPath);
        } catch (e) {
          setImagePath(uri);
        }
      }
    } catch (error) {
      console.log("Error picking image: ", error);
    }
  };

  const handleSave = async () => {
    if (!name || !location || !length) {
      Alert.alert("Required", "Please fill Name, Location and Length.");
      return;
    }

    const dateStr = date.toLocaleDateString("en-GB");
    const parkingStr = parking ? "Yes" : "No";

    try {
      if (isEditing) {
        await db.updateHike(
          hikeToEdit.id,
          name,
          location,
          dateStr,
          parkingStr,
          length,
          difficulty,
          description
        );

        if (imagePath && imagePath !== originalImagePath) {
          await db.deleteImageObservations(hikeToEdit.id);
          await db.addObservation(
            hikeToEdit.id,
            "Photo Updated",
            new Date().toLocaleString(),
            imagePath
          );
        }
        Alert.alert("Success", "Hike updated!");
      } else {
        const newId = await db.addHike(
          name,
          location,
          dateStr,
          parkingStr,
          length,
          difficulty,
          description
        );
        if (imagePath) {
          await db.addObservation(
            newId,
            "Cover Photo",
            new Date().toLocaleString(),
            imagePath
          );
        }
        Alert.alert("Success", "Hike added!");
      }
      navigation.goBack();
    } catch (error) {
      console.log(error);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) setDate(selectedDate);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formCard}>
        {/* NAME */}
        <Text style={styles.label}>
          Hike Name <Text style={styles.req}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Snowdon Peak"
        />

        {/* LOCATION */}
        <Text style={styles.label}>
          Location <Text style={styles.req}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="e.g. Wales"
        />

        {/* DATE (only 1 row, NO DUPLICATE DATE BELOW) */}
        <Text style={styles.label}>
          Date <Text style={styles.req}>*</Text>
        </Text>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={styles.dateInput}
        >
          <Text style={styles.inputText}>
            {date.toLocaleDateString("en-GB")}
          </Text>
          <Ionicons name="calendar-outline" size={22} color="#2E7D32" />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        {/* LENGTH + PARKING */}
        <View style={styles.rowContainer}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.label}>
              Length (km) <Text style={styles.req}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={length}
              onChangeText={setLength}
              keyboardType="numeric"
              placeholder="0.0"
            />
          </View>

          {/* FIXED PARKING ALIGNMENT */}
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.label}>Parking</Text>
            <View style={styles.parkingBox}>
              <Text style={styles.inputText}>{parking ? "Yes" : "No"}</Text>
              <Switch
                trackColor={{ false: "#767577", true: "#81c784" }}
                thumbColor={parking ? "#2E7D32" : "#f4f3f4"}
                value={parking}
                onValueChange={setParking}
                style={styles.switch}
              />
            </View>
          </View>
        </View>

        {/* DIFFICULTY */}
        <Text style={styles.label}>Difficulty</Text>
        <View style={styles.diffRow}>
          {["Easy", "Medium", "Hard"].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.diffBtn,
                difficulty === level && styles.diffBtnActive,
              ]}
              onPress={() => setDifficulty(level)}
            >
              <Text
                style={[
                  styles.diffText,
                  difficulty === level && styles.diffTextActive,
                ]}
              >
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* DESCRIPTION */}
        <Text style={[styles.label, { marginTop: 15 }]}>Description</Text>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: "top" }]}
          value={description}
          onChangeText={setDescription}
          multiline
          placeholder="Optional details..."
        />

        {/* IMAGE  <Image source={{ uri: imagePath }} */}
        <Text style={[styles.label, { marginTop: 15 }]}>Cover Photo</Text>
        {imagePath ? (
          <View style={styles.imgPreviewBox}>
            <Image source={{ uri: imagePath }} style={styles.imgPreview} />
            <TouchableOpacity
              style={styles.delImgBtn}
              onPress={() => setImagePath(null)}
            >
              <Ionicons name="trash" size={20} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.noImgBox}>
            <Text style={{ color: "#999" }}>No photo selected</Text>
          </View>
        )}

        {/* CAMERA + GALLERY BUTTONS */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.camBtn}
            onPress={() => pickImage(true)}
          >
            <Ionicons name="camera" size={20} color="white" />
            <Text style={styles.btnText}>Camera</Text>
          </TouchableOpacity>


          <View style={{ width: 15 }} />
          <TouchableOpacity
            style={[styles.camBtn, { backgroundColor: "#E65100" }]}
            onPress={() => pickImage(false)}
          >
            <Ionicons name="images" size={20} color="white" />
            <Text style={styles.btnText}>Gallery</Text>
          </TouchableOpacity>
        </View>

        {/* SAVE BUTTON */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>
            {isEditing ? "UPDATE HIKE" : "SAVE HIKE"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },

  formCard: {
    backgroundColor: "white",
    paddingHorizontal: 18,
    paddingVertical: 20,
    borderRadius: 16,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  req: { color: "red" },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
    marginBottom: 14,
  },
  inputText: {
    fontSize: 16,
    color: "#333",
  },

  dateInput: {
    height: 48,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    marginBottom: 14,
  },

  rowContainer: {
    flexDirection: "row",
    marginTop: 4,
    marginBottom: 4,
  },

  parkingBox: {
    height: 48,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    marginBottom: 14,
  },

  switch: {
    // transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
    marginTop: 9
  },

  diffRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    marginBottom: 4,
  },
  diffBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#2E7D32",
    alignItems: "center",
    marginHorizontal: 4,
    backgroundColor: "white",
  },
  diffBtnActive: { backgroundColor: "#2E7D32" },
  diffText: {
    color: "#2E7D32",
    fontWeight: "600",
    fontSize: 14,
  },
  diffTextActive: { color: "white" },

  imgPreviewBox: {
    position: "relative",
    marginTop: 6,
    marginBottom: 16,
  },
  imgPreview: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    resizeMode: "cover",
  },
  delImgBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 8,
    borderRadius: 20,
  },

  noImgBox: {
    height: 110,
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 16,
  },

  btnRow: {
    flexDirection: "row",
    marginTop: 4,
    marginBottom: 20,
  },
  camBtn: {
    flex: 1,
    backgroundColor: "#1976D2",
    paddingVertical: 11,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: {
    color: "white",
    marginLeft: 8,
    fontWeight: "600",
    fontSize: 14,
  },

  saveBtn: {
    backgroundColor: "#2E7D32",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnText: {
    color: "white",
    fontWeight: "700",
    fontSize: 17,
  },
});
