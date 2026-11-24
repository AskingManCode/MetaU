import 'package:flutter/material.dart';

import '../core/widgets/meta_u_logo.dart';
import '../screens/home_screen.dart';
import '../screens/courses_screen.dart';
import '../screens/enrollment_screen.dart';
import '../screens/payments_screen.dart';
import '../screens/profile_screen.dart';
import '../services/dashboard_service.dart';
import '../services/expediente_service.dart';

class MobileLayout extends StatefulWidget {
  const MobileLayout({
    super.key,
    this.dashboardService,
    this.expedienteService,
    this.onLogout,
  });

  final DashboardService? dashboardService;
  final ExpedienteService? expedienteService;
  final Future<void> Function()? onLogout;

  @override
  State<MobileLayout> createState() => _MobileLayoutState();
}

class _MobileLayoutState extends State<MobileLayout> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    final screens = [
      HomeScreen(
        dashboardService: widget.dashboardService,
        onNavigate: _selectTab,
      ),
      const CoursesScreen(),
      const EnrollmentScreen(),
      const PaymentsScreen(),
      ProfileScreen(
        onLogout: widget.onLogout,
        expedienteService: widget.expedienteService,
      ),
    ];

    return Scaffold(
      appBar: AppBar(
        toolbarHeight: 72,
        titleSpacing: 16,
        title: const MetaULogo(),
      ),
      body: IndexedStack(index: _selectedIndex, children: screens),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        height: 76,
        onDestinationSelected: _selectTab,
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Inicio',
          ),
          NavigationDestination(
            icon: Icon(Icons.menu_book_outlined),
            selectedIcon: Icon(Icons.menu_book),
            label: 'Mis cursos',
          ),
          NavigationDestination(
            icon: Icon(Icons.assignment_outlined),
            selectedIcon: Icon(Icons.assignment),
            label: 'Matrícula',
          ),
          NavigationDestination(
            icon: Icon(Icons.payments_outlined),
            selectedIcon: Icon(Icons.payments),
            label: 'Pagos',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Perfil',
          ),
        ],
      ),
    );
  }

  void _selectTab(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }
}
