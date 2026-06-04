/* Brand Center Interactivity & Growth Telemetry - Beija-Flor Rebranding */

// Global Error Handler for remote debugging
window.onerror = function(message, source, lineno, colno, error) {
  alert("Erro de Script:\n" + message + "\nLinha: " + lineno + "\nArquivo: " + source);
  return false;
};

// Inline fallback JSON data in case CORS blocks fetch (e.g., when opening index.html directly from local folder)
const fallbackBrandData = {
  "visual_identity": {
    "color_palette": [
      {
        "name": "Verde Floresta",
        "role": "Cor Primária",
        "hex": "#0A3C36",
        "rgb": "rgb(10, 60, 54)",
        "hsl": "hsl(173, 71%, 14%)",
        "description": "Inspirada no coração da Mata Atlântica de Ilhabela. Transmite estabilidade, compromisso ecológico, profundidade e prestígio."
      },
      {
        "name": "Dourado Areia",
        "role": "Cor Secundária",
        "hex": "#D4A373",
        "rgb": "rgb(212, 163, 115)",
        "hsl": "hsl(30, 53%, 64%)",
        "description": "Representa o brilho do sol, a areia dourada e a energia vibrante do beija-flor. Traz calor e sofisticação à identidade visual."
      },
      {
        "name": "Verde Selva Médio",
        "role": "Cor de Apoio / Destaques",
        "hex": "#1E8276",
        "rgb": "rgb(30, 130, 118)",
        "hsl": "hsl(173, 63%, 31%)",
        "description": "Usado para botões, links ativos e elementos que precisam de destaque visual sem perder a harmonia com o tom escuro."
      },
      {
        "name": "Creme Orgânico",
        "role": "Fundo Claro / Neutro",
        "hex": "#FDFBF7",
        "rgb": "rgb(253, 251, 247)",
        "hsl": "hsl(40, 43%, 98%)",
        "description": "Substitui o branco clínico frio. Proporciona um fundo limpo, confortável para os olhos, que remete à suavidade e pureza do ambiente sanitizado."
      },
      {
        "name": "Terracota Suave",
        "role": "Destaque de Alerta",
        "hex": "#E29578",
        "rgb": "rgb(226, 149, 120)",
        "hsl": "hsl(16, 66%, 68%)",
        "description": "Cor de destaque secundário para alertas, botões de ação secundária e notas importantes, complementando os tons de verde."
      }
    ]
  }
};

document.addEventListener("DOMContentLoaded", () => {
  // 1. CHANNELS & TELEMETRY CONFIGURATION
  const NTFY_TOPIC = "beijaflor_thiago_pitch";
  const NTFY_URL = `https://ntfy.sh/${NTFY_TOPIC}`;
  
  // Local telemetry state
  let sessionLogs = [];
  let totalTimeSeconds = 0;
  let viewedSections = new Set(["strategy"]); // Strategy is viewed by default
  let isSoundEnabled = true;
  let brandData = fallbackBrandData;

  // Track session start
  logAction("Sessão Iniciada", "Brand Center carregado.");
  sendNtfyNotification("Nova Acesso", "Alguém abriu a proposta do Rebrand Beija-Flor. 🚀", 4);

  // Time tracker loop
  setInterval(() => {
    totalTimeSeconds++;
    updateAnalyticsDisplay();
    // Send active session ping every 2 minutes
    if (totalTimeSeconds % 120 === 0) {
      sendNtfyNotification("Acesso Ativo", `O cliente continua lendo a proposta. Tempo: ${formatTime(totalTimeSeconds)} ⏳`, 2);
    }
  }, 1000);

  // 2. DATA LOADING (JSON)
  fetch('data/brand_manual.json')
    .then(res => {
      if (!res.ok) throw new Error("CORS or File system restriction");
      return res.json();
    })
    .then(data => {
      brandData = data;
      renderColors();
    })
    .catch(err => {
      console.log("Using local fallback brand data:", err.message);
      renderColors();
    });

  // 3. SOUND SYNTHESIZER (Web Audio API - Instantiated lazily to prevent load crash)
  let audioCtx = null;
  
  function playSound(type) {
    if (!isSoundEnabled) return;
    
    try {
      // Lazy instantiation on first user action
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } 
      else if (type === 'swoosh') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } 
      else if (type === 'success') {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const o = audioCtx.createOscillator();
          const g = audioCtx.createGain();
          o.connect(g);
          g.connect(audioCtx.destination);
          o.type = 'sine';
          o.frequency.setValueAtTime(freq, now + idx * 0.06);
          g.gain.setValueAtTime(0.04, now + idx * 0.06);
          g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);
          o.start(now + idx * 0.06);
          o.stop(now + idx * 0.06 + 0.25);
        });
      } 
      else if (type === 'chirp') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1500, now);
        osc.frequency.exponentialRampToValueAtTime(2200, now + 0.06);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
        
        setTimeout(() => {
          if (!audioCtx) return;
          const o2 = audioCtx.createOscillator();
          const g2 = audioCtx.createGain();
          o2.connect(g2);
          g2.connect(audioCtx.destination);
          o2.type = 'sine';
          o2.frequency.setValueAtTime(1600, audioCtx.currentTime);
          o2.frequency.exponentialRampToValueAtTime(2400, audioCtx.currentTime + 0.06);
          g2.gain.setValueAtTime(0.04, audioCtx.currentTime);
          g2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);
          o2.start(audioCtx.currentTime);
          o2.stop(audioCtx.currentTime + 0.06);
        }, 80);
      }
    } catch(e) {
      console.log("Audio Web API error:", e);
    }
  }

  // Sound Toggle Button listener
  const soundToggleBtn = document.getElementById("btn-sound-toggle");
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener("click", () => {
      isSoundEnabled = !isSoundEnabled;
      soundToggleBtn.classList.toggle("muted", !isSoundEnabled);
      soundToggleBtn.innerHTML = isSoundEnabled ? "🔊 Efeitos Sonoros" : "🔇 Efeitos Sonoros";
      logAction("Sons Alterados", isSoundEnabled ? "Sons Ativados" : "Sons Mutados");
      playSound('click');
    });
  }

  // 4. SIDEBAR NAVIGATION & BREADCRUMBS
  const menuItems = document.querySelectorAll(".menu-item");
  const sections = document.querySelectorAll(".content-section");
  const breadcrumbCurrent = document.getElementById("active-breadcrumb");

  menuItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      playSound('swoosh');
      
      // Update active navigation state
      menuItems.forEach(mi => mi.classList.remove("active"));
      item.classList.add("active");
      
      // Update breadcrumbs
      const sectionName = item.textContent.trim();
      breadcrumbCurrent.textContent = sectionName;
      
      // Switch sections
      const targetId = item.getAttribute("data-target");
      sections.forEach(sec => {
        sec.classList.remove("active");
        if (sec.id === `${targetId}-section`) {
          sec.classList.add("active");
        }
      });
      
      // Track progress
      if (!viewedSections.has(targetId)) {
        viewedSections.add(targetId);
        updateProgress();
      }
      
      logAction("Visualizou Seção", sectionName);
      sendNtfyNotification("Secao Visualizada", `Cliente está lendo: "${sectionName}" 👁️`, 2);
      
      // Scroll content to top
      document.querySelector(".brandcenter-main").scrollTop = 0;
    });
  });

  // 5. INTERACTIVE LOGO PLAYGROUND
  const colorBtns = document.querySelectorAll(".color-btn");
  const logoCanvas = document.getElementById("logo-canvas");
  const logoSvg = document.getElementById("interactive-logo-svg");
  
  colorBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      playSound('click');
      colorBtns.forEach(cb => cb.classList.remove("active"));
      btn.classList.add("active");
      
      const color = btn.getAttribute("data-color");
      logoCanvas.style.backgroundColor = color;
      logAction("Logo Playground", `Cor de fundo alterada para: ${color}`);
    });
  });

  // Logo Click Flutter Easter Egg
  if (logoCanvas && logoSvg) {
    logoCanvas.addEventListener("click", () => {
      playSound('chirp');
      triggerConfettiExplosion(0.5);
      logoSvg.style.transform = "scale(1.1) rotate(5deg)";
      setTimeout(() => {
        logoSvg.style.transform = "scale(1) rotate(0deg)";
      }, 300);
      logAction("Easter Egg Logo", "Clicou no beija-flor e ouviu o cantar!");
    });
  }

  // Sidebar Logo Easter Egg
  const sidebarLogoSvg = document.getElementById("sidebar-logo-svg");
  if (sidebarLogoSvg) {
    sidebarLogoSvg.addEventListener("click", () => {
      playSound('chirp');
      triggerConfettiExplosion(0.2);
      logAction("Easter Egg Logo", "Clicou no beija-flor da barra lateral.");
    });
  }

  // Approve Logo button
  const approveLogoBtn = document.getElementById("btn-approve-logo");
  if (approveLogoBtn) {
    approveLogoBtn.addEventListener("click", () => {
      playSound('success');
      triggerConfettiExplosion(1.0);
      logAction("Logo Aprovada", "Clicou no botão de aprovação da Logo.");
      sendNtfyNotification("Logo Aprovada", "O cliente aprovou o conceito da logo pelo portal! 🎉", 4);
      alert("Sensacional! A nova logomarca foi marcada como Aprovada. Thiago foi notificado da sua escolha! 🚀");
    });
  }

  // 6. WEBSITE PREVIEW DEVICE TOGGLES & PROTOTYPE BINDING
  const deviceBtns = document.querySelectorAll(".device-btn");
  const iframeFrame = document.getElementById("iframe-device-frame");

  deviceBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      playSound('click');
      deviceBtns.forEach(db => db.classList.remove("active"));
      btn.classList.add("active");
      
      const device = btn.getAttribute("data-device");
      iframeFrame.className = `iframe-wrapper ${device}`;
      logAction("Website Simulator", `Visualização alterada para: ${device}`);
    });
  });

  // Listener to receive messages from the iframe website preview
  window.addEventListener("message", (event) => {
    if (event.data && event.data.type === "budget_simulated") {
      const budgetDetail = event.data.details;
      logAction("Simulou Orçamento", `Imóvel: ${budgetDetail.type}, Tamanho: ${budgetDetail.size}, Valor: ${budgetDetail.price}`);
      sendNtfyNotification("Orcamento Simulado", `Cliente simulou: Imóvel ${budgetDetail.type.toUpperCase()}, Área: ${budgetDetail.size}, Valor: ${budgetDetail.price} 💰`, 3);
      playSound('success');
      triggerConfettiExplosion(0.5);
    }
  });

  // 7. COLORS GRID RENDER & CLIPBOARD COPYING
  function renderColors() {
    const container = document.getElementById("colors-grid-container");
    if (!container) return;
    
    container.innerHTML = ""; // Clear loader
    const colors = brandData.visual_identity.color_palette;
    
    colors.forEach(color => {
      const row = document.createElement("div");
      row.className = "color-card-row";
      row.title = "Clique para copiar o código HEX";
      
      row.innerHTML = `
        <div class="color-swatch" style="background-color: ${color.hex};"></div>
        <div class="color-meta-info">
          <h4>${color.name}</h4>
          <p>${color.role} &bull; ${color.description}</p>
        </div>
        <div class="color-codes-group">
          <span class="color-hex">${color.hex}</span>
          <span class="color-copy-label">Copiar HEX</span>
        </div>
      `;
      
      row.addEventListener("click", () => {
        copyToClipboard(color.hex, color.name);
      });
      
      container.appendChild(row);
    });
  }

  // Copy Color Swatch
  function copyToClipboard(hex, name) {
    playSound('click');
    triggerConfettiExplosion(0.3); // Dopamine hit!
    
    navigator.clipboard.writeText(hex).then(() => {
      showToast(`Código ${name} (${hex}) copiado! 🎉`);
      logAction("Copiou Cor", `Copiou HEX de ${name} (${hex})`);
    }).catch(err => {
      const el = document.createElement('textarea');
      el.value = hex;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      showToast(`Código ${name} (${hex}) copiado! 🎉`);
      logAction("Copiou Cor (Fallback)", `Copiou HEX de ${name} (${hex})`);
    });
  }

  // Toast Notification
  function showToast(message) {
    const existingToast = document.querySelector(".toast");
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.4s ease";
      setTimeout(() => {
        toast.remove();
      }, 400);
    }, 2000);
  }

  // 8. DOPAMINE MICRO-FEEDBACK WIDGETS
  const feedbackBtns = document.querySelectorAll(".feedback-btn");
  feedbackBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      playSound('success');
      triggerConfettiExplosion(0.6);
      
      const reaction = btn.getAttribute("data-reaction");
      const section = btn.getAttribute("data-section");
      
      const parent = btn.closest(".feedback-buttons");
      parent.innerHTML = "<span style='color: var(--brand-secondary); font-size:12px; font-weight:700;'>Obrigado pelo feedback! ❤️</span>";
      
      logAction("Feedback Enviado", `Seção: ${section}, Reação: ${reaction}`);
      sendNtfyNotification("Feedback Recebido", `Cliente reagiu como "${reaction.toUpperCase()}" na seção "${section}" 👍`, 3);
    });
  });

  // 9. PROGRESS BAR & CONGRATS POPUP
  const totalSections = 7;
  const congratsPopup = document.getElementById("congrats-popup");
  const closeCongratsBtn = document.getElementById("btn-close-congrats");
  const congratsCta = document.getElementById("btn-congrats-cta");

  function updateProgress() {
    const percentage = Math.round((viewedSections.size / totalSections) * 100);
    const progressBar = document.getElementById("reading-progress");
    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
    }
    
    if (viewedSections.size === totalSections) {
      setTimeout(() => {
        playSound('success');
        triggerConfettiExplosion(1.0);
        setTimeout(() => triggerConfettiExplosion(0.8), 200);
        
        if (congratsPopup) {
          congratsPopup.classList.add("active");
        }
        
        logAction("Proposta Concluída", "Leu todas as seções da proposta.");
        sendNtfyNotification("Proposta Concluida", "O cliente visualizou TODAS as seções da proposta comercial! 🏆", 5);
      }, 800);
    }
  }

  if (closeCongratsBtn && congratsPopup) {
    closeCongratsBtn.addEventListener("click", () => {
      playSound('click');
      congratsPopup.classList.remove("active");
    });
  }

  if (congratsCta) {
    congratsCta.addEventListener("click", () => {
      playSound('success');
      logAction("Click CTA Final", "Clicou no CTA de WhatsApp do popup de parabéns.");
      sendNtfyNotification("Click CTA WhatsApp", "O cliente clicou no WhatsApp final para fechar o projeto! 🚀", 5);
    });
  }

  // Bind meeting CTA links click
  const ctaWhatsLinks = [
    document.getElementById("cta-header-whats"),
    document.getElementById("sticky-whats-cta")
  ];
  
  ctaWhatsLinks.forEach(link => {
    if (link) {
      link.addEventListener("click", () => {
        playSound('success');
        logAction("Click WhatsApp CTA", `Clicou no botão WhatsApp: ${link.id}`);
        sendNtfyNotification("Click CTA WhatsApp", `Cliente clicou no CTA do botão: ${link.id} 🔥`, 5);
      });
    }
  });

  // 10. SECRET GROWTH & TELEMETRY PANEL (Ctrl+Shift+A toggle)
  const analyticsPanel = document.getElementById("analytics-panel");
  const closeAnalyticsBtn = document.getElementById("btn-close-analytics");

  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === "A") {
      e.preventDefault();
      playSound('swoosh');
      analyticsPanel.classList.toggle("active");
      logAction("Painel Oculto", "Thiago abriu o painel oculto de telemetria.");
    }
  });

  if (closeAnalyticsBtn && analyticsPanel) {
    closeAnalyticsBtn.addEventListener("click", () => {
      playSound('click');
      analyticsPanel.classList.remove("active");
    });
  }

  function logAction(action, detail) {
    const timestamp = new Date().toLocaleTimeString();
    sessionLogs.unshift({ timestamp, action, detail });
    if (sessionLogs.length > 50) sessionLogs.pop();
    updateAnalyticsDisplay();
  }

  function updateAnalyticsDisplay() {
    const statViews = document.getElementById("stat-views");
    const statTime = document.getElementById("stat-time");
    const statProgress = document.getElementById("stat-progress");
    const logList = document.getElementById("analytics-log-list");

    if (statViews) statViews.textContent = "1";
    if (statTime) statTime.textContent = formatTime(totalTimeSeconds);
    if (statProgress) statProgress.textContent = `${Math.round((viewedSections.size / totalSections) * 100)}%`;

    if (logList) {
      logList.innerHTML = sessionLogs.map(log => 
        `<li>[${log.timestamp}] <span>${log.action}</span>: ${log.detail}</li>`
      ).join("");
    }
  }

  // 11. CONFETTI HELPER
  function triggerConfettiExplosion(scalarValue = 1.0) {
    if (typeof confetti === "function") {
      confetti({
        particleCount: Math.round(80 * scalarValue),
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0A3C36', '#D4A373', '#1E8276', '#E29578', '#FDFBF7']
      });
    } else {
      console.log("Confetti triggered!");
    }
  }

  // 12. TELEMETRY NOTIFIER SEND (Clean ASCII headers ONLY to prevent TypeError crash!)
  function sendNtfyNotification(title, message, priority = 3) {
    // We clean the Title header to only use simple ASCII characters.
    // The rich UTF-8 message (with emojis & accents) is sent in the body.
    const cleanTitle = title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[^\x00-\x7F]/g, "");    // Remove non-ASCII (emojis)

    fetch(NTFY_URL, {
      method: "POST",
      body: message,
      headers: {
        "Title": cleanTitle,
        "Priority": priority.toString(),
        "Tags": "beijaflor,brandcenter,rebrand"
      }
    })
    .then(res => {
      if (!res.ok) console.log("Ntfy failed to send");
    })
    .catch(err => {
      console.log("Telemetry network offline:", err.message);
    });
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
});
