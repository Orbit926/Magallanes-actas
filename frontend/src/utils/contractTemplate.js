export const checklistSections = [
  {
    title: 'Acabados',
    items: [
      { id: 'pintura_enjarres', label: 'Pintura y enjarres completos' },
      { id: 'cristales_aluminio', label: 'Cristales no rotos y aluminio completo' },
      { id: 'carpinteria_completa', label: 'Carpintería completa' },
      { id: 'piso_completo', label: 'Piso completo y no roto' },
      { id: 'elementos_decorativos', label: 'Elementos decorativos completos (lámpara de barro y 3 faroles)' },
    ],
  },
  {
    title: 'Instalaciones',
    items: [
      { id: 'accesorios_hidraulicos', label: 'Accesorios hidráulicos completos' },
      { id: 'accesorios_electricos', label: 'Accesorios eléctricos completos' },
      { id: 'funcionamiento_chapas', label: 'Funcionamiento correcto de chapas' },
    ],
  },
  {
    title: 'Herrería',
    items: [
      { id: 'herreria_balcon', label: 'Balcón en herrería completo' },
      { id: 'herreria_escalera', label: 'Escalera marina completa' },
    ],
  },
  {
    title: 'Equipos Completos',
    items: [
      {
        id: 'estufa_kit_gas',
        label: 'Estufa y kit de conexión',
      },
      { id: 'campana', label: 'Campana instalada' },
      { id: 'tarja_cocina', label: 'Tarja con mezcladora (cocina)' },
      { id: 'bomba', label: 'Bomba' },
      {
        id: 'tarja_servicio',
        label: 'Tarja y mezcladora (cuarto de servicio)',
      },
      {
        id: 'boiler_kit_gas',
        label: 'Boiler y kit de conectividad (verificar conexiones y salidas de gas)',
      },
      {
        id: 'ac_rec_principal',
        label: 'Aire acondicionado y control (recámara principal)',
      },
      {
        id: 'ac_rec_secundaria',
        label: 'Aire acondicionado y control (recámara secundaria)',
      },
    ],
  },
];


export function generateFolio(numeroCasa, fecha) {
  const d = fecha ? new Date(fecha) : new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `HM-${numeroCasa}-${yyyy}${mm}${dd}-${rand}`;
}

export function getContractText(data) {
  const {
    // PROPIETARIO
    nombre = '___________',
    apellidoPaterno = '___________',
    apellidoMaterno = '___________',
    email = '___________',
    telefono = '___________',

    // INMUEBLE
    numeroCasa = '___',
    folio = '___________',

    // DATOS FIJOS DEL CONDOMINIO
    vendedorRepresentante = 'Arq. Mayra Belen Lupercio Romero',
    vendedorRepresentadoPor = 'Lic. Ricardo García Rulfo de Aguinaga',
  } = data;

  const nombreCompleto = `${nombre} ${apellidoPaterno} ${apellidoMaterno}`.trim();

  // Datos fijos de Magallanes Residencial
  const condominioNombre = 'Magallanes Residencial';
  const direccionFija = `Av. Magallanes #890 int. ${numeroCasa}`;
  const colonia = 'Santa Anita';
  const cp = '45600';
  const municipio = 'Tlaquepaque';
  const ciudadEstado = 'Jalisco';
  
  // Fecha actual formateada
  const hoy = new Date();
  const fechaEntrega = hoy.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });

  return [
    {
      title: 'ACTA DE ENTREGA-RECEPCIÓN',
      content: `Folio: ${folio}`,
    },
    {
      title: '',
      content:
        `Por medio del presente documento se hace constar la comparecencia de ${vendedorRepresentante} en representación del ${vendedorRepresentadoPor}, a quien se le denominará "EL VENDEDOR" así como de ${nombreCompleto} de la finca marcada con el número ${numeroCasa} del Condominio "${condominioNombre}", ubicado en ${direccionFija} en la Colonia ${colonia}, C.P.${cp}, en el Municipio de ${municipio}, ${ciudadEstado}, a quien se le denominará "EL PROPIETARIO" por lo que ambas partes están de acuerdo en hacer constar los siguientes hechos:`,
    },
    {
      title: '',
      content:
        `a) Que con fecha ${fechaEntrega} se le hace entrega a “EL PROPIETARIO” física y materialmente de la finca ubicada en el párrafo anterior.\n` +
        `b) Que en este mismo acto “EL PROPIETARIO” declara que recibe de “EL VENDEDOR” las llaves del Inmueble referido en el inciso que antecede.\n` +
        `c) Ambas partes hacen constar que “EL PROPIETARIO” ha revisado en su totalidad los interiores y exteriores de la finca por lo que manifiesta en este acto que se ha cumplido con las especificaciones establecidas y ofrecidas en cuanto a materiales y calidad.\n` +
        `d) Declara “EL PROPIETARIO” que recibe la posesión física y material del inmueble por parte de “EL VENDEDOR” por lo que a partir de este momento se hace responsable del uso y mantenimiento del inmueble, así como de cualquier gasto, impuesto y contribución que genere la finca de su propiedad.`,
    },
    {
      title: 'PÓLIZA DE GARANTÍA',
      content:
        `Se expide la presente Garantía en los conceptos, duración y condiciones que a continuación se describen, haciendo del conocimiento del “PROPIETARIO” que el procedimiento para hacer efectiva la garantía es mediante el reporte al correo electrónico m.r.postventa@gmail.com en donde se programará una visita de verificación a la finca siempre y cuando haya existido un uso adecuado del inmueble como Casa Habitación, hecho que acepta expresamente “EL PROPIETARIO” en este acto.`,
    },
    {
      title: '',
      content:
        `I.- Garantía al día de la entrega de la propiedad, misma que aplicará en ese momento por cualquier defecto.\n\n` +
        `II.- Garantía de treinta días por vicios ocultos.\n\n` +
        `III.- Garantía por cinco años respecto a daños que afecten específicamente la estructura de la construcción.\n\n` +
        `IMPORTANTE: A partir de esta fecha, es responsabilidad del “PROPIETARIO” revisar y estar al pendiente de su propiedad constantemente para identificar, si es el caso, alguna filtración o fuga que pudiera afectar la carpintería, enjarres, pintura, etc. y es responsabilidad de “EL PROPIETARIO” dar aviso de inmediato al “EL VENDEDOR” para su reparación.`,
    },
    {
      title: '',
      content:
        `“El propietario” recibe en este acto el Reglamento interno del Condominio y acepta que respetará y se apegará a todas y cada una de sus cláusulas.`,
    },
    {
      title: 'CONDICIONES GENERALES',
      content:
        `• Se hace del conocimiento de “EL PROPIETARIO” que “EL VENDEDOR” no se hace responsable por desperfectos derivados del mal uso, falta de mantenimiento, modificaciones o ampliaciones a la estructura, a las instalaciones eléctricas, hidráulicas, sanitarias y de gas o en general a los acabados originales de la vivienda.\n` +
        `• Los plazos y vigencia de la póliza comienzan a partir de la fecha indicada en esta acta de ENTREGA-RECEPCIÓN, independientemente de si habita o no el inmueble.\n` +
        `• En caso de reparaciones “EL PROPIETARIO” se obliga a firmar de conformidad, una vez que el trabajo de reparación se haya efectuado.\n` +
        `• “EL PROPIETARIO” acepta que el desarrollo es una obra en proceso de construcción por lo que está totalmente consciente de los ruidos, vibraciones, polvo, obstáculos etc. que trabajadores, herramienta, maquinaria y vehículos pesados pueden ocasionar.\n` +
        `• Esta póliza de garantía no ampara desperfectos causados por terceros.\n` +
        `• La seguridad de la finca y sus pertenencias son responsabilidad de “EL PROPIETARIO” y no de “EL VENDEDOR”.\n` +
        `• “EL VENDEDOR” y su personal tendrán todo el derecho legal de ingresar al condominio a trabajar en tanto no se entreguen el 100% de las viviendas.\n` +
        `• Una vez transcurrida la vigencia de la garantía para cada rubro, los desperfectos que se presenten relacionados a los mismos, serán corregidos por “EL PROPIETARIO” considerándose como gastos normales del mantenimiento de la finca.\n` +
        `• EL VENDEDOR se deslinda de cualquier falla tanto estructural como de funcionamiento de instalaciones, ocasionada por las modificaciones o ampliaciones hechas de manera arbitraria al proyecto original, por parte de “EL PROPIETARIO”.\n` +
        `• El condominio cuenta con registros y ductos subterráneos para el servicio de telefonía e internet, el propietario de cada unidad privativa contratará su servicio y es responsabilidad de la empresa contratada por el propietario utilizar los ductos y suministrar e instalar la infraestructura necesaria para poder proporcionar el servicio.\n` +
        `• Se le recuerda que el área verde, la plazoleta y la casa club no pertenecen al régimen de condominio por ser área de cesión al Ayuntamiento y se encuentran bajo resguardo, responsabilidad y mantenimiento del constructor por lo que no es posible entrar y utilizar por los condóminos ya que son áreas que pasaran a ser propiedad del Ayuntamiento.`,
    },
    {
      title: '',
      content:
        `Firmando de conformidad para constancia de la entrega del Inmueble, conocimiento del reglamento, de la presente Póliza de Garantía y para los efectos legales correspondientes.\n\n` +
        `“EL PROPIETARIO”\n${nombreCompleto}\nemail: ${email}\nTeléfono: ${telefono}\n\n` +
        `“VENDEDOR”\n${vendedorRepresentante}\nEn representación del ${vendedorRepresentadoPor}`,
    },
  ];
}

export const warrantyConditions = [
  {
    title: 'CONDICIONES GENERALES',
    content: '',
  },
  {
    title: '',
    content:
      '• Se hace del conocimiento de “EL PROPIETARIO” que “EL VENDEDOR” no se hace responsable por desperfectos derivados del mal uso, falta de mantenimiento, modificaciones o ampliaciones a la estructura, a las instalaciones eléctricas, hidráulicas, sanitarias y de gas o en general a los acabados originales de la vivienda.\n' +
      '• Los plazos y vigencia de la póliza comienzan a partir de la fecha indicada en esta acta de ENTREGA-RECEPCIÓN, independientemente de si habita o no el inmueble.\n' +
      '• En caso de reparaciones “EL PROPIETARIO” se obliga a firmar de conformidad, una vez que el trabajo de reparación se haya efectuado.\n' +
      '• “EL PROPIETARIO” acepta que el desarrollo es una obra en proceso de construcción por lo que está totalmente consciente de los ruidos, vibraciones, polvo, obstáculos etc. que trabajadores, herramienta, maquinaria y vehículos pesados pueden ocasionar.\n' +
      '• Esta póliza de garantía no ampara desperfectos causados por terceros.\n' +
      '• La seguridad de la finca y sus pertenencias son responsabilidad de “EL PROPIETARIO” y no de “EL VENDEDOR”.\n' +
      '• “EL VENDEDOR” y su personal tendrán todo el derecho legal de ingresar al condominio a trabajar en tanto no se entreguen el 100% de las viviendas.\n' +
      '• Una vez transcurrida la vigencia de la garantía para cada rubro, los desperfectos que se presenten relacionados a los mismos, serán corregidos por “EL PROPIETARIO” considerándose como gastos normales del mantenimiento de la finca.\n' +
      '• EL VENDEDOR se deslinda de cualquier falla tanto estructural como de funcionamiento de instalaciones, ocasionada por las modificaciones o ampliaciones hechas de manera arbitraria al proyecto original, por parte de “EL PROPIETARIO”.\n' +
      '• El condominio cuenta con registros y ductos subterráneos para el servicio de telefonía e internet, el propietario de cada unidad privativa contratará su servicio y es responsabilidad de la empresa contratada por el propietario utilizar los ductos y suministrar e instalar la infraestructura necesaria para poder proporcionar el servicio.\n' +
      '• Se le recuerda que el área verde, la plazoleta y la casa club no pertenecen al régimen de condominio por ser área de cesión al Ayuntamiento y se encuentran bajo resguardo, responsabilidad y mantenimiento del constructor por lo que no es posible entrar y utilizar por los condóminos ya que son áreas que pasaran a ser propiedad del Ayuntamiento.',
  },
];

export const mockData = {
  nombre: 'Carlos Eduardo',
  apellidoPaterno: 'García',
  apellidoMaterno: 'Martínez',
  email: 'carlos.garcia@correo.com',
  telefono: '3331234567',
  numeroCasa: '42',
};
