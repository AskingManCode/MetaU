class AuthSession {
  const AuthSession({
    required this.accessToken,
    required this.expiresIn,
    required this.refreshToken,
    required this.userId,
    required this.email,
    required this.rememberMe,
  });

  final String accessToken;
  final String expiresIn;
  final String refreshToken;
  final String userId;
  final String email;
  final bool rememberMe;

  DateTime get expiresAt => DateTime.parse(expiresIn);

  bool get isExpired => !expiresAt.isAfter(DateTime.now());

  factory AuthSession.fromLoginJson(
    Map<String, dynamic> json, {
    required String email,
    required bool rememberMe,
  }) {
    return AuthSession(
      accessToken: _requiredString(json, 'access_token'),
      expiresIn: _requiredString(json, 'expires_in'),
      refreshToken: _requiredString(json, 'refresh_token'),
      userId: _requiredString(json, 'usuarioID'),
      email: email,
      rememberMe: rememberMe,
    );
  }

  factory AuthSession.fromRefreshJson(
    Map<String, dynamic> json,
    AuthSession previousSession,
  ) {
    return AuthSession(
      accessToken: _requiredString(json, 'access_token'),
      expiresIn: _requiredString(json, 'expires_in'),
      refreshToken: _requiredString(json, 'refresh_token'),
      userId: previousSession.userId,
      email: previousSession.email,
      rememberMe: previousSession.rememberMe,
    );
  }

  factory AuthSession.fromStorage(Map<String, String?> values) {
    final session = AuthSession(
      accessToken: _requiredStorageValue(values, 'access_token'),
      expiresIn: _requiredStorageValue(values, 'expires_in'),
      refreshToken: _requiredStorageValue(values, 'refresh_token'),
      userId: _requiredStorageValue(values, 'usuario_id'),
      email: _requiredStorageValue(values, 'email'),
      rememberMe: values['remember_me'] == 'true',
    );
    session.expiresAt;
    return session;
  }

  Map<String, String> toStorage() => {
    'access_token': accessToken,
    'expires_in': expiresIn,
    'refresh_token': refreshToken,
    'usuario_id': userId,
    'email': email,
    'remember_me': rememberMe.toString(),
  };

  static String _requiredString(Map<String, dynamic> json, String key) {
    final value = json[key];
    if (value is! String || value.isEmpty) {
      throw FormatException('La respuesta no contiene un valor válido para $key.');
    }
    return value;
  }

  static String _requiredStorageValue(
    Map<String, String?> values,
    String key,
  ) {
    final value = values[key];
    if (value == null || value.isEmpty) {
      throw FormatException('Falta el valor seguro $key.');
    }
    return value;
  }
}
