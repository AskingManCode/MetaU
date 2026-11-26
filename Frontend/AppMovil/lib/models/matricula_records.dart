class GroupOption {
  const GroupOption({
    required this.code,
    required this.courseCode,
    required this.periodId,
    required this.number,
    required this.schedule,
    required this.capacity,
  });

  final String code;
  final String courseCode;
  final String periodId;
  final String number;
  final String schedule;
  final int? capacity;

  factory GroupOption.fromJson(Map<String, dynamic> json) => GroupOption(
    code: _text(json, ['grupoCode', 'GrupoCode', 'id']),
    courseCode: _text(json, ['cursoCode', 'CursoCode']),
    periodId: _text(json, ['periodoID', 'PeriodoID']),
    number: _text(json, ['numeroGrupo', 'NumeroGrupo']),
    schedule: _text(json, ['horario', 'Horario']),
    capacity: _integer(json, ['cupo', 'Cupo']),
  );
}

class MatriculaOption {
  const MatriculaOption({
    required this.id,
    required this.courseCode,
    required this.groupCode,
    required this.periodId,
  });

  final String id;
  final String courseCode;
  final String groupCode;
  final String periodId;

  factory MatriculaOption.fromJson(Map<String, dynamic> json) =>
      MatriculaOption(
        id: _text(json, ['id', 'Id', 'matriculaXCursoID', 'MatriculaXCursoID']),
        courseCode: _text(json, ['cursoCode', 'CursoCode']),
        groupCode: _text(json, ['grupoCode', 'GrupoCode']),
        periodId: _text(json, ['periodoID', 'PeriodoID']),
      );
}

String _text(Map<String, dynamic> json, List<String> keys) {
  for (final key in keys) {
    final value = json[key];
    if (value != null && value.toString().trim().isNotEmpty) {
      return value.toString();
    }
  }
  return '';
}

int? _integer(Map<String, dynamic> json, List<String> keys) {
  for (final key in keys) {
    final value = json[key];
    if (value is int) return value;
    final parsed = int.tryParse(value?.toString() ?? '');
    if (parsed != null) return parsed;
  }
  return null;
}
