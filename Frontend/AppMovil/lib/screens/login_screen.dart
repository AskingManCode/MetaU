import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../core/theme/app_theme.dart';
import '../core/widgets/app_feedback.dart';
import '../core/widgets/meta_u_logo.dart';
import '../services/auth_service.dart';
import '../services/gateway_client.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({
    super.key,
    required this.authService,
    required this.emailDomain,
    required this.onAuthenticated,
    this.initialFeedbackMessage,
  });

  final AuthService authService;
  final String emailDomain;
  final ValueChanged<LoginResult> onAuthenticated;
  final String? initialFeedbackMessage;

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _rememberMe = false;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    final message = widget.initialFeedbackMessage;
    if (message != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          AppFeedback.show(
            context,
            message: message,
            type: FeedbackType.info,
          );
        }
      });
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  String? _validateEmail(String? value) {
    final email = value?.trim() ?? '';
    if (email.isEmpty) {
      return 'Ingrese su correo electrónico.';
    }

    final separator = email.lastIndexOf('@');
    if (separator <= 0 ||
        separator != email.indexOf('@') ||
        separator == email.length - 1) {
      return 'Ingrese un correo electrónico válido.';
    }

    final localPart = email.substring(0, separator);
    final domain = email.substring(separator + 1);
    final validLocalPart = RegExp(
      r"^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$",
    ).hasMatch(localPart);
    if (!validLocalPart ||
        localPart.startsWith('.') ||
        localPart.endsWith('.') ||
        localPart.contains('..') ||
        domain.toLowerCase() != widget.emailDomain.toLowerCase()) {
      return 'Use un correo válido del dominio ${widget.emailDomain}.';
    }

    return null;
  }

  String? _validatePassword(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Ingrese su contraseña.';
    }
    return null;
  }

  Future<void> _submit() async {
    if (_isSubmitting || !_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      final result = await widget.authService.login(
        email: _emailController.text.trim(),
        password: _passwordController.text,
        rememberMe: _rememberMe,
      );
      if (mounted) {
        widget.onAuthenticated(result);
      }
    } on InvalidCredentialsException {
      if (mounted) {
        AppFeedback.show(
          context,
          message: 'Usuario y/o contraseña incorrectos',
          type: FeedbackType.error,
        );
      }
    } on GatewayException catch (error) {
      if (mounted) {
        AppFeedback.show(
          context,
          message: error.message,
          type: FeedbackType.error,
        );
      }
    } on FormatException catch (error) {
      if (mounted) {
        AppFeedback.show(
          context,
          message: 'La respuesta del servicio no es válida: ${error.message}',
          type: FeedbackType.error,
        );
      }
    } on StateError catch (error) {
      if (mounted) {
        AppFeedback.show(
          context,
          message: error.message.toString(),
          type: FeedbackType.error,
        );
      }
    } on PlatformException {
      if (mounted) {
        AppFeedback.show(
          context,
          message: 'No se pudo acceder al almacenamiento seguro de la sesión.',
          type: FeedbackType.error,
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        toolbarHeight: 72,
        title: const MetaULogo(),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: Card(
              color: Colors.white,
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Text(
                        'Inicio de sesión',
                        style: TextStyle(
                          color: AppTheme.primary,
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text('Ingrese sus credenciales de estudiante.'),
                      const SizedBox(height: 24),
                      TextFormField(
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        textInputAction: TextInputAction.next,
                        autofillHints: const [AutofillHints.username],
                        decoration: const InputDecoration(
                          labelText: 'Correo electrónico',
                          prefixIcon: Icon(Icons.email_outlined),
                          border: OutlineInputBorder(),
                        ),
                        validator: _validateEmail,
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _passwordController,
                        obscureText: true,
                        textInputAction: TextInputAction.done,
                        autofillHints: const [AutofillHints.password],
                        onFieldSubmitted: (_) => _submit(),
                        decoration: const InputDecoration(
                          labelText: 'Contraseña',
                          prefixIcon: Icon(Icons.lock_outline),
                          border: OutlineInputBorder(),
                        ),
                        validator: _validatePassword,
                      ),
                      CheckboxListTile(
                        contentPadding: EdgeInsets.zero,
                        value: _rememberMe,
                        title: const Text('Recordarme'),
                        controlAffinity: ListTileControlAffinity.leading,
                        onChanged: _isSubmitting
                            ? null
                            : (value) {
                                setState(() {
                                  _rememberMe = value ?? false;
                                });
                              },
                      ),
                      const SizedBox(height: 8),
                      FilledButton(
                        onPressed: _isSubmitting ? null : _submit,
                        child: _isSubmitting
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                ),
                              )
                            : const Text('Iniciar sesión'),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
