class AddressOption {
  const AddressOption({required this.value, required this.label});

  final String value;
  final String label;

  factory AddressOption.fromJson(dynamic json) {
    if (json is Map<String, dynamic>) {
      final label = _firstText(json, ['nombre', 'descripcion', 'name']);
      final id = _firstText(json, [
        'id',
        'codigo',
        'provinciaID',
        'cantonID',
        'distritoID',
      ]);
      if (label != null) {
        return AddressOption(value: id ?? label, label: label);
      }
    } else if (json is String && json.trim().isNotEmpty) {
      return AddressOption(value: json.trim(), label: json.trim());
    }
    throw const FormatException(
      'El Gateway devolvio una opcion de direccion invalida',
    );
  }
}

class ExpedienteRecord {
  const ExpedienteRecord({
    required this.identification,
    required this.identificationType,
    required this.email,
    required this.fullName,
    required this.birthDate,
    required this.province,
    required this.canton,
    required this.district,
    required this.otherAddress,
    required this.phones,
    required this.raw,
  });

  final String identification;
  final String identificationType;
  final String email;
  final String fullName;
  final String birthDate;
  final String province;
  final String canton;
  final String district;
  final String otherAddress;
  final List<String> phones;
  final Map<String, dynamic> raw;

  factory ExpedienteRecord.fromJson(Map<String, dynamic> json) {
    final rawAddress = json['direccion'];
    final address = rawAddress is Map<String, dynamic> ? rawAddress : json;

    final identification = _firstText(json, [
      'identificacion',
      'numeroIdentificacion',
    ]);
    if (identification == null) {
      throw const FormatException(
        'El expediente no contiene la identificacion',
      );
    }

    return ExpedienteRecord(
      identification: identification,
      identificationType:
          _firstText(json, [
            'tipoIdentificacion',
            'tipoIdentificacionID',
            'tipo',
          ]) ??
          '',
      email: _firstText(json, ['email', 'correo']) ?? '',
      fullName: _firstText(json, ['nombreCompleto', 'nombre']) ?? '',
      birthDate: _firstText(json, ['fechaNacimiento']) ?? '',
      province: _firstText(address, ['provincia']) ?? '',
      canton: _firstText(address, ['canton']) ?? '',
      district: _firstText(address, ['distrito']) ?? '',
      otherAddress: _firstText(address, ['otrasSenas', 'senas']) ?? '',
      phones: _parsePhones(json['telefonos'] ?? json['telefono']),
      raw: json,
    );
  }

  ExpedienteRecord copyWith({
    List<String>? phones,
    String? province,
    String? canton,
    String? district,
    String? otherAddress,
  }) {
    return ExpedienteRecord(
      identification: identification,
      identificationType: identificationType,
      email: email,
      fullName: fullName,
      birthDate: birthDate,
      province: province ?? this.province,
      canton: canton ?? this.canton,
      district: district ?? this.district,
      otherAddress: otherAddress ?? this.otherAddress,
      phones: phones ?? this.phones,
      raw: raw,
    );
  }

  Map<String, dynamic> toJson() {
    final rawAddress = raw['direccion'];
    if (rawAddress is Map<String, dynamic>) {
      return {
        ...raw,
        'direccion': {
          ...rawAddress,
          'provincia': province,
          'canton': canton,
          'distrito': district,
          'otrasSenas': otherAddress,
        },
        'telefonos': phones,
      };
    }

    return {
      ...raw,
      'provincia': province,
      'canton': canton,
      'distrito': district,
      'otrasSenas': otherAddress,
      'telefonos': phones,
    };
  }
}

List<String> _parsePhones(dynamic value) {
  final phones = <String>[];

  if (value is List<dynamic>) {
    for (final item in value) {
      final text = item is Map<String, dynamic>
          ? _firstText(item, ['telefono', 'numero', 'numeroTelefono'])
          : _textOf(item);
      if (text != null) {
        phones.add(text);
      }
    }
  } else if (value is String) {
    for (final part in value.split(RegExp(r'[,;]'))) {
      final text = part.trim();
      if (text.isNotEmpty) {
        phones.add(text);
      }
    }
  }

  return phones;
}

String? _firstText(Map<String, dynamic> json, List<String> keys) {
  for (final key in keys) {
    final text = _textOf(json[key]);
    if (text != null) {
      return text;
    }
  }
  return null;
}

String? _textOf(dynamic value) {
  if (value is String) {
    final text = value.trim();
    return text.isEmpty ? null : text;
  }
  if (value is num) {
    return value.toString();
  }
  if (value is Map<String, dynamic>) {
    return _firstText(value, ['nombre', 'descripcion', 'name']);
  }
  return null;
}
