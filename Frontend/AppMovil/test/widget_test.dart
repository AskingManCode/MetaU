import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:metau_mobile/core/config/app_config.dart';
import 'package:metau_mobile/layout/mobile_layout.dart';
import 'package:metau_mobile/models/auth_session.dart';
import 'package:metau_mobile/main.dart';
import 'package:metau_mobile/screens/login_screen.dart';
import 'package:metau_mobile/services/auth_service.dart';
import 'package:metau_mobile/services/gateway_client.dart';
import 'package:metau_mobile/services/secure_session_store.dart';
import 'package:metau_mobile/widgets/summary_card.dart';

class _MemorySessionStore extends SecureSessionStore {
  _MemorySessionStore(this.session);

  AuthSession? session;

  @override
  Future<AuthSession?> readSession() async => session;

  @override
  Future<AuthSession?> loadRememberedSession() async =>
      session?.rememberMe == true ? session : null;

  @override
  Future<void> save(AuthSession session) async {
    this.session = session;
  }

  @override
  Future<void> clear() async {
    session = null;
  }
}

void main() {
  testWidgets('MOB0 - Carga correctamente la plantilla Meta U', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const MaterialApp(home: MobileLayout()));

    // Verificar el nombre de la aplicación.
    expect(find.text('Meta U'), findsOneWidget);

    // Verificar la pantalla inicial.
    expect(find.text('Bienvenida'), findsOneWidget);

    // Verificar la barra de navegación inferior.
    expect(find.byType(NavigationBar), findsOneWidget);

    // Verificar las cinco opciones requeridas.
    expect(find.byType(NavigationDestination), findsNWidgets(5));
  });

  testWidgets('MOB0 - Permite navegar entre pantallas', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const MaterialApp(home: MobileLayout()));

    // Seleccionar la pestaña Mis cursos.
    await tester.tap(
      find.descendant(
        of: find.byType(NavigationBar),
        matching: find.text('Mis cursos'),
      ),
    );

    await tester.pumpAndSettle();

    // Verificar que se muestra la pantalla seleccionada.
    expect(find.text('Pantalla pendiente de integración.'), findsOneWidget);
  });

  testWidgets('MOB1 - Abre el login cuando no hay sesión recordada', (
    WidgetTester tester,
  ) async {
    final sessionStore = _MemorySessionStore(null);
    final config = const AppConfig(
      gatewayBaseUrl: 'https://example.test/ApiGateway_MetaU',
    );
    final gatewayClient = GatewayClient(
      config: config,
      sessionStore: sessionStore,
    );
    final authService = AuthService(
      gatewayClient: gatewayClient,
      sessionStore: sessionStore,
    );

    await tester.pumpWidget(
      MetaUApp(
        config: config,
        authService: authService,
        gatewayClient: gatewayClient,
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Inicio de sesión'), findsOneWidget);
  });

  testWidgets('Login - Rechaza un correo de otro dominio', (
    WidgetTester tester,
  ) async {
    final sessionStore = SecureSessionStore();
    final gatewayClient = GatewayClient(
      config: const AppConfig(gatewayBaseUrl: 'https://example.test/gateway'),
      sessionStore: sessionStore,
    );
    final authService = AuthService(
      gatewayClient: gatewayClient,
      sessionStore: sessionStore,
    );

    await tester.pumpWidget(
      MaterialApp(
        home: LoginScreen(
          authService: authService,
          emailDomain: 'cuc.cr',
          onAuthenticated: (_) {},
        ),
      ),
    );

    await tester.enterText(
      find.byType(TextFormField).at(0),
      'student@example.com',
    );
    await tester.enterText(find.byType(TextFormField).at(1), 'password');
    await tester.tap(find.text('Iniciar sesión'));
    await tester.pumpAndSettle();

    expect(
      find.text('Use un correo válido del dominio cuc.cr.'),
      findsOneWidget,
    );
  });

  testWidgets('Login - Muestra el mensaje exacto para credenciales inválidas', (
    WidgetTester tester,
  ) async {
    final sessionStore = SecureSessionStore();
    final gatewayClient = GatewayClient(
      config: const AppConfig(
        gatewayBaseUrl: 'https://example.test/ApiGateway_MetaU',
      ),
      sessionStore: sessionStore,
      client: MockClient((request) async {
        expect(request.method, 'POST');
        expect(request.url.path, '/ApiGateway_MetaU/gateway/auth/login');
        expect(request.headers['usuario'], 'student@cuc.cr');
        expect(request.headers['contrasena'], 'wrong-password');
        return http.Response('{}', 401);
      }),
    );
    final authService = AuthService(
      gatewayClient: gatewayClient,
      sessionStore: sessionStore,
    );

    await tester.pumpWidget(
      MaterialApp(
        home: LoginScreen(
          authService: authService,
          emailDomain: 'cuc.cr',
          onAuthenticated: (_) {},
        ),
      ),
    );
    await tester.enterText(find.byType(TextFormField).at(0), 'student@cuc.cr');
    await tester.enterText(find.byType(TextFormField).at(1), 'wrong-password');
    await tester.tap(find.text('Iniciar sesión'));
    await tester.pumpAndSettle();

    expect(find.text('Usuario y/o contraseña incorrectos'), findsOneWidget);
  });

  test('Gateway config appends routes to the configured base path', () {
    const config = AppConfig(
      gatewayBaseUrl: 'https://example.test/ApiGateway_MetaU',
    );

    expect(
      config
          .gatewayUri(
            'gateway/enrollment/matricula',
            queryParameters: {'identificacion': '123456789'},
          )
          .toString(),
      'https://example.test/ApiGateway_MetaU/gateway/enrollment/matricula?identificacion=123456789',
    );
  });

  test(
    'Gateway client refreshes expired credentials and retries once',
    () async {
      final now = DateTime.now();
      final store = _MemorySessionStore(
        AuthSession(
          accessToken: 'expired-access-token',
          expiresIn: now.subtract(const Duration(minutes: 1)).toIso8601String(),
          refreshToken: 'old-refresh-token',
          userId: '00000000-0000-0000-0000-000000000001',
          email: 'student@cuc.cr',
          rememberMe: true,
        ),
      );
      final client = GatewayClient(
        config: const AppConfig(gatewayBaseUrl: 'https://example.test/base'),
        sessionStore: store,
        client: MockClient((request) async {
          if (request.url.path.endsWith('/gateway/auth/refresh')) {
            expect(request.headers['authorization'], isNull);
            expect(jsonDecode(request.body), {
              'refreshToken': 'old-refresh-token',
            });
            return http.Response(
              jsonEncode({
                'access_token': 'new-access-token',
                'expires_in': now
                    .add(const Duration(minutes: 5))
                    .toIso8601String(),
                'refresh_token': 'new-refresh-token',
              }),
              201,
            );
          }

          expect(request.url.path, '/base/gateway/academic/periodo');
          expect(request.headers['authorization'], 'Bearer new-access-token');
          expect(
            request.headers['x-usuario-id'],
            '00000000-0000-0000-0000-000000000001',
          );
          return http.Response('[]', 200);
        }),
      );

      final response = await client.getAuthenticated(
        'gateway/academic/periodo',
      );

      expect(response.statusCode, 200);
      expect(store.session?.refreshToken, 'new-refresh-token');
    },
  );

  testWidgets('Resumen - Presenta el estado vacío de una tarjeta', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: SummaryCard(
            title: 'Cursos actuales',
            icon: Icons.menu_book_outlined,
            value: Future.value(0),
            emptyMessage: 'No hay cursos actuales.',
            onRetry: () {},
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('No hay cursos actuales.'), findsOneWidget);
  });
}
