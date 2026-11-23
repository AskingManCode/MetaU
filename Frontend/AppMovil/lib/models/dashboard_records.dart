class StudentProfile {
  const StudentProfile({required this.identification});

  final String identification;

  factory StudentProfile.fromJson(Map<String, dynamic> json) {
    return StudentProfile(
      identification: _requiredString(json, 'identificacion'),
    );
  }
}

class AcademicPeriod {
  const AcademicPeriod({
    required this.id,
    required this.startDate,
    required this.endDate,
  });

  final String id;
  final DateTime startDate;
  final DateTime endDate;

  factory AcademicPeriod.fromJson(Map<String, dynamic> json) {
    return AcademicPeriod(
      id: _requiredString(json, 'periodoID'),
      startDate: DateTime.parse(_requiredString(json, 'fechaInicio')),
      endDate: DateTime.parse(_requiredString(json, 'fechaFin')),
    );
  }
}

class PrematriculaRecord {
  const PrematriculaRecord({required this.identification});

  final String identification;

  factory PrematriculaRecord.fromJson(Map<String, dynamic> json) {
    return PrematriculaRecord(
      identification: _requiredString(json, 'identificacion'),
    );
  }
}

class MatriculaRecord {
  const MatriculaRecord({required this.periodId});

  final String periodId;

  factory MatriculaRecord.fromJson(Map<String, dynamic> json) {
    return MatriculaRecord(
      periodId: _requiredString(json, 'periodoID'),
    );
  }
}

class InvoiceRecord {
  const InvoiceRecord({
    required this.id,
    required this.identification,
    required this.status,
  });

  final String id;
  final String identification;
  final String status;

  factory InvoiceRecord.fromJson(Map<String, dynamic> json) {
    return InvoiceRecord(
      id: _requiredString(json, 'facturaID'),
      identification: _requiredString(json, 'identificacionEstudiante'),
      status: _requiredString(json, 'estado'),
    );
  }
}

class PaymentRecord {
  const PaymentRecord({
    required this.invoiceId,
    required this.identification,
    required this.status,
  });

  final String invoiceId;
  final String identification;
  final String status;

  factory PaymentRecord.fromJson(Map<String, dynamic> json) {
    final invoice = json['factura'];
    if (invoice is! Map<String, dynamic>) {
      throw const FormatException('El pago no contiene una factura válida.');
    }

    return PaymentRecord(
      invoiceId: _requiredString(invoice, 'facturaID'),
      identification: _requiredString(
        invoice,
        'identificacionEstudiante',
      ),
      status: _requiredString(json, 'estado'),
    );
  }
}

class DashboardSummary {
  const DashboardSummary({
    required this.activePrematriculas,
    required this.currentMatriculas,
    required this.currentCourses,
    required this.pendingInvoices,
  });

  final Future<int> activePrematriculas;
  final Future<int> currentMatriculas;
  final Future<int> currentCourses;
  final Future<int> pendingInvoices;
}

String _requiredString(Map<String, dynamic> json, String key) {
  final value = json[key];
  if (value is! String || value.isEmpty) {
    throw FormatException('La respuesta no contiene un valor válido para $key.');
  }
  return value;
}
