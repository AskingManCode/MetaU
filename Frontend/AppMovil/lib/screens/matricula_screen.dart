import 'package:flutter/material.dart';

import '../core/widgets/app_feedback.dart';
import '../models/dashboard_records.dart';
import '../models/matricula_records.dart';
import '../models/prematricula_records.dart';
import '../services/gateway_client.dart';
import '../services/matricula_service.dart';

class MatriculaScreen extends StatefulWidget {
  const MatriculaScreen({super.key, required this.service});

  final MatriculaService service;

  @override
  State<MatriculaScreen> createState() => _MatriculaScreenState();
}

class _MatriculaScreenState extends State<MatriculaScreen> {
  MatriculaCatalog? _catalog;
  CourseOption? _course;
  GroupOption? _group;
  bool _loading = true;
  bool _saving = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
      _course = null;
      _group = null;
    });
    try {
      final catalog = await widget.service.load();
      if (!mounted) return;
      setState(() {
        _catalog = catalog;
        _loading = false;
      });
    } on Exception catch (error) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = error is GatewayException ? error.message : error.toString();
      });
    }
  }

  List<GroupOption> get _groups {
    final catalog = _catalog;
    final course = _course;
    if (catalog == null || course == null) return const [];
    return catalog.groups
        .where((group) => group.courseCode == course.code)
        .toList();
  }

  bool _isDuplicate(GroupOption group) {
    final catalog = _catalog;
    if (catalog == null) return false;
    return catalog.existing.any(
      (item) =>
          item.courseCode == group.courseCode &&
          item.groupCode == group.code &&
          item.periodId == catalog.period.id,
    );
  }

  Future<void> _submit() async {
    final catalog = _catalog;
    final course = _course;
    final group = _group;
    if (catalog == null || course == null || group == null) {
      AppFeedback.show(
        context,
        message: 'Seleccione un curso y un grupo.',
        type: FeedbackType.warning,
      );
      return;
    }
    if (_isDuplicate(group)) {
      AppFeedback.show(
        context,
        message: 'Ese curso y grupo ya están matriculados.',
        type: FeedbackType.warning,
      );
      return;
    }

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirmar matrícula'),
        content: Text(
          '¿Desea matricular ${course.name} en el grupo ${group.number}?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Confirmar'),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;

    setState(() => _saving = true);
    try {
      await widget.service.create(
        courseCode: course.code,
        groupCode: group.code,
        periodId: catalog.period.id,
      );
      if (!mounted) return;
      AppFeedback.show(
        context,
        message: 'Matrícula registrada correctamente.',
        type: FeedbackType.success,
      );
      await _load();
    } on Exception catch (error) {
      if (mounted) {
        AppFeedback.show(
          context,
          message: error is GatewayException ? error.message : error.toString(),
          type: FeedbackType.error,
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
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
      );
    }

    final catalog = _catalog!;
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
                  'Nueva matrícula',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text('Periodo activo: ${_periodLabel(catalog.period)}'),
                const SizedBox(height: 16),
                DropdownButtonFormField<CourseOption>(
                  isExpanded: true,
                  initialValue: _course,
                  decoration: const InputDecoration(
                    labelText: 'Curso disponible',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.menu_book_outlined),
                  ),
                  items: catalog.courses
                      .map(
                        (course) => DropdownMenuItem(
                          value: course,
                          child: Text(
                            '${course.code} · ${course.name}',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      )
                      .toList(),
                  onChanged: _saving
                      ? null
                      : (value) => setState(() {
                          _course = value;
                          _group = null;
                        }),
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<GroupOption>(
                  isExpanded: true,
                  initialValue: _group,
                  decoration: const InputDecoration(
                    labelText: 'Grupo',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.groups_outlined),
                  ),
                  items: _groups
                      .map(
                        (group) => DropdownMenuItem(
                          value: group,
                          child: Text(
                            'Grupo ${group.number} · ${group.schedule}',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      )
                      .toList(),
                  onChanged: _saving || _course == null
                      ? null
                      : (value) => setState(() => _group = value),
                ),
                const SizedBox(height: 20),
                FilledButton.icon(
                  onPressed: _saving ? null : _submit,
                  icon: const Icon(Icons.check_circle_outline),
                  label: const Text('Confirmar matrícula'),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _title() => Container(
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: const Color(0xFFEAF0FF),
      borderRadius: BorderRadius.circular(12),
      border: const Border(
        left: BorderSide(color: Color(0xFF294A96), width: 4),
      ),
    ),
    child: const Text(
      'Matrícula',
      style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
    ),
  );

  String _periodLabel(AcademicPeriod period) =>
      '${period.startDate.year} · ${period.startDate.month}/${period.startDate.day} - ${period.endDate.month}/${period.endDate.day}';
}
