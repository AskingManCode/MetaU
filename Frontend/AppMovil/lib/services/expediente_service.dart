import 'dart:convert';

import 'package:http/http.dart' as http;

import '../models/auth_session.dart';
import '../models/dashboard_records.dart';
import '../models/expediente_records.dart';
import 'gateway_client.dart';

class ExpedienteLoadResult {
  const ExpedienteLoadResult({required this.record, this.auditWarning});

  final ExpedienteRecord record;
  final String? auditWarning;
}

class ExpedienteUpdateResult {
  const ExpedienteUpdateResult({required this.record, this.auditWarning});

  final ExpedienteRecord record;
  final String? auditWarning;
}

class ExpedienteService {
  ExpedienteService({
    required GatewayClient gatewayClient,
    required AuthSession session,
  }) : _gatewayClient = gatewayClient,
       _session = session;

  final GatewayClient _gatewayClient;
  final AuthSession _session;

  static const _usuarioRoute = 'gateway/admin/usuario';
  static const _expedienteRoute = 'gateway/enrollment/expediente';
  static const _provinciasRoute = 'gateway/enrollment/provincias';
  static const _cantonesRoute = 'gateway/enrollment/cantones';
  static const _distritosRoute = 'gateway/enrollment/distritos';
  static const _bitacoraRoute = 'gateway/admin/bitacora';

  static String describeError(Object error) {
    if (error is GatewayException) {
      return error.message;
    }
    if (error is FormatException) {
      return 'La respuesta del servicio no es valida: ${error.message}';
    }
    return 'Ocurrio un error inesperado Intente de nuevo';
  }

  Future<ExpedienteLoadResult> loadExpediente() async {
    final profileResponse = await _gatewayClient.getAuthenticated(
      '$_usuarioRoute/${_session.email}',
    );
    final profile = StudentProfile.fromJson(
      _decodeObject(profileResponse, expectedStatusCode: 200),
    );

    final response = await _gatewayClient.getAuthenticated(
      '$_expedienteRoute/${profile.identification}',
    );
    if (response.statusCode == 404) {
      throw const GatewayException(
        'No se encontro un expediente asociado a su cuenta',
        statusCode: 404,
      );
    }
    final record = ExpedienteRecord.fromJson(
      _decodeObject(response, expectedStatusCode: 200),
    );

    final warning = await _registerAudit('El usuario consulta su expediente');
    return ExpedienteLoadResult(record: record, auditWarning: warning);
  }

  Future<ExpedienteUpdateResult> updateExpediente({
    required ExpedienteRecord previous,
    required List<String> phones,
    required String province,
    required String canton,
    required String district,
    required String otherAddress,
  }) async {
    final updated = previous.copyWith(
      phones: phones,
      province: province,
      canton: canton,
      district: district,
      otherAddress: otherAddress,
    );

    final response = await _gatewayClient.putAuthenticated(
      '$_expedienteRoute/${previous.identification}',
      body: jsonEncode(updated.toJson()),
    );
    if (response.statusCode != 200 &&
        response.statusCode != 201 &&
        response.statusCode != 204) {
      throw GatewayException(
        _errorMessage(response),
        statusCode: response.statusCode,
      );
    }

    final warning = await _registerAudit(
      'Actualizacion de expediente - '
      'Registro anterior: ${jsonEncode(previous.toJson())} - '
      'Registro actual: ${jsonEncode(updated.toJson())}',
    );
    return ExpedienteUpdateResult(record: updated, auditWarning: warning);
  }

  Future<List<AddressOption>> loadProvincias() async {
    final response = await _gatewayClient.getAuthenticated(_provinciasRoute);
    return _decodeOptions(response);
  }

  Future<List<AddressOption>> loadCantones(String provincia) async {
    final response = await _gatewayClient.getAuthenticated(
      _cantonesRoute,
      queryParameters: {'provincia': provincia},
    );
    return _decodeOptions(response);
  }

  Future<List<AddressOption>> loadDistritos(
    String provincia,
    String canton,
  ) async {
    final response = await _gatewayClient.getAuthenticated(
      _distritosRoute,
      queryParameters: {'provincia': provincia, 'canton': canton},
    );
    return _decodeOptions(response);
  }

  Future<String?> _registerAudit(String description) async {
    try {
      final response = await _gatewayClient.postAuthenticated(
        _bitacoraRoute,
        body: jsonEncode({'descripcion': description}),
      );
      if (response.statusCode != 201) {
        return 'No se pudo registrar la accion en Bitacoras (HTTP ${response.statusCode})';
      }
      return null;
    } on SessionExpiredException {
      rethrow;
    } on GatewayException catch (error) {
      return error.message;
    }
  }

  List<AddressOption> _decodeOptions(http.Response response) {
    _ensureSuccessful(response, 200);
    final decoded = jsonDecode(response.body);
    if (decoded is! List<dynamic>) {
      throw const FormatException('El Gateway devolvio una lista invalida');
    }
    final options = decoded.map(AddressOption.fromJson);
    return {for (final option in options) option.value: option}.values.toList();
  }

  Map<String, dynamic> _decodeObject(
    http.Response response, {
    required int expectedStatusCode,
  }) {
    _ensureSuccessful(response, expectedStatusCode);
    final decoded = jsonDecode(response.body);
    if (decoded is! Map<String, dynamic>) {
      throw const FormatException('El Gateway devolvio un objeto invalido');
    }
    return decoded;
  }

  void _ensureSuccessful(http.Response response, int expectedStatusCode) {
    if (response.statusCode != expectedStatusCode) {
      throw GatewayException(
        'La consulta al Gateway fallo (HTTP ${response.statusCode})',
        statusCode: response.statusCode,
      );
    }
  }

  String _errorMessage(http.Response response) {
    final fallback =
        'No se pudo actualizar el expediente (HTTP ${response.statusCode})';
    try {
      final decoded = jsonDecode(response.body);
      if (decoded is Map<String, dynamic>) {
        for (final key in [
          'mensaje',
          'Mensaje',
          'message',
          'detail',
          'title',
        ]) {
          final value = decoded[key];
          if (value is String && value.isNotEmpty) {
            return value;
          }
        }
      } else if (decoded is String && decoded.isNotEmpty) {
        return decoded;
      }
      return fallback;
    } on FormatException {
      return fallback;
    }
  }
}
