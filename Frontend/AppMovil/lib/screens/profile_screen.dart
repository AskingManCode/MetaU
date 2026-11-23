import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../core/theme/app_theme.dart';
import '../core/widgets/app_confirm_dialog.dart';
import '../core/widgets/app_feedback.dart';
import 'placeholder_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key, this.onLogout});

  final Future<void> Function()? onLogout;

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _isLoggingOut = false;

  Future<void> _confirmLogout() async {
    final confirmed = await AppConfirmDialog.show(
      context,
      title: 'Cerrar sesión',
      message: '¿Desea cerrar su sesión?',
      confirmText: 'Cerrar sesión',
    );
    if (!confirmed || widget.onLogout == null) {
      return;
    }

    setState(() {
      _isLoggingOut = true;
    });
    try {
      await widget.onLogout!();
    } on PlatformException {
      if (mounted) {
        AppFeedback.show(
          context,
          message: 'No se pudieron eliminar las credenciales seguras.',
          type: FeedbackType.error,
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoggingOut = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final onLogout = widget.onLogout;
    if (onLogout == null) {
      return const PlaceholderScreen(
        title: 'Perfil',
        icon: Icons.person_outline,
      );
    }

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
            'Perfil',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w600,
              color: AppTheme.primary,
            ),
          ),
        ),
        const SizedBox(height: 16),
        const Text('Pantalla pendiente de integración.'),
        const SizedBox(height: 16),
        OutlinedButton.icon(
          onPressed: _isLoggingOut ? null : _confirmLogout,
          icon: const Icon(Icons.logout),
          label: const Text('Cerrar sesión'),
        ),
      ],
    );
  }
}
