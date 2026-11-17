import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

enum FeedbackType { success, error, warning, info }

class AppFeedback {
  static void show(
    BuildContext context, {
    required String message,
    FeedbackType type = FeedbackType.info,
  }) {
    late Color color;
    late IconData icon;

    switch (type) {
      case FeedbackType.success:
        color = Colors.green.shade700;
        icon = Icons.check_circle_outline;
        break;

      case FeedbackType.error:
        color = Colors.red.shade700;
        icon = Icons.error_outline;
        break;

      case FeedbackType.warning:
        color = Colors.orange.shade800;
        icon = Icons.warning_amber_outlined;
        break;

      case FeedbackType.info:
        color = AppTheme.accent;
        icon = Icons.info_outline;
        break;
    }

    final messenger = ScaffoldMessenger.of(context);

    messenger.hideCurrentSnackBar();

    messenger.showSnackBar(
      SnackBar(
        behavior: SnackBarBehavior.floating,
        backgroundColor: color,
        duration: const Duration(seconds: 3),
        content: Row(
          children: [
            Icon(icon, color: Colors.white),
            const SizedBox(width: 12),
            Expanded(
              child: Text(message, style: const TextStyle(color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }
}
