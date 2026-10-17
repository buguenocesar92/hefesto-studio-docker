# Datos originales de demostración. Ninguna fila representa un cliente real.
rows = '''
Alimentos|minimarket|Minimarket|Almacén del barrio|Lo que necesitas, a la vuelta.|Abarrotes,Bebidas,Limpieza|Arroz familiar,Jugo natural,Detergente|Ver productos|#286344
Alimentos|cafeteria|Cafetería|Café de la esquina|Una buena pausa empieza aquí.|Café,Pastelería,Desayunos|Café de origen,Torta del día,Desayuno de la casa|Explorar la carta|#8c492d
Alimentos|panaderia|Panadería|Pan y oficio|Hecho despacio. Disfrutado cada día.|Panes,Dulces,Encargos|Pan de masa madre,Croissant,Caja de desayuno|Ver especialidades|#945a26
Alimentos|restaurante|Restaurante|Mesa abierta|Una mesa para compartir lo bueno.|Entradas,Fondos,Postres|Ensalada de estación,Plato de la casa,Postre artesanal|Explorar la carta|#9e3e30
Alimentos|pasteleria|Pastelería|Dulce taller|Celebra con algo hecho para ti.|Tortas,Individuales,Eventos|Torta personalizada,Selección de macarons,Mesa dulce|Consultar un encargo|#a44468
Alimentos|fruteria|Frutería|Huerta cercana|De la estación a tu mesa.|Frutas,Verduras,Canastas|Fruta de temporada,Verduras del día,Canasta semanal|Ver la cosecha|#43722e
Comercio|ferreteria|Ferretería|Punto de obra|Todo gran proyecto empieza con una pieza.|Herramientas,Fijaciones,Pinturas|Taladro de ejemplo,Kit de tornillos,Pintura interior|Explorar catálogo|#b34d21
Comercio|ropa|Tienda de ropa|Línea cotidiana|Tu estilo, todos los días.|Básicos,Colecciones,Accesorios|Camisa esencial,Pantalón urbano,Bolso diario|Ver colección|#4d507c
Comercio|calzado|Calzado|Paso libre|Diseñados para tu próximo paso.|Urbano,Deportivo,Cuidado|Zapatilla urbana,Zapato clásico,Kit de cuidado|Explorar modelos|#315b77
Comercio|libreria|Librería|Entre páginas|Tu próxima historia está aquí.|Literatura,Infantil,Papelería|Novela de muestra,Cuento ilustrado,Cuaderno de notas|Descubrir libros|#69513e
Comercio|mascotas|Tienda de mascotas|Compañía animal|Pequeñas cosas para grandes compañeros.|Alimentos,Paseo,Juguetes|Alimento de ejemplo,Arnés de paseo,Juguete interactivo|Ver productos|#426d67
Comercio|tecnologia|Tienda de tecnología|Nodo digital|Tecnología que encaja contigo.|Computación,Periféricos,Accesorios|Equipo de muestra,Teclado compacto,Hub de conexión|Explorar equipos|#405fcc
Cuidado personal|peluqueria|Peluquería|Estudio raíz|Un cambio que se siente tuyo.|Cortes,Color,Tratamientos|Corte personalizado,Diagnóstico de color,Tratamiento capilar|Consultar disponibilidad|#82553e
Cuidado personal|barberia|Barbería|Oficio barber|Detalles que hacen la diferencia.|Cabello,Barba,Rituales|Corte clásico,Perfilado de barba,Servicio completo|Consultar una hora|#356465
Cuidado personal|unas|Estudio de uñas|Trazo studio|El detalle también habla de ti.|Manicure,Diseño,Cuidado|Manicure clásica,Diseño personalizado,Retiro y cuidado|Explorar servicios|#a3426a
Cuidado personal|estetica|Centro de estética|Calma estética|Un espacio para dedicarte tiempo.|Facial,Corporal,Asesoría|Sesión de valoración,Cuidado facial,Asesoría personal|Consultar una sesión|#847044
Cuidado personal|spa|Spa|Pausa natural|Baja el ritmo. Vuelve a ti.|Masajes,Rituales,Experiencias|Masaje de relajación,Ritual de descanso,Experiencia en pareja|Ver experiencias|#507269
Cuidado personal|maquillaje|Maquillaje profesional|Luz propia|Tu esencia, en cada ocasión.|Social,Novias,Clases|Maquillaje social,Prueba de novia,Clase individual|Cotizar una sesión|#89415e
Servicios profesionales|contabilidad|Servicios contables|Balance claro|Tus números, con una dirección clara.|Contabilidad,Asesoría,Gestión|Diagnóstico inicial,Plan de acompañamiento,Revisión documental|Solicitar una reunión|#275c76
Servicios profesionales|abogados|Estudio jurídico|Criterio legal|Entender tus opciones es el primer paso.|Consultas,Contratos,Acompañamiento|Consulta inicial,Revisión de contrato,Seguimiento de caso|Solicitar una consulta|#635139
Servicios profesionales|arquitectura|Arquitectura|Forma habitable|Espacios pensados para vivirlos.|Diseño,Remodelación,Asesoría|Anteproyecto,Estudio de espacio,Visita técnica|Conversar un proyecto|#6a644f
Servicios profesionales|agencia|Agencia creativa|Materia creativa|Ideas que encuentran su forma.|Identidad,Contenido,Campañas|Kit de identidad,Sesión de contenido,Plan de campaña|Contar mi idea|#6f4bbe
Servicios profesionales|consultoria|Consultoría|Perspectiva práctica|Convierte el siguiente paso en un plan.|Diagnóstico,Estrategia,Seguimiento|Diagnóstico de negocio,Taller de estrategia,Acompañamiento mensual|Agendar una conversación|#316a68
Servicios profesionales|fotografia|Fotografía|Instante estudio|Historias que merecen quedarse.|Retratos,Productos,Eventos|Sesión de retrato,Catálogo de producto,Cobertura de evento|Consultar una sesión|#745341
Hogar y oficios|taller-mecanico|Taller mecánico|Motor y oficio|Confianza para seguir el camino.|Diagnóstico,Mantención,Reparación|Revisión inicial,Mantención programada,Evaluación de reparación|Solicitar evaluación|#9a4825
Hogar y oficios|electricidad|Electricista|Circuito seguro|Soluciones claras para tu instalación.|Inspección,Instalación,Mantención|Visita de diagnóstico,Instalación de punto,Plan de mantención|Pedir una visita|#94661f
Hogar y oficios|gasfiteria|Gasfitería|Agua en orden|Resuelve lo pendiente en tu hogar.|Reparaciones,Instalaciones,Revisión|Revisión de fuga,Instalación de grifería,Evaluación sanitaria|Solicitar atención|#2c6684
Hogar y oficios|carpinteria|Carpintería|Madera viva|Hecho a medida de tu espacio.|Muebles,Restauración,Proyectos|Mueble a medida,Restauración de pieza,Diseño de estantería|Cotizar mi proyecto|#77532e
Hogar y oficios|jardineria|Jardinería|Verde en casa|Más vida para tus espacios.|Diseño,Mantención,Plantas|Diseño de jardín,Visita de mantención,Selección de plantas|Pedir asesoría|#3d713c
Hogar y oficios|limpieza|Servicios de limpieza|Espacio limpio|Tu espacio, listo para lo que viene.|Hogar,Oficinas,Servicios puntuales|Limpieza de hogar,Plan para oficinas,Limpieza de entrega|Solicitar cotización|#326b78
Educación y bienestar|academia|Academia|Aprender haciendo|Una nueva habilidad empieza hoy.|Cursos,Talleres,Mentorías|Curso inicial,Taller práctico,Mentoría individual|Explorar programas|#5660a6
Educación y bienestar|idiomas|Escuela de idiomas|Voces del mundo|Abre una conversación con el mundo.|Grupales,Individuales,Empresas|Nivelación inicial,Curso de conversación,Programa para equipos|Consultar un programa|#305c91
Educación y bienestar|musica|Escuela de música|Compás escuela|Dale espacio a tu música.|Instrumentos,Canto,Ensamble|Clase de instrumento,Entrenamiento vocal,Taller de ensamble|Encontrar mi clase|#864572
Educación y bienestar|gimnasio|Gimnasio|Movimiento club|Encuentra tu manera de moverte.|Entrenamiento,Clases,Planes|Sesión de orientación,Clase grupal,Plan de entrenamiento|Conocer los planes|#466a38
Educación y bienestar|yoga|Estudio de yoga|Punto calma|Haz espacio para tu bienestar.|Prácticas,Talleres,Individuales|Clase introductoria,Práctica grupal,Sesión individual|Ver las prácticas|#626f49
Educación y bienestar|nutricion|Consulta nutricional|Hábitos cercanos|Acompañamiento para tus hábitos.|Orientación,Seguimiento,Talleres|Consulta informativa,Sesión de seguimiento,Taller de hábitos|Solicitar información|#467567
Turismo y eventos|alojamiento|Alojamiento|Refugio de estación|Tu próxima pausa tiene un lugar.|Estadías,Experiencias,Servicios|Habitación de ejemplo,Estadía de fin de semana,Servicio adicional|Consultar fechas|#356c66
Turismo y eventos|cabana|Cabañas|Bosque adentro|Un lugar para volver a lo simple.|Cabañas,Entorno,Estadías|Cabaña familiar,Cabaña para dos,Escapada de temporada|Consultar disponibilidad|#4f6438
Turismo y eventos|tours|Operador de tours|Ruta abierta|Descubre el camino con otros ojos.|Rutas,Grupos,Privados|Ruta de un día,Salida grupal,Experiencia privada|Explorar rutas|#a25726
Turismo y eventos|viajes|Agencia de viajes|Próximo destino|Tu viaje empieza con una buena idea.|Destinos,Escapadas,Grupos|Escapada nacional,Viaje a medida,Programa grupal|Planificar mi viaje|#2f6590
Turismo y eventos|eventos|Productora de eventos|Encuentro estudio|Momentos pensados hasta el detalle.|Producción,Ambientación,Coordinación|Producción de evento,Propuesta de ambientación,Coordinación del día|Contar mi evento|#884a72
Turismo y eventos|arriendos-eventos|Arriendo para eventos|Mesa y encuentro|Todo listo para recibir.|Mobiliario,Montaje,Accesorios|Set de mesas,Montaje de espacio,Pack de accesorios|Armar mi cotización|#84602e
Especializados|inmobiliaria|Corredora de propiedades|Habitar propiedades|Encuentra el espacio que viene.|Venta,Arriendo,Asesoría|Propiedad de ejemplo,Arriendo de muestra,Asesoría de publicación|Explorar propiedades|#4a6270
Especializados|imprenta|Imprenta|Tinta y papel|De tu idea a algo que puedes tocar.|Impresión,Gran formato,Terminaciones|Tarjetas de muestra,Cartel de ejemplo,Encuadernación|Cotizar impresión|#854284
Especializados|floreria|Florería|Tallo floral|Una forma de decirlo con flores.|Ramos,Arreglos,Eventos|Ramo de estación,Arreglo para regalo,Propuesta floral|Ver arreglos|#93435c
Especializados|joyeria|Joyería|Detalle atelier|Piezas para llevar una historia.|Colecciones,A medida,Cuidado|Anillo de muestra,Colgante de colección,Servicio de ajuste|Ver las piezas|#86642e
Especializados|reparacion-tech|Servicio técnico|Segunda vida tech|Dale una nueva oportunidad a tu equipo.|Diagnóstico,Reparación,Mantención|Diagnóstico de equipo,Reparación evaluada,Mantención preventiva|Consultar reparación|#426893
Especializados|lavanderia|Lavandería|Ciclo limpio|Más tiempo para lo que importa.|Lavado,Especiales,Empresas|Lavado de prendas,Limpieza de textiles,Plan para empresas|Consultar servicios|#38747b
'''
