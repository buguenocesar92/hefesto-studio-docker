(() => {
  const form = document.querySelector("#solution-quote"),
    actions = document.querySelector("#quote-actions");
  const label = document.createElement("label");
  label.textContent = "Correo para responder tu solicitud";
  const email = document.createElement("input");
  email.type = "email";
  email.maxLength = 254;
  email.autocomplete = "email";
  label.append(email);
  form.append(label);
  const consentLabel = document.createElement("label"),
    consent = document.createElement("input");
  consent.type = "checkbox";
  consentLabel.append(
    consent,
    document.createTextNode(
      "Autorizo usar estos datos para responder mi solicitud.",
    ),
  );
  const privacy = document.createElement("a");
  privacy.href = "/legal/privacidad/";
  privacy.textContent = " Leer privacidad";
  consentLabel.append(privacy);
  form.append(consentLabel);
  const send = document.createElement("button");
  send.type = "button";
  send.className = "btn";
  send.textContent = "Enviar solicitud a Hefesto";
  const status = document.createElement("p");
  status.setAttribute("role", "status");
  actions.append(send, status);
  send.addEventListener("click", async () => {
    if (!email.value || !email.checkValidity() || !consent.checked) {
      status.textContent =
        "Completa un correo válido y autoriza el uso de tus datos.";
      return;
    }
    send.disabled = true;
    status.textContent = "Enviando…";
    try {
      const r = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business: document.querySelector("#quote-business").value,
          email: email.value,
          goal: document.querySelector("#quote-goal").value,
          modules: [...form.querySelectorAll("[name=module]:checked")].map(
            (x) => x.value,
          ),
          consent: true,
        }),
      });
      const b = await r.json();
      if (!r.ok) throw Error(b.error);
      status.textContent = "Solicitud recibida. Referencia: " + b.id;
      send.textContent = "Solicitud enviada";
    } catch (e) {
      status.textContent = e.message;
      send.disabled = false;
    }
  });
  const chat = document.querySelector("#assistant-form"),
    input = document.querySelector("#assistant-input"),
    log = document.querySelector("#assistant-messages");
  let busy = false;
  document.addEventListener(
    "submit",
    async (e) => {
      if (e.target !== chat) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (busy) return;
      const question = input.value.trim();
      if (!question) return;
      busy = true;
      input.value = "";
      const user = document.createElement("p"),
        reply = document.createElement("p");
      user.className = "assistant-message user";
      user.textContent = question;
      reply.className = "assistant-message";
      reply.textContent = "Consultando…";
      log.append(user, reply);
      try {
        const r = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question }),
        });
        const b = await r.json();
        if (!r.ok) throw Error(b.error);
        reply.textContent = b.answer;
        for (const source of b.sources || []) {
          const a = document.createElement("a");
          a.href = source.url;
          a.textContent = " " + source.title;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          reply.append(a);
        }
      } catch (e) {
        reply.textContent = e.message;
      } finally {
        busy = false;
        log.scrollTop = log.scrollHeight;
      }
    },
    true,
  );
  document.querySelector(".assistant-note").textContent =
    "Asistente vía backend. Disponible cuando n8n esté configurado; evita ingresar datos sensibles.";
})();
