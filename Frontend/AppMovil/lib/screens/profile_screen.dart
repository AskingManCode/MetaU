import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../core/theme/app_theme.dart';
import '../core/widgets/app_confirm_dialog.dart';
import '../core/widgets/app_feedback.dart';
import '../services/expediente_service.dart';
import 'expediente_screen.dart';
import 'placeholder_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key, this.onLogout, this.expedienteService});

  final Future<void> Function()? onLogout;
  final ExpedienteService? expedienteService;

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

  void _openExpediente() {
    final service = widget.expedienteService;
    if (service == null) {
      return;
    }
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => ExpedienteScreen(service: service)),
    );
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
        if (widget.expedienteService != null)
          Card(
            color: Colors.white,
            child: ListTile(
              leading: const Icon(Icons.badge_outlined, color: AppTheme.accent),
              title: const Text(
                'Mi expediente',
                style: TextStyle(fontWeight: FontWeight.w600),
              ),
              subtitle: const Text(
                'Consulte sus datos y actualice telefonos y direccion',
              ),
              trailing: const Icon(Icons.chevron_right),
              onTap: _openExpediente,
            ),
          )
        else
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
