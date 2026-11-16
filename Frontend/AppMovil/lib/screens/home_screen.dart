import 'package:flutter/material.dart';

import '../core/theme/app_theme.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Encabezado de bienvenida
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

        // Contenido inicial de la aplicación
        Card(
          color: Colors.white,
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(
                  Icons.home_outlined,
                  size: 36,
                  color: AppTheme.accent,
                ),

                const SizedBox(height: 12),

                const Text(
                  'Bienvenido a Meta U',
                  style: TextStyle(
                    fontSize: 21,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.accent,
                  ),
                ),

                const SizedBox(height: 8),

                const Text('Plataforma móvil estudiantil.'),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
