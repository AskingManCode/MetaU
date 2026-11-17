import 'package:flutter/material.dart';

class MetaULogo extends StatelessWidget {
  final bool showSubtitle;
  final bool compact;

  const MetaULogo({super.key, this.showSubtitle = true, this.compact = false});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: compact ? 42 : 48,
          height: compact ? 42 : 48,
          decoration: const BoxDecoration(
            color: Colors.white,
            shape: BoxShape.circle,
          ),
          clipBehavior: Clip.antiAlias,
          padding: const EdgeInsets.all(5),
          child: Image.asset('assets/images/logo.png', fit: BoxFit.contain),
        ),

        const SizedBox(width: 10),

        Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Meta U',
              style: TextStyle(
                color: Colors.white,
                fontSize: compact ? 16 : 18,
                fontWeight: FontWeight.bold,
              ),
            ),

            if (showSubtitle)
              Text(
                'Estudiante',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: compact ? 11 : 12,
                ),
              ),
          ],
        ),
      ],
    );
  }
}
