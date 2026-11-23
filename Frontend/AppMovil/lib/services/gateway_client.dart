import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import '../core/config/app_config.dart';
import '../models/auth_session.dart';
import 'secure_session_store.dart';

class GatewayException implements Exception {
  const GatewayException(this.message, {this.statusCode});

  final String message;
  final int? statusCode;

  @override
  String toString() => message;
}

class SessionExpiredException extends GatewayException {
  const SessionExpiredException()
    : super('La sesión expiró. Inicie sesión nuevamente.');
}

enum UserIdHeader { xUsuarioId, usuarioGuid, none }

class GatewayClient {
  GatewayClient({
    required AppConfig config,
    required SecureSessionStore sessionStore,
    http.Client? client,
  }) : _config = config,
       _sessionStore = sessionStore,
       _client = client ?? http.Client();

  final AppConfig _config;
  final SecureSessionStore _sessionStore;
  final http.Client _client;
  final StreamController<void> _sessionExpiredController =
      StreamController<void>.broadcast();
  Future<void> _sessionQueue = Future<void>.value();

  Stream<void> get onSessionExpired => _sessionExpiredController.stream;

  Future<http.Response> getPublic(String route) =>
      _send('GET', route);

  Future<http.Response> postPublic(
    String route, {
    Map<String, String> headers = const {},
    String? body,
  }) => _send('POST', route, headers: headers, body: body);

  Future<http.Response> getAuthenticated(
    String route, {
    Map<String, String>? queryParameters,
    UserIdHeader userIdHeader = UserIdHeader.xUsuarioId,
  }) => _sendAuthenticated(
    'GET',
    route,
    queryParameters: queryParameters,
    userIdHeader: userIdHeader,
  );

  Future<http.Response> postAuthenticated(
    String route, {
    String? body,
    UserIdHeader userIdHeader = UserIdHeader.xUsuarioId,
  }) => _sendAuthenticated(
    'POST',
    route,
    body: body,
    userIdHeader: userIdHeader,
  );

  Future<http.Response> _sendAuthenticated(
    String method,
    String route, {
    String? body,
    Map<String, String>? queryParameters,
    required UserIdHeader userIdHeader,
  }) async {
    var session = await _loadValidSession();

    var response = await _send(
      method,
      route,
      body: body,
      queryParameters: queryParameters,
      headers: {
        ..._authorizationHeaders(session, userIdHeader: userIdHeader),
        if (body != null) 'Content-Type': 'application/json',
      },
    );

    if (response.statusCode != 401) {
      return response;
    }

    if (await _isAccessTokenValid(session)) {
      return response;
    }

    session = await _refreshIfCurrent(session);
    response = await _send(
      method,
      route,
      body: body,
      queryParameters: queryParameters,
      headers: {
        ..._authorizationHeaders(session, userIdHeader: userIdHeader),
        if (body != null) 'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 401 && !await _isAccessTokenValid(session)) {
      await _invalidateSession();
      throw const SessionExpiredException();
    }

    return response;
  }

  Map<String, String> _authorizationHeaders(
    AuthSession session, {
    required UserIdHeader userIdHeader,
  }) {
    return {
      'Authorization': 'Bearer ${session.accessToken}',
      if (userIdHeader == UserIdHeader.xUsuarioId)
        'X-Usuario-Id': session.userId,
      if (userIdHeader == UserIdHeader.usuarioGuid)
        'UsuarioGUID': session.userId,
    };
  }

  Future<AuthSession> _loadValidSession() {
    return _withSessionLock(() async {
      final session = await _sessionStore.readSession();
      if (session == null) {
        throw const SessionExpiredException();
      }

      return session.isExpired ? _refresh(session) : session;
    });
  }

  Future<AuthSession> _refreshIfCurrent(AuthSession rejectedSession) {
    return _withSessionLock(() async {
      final currentSession = await _sessionStore.readSession();
      if (currentSession == null) {
        throw const SessionExpiredException();
      }

      if (currentSession.refreshToken != rejectedSession.refreshToken ||
          currentSession.accessToken != rejectedSession.accessToken) {
        return currentSession;
      }

      return _refresh(currentSession);
    });
  }

  Future<T> _withSessionLock<T>(Future<T> Function() operation) async {
    final previous = _sessionQueue;
    final release = Completer<void>();
    _sessionQueue = release.future;
    await previous;
    try {
      return await operation();
    } finally {
      release.complete();
    }
  }

  Future<bool> _isAccessTokenValid(AuthSession session) async {
    final response = await _send(
      'POST',
      'gateway/auth/validate',
      headers: {'Authorization': 'Bearer ${session.accessToken}'},
    );

    if (response.statusCode == 401) {
      return false;
    }
    if (response.statusCode != 200) {
      throw GatewayException(
        'No se pudo comprobar el token de acceso (HTTP ${response.statusCode}).',
        statusCode: response.statusCode,
      );
    }

    final decoded = jsonDecode(response.body);
    if (decoded is! bool) {
      throw const FormatException('Respuesta de validación de token inválida.');
    }
    return decoded;
  }

  Future<void> _invalidateSession() async {
    await _sessionStore.clear();
    if (!_sessionExpiredController.isClosed) {
      _sessionExpiredController.add(null);
    }
  }

  Future<AuthSession> _refresh(AuthSession previousSession) async {
    final response = await postPublic(
      'gateway/auth/refresh',
      headers: const {'Content-Type': 'application/json'},
      body: jsonEncode({'refreshToken': previousSession.refreshToken}),
    );

    if (response.statusCode == 401) {
      if (_isRefreshTokenRejected(response)) {
        await _invalidateSession();
        throw const SessionExpiredException();
      }
      throw const GatewayException(
        'El Gateway rechazó la renovación sin confirmar que el refresh token sea inválido.',
        statusCode: 401,
      );
    }
    if (response.statusCode != 201) {
      throw GatewayException(
        'No se pudo renovar la sesión (HTTP ${response.statusCode}).',
        statusCode: response.statusCode,
      );
    }

    late final AuthSession refreshedSession;
    try {
      final decoded = jsonDecode(response.body);
      if (decoded is! Map<String, dynamic>) {
        throw const FormatException('Respuesta de refresh inválida.');
      }
      refreshedSession = AuthSession.fromRefreshJson(
        decoded,
        previousSession,
      );
      refreshedSession.expiresAt;
    } on FormatException catch (error) {
      throw GatewayException(
        'La respuesta de renovación es inválida: ${error.message}',
        statusCode: response.statusCode,
      );
    }

    await _sessionStore.save(refreshedSession);
    return refreshedSession;
  }

  bool _isRefreshTokenRejected(http.Response response) {
    try {
      final decoded = jsonDecode(response.body);
      if (decoded is Map<String, dynamic>) {
        return decoded['mensaje'] == 'No autorizado' ||
            decoded['Mensaje'] == 'No autorizado';
      }
    } on FormatException {
      return false;
    }
    return false;
  }

  Future<http.Response> _send(
    String method,
    String route, {
    Map<String, String> headers = const {},
    String? body,
    Map<String, String>? queryParameters,
  }) async {
    final uri = _config.gatewayUri(
      route,
      queryParameters: queryParameters,
    );
    try {
      switch (method) {
        case 'GET':
          return await _client.get(uri, headers: headers);
        case 'POST':
          return await _client.post(uri, headers: headers, body: body);
        default:
          throw ArgumentError.value(method, 'method', 'Método no admitido.');
      }
    } on http.ClientException {
      throw const GatewayException(
        'No se pudo conectar al Gateway. Verifique la conexión e intente de nuevo.',
      );
    }
  }
}
