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
  }) => _sendAuthenticated(
    'GET',
    route,
    queryParameters: queryParameters,
  );

  Future<http.Response> postAuthenticated(
    String route, {
    String? body,
    bool includeUserId = true,
  }) => _sendAuthenticated(
    'POST',
    route,
    body: body,
    includeUserId: includeUserId,
  );

  Future<http.Response> _sendAuthenticated(
    String method,
    String route, {
    String? body,
    Map<String, String>? queryParameters,
    bool includeUserId = true,
  }) async {
    var session = await _sessionStore.readSession();
    if (session == null) {
      throw const SessionExpiredException();
    }

    if (session.isExpired) {
      session = await _refresh(session);
    }

    var response = await _send(
      method,
      route,
      body: body,
      queryParameters: queryParameters,
      headers: {
        ..._authorizationHeaders(session, includeUserId: includeUserId),
        if (body != null) 'Content-Type': 'application/json',
      },
    );

    if (response.statusCode != 401) {
      return response;
    }

    session = await _refresh(session);
    response = await _send(
      method,
      route,
      body: body,
      queryParameters: queryParameters,
      headers: {
        ..._authorizationHeaders(session, includeUserId: includeUserId),
        if (body != null) 'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 401) {
      await _sessionStore.clear();
      throw const SessionExpiredException();
    }

    return response;
  }

  Map<String, String> _authorizationHeaders(
    AuthSession session, {
    required bool includeUserId,
  }) => {
    'Authorization': 'Bearer ${session.accessToken}',
    if (includeUserId) 'X-Usuario-Id': session.userId,
  };

  Future<AuthSession> _refresh(AuthSession previousSession) async {
    late final http.Response response;
    try {
      response = await postPublic(
        'gateway/auth/refresh',
        headers: const {'Content-Type': 'application/json'},
        body: jsonEncode({'refreshToken': previousSession.refreshToken}),
      );
    } on GatewayException {
      await _sessionStore.clear();
      throw const SessionExpiredException();
    }

    if (response.statusCode != 201) {
      await _sessionStore.clear();
      throw const SessionExpiredException();
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
    } on FormatException {
      await _sessionStore.clear();
      throw const SessionExpiredException();
    }

    await _sessionStore.save(refreshedSession);
    return refreshedSession;
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
