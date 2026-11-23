import 'package:flutter/material.dart';

import 'core/theme/app_theme.dart';
import 'core/config/app_config.dart';
import 'screens/auth_gate.dart';
import 'services/auth_service.dart';
import 'services/gateway_client.dart';
import 'services/secure_session_store.dart';

void main() {
  const config = AppConfig();
  final sessionStore = SecureSessionStore();
  final gatewayClient = GatewayClient(
    config: config,
    sessionStore: sessionStore,
  );
  final authService = AuthService(
    gatewayClient: gatewayClient,
    sessionStore: sessionStore,
  );

  runApp(
    MetaUApp(
      config: config,
      authService: authService,
      gatewayClient: gatewayClient,
    ),
  );
}

class MetaUApp extends StatelessWidget {
  const MetaUApp({
    super.key,
    required this.config,
    required this.authService,
    required this.gatewayClient,
  });

  final AppConfig config;
  final AuthService authService;
  final GatewayClient gatewayClient;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Meta U',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: AuthGate(
        config: config,
        authService: authService,
        gatewayClient: gatewayClient,
      ),
    );
  }
}
