import 'dart:convert';

import 'package:http/http.dart' as http;

import '../models/auth_session.dart';
import '../models/dashboard_records.dart';
import 'gateway_client.dart';

class DashboardService {
  DashboardService({
    required GatewayClient gatewayClient,
    required AuthSession session,
  }) : _gatewayClient = gatewayClient,
       _session = session;

  final GatewayClient _gatewayClient;
  final AuthSession _session;

  DashboardSummary loadSummary() {
    final profile = _loadStudentProfile();
    final period = _loadCurrentPeriod();
    final currentMatriculas = _loadCurrentMatriculas(profile, period);

    return DashboardSummary(
      activePrematriculas: _countActivePrematriculas(profile),
      currentMatriculas: currentMatriculas.then((records) => records.length),
      currentCourses: currentMatriculas.then((records) => records.length),
      pendingInvoices: _countPendingInvoices(profile, period),
    );
  }

  Future<StudentProfile> _loadStudentProfile() async {
    final response = await _gatewayClient.getAuthenticated(
      'gateway/admin/usuario/${_session.email}',
    );
    final json = _decodeObject(response, expectedStatusCode: 200);
    return StudentProfile.fromJson(json);
  }

  Future<AcademicPeriod?> _loadCurrentPeriod() async {
    final response = await _gatewayClient.getAuthenticated(
      'gateway/academic/periodo',
    );
    final records = _decodeArray(response, expectedStatusCode: 200)
        .map(AcademicPeriod.fromJson)
        .toList();
    final now = DateTime.now();
    final currentPeriods = records
        .where(
          (period) =>
              !now.isBefore(period.startDate) && !now.isAfter(period.endDate),
        )
        .toList()
      ..sort((left, right) => right.startDate.compareTo(left.startDate));

    return currentPeriods.isEmpty ? null : currentPeriods.first;
  }

  Future<int> _countActivePrematriculas(
    Future<StudentProfile> profileFuture,
  ) async {
    final profile = await profileFuture;
    final response = await _gatewayClient.getAuthenticated(
      'gateway/enrollment/prematricula',
    );
    final records = _decodeArray(response, expectedStatusCode: 200)
        .map(PrematriculaRecord.fromJson);

    return records
        .where((record) => record.identification == profile.identification)
        .length;
  }

  Future<List<MatriculaRecord>> _loadCurrentMatriculas(
    Future<StudentProfile> profileFuture,
    Future<AcademicPeriod?> periodFuture,
  ) async {
    final profile = await profileFuture;
    final period = await periodFuture;
    if (period == null) {
      return [];
    }

    final response = await _gatewayClient.getAuthenticated(
      'gateway/enrollment/matricula',
      queryParameters: {'identificacion': profile.identification},
    );
    return _decodeArray(response, expectedStatusCode: 200)
        .map(MatriculaRecord.fromJson)
        .where((record) => record.periodId == period.id)
        .toList();
  }

  Future<int> _countPendingInvoices(
    Future<StudentProfile> profileFuture,
    Future<AcademicPeriod?> periodFuture,
  ) async {
    final profile = await profileFuture;
    final period = await periodFuture;
    if (period == null) {
      return 0;
    }

    final results = await Future.wait([
      _gatewayClient.getAuthenticated(
        'gateway/finance/factura/periodo/${period.id}',
      ),
      _gatewayClient.getAuthenticated(
        'gateway/finance/pago/periodo/${period.id}',
      ),
    ]);

    final invoices = _decodeArray(results[0], expectedStatusCode: 200)
        .map(InvoiceRecord.fromJson)
        .where(
          (invoice) =>
              invoice.identification == profile.identification &&
              invoice.status == 'PEND',
        )
        .toList();
    final paidInvoiceIds = _decodeArray(results[1], expectedStatusCode: 200)
        .map(PaymentRecord.fromJson)
        .where(
          (payment) =>
              payment.identification == profile.identification &&
              payment.status == 'PAG',
        )
        .map((payment) => payment.invoiceId)
        .toSet();

    return invoices.where((invoice) => !paidInvoiceIds.contains(invoice.id)).length;
  }

  Map<String, dynamic> _decodeObject(
    http.Response response, {
    required int expectedStatusCode,
  }) {
    _ensureSuccessful(response, expectedStatusCode);
    final decoded = jsonDecode(response.body);
    if (decoded is! Map<String, dynamic>) {
      throw const FormatException('El Gateway devolvió un objeto inválido.');
    }
    return decoded;
  }

  List<Map<String, dynamic>> _decodeArray(
    http.Response response, {
    required int expectedStatusCode,
  }) {
    _ensureSuccessful(response, expectedStatusCode);
    final decoded = jsonDecode(response.body);
    if (decoded is! List<dynamic>) {
      throw const FormatException('El Gateway devolvió una lista inválida.');
    }

    return decoded.map((item) {
      if (item is! Map<String, dynamic>) {
        throw const FormatException('El Gateway devolvió un registro inválido.');
      }
      return item;
    }).toList();
  }

  void _ensureSuccessful(
    http.Response response,
    int expectedStatusCode,
  ) {
    if (response.statusCode != expectedStatusCode) {
      throw GatewayException(
        'La consulta al Gateway falló (HTTP ${response.statusCode}).',
        statusCode: response.statusCode,
      );
    }
  }
}
