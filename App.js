import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "react-native";

import HomeScreen from "./src/screens/HomeScreen";
import AddHikeScreen from "./src/screens/AddHikeScreen";
import HikeDetailScreen from "./src/screens/HikeDetailScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: "#2E7D32" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "M-Hike" }}
        />
        <Stack.Screen
          name="AddHike"
          component={AddHikeScreen}
          options={{ title: "New Hike" }}
        />
        <Stack.Screen
          name="HikeDetail"
          component={HikeDetailScreen}
          options={{ title: "Hike Details" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
