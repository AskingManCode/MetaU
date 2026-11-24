import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../core/widgets/app_confirm_dialog.dart';
import '../core/widgets/app_feedback.dart';
import '../core/widgets/meta_u_logo.dart';
import '../models/expediente_records.dart';
import '../services/expediente_service.dart';
import '../widgets/page_header.dart';

class ExpedienteFormScreen extends StatefulWidget {
  const ExpedienteFormScreen({
    super.key,
    required this.service,
    required this.record,
  });

  final ExpedienteService service;
  final ExpedienteRecord record;

  @override
  State<ExpedienteFormScreen> createState() => _ExpedienteFormScreenState();
}

class _ExpedienteFormScreenState extends State<ExpedienteFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final List<TextEditingController> _phoneControllers = [];
  late final TextEditingController _otherAddressController;

  List<AddressOption> _provincias = [];
  List<AddressOption> _cantones = [];
  List<AddressOption> _distritos = [];
  AddressOption? _provincia;
  AddressOption? _canton;
  AddressOption? _distrito;

  bool _loadingProvincias = true;
  bool _loadingCantones = false;
  bool _loadingDistritos = false;
  String? _addressError;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    final phones = widget.record.phones;
    for (final phone in phones.isEmpty ? [''] : phones) {
      _phoneControllers.add(TextEditingController(text: phone));
    }
    _otherAddressController = TextEditingController(
      text: widget.record.otherAddress,
    );
    _loadInitialAddress();
  }

  @override
  void dispose() {
    for (final controller in _phoneControllers) {
      controller.dispose();
    }
    _otherAddressController.dispose();
    super.dispose();
  }

  AddressOption? _match(List<AddressOption> options, String current) {
    final target = current.trim().toLowerCase();
    if (target.isEmpty) {
      return null;
    }
    for (final option in options) {
      if (option.value.toLowerCase() == target ||
          option.label.toLowerCase() == target) {
        return option;
      }
    }
    return null;
  }

  bool _sameAs(AddressOption? option, String current) {
    if (option == null) {
      return current.trim().isEmpty;
    }
    final target = current.trim().toLowerCase();
    return option.value.toLowerCase() == target ||
        option.label.toLowerCase() == target;
  }

  Future<void> _loadInitialAddress() async {
    setState(() {
      _loadingProvincias = true;
      _addressError = null;
    });

    try {
      final provincias = await widget.service.loadProvincias();
      final provincia = _match(provincias, widget.record.province);
      final cantones = provincia == null
          ? <AddressOption>[]
          : await widget.service.loadCantones(provincia.value);
      final canton = provincia == null
          ? null
          : _match(cantones, widget.record.canton);
      final distritos = (provincia == null || canton == null)
          ? <AddressOption>[]
          : await widget.service.loadDistritos(provincia.value, canton.value);
      final distrito = canton == null
          ? null
          : _match(distritos, widget.record.district);

      if (!mounted) {
        return;
      }
      setState(() {
        _provincias = provincias;
        _cantones = cantones;
        _distritos = distritos;
        _provincia = provincia;
        _canton = canton;
        _distrito = distrito;
        _loadingProvincias = false;
      });
    } on Exception catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _addressError = ExpedienteService.describeError(error);
        _loadingProvincias = false;
      });
    }
  }

  Future<void> _onProvinciaChanged(String? value) async {
    if (value == null || value == _provincia?.value) {
      return;
    }
    final selected = _provincias.firstWhere((option) => option.value == value);

    setState(() {
      _provincia = selected;
      _canton = null;
      _distrito = null;
      _cantones = [];
      _distritos = [];
      _loadingCantones = true;
    });

    try {
      final cantones = await widget.service.loadCantones(selected.value);
      if (!mounted || _provincia?.value != selected.value) {
        return;
      }
      setState(() {
        _cantones = cantones;
        _loadingCantones = false;
      });
    } on Exception catch (error) {
      if (!mounted || _provincia?.value != selected.value) {
        return;
      }
      setState(() {
        _loadingCantones = false;
      });
      AppFeedback.show(
        context,
        message: ExpedienteService.describeError(error),
        type: FeedbackType.error,
      );
    }
  }

  Future<void> _onCantonChanged(String? value) async {
    final provincia = _provincia;
    if (provincia == null || value == null || value == _canton?.value) {
      return;
    }
    final selected = _cantones.firstWhere((option) => option.value == value);

    setState(() {
      _canton = selected;
      _distrito = null;
      _distritos = [];
      _loadingDistritos = true;
    });

    try {
      final distritos = await widget.service.loadDistritos(
        provincia.value,
        selected.value,
      );
      if (!mounted || _canton?.value != selected.value) {
        return;
      }
      setState(() {
        _distritos = distritos;
        _loadingDistritos = false;
      });
    } on Exception catch (error) {
      if (!mounted || _canton?.value != selected.value) {
        return;
      }
      setState(() {
        _loadingDistritos = false;
      });
      AppFeedback.show(
        context,
        message: ExpedienteService.describeError(error),
        type: FeedbackType.error,
      );
    }
  }

  void _onDistritoChanged(String? value) {
    if (value == null) {
      return;
    }
    setState(() {
      _distrito = _distritos.firstWhere((option) => option.value == value);
    });
  }

  String? _normalizePhone(String raw) {
    var digits = raw.replaceAll(RegExp(r'[\s\-]'), '');
    if (digits.startsWith('+506')) {
      digits = digits.substring(4);
    } else if (digits.length == 11 && digits.startsWith('506')) {
      digits = digits.substring(3);
    }
    return RegExp(r'^\d{8}$').hasMatch(digits) ? digits : null;
  }

  String? _validatePhone(String? value, TextEditingController current) {
    final text = value?.trim() ?? '';
    if (text.isEmpty) {
      return 'Ingrese el numero de telefono';
    }
    final phone = _normalizePhone(text);
    if (phone == null) {
      return 'Ingrese un telefono valido de 8 digitos';
    }
    final repeated = _phoneControllers.any(
      (controller) =>
          !identical(controller, current) &&
          _normalizePhone(controller.text) == phone,
    );
    return repeated ? 'Este telefono esta repetido' : null;
  }

  void _addPhone() {
    setState(() {
      _phoneControllers.add(TextEditingController());
    });
  }

  void _removePhone(int index) {
    final controller = _phoneControllers[index];
    setState(() {
      _phoneControllers.removeAt(index);
    });
    WidgetsBinding.instance.addPostFrameCallback((_) => controller.dispose());
  }

  List<String> _currentPhones() {
    return [
      for (final controller in _phoneControllers)
        if (controller.text.trim().isNotEmpty)
          _normalizePhone(controller.text) ?? controller.text.trim(),
    ];
  }

  bool _hasChanges() {
    final original = [
      for (final phone in widget.record.phones)
        _normalizePhone(phone) ?? phone.trim(),
    ];
    final current = _currentPhones();
    if (original.length != current.length) {
      return true;
    }
    for (var i = 0; i < original.length; i++) {
      if (original[i] != current[i]) {
        return true;
      }
    }

    if (_otherAddressController.text.trim() !=
        widget.record.otherAddress.trim()) {
      return true;
    }

    return !_sameAs(_provincia, widget.record.province) ||
        !_sameAs(_canton, widget.record.canton) ||
        !_sameAs(_distrito, widget.record.district);
  }

  Future<void> _save() async {
    if (_saving) {
      return;
    }
    if (!_formKey.currentState!.validate()) {
      AppFeedback.show(
        context,
        message: 'Revise los campos marcados',
        type: FeedbackType.warning,
      );
      return;
    }

    final provincia = _provincia;
    final canton = _canton;
    final distrito = _distrito;
    if (provincia == null || canton == null || distrito == null) {
      return;
    }

    if (!_hasChanges()) {
      AppFeedback.show(
        context,
        message: 'No hay cambios por guardar',
        type: FeedbackType.info,
      );
      return;
    }

    final confirmed = await AppConfirmDialog.show(
      context,
      title: 'Confirmar cambios',
      message: 'Desea guardar los cambios en su expediente?',
      confirmText: 'Guardar',
    );
    if (!confirmed || !mounted) {
      return;
    }

    setState(() {
      _saving = true;
    });

    try {
      final result = await widget.service.updateExpediente(
        previous: widget.record,
        phones: _currentPhones(),
        province: provincia.value,
        canton: canton.value,
        district: distrito.value,
        otherAddress: _otherAddressController.text.trim(),
      );
      if (!mounted) {
        return;
      }
      Navigator.of(context).pop(result);
    } on Exception catch (error) {
      if (!mounted) {
        return;
      }
      AppFeedback.show(
        context,
        message: ExpedienteService.describeError(error),
        type: FeedbackType.error,
      );
    } finally {
      if (mounted) {
        setState(() {
          _saving = false;
        });
      }
    }
  }

  Future<void> _confirmExit() async {
    if (_saving) {
      return;
    }
    if (_hasChanges()) {
      final discard = await AppConfirmDialog.show(
        context,
        title: 'Descartar cambios',
        message: 'Tiene cambios sin guardar - desea salir sin guardar?',
        confirmText: 'Salir',
        cancelText: 'Seguir editando',
      );
      if (!discard || !mounted) {
        return;
      }
    }
    Navigator.of(context).pop();
  }

  Widget _dropdown({
    required String label,
    required IconData icon,
    required List<AddressOption> options,
    required AddressOption? selected,
    required bool loading,
    required ValueChanged<String?> onChanged,
    required String requiredMessage,
  }) {
    return DropdownButtonFormField<String>(
      key: ValueKey('$label-${options.length}-${selected?.value}'),
      initialValue: selected?.value,
      isExpanded: true,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon),
        border: const OutlineInputBorder(),
        suffixIcon: loading
            ? const Padding(
                padding: EdgeInsets.all(12),
                child: SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
              )
            : null,
      ),
      items: [
        for (final option in options)
          DropdownMenuItem<String>(
            value: option.value,
            child: Text(option.label, overflow: TextOverflow.ellipsis),
          ),
      ],
      onChanged: (_saving || loading || options.isEmpty) ? null : onChanged,
      validator: (value) => value == null ? requiredMessage : null,
    );
  }

  @override
  Widget build(BuildContext context) {
    final record = widget.record;

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) {
          _confirmExit();
        }
      },
      child: Scaffold(
        appBar: AppBar(
          toolbarHeight: 72,
          titleSpacing: 16,
          automaticallyImplyLeading: false,
          title: const MetaULogo(),
        ),
        body: Form(
          key: _formKey,
          autovalidateMode: AutovalidateMode.onUserInteraction,
          child: ListView(
            keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
            padding: const EdgeInsets.all(16),
            children: [
              PageHeader(
                title: 'Editar expediente',
                actions: [
                  IconButton.filled(
                    tooltip: 'Regresar',
                    onPressed: _saving ? null : _confirmExit,
                    icon: const Icon(Icons.arrow_back),
                  ),
                  IconButton.filled(
                    tooltip: 'Guardar',
                    onPressed: _saving ? null : _save,
                    icon: _saving
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : const Icon(Icons.save_outlined),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Card(
                color: Colors.white,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SectionTitle('Datos no editables'),
                      const SizedBox(height: 12),
                      _ReadOnlyField(
                        label: 'Identificacion',
                        value: record.identification,
                        icon: Icons.badge_outlined,
                      ),
                      const SizedBox(height: 12),
                      _ReadOnlyField(
                        label: 'Correo institucional',
                        value: record.email,
                        icon: Icons.email_outlined,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Card(
                color: Colors.white,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SectionTitle('Telefonos'),
                      const SizedBox(height: 12),
                      for (var i = 0; i < _phoneControllers.length; i++)
                        Padding(
                          key: ObjectKey(_phoneControllers[i]),
                          padding: const EdgeInsets.only(bottom: 12),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                child: TextFormField(
                                  controller: _phoneControllers[i],
                                  enabled: !_saving,
                                  keyboardType: TextInputType.phone,
                                  textInputAction: TextInputAction.next,
                                  inputFormatters: [
                                    FilteringTextInputFormatter.allow(
                                      RegExp(r'[0-9+\- ]'),
                                    ),
                                  ],
                                  decoration: InputDecoration(
                                    labelText: 'Telefono ${i + 1}',
                                    hintText: '8888-8888',
                                    prefixIcon: const Icon(
                                      Icons.phone_outlined,
                                    ),
                                    border: const OutlineInputBorder(),
                                  ),
                                  validator: (value) => _validatePhone(
                                    value,
                                    _phoneControllers[i],
                                  ),
                                ),
                              ),
                              if (_phoneControllers.length > 1)
                                IconButton(
                                  tooltip: 'Quitar telefono',
                                  onPressed: _saving
                                      ? null
                                      : () => _removePhone(i),
                                  icon: const Icon(Icons.delete_outline),
                                ),
                            ],
                          ),
                        ),
                      TextButton.icon(
                        onPressed: _saving ? null : _addPhone,
                        icon: const Icon(Icons.add),
                        label: const Text('Agregar telefono'),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Card(
                color: Colors.white,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SectionTitle('Direccion'),
                      const SizedBox(height: 12),
                      if (_loadingProvincias)
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 16),
                          child: Center(child: CircularProgressIndicator()),
                        )
                      else if (_addressError != null) ...[
                        Text(_addressError!),
                        TextButton(
                          onPressed: _loadInitialAddress,
                          child: const Text('Reintentar'),
                        ),
                      ] else ...[
                        _dropdown(
                          label: 'Provincia',
                          icon: Icons.map_outlined,
                          options: _provincias,
                          selected: _provincia,
                          loading: false,
                          onChanged: _onProvinciaChanged,
                          requiredMessage: 'Seleccione la provincia',
                        ),
                        const SizedBox(height: 16),
                        _dropdown(
                          label: 'Canton',
                          icon: Icons.location_city_outlined,
                          options: _cantones,
                          selected: _canton,
                          loading: _loadingCantones,
                          onChanged: _onCantonChanged,
                          requiredMessage: 'Seleccione el canton',
                        ),
                        const SizedBox(height: 16),
                        _dropdown(
                          label: 'Distrito',
                          icon: Icons.place_outlined,
                          options: _distritos,
                          selected: _distrito,
                          loading: _loadingDistritos,
                          onChanged: _onDistritoChanged,
                          requiredMessage: 'Seleccione el distrito',
                        ),
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: _otherAddressController,
                          enabled: !_saving,
                          maxLines: 3,
                          textCapitalization: TextCapitalization.sentences,
                          decoration: const InputDecoration(
                            labelText: 'Otras senas',
                            alignLabelWithHint: true,
                            prefixIcon: Icon(Icons.home_outlined),
                            border: OutlineInputBorder(),
                          ),
                          validator: (value) =>
                              (value == null || value.trim().isEmpty)
                              ? 'Ingrese las otras senas'
                              : null,
                        ),
                      ],
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              FilledButton.icon(
                onPressed: _saving ? null : _save,
                icon: const Icon(Icons.save_outlined),
                label: const Text('Guardar cambios'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ReadOnlyField extends StatelessWidget {
  const _ReadOnlyField({
    required this.label,
    required this.value,
    required this.icon,
  });

  final String label;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      initialValue: value,
      enabled: false,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon),
        suffixIcon: const Icon(Icons.lock_outline),
        border: const OutlineInputBorder(),
      ),
    );
  }
}
