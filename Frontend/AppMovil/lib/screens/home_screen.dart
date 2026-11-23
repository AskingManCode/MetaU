import 'package:flutter/material.dart';

import '../core/theme/app_theme.dart';
import '../models/dashboard_records.dart';
import '../services/dashboard_service.dart';
import '../widgets/summary_card.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({
    super.key,
    this.dashboardService,
    this.onNavigate,
  });

  final DashboardService? dashboardService;
  final ValueChanged<int>? onNavigate;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  DashboardSummary? _summary;

  @override
  void initState() {
    super.initState();
    _loadSummary();
  }

  @override
  void didUpdateWidget(covariant HomeScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.dashboardService != widget.dashboardService) {
      _loadSummary();
    }
  }

  void _loadSummary() {
    _summary = widget.dashboardService?.loadSummary();
  }

  void _retry() {
    setState(_loadSummary);
  }

  @override
  Widget build(BuildContext context) {
    final summary = _summary;
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: const Border(
              left: BorderSide(color: AppTheme.primary, width: 4),
            ),
          ),
          child: const Text(
            'Bienvenida',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w600,
              color: AppTheme.primary,
            ),
          ),
        ),
        const SizedBox(height: 16),
        const Text(
          'Accesos rápidos',
          style: TextStyle(
            color: AppTheme.primary,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            _QuickAccessButton(
              label: 'Prematrícula',
              icon: Icons.assignment_add,
              onPressed: () => widget.onNavigate?.call(2),
            ),
            _QuickAccessButton(
              label: 'Matrícula',
              icon: Icons.assignment_outlined,
              onPressed: () => widget.onNavigate?.call(2),
            ),
            _QuickAccessButton(
              label: 'Mis cursos',
              icon: Icons.menu_book_outlined,
              onPressed: () => widget.onNavigate?.call(1),
            ),
            _QuickAccessButton(
              label: 'Pagos',
              icon: Icons.payments_outlined,
              onPressed: () => widget.onNavigate?.call(3),
            ),
          ],
        ),
        const SizedBox(height: 20),
        const Text(
          'Resumen de estado',
          style: TextStyle(
            color: AppTheme.primary,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        if (summary == null)
          const Card(
            color: Colors.white,
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Text('Inicie sesión para consultar su resumen.'),
            ),
          )
        else ...[
          SummaryCard(
            title: 'Prematrículas activas',
            icon: Icons.assignment_turned_in_outlined,
            value: summary.activePrematriculas,
            emptyMessage: 'No hay prematrículas activas.',
            onRetry: _retry,
          ),
          SummaryCard(
            title: 'Matrícula del período',
            icon: Icons.event_available_outlined,
            value: summary.currentMatriculas,
            emptyMessage: 'Sin matrícula en el período actual.',
            onRetry: _retry,
          ),
          SummaryCard(
            title: 'Cursos actuales',
            icon: Icons.menu_book_outlined,
            value: summary.currentCourses,
            emptyMessage: 'No hay cursos en el período actual.',
            onRetry: _retry,
          ),
          SummaryCard(
            title: 'Facturas/Pagos pendientes',
            icon: Icons.receipt_long_outlined,
            value: summary.pendingInvoices,
            emptyMessage: 'No hay facturas pendientes.',
            onRetry: _retry,
          ),
        ],
      ],
    );
  }
}

class _QuickAccessButton extends StatelessWidget {
  const _QuickAccessButton({
    required this.label,
    required this.icon,
    required this.onPressed,
  });

  final String label;
  final IconData icon;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return OutlinedButton.icon(
      onPressed: onPressed,
      icon: Icon(icon),
      label: Text(label),
    );
  }
}
