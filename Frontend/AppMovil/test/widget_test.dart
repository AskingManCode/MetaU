
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:metau_mobile/main.dart';

void main() {
  testWidgets('MOB0 - Carga correctamente la plantilla Meta U',
      (WidgetTester tester) async {

    await tester.pumpWidget(const MetaUApp());

    // Verificar el nombre de la aplicación.
    expect(find.text('Meta U'), findsOneWidget);

    // Verificar la pantalla inicial.
    expect(find.text('Bienvenida'), findsOneWidget);

    // Verificar la barra de navegación inferior.
    expect(find.byType(NavigationBar), findsOneWidget);

    // Verificar las cinco opciones requeridas.
    expect(
      find.byType(NavigationDestination),
      findsNWidgets(5),
    );
  });

  testWidgets('MOB0 - Permite navegar entre pantallas',
      (WidgetTester tester) async {

    await tester.pumpWidget(const MetaUApp());

    // Seleccionar la pestaña Mis cursos.
    await tester.tap(find.text('Mis cursos'));

    await tester.pumpAndSettle();

    // Verificar que se muestra la pantalla seleccionada.
    expect(
      find.text('Pantalla pendiente de integración.'),
      findsOneWidget,
    );
  });
}
