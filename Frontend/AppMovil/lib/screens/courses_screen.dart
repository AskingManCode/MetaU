import 'package:flutter/material.dart';

import 'placeholder_screen.dart';

class CoursesScreen extends StatelessWidget {
  const CoursesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const PlaceholderScreen(
      title: 'Mis cursos',
      icon: Icons.menu_book_outlined,
    );
  }
}
