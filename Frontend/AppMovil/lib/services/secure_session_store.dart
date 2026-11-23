import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../models/auth_session.dart';

class SecureSessionStore {
  SecureSessionStore({FlutterSecureStorage? storage})
    : _storage = storage ?? const FlutterSecureStorage();

  static const _keys = [
    'access_token',
    'expires_in',
    'refresh_token',
    'usuario_id',
    'email',
    'remember_me',
  ];

  final FlutterSecureStorage _storage;

  Future<void> save(AuthSession session) async {
    for (final entry in session.toStorage().entries) {
      await _storage.write(key: entry.key, value: entry.value);
    }
  }

  Future<AuthSession?> readSession() async {
    final values = <String, String?>{};
    for (final key in _keys) {
      values[key] = await _storage.read(key: key);
    }

    if (values.values.every((value) => value == null)) {
      return null;
    }

    return AuthSession.fromStorage(values);
  }

  Future<AuthSession?> loadRememberedSession() async {
    final rememberMe = await _storage.read(key: 'remember_me');
    if (rememberMe != 'true') {
      await clear();
      return null;
    }

    return readSession();
  }

  Future<void> clear() async {
    for (final key in _keys) {
      await _storage.delete(key: key);
    }
  }
}
