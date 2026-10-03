document.addEventListener("DOMContentLoaded", () => {
  // 1. Real-time Clock Header
  function updateClock() {
    const clockElem = document.getElementById("current-time");
    if (clockElem) {
      const now = new Date();
      clockElem.innerText = now.toLocaleTimeString("id-ID");
    }
  }
  setInterval(updateClock, 1000);
  updateClock();

  // 2. Slider Servo Angle & Preset Buttons
  const servoSlider = document.getElementById("servo-angle");
  const angleVal = document.getElementById("angle-val");
  const presetBtns = document.querySelectorAll(".btn-preset");

  if (servoSlider && angleVal) {
    servoSlider.addEventListener("input", (e) => {
      angleVal.innerText = e.target.value;
    });
  }

  presetBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const angle = btn.getAttribute("data-angle");
      if (servoSlider && angleVal) {
        servoSlider.value = angle;
        angleVal.innerText = angle;
      }
    });
  });

  // 3. Generator Data Dummy / Simulasi (Lengkap dengan Sensor ATS & Monitoring Baru)
  const simToggle = document.getElementById("toggle-sim-data");
  let simInterval = null;

  if (simToggle) {
    simToggle.addEventListener("change", (e) => {
      const espBadgeDesktop = document.getElementById("esp-status");
      const espBadgeMobile = document.getElementById("esp-status-mobile");

      const updateBadges = (className, text) => {
        if (espBadgeDesktop) {
          espBadgeDesktop.className = className;
          espBadgeDesktop.innerText = text;
        }
        if (espBadgeMobile) {
          espBadgeMobile.className = className;
          espBadgeMobile.innerText = text;
        }
      };

      if (e.target.checked) {
        updateBadges("badge bg-success", "Simulated");

        simInterval = setInterval(() => {
          // A. Parameter Solar Panel & Charger
          const solarVin = (Math.random() * (21 - 17) + 17).toFixed(1);
          const solarVout = (Math.random() * (14.5 - 12.5) + 12.5).toFixed(1);
          const solarI = (Math.random() * (3.5 - 0.5) + 0.5).toFixed(1);
          const batV = (Math.random() * (13.8 - 11.5) + 11.5).toFixed(1);
          const batLevel = Math.round(((batV - 11) / (13.8 - 11)) * 100);

          // B. Sensor Lingkungan & LDR
          const ldr1 = Math.floor(Math.random() * (900 - 100) + 100);
          const ldr2 = Math.floor(Math.random() * (900 - 100) + 100);
          const hum = Math.floor(Math.random() * (85 - 50) + 50);

          // C. PLN
          const plnV = Math.floor(Math.random() * (230 - 215) + 215);

          // Update Tampilan Menu Utama (index.html)
          const valSolarPower = document.getElementById("val-solar-power");
          const valBatteryLevel = document.getElementById("val-battery-level");
          if (valSolarPower) valSolarPower.innerText = (solarVout * solarI).toFixed(0);
          if (valBatteryLevel) valBatteryLevel.innerText = Math.min(100, Math.max(0, batLevel));

          // Update Tampilan Menu Monitoring (monitoring.html)
          const monHumidity = document.getElementById("mon-humidity");
          const monLdr1 = document.getElementById("mon-ldr-1");
          const monLdr2 = document.getElementById("mon-ldr-2");
          const monSolarVin = document.getElementById("mon-solar-v-in");
          const monSolarVout = document.getElementById("mon-solar-v-out");
          const monSolarI = document.getElementById("mon-solar-i");
          const monChargerVin = document.getElementById("mon-charger-v-in");
          const monBatV = document.getElementById("mon-bat-v");
          const monPlnV = document.getElementById("mon-pln-v");
          const monChargingStatus = document.getElementById("mon-charging-status");

          if (monHumidity) monHumidity.innerText = hum;
          if (monLdr1) monLdr1.innerText = ldr1;
          if (monLdr2) monLdr2.innerText = ldr2;
          if (monSolarVin) monSolarVin.innerText = solarVin;
          if (monSolarVout) monSolarVout.innerText = solarVout;
          if (monSolarI) monSolarI.innerText = solarI;
          if (monChargerVin) monChargerVin.innerText = solarVout;
          if (monBatV) monBatV.innerText = batV;
          if (monPlnV) monPlnV.innerText = plnV;

          if (monChargingStatus) {
            if (parseFloat(solarI) > 0.8) {
              monChargingStatus.className = "badge bg-success";
              monChargingStatus.innerText = "Charging";
            } else {
              monChargingStatus.className = "badge bg-secondary";
              monChargingStatus.innerText = "Standby";
            }
          }
        }, 2000);
      } else {
        clearInterval(simInterval);
        updateBadges("badge bg-danger", "Disconnected");
      }
    });
  }

  // 4. Logic Mode Otomatis vs Manual & Locks Input Kontrol
  const switchAutoMode = document.getElementById("switch-auto-mode");
  const labelMode = document.getElementById("label-mode");
  const allManualInputs = document.querySelectorAll(
    ".switch-lamp, .switch-socket, #servo-angle, .btn-preset, #switch-ats-source"
  );

  if (switchAutoMode) {
    switchAutoMode.addEventListener("change", (e) => {
      const isAuto = e.target.checked;
      if (labelMode) labelMode.innerText = isAuto ? "Otomatis" : "Manual";

      // Enable / Disable seluruh kontrol manual berdasarkan sakelar
      allManualInputs.forEach((input) => {
        input.disabled = isAuto;
      });

      // Jika berpindah ke Otomatis, nyalakan lampu secara otomatis
      if (isAuto) {
        setLampState(1, true);
        setLampState(2, true);
        setLampState(3, true);
        setLampState(4, true);
      }
    });
  }

  // 5. Bypass ATS Switch
  const atsSwitch = document.getElementById("switch-ats-source");
  const labelAts = document.getElementById("label-ats-source");

  if (atsSwitch) {
    atsSwitch.addEventListener("change", (e) => {
      if (labelAts) {
        if (e.target.checked) {
          labelAts.className = "badge bg-danger text-white";
          labelAts.innerText = "Listrik PLN (Bypass)";
        } else {
          labelAts.className = "badge bg-warning text-dark";
          labelAts.innerText = "Solar Panel / Aki";
        }
      }
    });
  }

  // 6. Logic Sakelar Lampu
  const lampSwitches = document.querySelectorAll(".switch-lamp");
  lampSwitches.forEach((sw) => {
    sw.addEventListener("change", (e) => {
      const id = e.target.getAttribute("data-target");
      setLampState(id, e.target.checked);
    });
  });

  function setLampState(id, isOn) {
    const icon = document.getElementById(`icon-lamp-${id}`);
    const box = document.getElementById(`box-lamp-${id}`);
    const input = document.getElementById(`lamp-${id}`);

    if (input) input.checked = isOn;

    if (isOn) {
      if (icon) icon.className = "fa-solid fa-lightbulb text-warning fa-2x mb-2 icon-pulse";
      if (box) box.classList.add("border-warning", "bg-light");
    } else {
      if (icon) icon.className = "fa-solid fa-lightbulb text-secondary fa-2x mb-2";
      if (box) box.classList.remove("border-warning", "bg-light");
    }
  }

  // 7. Logic Sakelar Stop Kontak
  const socketSwitches = document.querySelectorAll(".switch-socket");
  socketSwitches.forEach((sw) => {
    sw.addEventListener("change", (e) => {
      const id = e.target.getAttribute("data-target");
      setSocketState(id, e.target.checked);
    });
  });

  function setSocketState(id, isOn) {
    const icon = document.getElementById(`icon-socket-${id}`);
    const box = document.getElementById(`box-socket-${id}`);

    if (isOn) {
      if (icon) icon.className = "fa-solid fa-plug text-danger fa-2x mb-2";
      if (box) box.classList.add("border-danger", "bg-light");
    } else {
      if (icon) icon.className = "fa-solid fa-plug text-secondary fa-2x mb-2";
      if (box) box.classList.remove("border-danger", "bg-light");
    }
  }
});