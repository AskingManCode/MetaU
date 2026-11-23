class AppConfig {
  const AppConfig({
    this.gatewayBaseUrl = const String.fromEnvironment('API_BASE_URL'),
    this.studentEmailDomain = const String.fromEnvironment(
      'STUDENT_EMAIL_DOMAIN',
      defaultValue: 'cuc.cr',
    ),
  });

  final String gatewayBaseUrl;
  final String studentEmailDomain;

  Uri get gatewayBaseUri {
    final uri = Uri.tryParse(gatewayBaseUrl);
    if (uri == null ||
        uri.scheme != 'https' ||
        uri.host.isEmpty ||
        uri.userInfo.isNotEmpty ||
        uri.hasQuery ||
        uri.hasFragment) {
      throw StateError(
        'Configure API_BASE_URL con una URL base HTTPS del Gateway.',
      );
    }

    return uri;
  }

  Uri gatewayUri(String route, {Map<String, String>? queryParameters}) {
    final base = gatewayBaseUri;
    final routeSegments = route
        .split('/')
        .where((segment) => segment.isNotEmpty)
        .toList();
    final baseSegments = base.pathSegments
        .where((segment) => segment.isNotEmpty)
        .toList();

    return base.replace(
      pathSegments: [...baseSegments, ...routeSegments],
      queryParameters: queryParameters == null || queryParameters.isEmpty
          ? null
          : queryParameters,
    );
  }
}
