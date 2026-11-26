import 'package:flutter/material.dart';

import '../core/theme/app_theme.dart';
import '../core/widgets/app_confirm_dialog.dart';
import '../core/widgets/app_feedback.dart';
import '../models/dashboard_records.dart';
import '../models/prematricula_records.dart';
import '../services/gateway_client.dart';
import '../services/prematricula_service.dart';

class PrematriculaScreen extends StatefulWidget {
  const PrematriculaScreen({super.key, required this.service});

  final PrematriculaService service;

  @override
  State<PrematriculaScreen> createState() => _PrematriculaScreenState();
}

class _PrematriculaScreenState extends State<PrematriculaScreen> {
  PrematriculaCatalog? _catalog;
  AcademicPeriod? _period;
  CareerOption? _career;
  final Set<String> _selectedCourses = {};
  final _observationsController = TextEditingController();
  bool _loading = true;
  bool _saving = false;
  bool _notifyByEmail = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _observationsController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final catalog = await widget.service.loadCatalog();
      if (!mounted) return;
      setState(() {
        _catalog = catalog;
        _loading = false;
      });
    } on Exception catch (error) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = error is GatewayException
            ? error.message
            : 'No se pudieron cargar las opciones de prematrícula.';
      });
    }
  }

  List<AcademicPeriod> get _futurePeriods {
    final periods = _catalog?.periods ?? const <AcademicPeriod>[];
    return periods
        .where((period) => period.startDate.isAfter(DateTime.now()))
        .toList()
      ..sort((left, right) => left.startDate.compareTo(right.startDate));
  }

  List<CourseOption> get _availableCourses {
    final career = _career;
    if (career == null) return const [];

    return (_catalog?.courses ?? const <CourseOption>[])
        .where(
          (course) =>
              course.careerCode == career.code &&
              (course.level == null || course.level == 1),
        )
        .toList()
      ..sort((left, right) => left.name.compareTo(right.name));
  }

  Future<void> _submit() async {
    final period = _period;
    final career = _career;
    if (period == null || career == null || _selectedCourses.isEmpty) {
      AppFeedback.show(
        context,
        message: 'Seleccione un periodo, una carrera y al menos un curso.',
        type: FeedbackType.warning,
      );
      return;
    }

    final confirmed = await AppConfirmDialog.show(
      context,
      title: 'Confirmar prematrícula',
      message:
          '¿Desea registrar ${_selectedCourses.length} curso(s) para el periodo seleccionado?',
      confirmText: 'Registrar',
    );
    if (!confirmed || !mounted) return;

    setState(() => _saving = true);
    try {
      final result = await widget.service.create(
        careerCode: career.code,
        courseCodes: _selectedCourses.toList(),
        periodId: period.id,
        observations: _observationsController.text,
        notifyByEmail: _notifyByEmail,
      );

      if (!mounted) return;
      setState(() {
        _saving = false;
        _period = null;
        _career = null;
        _selectedCourses.clear();
        _observationsController.clear();
        _notifyByEmail = false;
      });
      AppFeedback.show(
        context,
        message: result.auditWarning == null
            ? 'Prematrícula registrada correctamente.'
            : 'Prematrícula registrada. ${result.auditWarning}',
        type: result.auditWarning == null
            ? FeedbackType.success
            : FeedbackType.warning,
      );
    } on Exception catch (error) {
      if (!mounted) return;
      setState(() => _saving = false);
      AppFeedback.show(
        context,
        message: error is GatewayException
            ? error.message
            : 'No se pudo registrar la prematrícula.',
        type: FeedbackType.error,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _title(),
          const SizedBox(height: 16),
          Card(
            color: Colors.white,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Text(_error!, textAlign: TextAlign.center),
                  const SizedBox(height: 12),
                  FilledButton.icon(
                    onPressed: _load,
                    icon: const Icon(Icons.refresh),
                    label: const Text('Reintentar'),
                  ),
                ],
              ),
            ),
          ),
        ],
      );
    }

    final courses = _availableCourses;
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _title(),
        const SizedBox(height: 16),
        Card(
          color: Colors.white,
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Nueva prematrícula',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<AcademicPeriod>(
                  key: ValueKey('period-${_period?.id ?? 'none'}'),
                  initialValue: _period,
                  isExpanded: true,
                  decoration: const InputDecoration(
                    labelText: 'Periodo futuro',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.event_outlined),
                  ),
                  items: _futurePeriods
                      .map(
                        (period) => DropdownMenuItem(
                          value: period,
                          child: Text(_periodLabel(period)),
                        ),
                      )
                      .toList(),
                  onChanged: _saving
                      ? null
                      : (value) => setState(() => _period = value),
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<CareerOption>(
                  key: ValueKey('career-${_career?.code ?? 'none'}'),
                  initialValue: _career,
                  isExpanded: true,
                  decoration: const InputDecoration(
                    labelText: 'Carrera',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.school_outlined),
                  ),
                  items: (_catalog?.careers ?? const <CareerOption>[])
                      .map(
                        (career) => DropdownMenuItem(
                          value: career,
                          child: Text(
                            career.name,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      )
                      .toList(),
                  onChanged: _saving
                      ? null
                      : (value) => setState(() {
                          _career = value;
                          _selectedCourses.clear();
                        }),
                ),
                const SizedBox(height: 16),
                Text(
                  'Cursos disponibles',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 8),
                if (_career == null)
                  const Text('Seleccione una carrera para ver sus cursos.')
                else if (courses.isEmpty)
                  const Text('No hay cursos de primer nivel disponibles.'),
                for (final course in courses)
                  CheckboxListTile(
                    contentPadding: EdgeInsets.zero,
                    value: _selectedCourses.contains(course.code),
                    title: Text(course.name),
                    subtitle: Text(course.code),
                    onChanged: _saving
                        ? null
                        : (selected) => setState(() {
                            if (selected == true) {
                              _selectedCourses.add(course.code);
                            } else {
                              _selectedCourses.remove(course.code);
                            }
                          }),
                  ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _observationsController,
                  enabled: !_saving,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    labelText: 'Observaciones (opcional)',
                    border: OutlineInputBorder(),
                    alignLabelWithHint: true,
                    prefixIcon: Icon(Icons.notes_outlined),
                  ),
                ),
                CheckboxListTile(
                  contentPadding: EdgeInsets.zero,
                  value: _notifyByEmail,
                  title: const Text('Notificarme por correo'),
                  subtitle: Text(
                    'Se enviará a la cuenta ${widget.service.email}.',
                  ),
                  onChanged: _saving
                      ? null
                      : (value) =>
                            setState(() => _notifyByEmail = value ?? false),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    onPressed: _saving ? null : _submit,
                    icon: _saving
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.check_circle_outline),
                    label: const Text('Confirmar prematrícula'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _title() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: const Border(
          left: BorderSide(color: AppTheme.primary, width: 4),
        ),
      ),
      child: const Text(
        'Prematrícula',
        style: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: AppTheme.primary,
        ),
      ),
    );
  }

  String _periodLabel(AcademicPeriod period) {
    final date = period.startDate.toLocal();
    return 'Periodo desde ${date.day.toString().padLeft(2, '0')}/'
        '${date.month.toString().padLeft(2, '0')}/${date.year}';
  }
}
