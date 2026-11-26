class CareerOption {
  const CareerOption({required this.code, required this.name});

  final String code;
  final String name;

  factory CareerOption.fromJson(Map<String, dynamic> json) {
    return CareerOption(
      code: _requiredText(json, ['carreraCode', 'CarreraCode', 'id']),
      name: _requiredText(json, ['nombre', 'Nombre', 'nombreCarrera']),
    );
  }
}

class CourseOption {
  const CourseOption({
    required this.code,
    required this.name,
    required this.careerCode,
    required this.level,
  });

  final String code;
  final String name;
  final String careerCode;
  final int? level;

  factory CourseOption.fromJson(Map<String, dynamic> json) {
    return CourseOption(
      code: _requiredText(json, ['cursoCode', 'CursoCode', 'id']),
      name: _requiredText(json, ['nombre', 'Nombre', 'nombreCurso']),
      careerCode: _text(json, ['carreraCode', 'CarreraCode']) ?? '',
      level: _integer(json, ['nivel', 'Nivel']),
    );
  }
}

class PrematriculaDetail {
  const PrematriculaDetail({
    required this.id,
    required this.identification,
    required this.careerCode,
    required this.courseCodes,
    required this.observations,
    required this.periodId,
  });

  final String id;
  final String identification;
  final String careerCode;
  final List<String> courseCodes;
  final String? observations;
  final String periodId;

  factory PrematriculaDetail.fromJson(Map<String, dynamic> json) {
    final courses = json['cursos'] ?? json['Cursos'];
    return PrematriculaDetail(
      id: _requiredText(json, ['id', 'Id', 'preMatriculaID', 'PreMatriculaID']),
      identification: _requiredText(json, ['identificacion', 'Identificacion']),
      careerCode: _requiredText(json, ['carreraCode', 'CarreraCode']),
      courseCodes: courses is List<dynamic>
          ? courses.map((item) => item.toString()).toList()
          : const [],
      observations: _text(json, ['observaciones', 'Observaciones']),
      periodId: _requiredText(json, ['periodoID', 'PeriodoID']),
    );
  }
}

String _requiredText(Map<String, dynamic> json, List<String> keys) {
  final value = _text(json, keys);
  if (value == null) {
    throw FormatException(
      'La respuesta no contiene un valor válido para ${keys.first}.',
    );
  }
  return value;
}

String? _text(Map<String, dynamic> json, List<String> keys) {
  for (final key in keys) {
    final value = json[key];
    if (value is String && value.trim().isNotEmpty) {
      return value.trim();
    }
    if (value is num) {
      return value.toString();
    }
  }
  return null;
}

int? _integer(Map<String, dynamic> json, List<String> keys) {
  for (final key in keys) {
    final value = json[key];
    if (value is int) return value;
    if (value is num) return value.toInt();
    if (value is String) return int.tryParse(value);
  }
  return null;
}
