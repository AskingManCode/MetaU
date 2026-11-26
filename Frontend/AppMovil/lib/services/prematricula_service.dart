import 'dart:convert';

import 'package:http/http.dart' as http;

import '../models/auth_session.dart';
import '../models/dashboard_records.dart';
import '../models/prematricula_records.dart';
import 'gateway_client.dart';

class PrematriculaCatalog {
  const PrematriculaCatalog({
    required this.periods,
    required this.careers,
    required this.courses,
    required this.existing,
  });

  final List<AcademicPeriod> periods;
  final List<CareerOption> careers;
  final List<CourseOption> courses;
  final List<PrematriculaDetail> existing;
}

class PrematriculaCreateResult {
  const PrematriculaCreateResult({required this.record, this.auditWarning});

  final PrematriculaDetail record;
  final String? auditWarning;
}

class PrematriculaService {
  PrematriculaService({
    required GatewayClient gatewayClient,
    required AuthSession session,
  }) : _gatewayClient = gatewayClient,
       _session = session;

  final GatewayClient _gatewayClient;
  final AuthSession _session;
  String? _identification;

  String get email => _session.email;

  static const _periodRoute = 'gateway/academic/periodo';
  static const _careerRoute = 'gateway/academic/carrera';
  static const _courseRoute = 'gateway/academic/curso';
  static const _prematriculaRoute = 'gateway/enrollment/prematricula';
  static const _notificationRoute = 'gateway/notifications';
  static const _bitacoraRoute = 'gateway/admin/bitacora';

  Future<PrematriculaCatalog> loadCatalog() async {
    final identification = await _loadIdentification();

    final responses = await Future.wait([
      _gatewayClient.getAuthenticated(_periodRoute),
      _gatewayClient.getAuthenticated(_careerRoute),
      _gatewayClient.getAuthenticated(_courseRoute),
      _gatewayClient.getAuthenticated(_prematriculaRoute),
    ]);

    final periods = _decodeArray(responses[0])
        .map(AcademicPeriod.fromJson)
        .toList();
    final careers = _decodeArray(responses[1])
        .map(CareerOption.fromJson)
        .toList();
    final courses = _decodeArray(responses[2])
        .map(CourseOption.fromJson)
        .toList();
    final existing = _decodeArray(responses[3])
        .map(PrematriculaDetail.fromJson)
        .where((record) => record.identification == identification)
        .toList();

    await _registerAudit('El usuario consulta opciones de prematrícula');
    return PrematriculaCatalog(
      periods: periods,
      careers: careers,
      courses: courses,
      existing: existing,
    );
  }

  Future<PrematriculaCreateResult> create({
    required String careerCode,
    required List<String> courseCodes,
    required String periodId,
    String? observations,
    bool notifyByEmail = false,
  }) async {
    final response = await _gatewayClient.postAuthenticated(
      _prematriculaRoute,
      body: jsonEncode({
        'identificacion': await _loadIdentification(),
        'carreraCode': careerCode,
        'cursos': courseCodes,
        'observaciones': observations?.trim().isEmpty == true
            ? null
            : observations?.trim(),
        'periodoID': periodId,
      }),
    );

    if (response.statusCode != 201) {
      throw GatewayException(
        _messageFrom(response) ??
            'No se pudo registrar la prematrícula (HTTP ${response.statusCode}).',
        statusCode: response.statusCode,
      );
    }

    final decoded = jsonDecode(response.body);
    if (decoded is! Map<String, dynamic>) {
      throw const FormatException('La respuesta de prematrícula es inválida.');
    }

    final record = PrematriculaDetail.fromJson(decoded);
    final warnings = <String>[];
    final auditWarning = await _registerAudit(
      'El usuario crea una prematrícula',
    );
    if (auditWarning != null) warnings.add(auditWarning);

    if (notifyByEmail) {
      final response = await _gatewayClient.postAuthenticated(
        _notificationRoute,
        userIdHeader: UserIdHeader.usuarioGuid,
        body: jsonEncode({
          'email': _session.email,
          'asunto': 'Prematrícula registrada',
          'cuerpo': '<p>Su solicitud de prematrícula fue registrada correctamente en MetaU.</p>',
        }),
      );
      if (response.statusCode != 200) {
        warnings.add(
          _messageFrom(response) ??
              'No se pudo enviar la notificación por correo.',
        );
      }
    }

    return PrematriculaCreateResult(
      record: record,
      auditWarning: warnings.isEmpty ? null : warnings.join(' '),
    );
  }

  Future<String?> _registerAudit(String description) async {
    try {
      final response = await _gatewayClient.postAuthenticated(
        _bitacoraRoute,
        body: jsonEncode({'descripcion': description}),
      );
      if (response.statusCode != 201) {
        return 'La operación se realizó, pero no se pudo registrar la bitácora.';
      }
    } on SessionExpiredException {
      rethrow;
    } on GatewayException catch (error) {
      return error.message;
    }
    return null;
  }

  Future<String> _loadIdentification() async {
    final cached = _identification;
    if (cached != null) return cached;

    final response = await _gatewayClient.getAuthenticated(
      'gateway/admin/usuario/${_session.email}',
    );
    final profile = _decodeObject(response);
    final identification = _requiredText(profile, 'identificacion');
    _identification = identification;
    return identification;
  }

  List<Map<String, dynamic>> _decodeArray(http.Response response) {
    if (response.statusCode != 200) {
      throw GatewayException(
        _messageFrom(response) ??
            'No se pudo cargar la información (HTTP ${response.statusCode}).',
        statusCode: response.statusCode,
      );
    }

    final decoded = jsonDecode(response.body);
    if (decoded is! List<dynamic>) {
      throw const FormatException('El Gateway devolvió una lista inválida.');
    }

    return decoded.map((item) {
      if (item is! Map<String, dynamic>) {
        throw const FormatException(
          'El Gateway devolvió un registro inválido.',
        );
      }
      return item;
    }).toList();
  }

  Map<String, dynamic> _decodeObject(http.Response response) {
    if (response.statusCode != 200) {
      throw GatewayException(
        _messageFrom(response) ??
            'No se pudo cargar el perfil (HTTP ${response.statusCode}).',
        statusCode: response.statusCode,
      );
    }

    final decoded = jsonDecode(response.body);
    if (decoded is! Map<String, dynamic>) {
      throw const FormatException('El Gateway devolvió un perfil inválido.');
    }
    return decoded;
  }

  String _requiredText(Map<String, dynamic> json, String key) {
    final value = json[key];
    if (value is! String || value.trim().isEmpty) {
      throw FormatException('El perfil no contiene un valor válido para $key.');
    }
    return value.trim();
  }

  String? _messageFrom(http.Response response) {
    try {
      final decoded = jsonDecode(response.body);
      if (decoded is Map<String, dynamic>) {
        final value = decoded['mensaje'] ?? decoded['message'];
        return value is String && value.trim().isNotEmpty ? value : null;
      }
    } on FormatException {
      return null;
    }
    return null;
  }
}
