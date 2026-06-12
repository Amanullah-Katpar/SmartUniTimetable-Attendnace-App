import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#534AB7",
        tabBarInactiveTintColor: "#888",
        tabBarStyle: {
          borderTopWidth: 0.5,
          borderTopColor: "rgba(0,0,0,0.1)",
          backgroundColor: "#fff",
          height: 60,
          paddingBottom: 8,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Timetable", tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="attendance" options={{ title: "Attendance", tabBarIcon: ({ color, size }) => <Ionicons name="checkmark-circle-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="courses" options={{ title: "Courses", tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="explore" options={{ title: "Grades", tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }} />
    </Tabs>
  );
}
