import 'dart:convert';

import 'package:http/http.dart' as http;

import '../models/auth_session.dart';
import 'gateway_client.dart';
import 'secure_session_store.dart';

class InvalidCredentialsException implements Exception {
  const InvalidCredentialsException();
}

class LoginResult {
  const LoginResult({
    required this.session,
    this.auditWarning,
  });

  final AuthSession session;
  final String? auditWarning;
}

class LogoutResult {
  const LogoutResult({this.auditWarning});

  final String? auditWarning;
}

class AuthService {
  AuthService({
    required GatewayClient gatewayClient,
    required SecureSessionStore sessionStore,
  }) : _gatewayClient = gatewayClient,
       _sessionStore = sessionStore;

  final GatewayClient _gatewayClient;
  final SecureSessionStore _sessionStore;

  Future<LoginResult> login({
    required String email,
    required String password,
    required bool rememberMe,
  }) async {
    final response = await _gatewayClient.postPublic(
      'gateway/auth/login',
      headers: {'usuario': email, 'contrasena': password},
    );

    if (response.statusCode == 401) {
      throw const InvalidCredentialsException();
    }
    if (response.statusCode != 201) {
      throw GatewayException(
        'No se pudo iniciar sesión (HTTP ${response.statusCode}).',
        statusCode: response.statusCode,
      );
    }

    final decoded = jsonDecode(response.body);
    if (decoded is! Map<String, dynamic>) {
      throw const FormatException('La respuesta de inicio de sesión es inválida.');
    }

    final session = AuthSession.fromLoginJson(
      decoded,
      email: email,
      rememberMe: rememberMe,
    );
    session.expiresAt;
    await _sessionStore.save(session);

    String? auditWarning;
    try {
      final auditResponse = await _gatewayClient.postAuthenticated(
        'gateway/admin/bitacora',
        body: jsonEncode({'descripcion': 'Inicio de sesión exitoso'}),
      );
      if (auditResponse.statusCode != 201) {
        auditWarning =
            'No se pudo registrar el inicio de sesión en Bitácoras (HTTP ${auditResponse.statusCode}).';
      }
    } on SessionExpiredException {
      rethrow;
    } on GatewayException catch (error) {
      auditWarning = error.message;
    }

    return LoginResult(session: session, auditWarning: auditWarning);
  }

  Future<AuthSession?> restoreSession() async {
    final session = await _sessionStore.loadRememberedSession();
    if (session == null) {
      return null;
    }

    try {
      final response = await _gatewayClient.postAuthenticated(
        'gateway/auth/validate',
        includeUserId: false,
      );
      if (response.statusCode != 200) {
        throw GatewayException(
          'No se pudo validar la sesión (HTTP ${response.statusCode}).',
          statusCode: response.statusCode,
        );
      }
      if (jsonDecode(response.body) != true) {
        await _sessionStore.clear();
        return null;
      }
      return await _sessionStore.readSession();
    } on SessionExpiredException {
      return null;
    }
  }

  Future<LogoutResult> logout() async {
    String? auditWarning;
    try {
      final response = await _gatewayClient.postAuthenticated(
        'gateway/admin/bitacora',
        body: jsonEncode({'descripcion': 'Cierre de sesión'}),
      );
      if (response.statusCode != 201) {
        auditWarning =
            'No se pudo registrar el cierre de sesión en Bitácoras (HTTP ${response.statusCode}).';
      }
    } on GatewayException catch (error) {
      auditWarning = error.message;
    } on http.ClientException {
      auditWarning = 'No se pudo conectar con Bitácoras para registrar el cierre de sesión.';
    } finally {
      await _sessionStore.clear();
    }

    return LogoutResult(auditWarning: auditWarning);
  }

  Future<void> clearSession() => _sessionStore.clear();
}
