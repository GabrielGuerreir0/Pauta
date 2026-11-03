import { Tabs } from 'expo-router';
import { CalendarDays, Settings, Sun } from 'lucide-react-native';

import { strings } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: {
          fontFamily: theme.typography.caption.fontFamily,
          fontSize: theme.typography.caption.fontSize,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: strings.tabs.today,
          tabBarIcon: ({ color }) => <Sun color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: strings.tabs.agenda,
          tabBarIcon: ({ color }) => <CalendarDays color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: strings.tabs.settings,
          tabBarIcon: ({ color }) => <Settings color={color} size={22} />,
        }}
      />
    </Tabs>
  );
}
