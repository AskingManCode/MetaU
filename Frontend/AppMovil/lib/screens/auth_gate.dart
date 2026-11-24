import 'dart:async';

import 'package:flutter/material.dart';

import '../core/config/app_config.dart';
import '../core/widgets/app_feedback.dart';
import '../models/auth_session.dart';
import '../services/auth_service.dart';
import '../services/dashboard_service.dart';
import '../services/gateway_client.dart';
import 'login_screen.dart';
import '../layout/mobile_layout.dart';
import '../services/expediente_service.dart';

class AuthGate extends StatefulWidget {
  const AuthGate({
    super.key,
    required this.config,
    required this.authService,
    required this.gatewayClient,
  });

  final AppConfig config;
  final AuthService authService;
  final GatewayClient gatewayClient;

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  late final StreamSubscription<void> _sessionExpiredSubscription;
  AuthSession? _session;
  Object? _restoreError;
  bool _isRestoring = true;
  String? _loginFeedback;

  @override
  void initState() {
    super.initState();
    _sessionExpiredSubscription = widget.gatewayClient.onSessionExpired.listen(
      (_) => _handleSessionExpired(),
    );
    _restoreSession();
  }

  @override
  void dispose() {
    _sessionExpiredSubscription.cancel();
    super.dispose();
  }

  void _handleSessionExpired() {
    if (!mounted) {
      return;
    }
    setState(() {
      _session = null;
      _restoreError = null;
      _isRestoring = false;
      _loginFeedback = 'La sesión expiró. Inicie sesión nuevamente.';
    });
  }

  Future<void> _restoreSession() async {
    setState(() {
      _isRestoring = true;
      _restoreError = null;
    });

    try {
      final session = await widget.authService.restoreSession();
      if (mounted) {
        setState(() {
          _session = session;
          _isRestoring = false;
        });
      }
    } on Exception catch (error) {
      if (mounted) {
        setState(() {
          _restoreError = error;
          _isRestoring = false;
        });
      }
    }
  }

  void _acceptLogin(LoginResult result) {
    setState(() {
      _session = result.session;
      _loginFeedback = null;
    });
    final warning = result.auditWarning;
    if (warning != null) {
      _showFeedback(warning, FeedbackType.warning);
    }
  }

  Future<void> _logout() async {
    final result = await widget.authService.logout();
    if (!mounted) {
      return;
    }
    setState(() {
      _session = null;
      _loginFeedback = result.auditWarning == null
          ? 'Sesión cerrada.'
          : 'Sesión cerrada, pero ${result.auditWarning}';
    });
  }

  Future<void> _returnToLogin() async {
    await widget.authService.clearSession();
    if (mounted) {
      setState(() {
        _restoreError = null;
        _session = null;
      });
    }
  }

  void _showFeedback(String message, FeedbackType type) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        AppFeedback.show(context, message: message, type: type);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isRestoring) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (_restoreError != null) {
      return Scaffold(
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.cloud_off_outlined, size: 40),
                const SizedBox(height: 12),
                const Text(
                  'No se pudo verificar la sesión guardada.',
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text('Detalle: $_restoreError', textAlign: TextAlign.center),
                const SizedBox(height: 20),
                FilledButton(
                  onPressed: _restoreSession,
                  child: const Text('Reintentar'),
                ),
                TextButton(
                  onPressed: _returnToLogin,
                  child: const Text('Ir al inicio de sesión'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final session = _session;
    if (session == null) {
      return LoginScreen(
        authService: widget.authService,
        emailDomain: widget.config.studentEmailDomain,
        onAuthenticated: _acceptLogin,
        initialFeedbackMessage: _loginFeedback,
      );
    }

    return MobileLayout(
      dashboardService: DashboardService(
        gatewayClient: widget.gatewayClient,
        session: session,
      ),
      expedienteService: ExpedienteService(
        gatewayClient: widget.gatewayClient,
        session: session,
      ),
      onLogout: _logout,
    );
  }
}
