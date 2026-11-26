import 'dart:convert';

import 'package:http/http.dart' as http;

import '../models/auth_session.dart';
import '../models/dashboard_records.dart';
import '../models/matricula_records.dart';
import '../models/prematricula_records.dart';
import 'gateway_client.dart';

class MatriculaCatalog {
  const MatriculaCatalog({
    required this.period,
    required this.courses,
    required this.groups,
    required this.existing,
  });

  final AcademicPeriod period;
  final List<CourseOption> courses;
  final List<GroupOption> groups;
  final List<MatriculaOption> existing;
}

class MatriculaService {
  MatriculaService({
    required GatewayClient gatewayClient,
    required AuthSession session,
  }) : _gatewayClient = gatewayClient,
       _session = session;

  final GatewayClient _gatewayClient;
  final AuthSession _session;
  String? _identification;

  Future<MatriculaCatalog> load() async {
    final profileResponse = await _gatewayClient.getAuthenticated(
      'gateway/admin/usuario/${_session.email}',
    );
    final profile = _decodeObject(profileResponse, 'perfil');
    _identification = _requiredText(profile, 'identificacion');

    final responses = await Future.wait([
      _gatewayClient.getAuthenticated('gateway/academic/periodo'),
      _gatewayClient.getAuthenticated('gateway/academic/curso'),
      _gatewayClient.getAuthenticated('gateway/academic/grupo'),
      _gatewayClient.getAuthenticated(
        'gateway/enrollment/matricula',
        queryParameters: {'identificacion': _identification!},
      ),
    ]);

    final periods =
        _decodeArray(
            responses[0],
            'periodos',
          ).map(AcademicPeriod.fromJson).where(_isActive).toList()
          ..sort((left, right) => left.startDate.compareTo(right.startDate));
    if (periods.isEmpty) {
      throw const GatewayException('No hay un periodo activo disponible.');
    }

    final period = periods.first;
    final courses = _decodeArray(
      responses[1],
      'cursos',
    ).map(CourseOption.fromJson).toList();
    final groups = _decodeArray(responses[2], 'grupos')
        .map(GroupOption.fromJson)
        .where((group) => group.periodId == period.id)
        .toList();
    final existing = _decodeArray(responses[3], 'matriculas')
        .map(MatriculaOption.fromJson)
        .where((item) => item.periodId == period.id)
        .toList();

    return MatriculaCatalog(
      period: period,
      courses: courses,
      groups: groups,
      existing: existing,
    );
  }

  Future<void> create({
    required String courseCode,
    required String groupCode,
    required String periodId,
  }) async {
    final identification = _identification;
    if (identification == null) {
      throw const GatewayException(
        'No se cargó la identificación del estudiante.',
      );
    }

    final response = await _gatewayClient.postAuthenticated(
      'gateway/enrollment/matricula',
      body: jsonEncode({
        'identificacion': identification,
        'cursoCode': courseCode,
        'grupoCode': groupCode,
        'periodoID': periodId,
      }),
    );
    if (response.statusCode != 201) {
      throw GatewayException(
        _messageFrom(response) ??
            'No se pudo registrar la matrícula (HTTP ${response.statusCode}).',
        statusCode: response.statusCode,
      );
    }
  }

  bool _isActive(AcademicPeriod period) {
    final now = DateTime.now();
    return !now.isBefore(period.startDate) && !now.isAfter(period.endDate);
  }

  List<Map<String, dynamic>> _decodeArray(
    http.Response response,
    String resource,
  ) {
    if (response.statusCode != 200) {
      throw GatewayException(
        'No se pudieron cargar $resource (HTTP ${response.statusCode}).',
        statusCode: response.statusCode,
      );
    }
    final decoded = jsonDecode(response.body);
    if (decoded is! List<dynamic>) {
      throw FormatException(
        'El Gateway devolvió una lista inválida de $resource.',
      );
    }
    return decoded.whereType<Map<String, dynamic>>().toList();
  }

  Map<String, dynamic> _decodeObject(http.Response response, String resource) {
    if (response.statusCode != 200) {
      throw GatewayException(
        'No se pudo cargar $resource (HTTP ${response.statusCode}).',
        statusCode: response.statusCode,
      );
    }
    final decoded = jsonDecode(response.body);
    if (decoded is! Map<String, dynamic>) {
      throw FormatException(
        'El Gateway devolvió un objeto inválido para $resource.',
      );
    }
    return decoded;
  }

  String _requiredText(Map<String, dynamic> json, String key) {
    final value = json[key];
    if (value == null || value.toString().trim().isEmpty) {
      throw FormatException('El perfil no contiene $key.');
    }
    return value.toString();
  }

  String? _messageFrom(http.Response response) {
    try {
      final decoded = jsonDecode(response.body);
      if (decoded is Map<String, dynamic>) {
        final value = decoded['mensaje'] ?? decoded['message'];
        if (value != null && value.toString().trim().isNotEmpty) {
          return value.toString();
        }
      }
    } on FormatException {
      return null;
    }
    return null;
  }
}
