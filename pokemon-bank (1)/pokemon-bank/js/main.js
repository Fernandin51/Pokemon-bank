/* ==========================================================================
   Pokémon Bank - js/main.js
   Lógica del cajero: login, depósito, retiro, consulta de saldo y pago de
   servicios. Cada operación actualiza el saldo, el historial, las tarjetas
   de resumen y los gráficos. Los datos se guardan en el navegador
   (localStorage) para que no se pierdan al recargar la página.
   ========================================================================== */
(function () {
  "use strict";

  var PIN_CORRECTO = "1234";
  var CLAVE = "pokemonbank_v1";
  var SERVICIOS = { energia: "Energía eléctrica", internet: "Internet", telefonia: "Telefonía", agua: "Agua potable" };

  /* ---------- Datos iniciales (usuario de prueba). Montos en centavos ---------- */
  function datosIniciales() {
    var t = function (f, tipo, det, monto, saldo) { return { f: f, tipo: tipo, det: det, monto: monto, saldo: saldo }; };
    return {
      saldo: 125075,
      tx: [
        t("05/10/2026 08:15", "dep", "Depósito en efectivo", 30000, 90880),
        t("05/10/2026 08:20", "sal", "Consulta de saldo", 0, 90880),
        t("06/10/2026 10:02", "ret", "Retiro en cajero", 6000, 84880),
        t("07/10/2026 14:30", "pag", "Energía eléctrica", 4530, 80350),
        t("07/10/2026 14:33", "pag", "Internet", 3000, 77350),
        t("08/10/2026 09:12", "ret", "Retiro en cajero", 10000, 67350),
        t("09/10/2026 16:45", "dep", "Depósito en efectivo", 50000, 117350),
        t("09/10/2026 16:47", "sal", "Consulta de saldo", 0, 117350),
        t("10/10/2026 11:20", "pag", "Agua potable", 1275, 116075),
        t("11/10/2026 18:05", "pag", "Telefonía", 2000, 114075),
        t("11/10/2026 18:10", "ret", "Retiro en cajero", 4000, 110075),
        t("12/10/2026 07:55", "dep", "Depósito en efectivo", 15000, 125075),
        t("12/10/2026 07:56", "sal", "Consulta de saldo", 0, 125075)
      ]
    };
  }

  var estado;
  try { estado = JSON.parse(localStorage.getItem(CLAVE)); } catch (e) { estado = null; }
  if (!estado || typeof estado.saldo !== "number" || !Array.isArray(estado.tx)) estado = datosIniciales();

  function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) { /* sin almacenamiento */ } }

  /* ---------- Utilidades ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function dinero(c) { return "$" + (c / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function aCentavos(v) { return Math.round(parseFloat(v) * 100); }
  function dos(n) { return (n < 10 ? "0" : "") + n; }
  function fechaHora() { var d = new Date(); return dos(d.getDate()) + "/" + dos(d.getMonth() + 1) + "/" + d.getFullYear() + " " + dos(d.getHours()) + ":" + dos(d.getMinutes()); }
  function soloFecha() { return fechaHora().split(" ")[0]; }

  var toastTimer;
  function aviso(texto, error) {
    var t = $("#pk-toast"); if (!t) return;
    t.textContent = texto; t.className = "pk-toast show" + (error ? " error" : "");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.className = "pk-toast" + (error ? " error" : ""); }, 3500);
  }

  function registrar(tipo, detalle, monto) {
    if (tipo === "dep") estado.saldo += monto;
    if (tipo === "ret" || tipo === "pag") estado.saldo -= monto;
    estado.tx.push({ f: fechaHora(), tipo: tipo, det: detalle, monto: monto, saldo: estado.saldo });
    guardar(); pintar();
  }

  /* ---------- Pintar historial, resumen, saldo y gráficos ---------- */
  var ETIQ = { dep: "Depósito", ret: "Retiro", pag: "Servicio", sal: "Consulta" };

  function pintar() {
    var tot = { dep: 0, ret: 0, pag: 0, sal: 0 }, cant = { dep: 0, ret: 0, pag: 0, sal: 0 };
    var filas = estado.tx.map(function (x, i) {
      tot[x.tipo] += x.monto; cant[x.tipo]++;
      var signo = x.tipo === "dep" ? "+" : "−";
      var monto = x.tipo === "sal" ? '<td class="pk-num pk-zero">—</td>' :
        '<td class="pk-num ' + (x.tipo === "dep" ? "pk-in" : "pk-out") + '">' + signo + dinero(x.monto) + "</td>";
      return '<tr class="t-' + x.tipo + '"><td>' + ("00" + (i + 1)).slice(-3) + "</td><td>" + x.f + '</td><td><span class="pk-tag ' + x.tipo + '">' +
        ETIQ[x.tipo] + "</span></td><td>" + x.det + "</td>" + monto + '<td class="pk-num">' + dinero(x.saldo) + "</td></tr>";
    });
    var tb = $("#historial tbody"); if (tb) tb.innerHTML = filas.join("");

    // Tarjetas de resumen
    ["dep", "ret", "pag"].forEach(function (k) {
      var c = $(".pk-stat." + k); if (!c) return;
      $("strong", c).textContent = dinero(tot[k]); $("span", c).textContent = cant[k] + " transacciones";
    });
    var cs = $(".pk-stat.sal"); if (cs) $("strong", cs).textContent = cant.sal;

    // Saldo en la ventana de consulta
    var am = $(".pk-amount"); if (am) am.innerHTML = "<sup>$</sup>" + dinero(estado.saldo).slice(1);
    var li = $$("#saldo .pk-info-list li span:last-child"); if (li[3]) li[3].textContent = soloFecha();

    // Gráfico de dona
    var n = estado.tx.length, dona = $(".pk-donut");
    if (dona && n) {
      var p1 = cant.dep / n * 100, p2 = p1 + cant.ret / n * 100, p3 = p2 + cant.pag / n * 100;
      dona.style.background = "conic-gradient(var(--pk-green) 0 " + p1 + "%, #e0403a " + p1 + "% " + p2 + "%, var(--pk-blue) " + p2 + "% " + p3 + "%, var(--pk-orange) " + p3 + "% 100%)";
      dona.setAttribute("data-total", n);
      dona.setAttribute("aria-label", "Gráfico de dona: depósitos " + cant.dep + ", retiros " + cant.ret + ", pago de servicios " + cant.pag + " y consultas de saldo " + cant.sal);
    }
    ["dep", "ret", "pag", "sal"].forEach(function (k, i) {
      var em = $(".pk-legend li:nth-child(" + (i + 1) + ") em");
      if (em) em.textContent = cant[k] + " · " + (n ? Math.round(cant[k] / n * 100) : 0) + "%";
    });

    // Barras de monto
    var max = Math.max(tot.dep, tot.ret, tot.pag, 1);
    ["dep", "ret", "pag"].forEach(function (k, i) {
      var fila = $$(".pk-bar-row")[i]; if (!fila) return;
      $(".pk-bar-label span:last-child", fila).textContent = dinero(tot[k]);
      $(".pk-bar-fill", fila).style.width = (tot[k] / max * 100) + "%";
    });
    var res = $$("#grafico .pk-info-list li span:last-child");
    if (res[0]) res[0].textContent = "+" + dinero(tot.dep);
    if (res[1]) res[1].textContent = "−" + dinero(tot.ret + tot.pag);
    if (res[2]) res[2].textContent = dinero(estado.saldo);
  }

  /* ---------- Cambiar de vista tras una operación ---------- */
  function irAAcciones() { window.location.hash = "#acciones"; }

  /* ---------- Login ---------- */
  var fLogin = $("#form-login");
  if (fLogin) fLogin.addEventListener("submit", function (e) {
    e.preventDefault();
    var pin = $("#pin"), err = $("#pin-error");
    if (pin.value === PIN_CORRECTO) { err.hidden = true; pin.value = ""; irAAcciones(); }
    else { err.textContent = "PIN incorrecto. Inténtalo de nuevo."; err.hidden = false; pin.value = ""; pin.focus(); }
  });

  /* ---------- Depósito ---------- */
  var fDep = $("#form-deposito");
  if (fDep) fDep.addEventListener("submit", function (e) {
    e.preventDefault();
    var m = aCentavos($("#monto-deposito").value);
    if (!(m > 0)) return aviso("Ingresa un monto válido.", true);
    registrar("dep", "Depósito en efectivo", m);
    aviso("Depósito de " + dinero(m) + " realizado. Saldo: " + dinero(estado.saldo));
    fDep.reset(); irAAcciones();
  });

  /* ---------- Retiro ---------- */
  var fRet = $("#form-retiro");
  if (fRet) fRet.addEventListener("submit", function (e) {
    e.preventDefault();
    var otro = $("#monto-retiro").value, rapido = $('input[name="rapido"]:checked');
    var v = otro !== "" ? otro : (rapido ? rapido.value : "");
    if (v === "") return aviso("Elige un monto rápido o escribe otro monto.", true);
    var m = aCentavos(v);
    if (!(m > 0) || m % 500 !== 0) return aviso("El monto debe ser múltiplo de $5.", true);
    if (m > 50000) return aviso("El límite por retiro es de $500.00.", true);
    if (m > estado.saldo) return aviso("Fondos insuficientes. Saldo: " + dinero(estado.saldo), true);
    registrar("ret", "Retiro en cajero", m);
    aviso("Retiro de " + dinero(m) + " realizado. Saldo: " + dinero(estado.saldo));
    fRet.reset(); irAAcciones();
  });

  /* ---------- Pago de servicios ---------- */
  var fSer = $("#form-servicios");
  if (fSer) fSer.addEventListener("submit", function (e) {
    e.preventDefault();
    var s = $('input[name="servicio"]:checked');
    if (!s) return aviso("Selecciona el servicio a pagar.", true);
    var m = aCentavos($("#monto-servicio").value);
    if (!(m > 0)) return aviso("Ingresa un monto válido.", true);
    if (m > estado.saldo) return aviso("Fondos insuficientes. Saldo: " + dinero(estado.saldo), true);
    registrar("pag", SERVICIOS[s.value], m);
    aviso("Pago de " + SERVICIOS[s.value] + " por " + dinero(m) + " realizado.");
    fSer.reset(); irAAcciones();
  });

  /* ---------- Consulta de saldo: se registra al abrir la ventana ---------- */
  window.addEventListener("hashchange", function () {
    if (window.location.hash === "#saldo") registrar("sal", "Consulta de saldo", 0);
  });

  /* ---------- Restablecer datos de prueba ---------- */
  var bReset = $("#btn-reset");
  if (bReset) bReset.addEventListener("click", function () {
    if (!window.confirm("¿Restablecer el saldo y el historial a los datos de prueba?")) return;
    estado = datosIniciales(); guardar(); pintar(); aviso("Datos de prueba restablecidos.");
  });

  pintar();
})();
