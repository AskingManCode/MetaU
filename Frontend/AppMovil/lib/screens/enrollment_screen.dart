import 'package:flutter/material.dart';

import '../services/prematricula_service.dart';
import 'prematricula_screen.dart';

class EnrollmentScreen extends StatelessWidget {
  const EnrollmentScreen({super.key, this.service});

  final PrematriculaService? service;

  @override
  Widget build(BuildContext context) {
    final currentService = service;
    if (currentService == null) {
      return const Center(child: Text('No se pudo preparar la sesión móvil.'));
    }

    return PrematriculaScreen(service: currentService);
  }
}
