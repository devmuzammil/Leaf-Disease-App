import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { AppStackNavigator } from "./AppStackNavigator";
import type { AppDrawerParamList } from "../types/navigation";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { signOut } from "../store/authSlice";
import { ProfileScreen } from "../screens/ProfileScreen";
import { AboutScreen } from "../screens/AboutScreen";
import { HelpSupportScreen } from "../screens/HelpSupportScreen";
import { useTranslation } from "../hooks/useTranslation";
import { useNavigation } from "@react-navigation/native";

const Drawer = createDrawerNavigator<AppDrawerParamList>();

const DrawerMenuButton: React.FC = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => (navigation as any)?.openDrawer?.()}
      style={styles.headerMenuButton}
      hitSlop={8}
    >
      <View style={styles.headerMenuLine} />
      <View style={[styles.headerMenuLine, styles.headerMenuLineShort]} />
    </TouchableOpacity>
  );
};

const CustomDrawerContent: React.FC<any> = (props) => {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const { t, language, setLanguage } = useTranslation();

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerContainer}
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitials}>
            {user?.name?.[0]?.toUpperCase() ?? "G"}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.nameText}>
            {user?.name ?? "Grower"}
          </Text>
          {user?.email ? (
            <Text style={styles.emailText}>{user.email}</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.sectionLabelWrapper}>
        <Text style={styles.sectionLabel}>{t("drawer.section")}</Text>
      </View>

      <DrawerItemList {...props} />

      <View style={styles.languageCard}>
        <Text style={styles.languageTitle}>{t("drawer.language")}</Text>
        <Text style={styles.languageSubtitle}>{t("drawer.languageInfo")}</Text>
        <View style={styles.languageButtons}>
          <TouchableOpacity
            style={[
              styles.langPill,
              language === "en" && styles.langPillActive,
            ]}
            onPress={() => setLanguage("en")}
          >
            <Text
              style={[
                styles.langPillText,
                language === "en" && styles.langPillTextActive,
              ]}
            >
              {t("drawer.english")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.langPill,
              language === "ur" && styles.langPillActive,
            ]}
            onPress={() => setLanguage("ur")}
          >
            <Text
              style={[
                styles.langPillText,
                language === "ur" && styles.langPillTextActive,
              ]}
            >
              {t("drawer.urdu")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.langPill,
              language === "ps" && styles.langPillActive,
            ]}
            onPress={() => setLanguage("ps")}
          >
            <Text
              style={[
                styles.langPillText,
                language === "ps" && styles.langPillTextActive,
              ]}
            >
              {t("drawer.pushto")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <DrawerItem
          label={t("drawer.signOut")}
          labelStyle={styles.logoutLabel}
          onPress={() => dispatch(signOut())}
        />
      </View>
    </DrawerContentScrollView>
  );
};

export const AppDrawerNavigator: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Drawer.Navigator
      initialRouteName="Main"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: "front",
        drawerActiveTintColor: "#022c22",
        drawerActiveBackgroundColor: "#a7f3d0",
        drawerInactiveTintColor: "#022c22",
      }}
    >
      <Drawer.Screen
        name="Main"
        component={AppStackNavigator}
        options={{ title: t("drawer.dashboard") }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: t("drawer.profile"),
          headerShown: true,
          headerStyle: { backgroundColor: "#022c22" },
          headerTintColor: "#ecfdf5",
          headerTitleStyle: { color: "#ecfdf5" },
          headerLeft: () => <DrawerMenuButton />,
        }}
      />
      <Drawer.Screen
        name="About"
        component={AboutScreen}
        options={{
          title: t("drawer.about"),
          headerShown: true,
          headerStyle: { backgroundColor: "#022c22" },
          headerTintColor: "#ecfdf5",
          headerTitleStyle: { color: "#ecfdf5" },
          headerLeft: () => <DrawerMenuButton />,
        }}
      />
      <Drawer.Screen
        name="Help"
        component={HelpSupportScreen}
        options={{
          title: t("drawer.help"),
          headerShown: true,
          headerStyle: { backgroundColor: "#022c22" },
          headerTintColor: "#ecfdf5",
          headerTitleStyle: { color: "#ecfdf5" },
          headerLeft: () => <DrawerMenuButton />,
        }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    paddingTop: 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: "#022c22",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#047857",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    color: "#ecfdf5",
    fontWeight: "700",
    fontSize: 20,
  },
  userInfo: {
    flex: 1,
  },
  nameText: {
    color: "#ecfdf5",
    fontWeight: "700",
    fontSize: 16,
  },
  emailText: {
    color: "#a7f3d0",
    fontSize: 12,
    marginTop: 2,
  },
  sectionLabelWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#ecfdf5",
  },
  sectionLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#047857",
    fontWeight: "600",
  },
  footer: {
    marginTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e7eb",
  },
  logoutLabel: {
    color: "#b91c1c",
    fontWeight: "600",
  },
  languageCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#d1fae5",
  },
  languageTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#065f46",
  },
  languageSubtitle: {
    fontSize: 12,
    color: "#065f46",
    marginTop: 2,
  },
  languageButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  langPill: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "#d1fae5",
  },
  langPillActive: {
    backgroundColor: "#047857",
  },
  langPillText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#065f46",
  },
  langPillTextActive: {
    color: "#ecfdf5",
  },
  headerMenuButton: {
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  headerMenuLine: {
    width: 22,
    height: 2,
    borderRadius: 999,
    backgroundColor: "#ecfdf5",
    marginBottom: 4,
  },
  headerMenuLineShort: {
    width: 16,
    opacity: 0.8,
  },
});


