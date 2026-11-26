import 'package:flutter/material.dart';

import '../services/prematricula_service.dart';
import '../services/matricula_service.dart';
import 'prematricula_screen.dart';
import 'matricula_screen.dart';

class EnrollmentScreen extends StatefulWidget {
  const EnrollmentScreen({
    super.key,
    this.initialTab = 0,
    this.prematriculaService,
    this.matriculaService,
  });

  final PrematriculaService? prematriculaService;
  final MatriculaService? matriculaService;
  final int initialTab;

  @override
  State<EnrollmentScreen> createState() => _EnrollmentScreenState();
}

class _EnrollmentScreenState extends State<EnrollmentScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(
      length: 2,
      vsync: this,
      initialIndex: widget.initialTab,
    );
  }

  @override
  void didUpdateWidget(covariant EnrollmentScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.initialTab != widget.initialTab) {
      _tabController.index = widget.initialTab;
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final preService = widget.prematriculaService;
    final enrollmentService = widget.matriculaService;
    if (preService == null || enrollmentService == null) {
      return const Center(child: Text('No se pudo preparar la sesión móvil.'));
    }

    return Column(
      children: [
        TabBar(
          controller: _tabController,
          tabs: [
            Tab(text: 'PreMatrícula'),
            Tab(text: 'Matrícula'),
          ],
        ),
        Expanded(
          child: TabBarView(
            controller: _tabController,
            children: [
              PrematriculaScreen(service: preService),
              MatriculaScreen(service: enrollmentService),
            ],
          ),
        ),
      ],
    );
  }
}
