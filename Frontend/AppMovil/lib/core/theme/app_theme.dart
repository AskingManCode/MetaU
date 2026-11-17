import 'package:flutter/material.dart';

class AppTheme {
  // Colores basados en la aplicación administrativa Meta U.
  static const Color primary = Color(0xFF233F86);
  static const Color active = Color(0xFF4F65A4);
  static const Color accent = Color(0xFF0D6EFD);
  static const Color background = Color(0xFFF5F6FA);
  static const Color white = Colors.white;

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: background,

      colorScheme: ColorScheme.fromSeed(
        seedColor: accent,
        brightness: Brightness.light,
      ).copyWith(primary: primary, secondary: accent, surface: white),

      appBarTheme: const AppBarTheme(
        backgroundColor: primary,
        foregroundColor: white,
        elevation: 0,
        centerTitle: false,
      ),

      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: white,
        indicatorColor: const Color(0xFFDDE5F7),
        labelTextStyle: WidgetStateProperty.all(const TextStyle(fontSize: 11)),
      ),
    );
  }
}
