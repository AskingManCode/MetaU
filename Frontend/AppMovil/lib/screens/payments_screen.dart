import 'package:flutter/material.dart';

import 'placeholder_screen.dart';

class PaymentsScreen extends StatelessWidget {
  const PaymentsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const PlaceholderScreen(
      title: 'Pagos',
      icon: Icons.payments_outlined,
    );
  }
}
