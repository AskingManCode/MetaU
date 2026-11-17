import 'package:flutter/material.dart';

import 'core/theme/app_theme.dart';
import 'layout/mobile_layout.dart';

void main() {
  runApp(const MetaUApp());
}

class MetaUApp extends StatelessWidget {
  const MetaUApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Meta U',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const MobileLayout(),
    );
  }
}
