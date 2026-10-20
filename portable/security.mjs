// Cabeceras de seguridad de la respuesta HTTP.
//
// El sitio es una SPA estática servida por este mismo proceso. Sin cabeceras
// de seguridad, el navegador no tiene ninguna restricción sobre lo que la
// página puede cargar ni sobre quién puede enmarcarla.
//
// La CSP se calibra con lo que el sitio REALMENTE usa:
//
// - `script-src 'self' 'unsafe-inline'`: el HTML construido lleva los
//   scripts en línea (Three.js, GSAP y el código de la interfaz). Sin
//   'unsafe-inline' la página quedaría en blanco. Lo que sí queda bloqueado
//   es cargar scripts de OTRO origen.
// - `style-src 'self' 'unsafe-inline'`: hay bloques <style> y atributos
//   style="" en el HTML construido.
// - `img-src 'self' data:`: las imágenes son locales y hay unas pocas
//   incrustadas como data: URI.
// - `frame-src 'self'`: las miniaturas de las plantillas se cargan en un
//   iframe del propio sitio.
// - `frame-ancestors 'self'`: el sitio se puede enmarcar desde el mismo
//   origen (la galería de plantillas lo hace) y no desde fuera.
// - `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`: el sitio
//   no usa plugins ni <base>, y sus formularios van al propio origen.
//
// HSTS lo declara el servidor: el navegador lo guarda por el dominio y
// exige HTTPS en las visitas siguientes. Sin `includeSubDomains` a
// propósito: el dominio puede tener subdominios que no sirvan este sitio.

export function cabecerasDeSeguridad() {
  return {
    "Content-Security-Policy": [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ].join("; "),
    "Strict-Transport-Security": "max-age=31536000",
    "X-Frame-Options": "SAMEORIGIN",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  };
}

export function aplicarCabecerasDeSeguridad(res) {
  for (const [nombre, valor] of Object.entries(cabecerasDeSeguridad())) {
    res.setHeader(nombre, valor);
  }
}
