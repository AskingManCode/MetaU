import 'package:flutter/material.dart';

import '../core/theme/app_theme.dart';
import '../core/widgets/app_feedback.dart';
import '../core/widgets/meta_u_logo.dart';
import '../models/expediente_records.dart';
import '../services/expediente_service.dart';
import '../widgets/page_header.dart';
import 'expediente_form_screen.dart';

class ExpedienteScreen extends StatefulWidget {
  const ExpedienteScreen({super.key, required this.service});

  final ExpedienteService service;

  @override
  State<ExpedienteScreen> createState() => _ExpedienteScreenState();
}

class _ExpedienteScreenState extends State<ExpedienteScreen> {
  ExpedienteRecord? _record;
  String? _error;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (_record == null) {
      setState(() {
        _isLoading = true;
        _error = null;
      });
    }

    try {
      final result = await widget.service.loadExpediente();
      if (!mounted) {
        return;
      }
      setState(() {
        _record = result.record;
        _error = null;
        _isLoading = false;
      });
      final warning = result.auditWarning;
      if (warning != null) {
        AppFeedback.show(context, message: warning, type: FeedbackType.warning);
      }
    } on Exception catch (error) {
      _showLoadError(ExpedienteService.describeError(error));
    }
  }

  void _showLoadError(String message) {
    if (!mounted) {
      return;
    }
    setState(() {
      _isLoading = false;
      if (_record == null) {
        _error = message;
      }
    });
    if (_record != null) {
      AppFeedback.show(context, message: message, type: FeedbackType.error);
    }
  }

  Future<void> _edit() async {
    final record = _record;
    if (record == null) {
      return;
    }

    final result = await Navigator.of(context).push<ExpedienteUpdateResult>(
      MaterialPageRoute(
        builder: (_) =>
            ExpedienteFormScreen(service: widget.service, record: record),
      ),
    );
    if (!mounted || result == null) {
      return;
    }

    setState(() {
      _record = result.record;
    });
    final warning = result.auditWarning;
    AppFeedback.show(
      context,
      message: warning == null
          ? 'Expediente actualizado correctamente'
          : 'Expediente actualizado pero $warning',
      type: warning == null ? FeedbackType.success : FeedbackType.warning,
    );
  }

  @override
  Widget build(BuildContext context) {
    final record = _record;

    return Scaffold(
      appBar: AppBar(
        toolbarHeight: 72,
        titleSpacing: 0,
        title: const MetaULogo(),
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          children: [
            const PageHeader(title: 'Mi expediente'),
            const SizedBox(height: 16),
            if (_isLoading)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 32),
                child: Center(child: CircularProgressIndicator()),
              )
            else if (record == null)
              _ErrorCard(
                message: _error ?? 'No se pudo cargar el expediente',
                onRetry: _load,
              )
            else
              ..._buildContent(record),
          ],
        ),
      ),
    );
  }

  List<Widget> _buildContent(ExpedienteRecord record) {
    return [
      const SectionTitle('Datos personales'),
      const SizedBox(height: 8),
      Card(
        color: Colors.white,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _InfoRow(label: 'Identificacion', value: record.identification),
              if (record.identificationType.isNotEmpty)
                _InfoRow(
                  label: 'Tipo de identificacion',
                  value: record.identificationType,
                ),
              _InfoRow(label: 'Nombre completo', value: record.fullName),
              _InfoRow(label: 'Correo institucional', value: record.email),
              _InfoRow(
                label: 'Fecha de nacimiento',
                value: _formatDate(record.birthDate),
              ),
              const SizedBox(height: 4),
              const Text(
                'Estos datos no se pueden modificar desde la aplicacion',
                style: TextStyle(fontSize: 12, color: Colors.black54),
              ),
            ],
          ),
        ),
      ),
      const SizedBox(height: 16),
      const SectionTitle('Telefonos'),
      const SizedBox(height: 8),
      Card(
        color: Colors.white,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (record.phones.isEmpty)
                const Text('Sin telefonos registrados')
              else
                for (final phone in record.phones)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.phone_outlined,
                          size: 20,
                          color: AppTheme.accent,
                        ),
                        const SizedBox(width: 8),
                        Text(phone, style: const TextStyle(fontSize: 16)),
                      ],
                    ),
                  ),
            ],
          ),
        ),
      ),
      const SizedBox(height: 16),
      const SectionTitle('Direccion'),
      const SizedBox(height: 8),
      Card(
        color: Colors.white,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _InfoRow(label: 'Provincia', value: record.province),
              _InfoRow(label: 'Canton', value: record.canton),
              _InfoRow(label: 'Distrito', value: record.district),
              _InfoRow(label: 'Otras senas', value: record.otherAddress),
            ],
          ),
        ),
      ),
      const SizedBox(height: 16),
      FilledButton.icon(
        onPressed: _edit,
        icon: const Icon(Icons.edit_outlined),
        label: const Text('Editar telefonos y direccion'),
      ),
    ];
  }

  String _formatDate(String value) {
    final date = DateTime.tryParse(value);
    if (date == null) {
      return value;
    }
    String two(int number) => number.toString().padLeft(2, '0');
    return '${two(date.day)}/${two(date.month)}/${date.year}';
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(fontSize: 12, color: Colors.black54),
          ),
          const SizedBox(height: 2),
          Text(
            value.isEmpty ? '-' : value,
            style: const TextStyle(fontSize: 16),
          ),
        ],
      ),
    );
  }
}

class _ErrorCard extends StatelessWidget {
  const _ErrorCard({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Card(
      color: Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Icon(
              Icons.cloud_off_outlined,
              size: 36,
              color: AppTheme.accent,
            ),
            const SizedBox(height: 12),
            Text(message),
            const SizedBox(height: 12),
            FilledButton(onPressed: onRetry, child: const Text('Reintentar')),
          ],
        ),
      ),
    );
  }
}
