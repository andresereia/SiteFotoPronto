// --- 1. CONFIGURAÇÃO CENTRAL DO WHATSAPP ---
const whatsappConfig = {
  number: "5565992726478",
  message: "Olá! Vim pelo site do FotoPronto e quero melhorar minhas fotos.",
};

const apiKey = ""; // Placeholder

// --- HELPERS PARA EMOJIS (ASCII SAFE) ---
function getEmoji(type) {
  if (type === "user") return String.fromCodePoint(0x1f464);
  if (type === "package") return String.fromCodePoint(0x1f4e6);
  if (type === "money") return String.fromCodePoint(0x1f4b0);
  if (type === "clock") return String.fromCodePoint(0x1f570);
  return "";
}

// --- 2. LÓGICA GERAL E MODAL ---
document.addEventListener("DOMContentLoaded", function () {
  // Slider init
  const sliders = document.querySelectorAll(
    ".comparison-slider, .style-slider-container"
  );
  sliders.forEach((slider) => {
    const resizeDiv = slider.querySelector(".resize-image");
    const handle = slider.querySelector(".handle");

    const overlay = slider.querySelector(".style-slider-overlay");
    const sHandle = slider.querySelector(".style-slider-handle");

    let isDown = false;

    const move = (e) => {
      const rect = slider.getBoundingClientRect();
      let x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      if (x < 0) x = 0;
      if (x > rect.width) x = rect.width;
      const percent = (x / rect.width) * 100;

      if (resizeDiv && handle) {
        resizeDiv.style.width = percent + "%";
        handle.style.left = percent + "%";
      }
      if (overlay && sHandle) {
        overlay.style.width = percent + "%";
        sHandle.style.left = percent + "%";
      }
    };

    slider.addEventListener("mousedown", (e) => {
      isDown = true;
      move(e);
    });
    window.addEventListener("mouseup", () => (isDown = false));
    slider.addEventListener("mousemove", (e) => {
      if (isDown) move(e);
    });

    slider.addEventListener(
      "touchstart",
      (e) => {
        isDown = true;
        move(e.touches[0]);
      },
      { passive: false }
    );
    window.addEventListener("touchend", () => (isDown = false));
    slider.addEventListener(
      "touchmove",
      (e) => {
        if (isDown) {
          e.preventDefault();
          move(e);
        }
      },
      { passive: false }
    );
  });

  // Standard buttons logic
  const standardButtons = document.querySelectorAll(
    ".wa-hero-btn, .wa-link-btn"
  );
  standardButtons.forEach((btn) => {
    const msg = btn.getAttribute("data-message") || whatsappConfig.message;
    const url = `https://wa.me/${
      whatsappConfig.number
    }?text=${encodeURIComponent(msg)}`;
    btn.href = url;
  });

  // Meta Pixel + GA4: track WhatsApp contact before redirect (links only)
  const waTrackButtons = document.querySelectorAll(
    ".wa-link-btn, .wa-hero-btn"
  );
  waTrackButtons.forEach((btn) => {
    if (btn.dataset.trackBound === "true") return;
    btn.dataset.trackBound = "true";

    btn.addEventListener("click", (e) => {
      if (btn.dataset.trackPending === "true") return;
      btn.dataset.trackPending = "true";

      const fireEvents = () => {
        if (typeof fbq === "function") {
          fbq("track", "Contact");
        }
        if (typeof gtag === "function") {
          gtag("event", "whatsapp_click");
        }
      };

      // Buttons: fire and keep existing behavior
      if (btn.tagName === "BUTTON") {
        fireEvents();
        setTimeout(() => {
          btn.dataset.trackPending = "false";
        }, 300);
        return;
      }

      const isModifiedClick =
        e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
      if (isModifiedClick) {
        btn.dataset.trackPending = "false";
        return;
      }

      const href =
        (btn.tagName === "A" && btn.href) ||
        btn.getAttribute("href") ||
        btn.getAttribute("data-href") ||
        btn.getAttribute("data-url");

      if (!href) {
        btn.dataset.trackPending = "false";
        return;
      }

      e.preventDefault();
      fireEvents();

      setTimeout(() => {
        window.location.href = href;
      }, 300);
    });
  });

  // Meta Pixel: ViewContent when "Escolha seu estilo" section is visible
  const sections = Array.from(document.querySelectorAll("section"));
  let targetSection = sections.find((section) => {
    const h2 = section.querySelector("h2");
    return (
      h2 &&
      h2.textContent.trim().toLowerCase() === "escolha seu estilo"
    );
  });

  if (!targetSection) {
    const h2 = Array.from(document.querySelectorAll("h2")).find(
      (el) => el.textContent.trim().toLowerCase() === "escolha seu estilo"
    );
    targetSection = h2?.closest("section") || null;
  }

  if (targetSection && "IntersectionObserver" in window) {
    let viewContentFired = false;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !viewContentFired) {
            viewContentFired = true;
            if (typeof fbq === "function") {
              fbq("track", "ViewContent");
            }
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(targetSection);
  }

  // GA4: scroll 50% once
  let scroll50Fired = false;
  const onScroll = () => {
    if (scroll50Fired || typeof gtag !== "function") return;
    const doc = document.documentElement;
    const scrollTop = window.pageYOffset || doc.scrollTop || 0;
    const scrollHeight = doc.scrollHeight || 0;
    const clientHeight = window.innerHeight || doc.clientHeight || 0;
    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll <= 0) return;
    if (scrollTop / maxScroll >= 0.5) {
      scroll50Fired = true;
      gtag("event", "scroll_50");
      window.removeEventListener("scroll", onScroll);
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // GA4: engaged_30s with visibility pause
  let engagedFired = false;
  let remainingMs = 30000;
  let engagedTimeout = null;
  let visibleStart = null;

  const startEngagedTimer = () => {
    if (engagedFired || remainingMs <= 0) return;
    visibleStart = Date.now();
    engagedTimeout = setTimeout(() => {
      if (typeof gtag === "function" && !engagedFired) {
        engagedFired = true;
        gtag("event", "engaged_30s");
      }
    }, remainingMs);
  };

  const stopEngagedTimer = () => {
    if (engagedTimeout) clearTimeout(engagedTimeout);
    engagedTimeout = null;
    if (visibleStart) {
      remainingMs -= Date.now() - visibleStart;
      visibleStart = null;
    }
  };

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      startEngagedTimer();
    } else {
      stopEngagedTimer();
    }
  });

  if (document.visibilityState === "visible") {
    startEngagedTimer();
  }

  // Close Policies Modal Logic
  const policiesModal = document.getElementById("policiesModal");
  if (policiesModal) {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !policiesModal.classList.contains("hidden")) {
        policiesModal.classList.add("hidden");
      }
    });

    policiesModal.addEventListener("click", (e) => {
      if (e.target === policiesModal) {
        policiesModal.classList.add("hidden");
      }
    });
  }
});

// ===== Modal (Simulador de Pedido) =====
function openOrderModal() {
  const modal = document.getElementById("orderModal");
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("overflow-hidden");
}

function closeOrderModal() {
  const modal = document.getElementById("orderModal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("overflow-hidden");
}

// Fecha no ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const modal = document.getElementById("orderModal");
    if (modal && !modal.classList.contains("hidden")) closeOrderModal();
  }
});

// --- 3. LÓGICA DO SIMULADOR (WIZARD) ---
let currentStep = 1;
const initialData = {
  qty: 0,
  price: 0,
  pkgName: "",
  styles: [],
  restoration: { qty: 0, price: 0 },
  customer: { name: "", phone: "", email: "" },
};

let selectedData = JSON.parse(JSON.stringify(initialData));
const steps = 4;
const phone = "5565992726478";

function saveProgress() {
  if (document.getElementById("customerName")) {
    selectedData.customer.name = document.getElementById("customerName").value;
    selectedData.customer.phone =
      document.getElementById("customerPhone").value;
    selectedData.customer.email =
      document.getElementById("customerEmail").value;
  }
  const state = { step: currentStep, data: selectedData };
  localStorage.setItem("fotoProntoState", JSON.stringify(state));
}

function loadProgress() {
  const saved = localStorage.getItem("fotoProntoState");
  if (saved) {
    const state = JSON.parse(saved);
    selectedData = state.data;

    if (typeof selectedData.styles === "undefined" && selectedData.style) {
      selectedData.styles = [selectedData.style];
    } else if (!selectedData.styles) {
      selectedData.styles = [];
    }

    currentStep = state.step;

    if (currentStep === 4) {
      setTimeout(() => {
        document.getElementById("customerName").value =
          selectedData.customer.name || "";
        document.getElementById("customerPhone").value =
          selectedData.customer.phone || "";
        document.getElementById("customerEmail").value =
          selectedData.customer.email || "";
        validateForm();
      }, 100);
    }

    restoreVisuals();
  }
  updateUI();
}

function restoreVisuals() {
  if (selectedData.qty > 0) {
    const qtyCard = document.querySelector(
      `#step1 .option-card[onclick*="${selectedData.qty},"]`
    );
    if (qtyCard) qtyCard.classList.add("selected");
  }

  if (selectedData.styles && selectedData.styles.length > 0) {
    selectedData.styles.forEach((style) => {
      const buttons = document.querySelectorAll("#step2 .option-style");
      buttons.forEach((btn) => {
        if (btn.innerText.includes(style)) btn.classList.add("selected");
      });
    });
  }

  if (selectedData.restoration.qty > 0) {
    const restCard = document.querySelector(
      `#step3 .option-card[onclick*="${selectedData.restoration.qty},"]`
    );
    if (restCard) restCard.classList.add("selected");
  }
}

function updateUI() {
  document.querySelectorAll(".step").forEach((el, index) => {
    el.classList.toggle("active", index + 1 === currentStep);
  });

  const progress = ((currentStep - 1) / (steps - 1)) * 100;
  const progressBar = document.getElementById("progressBar");
  if (progressBar) progressBar.style.width = `${progress}%`;

  document.querySelectorAll(".step-indicator").forEach((el, index) => {
    if (index + 1 <= currentStep) {
      el.classList.remove("bg-gray-200", "text-gray-500");
      el.classList.add("bg-brand-orange", "text-white");
    } else {
      el.classList.add("bg-gray-200", "text-gray-500");
      el.classList.remove("bg-brand-orange", "text-white");
    }
  });

  const styleSubtitle = document.getElementById("styleSubtitle");
  if (currentStep === 2 && styleSubtitle) {
    if (selectedData.qty === 10) {
      styleSubtitle.innerHTML = `<span class="text-brand-orange font-bold">Pacote 10 Fotos:</span> Escolha até <span class="font-bold">2 estilos</span>.`;
    } else {
      styleSubtitle.innerText = "Escolha o estilo ideal para suas fotos.";
    }
  }

  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const navButtons = document.getElementById("navButtons");

  if (prevBtn)
    prevBtn.style.visibility = currentStep === 1 ? "hidden" : "visible";

  if (navButtons && currentStep === steps) {
    navButtons.style.display = "none";
    updateSummary();
  } else if (navButtons) {
    navButtons.style.display = "flex";
    let canProceed = false;

    if (currentStep === 1 && selectedData.qty > 0) canProceed = true;
    if (currentStep === 2 && selectedData.styles.length > 0) canProceed = true;
    if (currentStep === 3) canProceed = true;

    if (nextBtn) nextBtn.disabled = !canProceed;
  }

  saveProgress();
}

function changeStep(dir) {
  currentStep += dir;
  if (currentStep < 1) currentStep = 1;
  if (currentStep > steps) currentStep = steps;
  updateUI();
}

function selectQty(qty, price, pkgName, el) {
  selectedData.qty = qty;
  selectedData.price = price;
  selectedData.pkgName = pkgName;
  selectedData.styles = [];

  document
    .querySelectorAll("#step2 .option-style")
    .forEach((c) => c.classList.remove("selected"));
  document
    .querySelectorAll("#step1 .option-card")
    .forEach((c) => c.classList.remove("selected"));
  el.classList.add("selected");

  updateUI();
  setTimeout(() => {
    changeStep(1);
  }, 300);
}

function selectStyle(styleName, el) {
  const isMultiSelect = selectedData.qty === 10;

  if (isMultiSelect) {
    const index = selectedData.styles.indexOf(styleName);

    if (index > -1) {
      selectedData.styles.splice(index, 1);
      el.classList.remove("selected");
    } else {
      if (selectedData.styles.length < 2) {
        selectedData.styles.push(styleName);
        el.classList.add("selected");
      } else {
        const firstStyle = selectedData.styles[0];
        const buttons = document.querySelectorAll("#step2 .option-style");
        buttons.forEach((btn) => {
          if (btn.innerText.includes(firstStyle))
            btn.classList.remove("selected");
        });
        selectedData.styles.shift();
        selectedData.styles.push(styleName);
        el.classList.add("selected");
      }
    }
  } else {
    selectedData.styles = [styleName];
    document
      .querySelectorAll("#step2 .option-style")
      .forEach((c) => c.classList.remove("selected"));
    el.classList.add("selected");
    setTimeout(() => {
      changeStep(1);
    }, 300);
  }

  updateUI();
}

function selectRestoration(qty, price, el) {
  selectedData.restoration.qty = qty;
  selectedData.restoration.price = price;

  document
    .querySelectorAll("#step3 .option-card")
    .forEach((c) => c.classList.remove("selected"));
  el.classList.add("selected");

  updateUI();
  setTimeout(() => {
    changeStep(1);
  }, 300);
}

function skipRestoration() {
  selectedData.restoration.qty = 0;
  selectedData.restoration.price = 0;
  document
    .querySelectorAll("#step3 .option-card")
    .forEach((c) => c.classList.remove("selected"));
  changeStep(1);
}

function validateForm() {
  const name = document.getElementById("customerName")?.value.trim() || "";
  const phoneVal = document.getElementById("customerPhone")?.value.trim() || "";
  const btn = document.getElementById("finalWhatsappBtn");
  if (!btn) return;

  const isValid = name.length > 2 && phoneVal.length > 8;

  if (isValid) {
    btn.classList.remove("bg-gray-300", "pointer-events-none", "opacity-70");
    btn.classList.add("bg-green-500", "hover:bg-green-600");
    btn.style.pointerEvents = "auto";
    updateSummary();
  } else {
    btn.classList.add("bg-gray-300", "pointer-events-none", "opacity-70");
    btn.classList.remove("bg-green-500", "hover:bg-green-600");
    btn.style.pointerEvents = "none";
  }
}

function updateSummary() {
  if (document.getElementById("customerName")) {
    selectedData.customer.name = document.getElementById("customerName").value;
    selectedData.customer.phone =
      document.getElementById("customerPhone").value;
    selectedData.customer.email =
      document.getElementById("customerEmail").value;
  }

  const summaryPackageName = document.getElementById("summaryPackageName");
  const summaryPackagePrice = document.getElementById("summaryPackagePrice");
  const summaryStyle = document.getElementById("summaryStyle");

  if (summaryPackageName)
    summaryPackageName.innerText = `${selectedData.pkgName} (${selectedData.qty} Fotos)`;
  if (summaryPackagePrice)
    summaryPackagePrice.innerText =
      "R$ " + selectedData.price.toFixed(2).replace(".", ",");
  if (summaryStyle) summaryStyle.innerText = selectedData.styles.join(" + ");

  const restorationDiv = document.getElementById("restorationSummary");
  let restorationMsg = "";

  if (selectedData.restoration.qty > 0) {
    restorationDiv?.classList.remove("hidden");
    document.getElementById("summaryRestorationQty").innerText =
      selectedData.restoration.qty + " Fotos Antigas";
    document.getElementById("summaryRestorationPrice").innerText =
      "+ R$ " + selectedData.restoration.price.toFixed(2).replace(".", ",");
    const clockEmoji = getEmoji("clock");
    restorationMsg = `\n${clockEmoji} *Restauração:* ${
      selectedData.restoration.qty
    } foto(s) - R$ ${selectedData.restoration.price
      .toFixed(2)
      .replace(".", ",")}`;
  } else {
    restorationDiv?.classList.add("hidden");
  }

  const totalPrice = selectedData.price + selectedData.restoration.price;
  const summaryPrice = document.getElementById("summaryPrice");
  if (summaryPrice)
    summaryPrice.innerText = "R$ " + totalPrice.toFixed(2).replace(".", ",");

  const emailText = selectedData.customer.email
    ? selectedData.customer.email
    : "—";
  const userEmoji = getEmoji("user");
  const pkgEmoji = getEmoji("package");
  const moneyEmoji = getEmoji("money");

  const msg =
    `Olá! Gostaria de fazer um pedido.\n\n` +
    `${userEmoji} *MEUS DADOS*\n` +
    `Nome: ${selectedData.customer.name}\n` +
    `Zap: ${selectedData.customer.phone}\n` +
    `Email: ${emailText}\n\n` +
    `${pkgEmoji} *PEDIDO*\n` +
    `Pacote: ${selectedData.pkgName} (${selectedData.qty} fotos)\n` +
    `Estilo: ${selectedData.styles.join(" + ")}${restorationMsg}\n\n` +
    `${moneyEmoji} *TOTAL: R$ ${totalPrice.toFixed(2).replace(".", ",")}*`;

  const finalBtn = document.getElementById("finalWhatsappBtn");
  if (finalBtn)
    finalBtn.href = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

function resetForm() {
  localStorage.removeItem("fotoProntoState");
  selectedData = JSON.parse(JSON.stringify(initialData));
  currentStep = 1;

  if (document.getElementById("customerName"))
    document.getElementById("customerName").value = "";
  if (document.getElementById("customerPhone"))
    document.getElementById("customerPhone").value = "";
  if (document.getElementById("customerEmail"))
    document.getElementById("customerEmail").value = "";

  document
    .querySelectorAll(".selected")
    .forEach((c) => c.classList.remove("selected"));
  updateUI();
}

// --- GEMINI AI LOGIC ---
function toggleAIConsultant() {
  const panel = document.getElementById("aiConsultantPanel");
  panel?.classList.toggle("hidden");
}

async function askGemini() {
  const userInput = document.getElementById("aiInput")?.value.trim() || "";
  if (!userInput) return;

  const loading = document.getElementById("aiLoading");
  const resultDiv = document.getElementById("aiResult");
  const resultText = document.getElementById("aiTextResult");
  const selectBtn = document.getElementById("aiSelectStyleBtn");

  loading?.classList.remove("hidden");
  resultDiv?.classList.add("hidden");

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    `Você é um consultor do FotoPronto. Estilos disponíveis: Perfil Profissional, Sua Melhor Versão, Personagem 3D, Foto de Cinema, Desenho a Lápis, Vire Quadro, Dramático (P&B). ` +
                    `O usuário dirá o que quer. Responda APENAS com o nome do estilo mais adequado seguido de uma frase curta e divertida explicando o porquê. ` +
                    `Exemplo: 'Personagem 3D: Vai ficar incrível e divertido!'. Entrada do usuário: ${userInput}`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) throw new Error("API Error");

    const data = await response.json();
    const aiResponse =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Não consegui entender a resposta do consultor.";

    let matchedStyle = "";
    const styles = [
      "Perfil Profissional",
      "Sua Melhor Versão",
      "Personagem 3D",
      "Foto de Cinema",
      "Desenho a Lápis",
      "Vire Quadro",
      "Dramático (P&B)",
    ];
    for (let s of styles) {
      if (aiResponse.includes(s)) {
        matchedStyle = s;
        break;
      }
    }

    if (resultText) resultText.innerText = aiResponse;
    resultDiv?.classList.remove("hidden");

    if (matchedStyle && selectBtn) {
      selectBtn.style.display = "block";
      selectBtn.onclick = function () {
        const buttons = document.querySelectorAll("#step2 .option-style");
        buttons.forEach((btn) => {
          if (btn.innerText.includes(matchedStyle)) {
            selectStyle(matchedStyle, btn);
            toggleAIConsultant();
          }
        });
      };
    } else if (selectBtn) {
      selectBtn.style.display = "none";
    }
  } catch (error) {
    console.error(error);
    if (resultText)
      resultText.innerText =
        "Desculpe, não consegui conectar com o consultor agora. Tente escolher manualmente!";
    resultDiv?.classList.remove("hidden");
    if (selectBtn) selectBtn.style.display = "none";
  } finally {
    loading?.classList.add("hidden");
  }
}

loadProgress();



// ===========================
// Produto Publicitário - Carrossel (somente neste bloco)
// ===========================
document.addEventListener("DOMContentLoaded", function () {
  const carousels = document.querySelectorAll("[data-pp-carousel]");
  carousels.forEach((carousel) => {
    const track = carousel.querySelector("[data-pp-track]");
    const slides = Array.from(carousel.querySelectorAll("[data-pp-slide]"));
    const prevBtn = carousel.querySelector("[data-pp-prev]");
    const nextBtn = carousel.querySelector("[data-pp-next]");
    const dotsWrap = carousel.querySelector("[data-pp-dots]");

    if (!track || slides.length === 0) return;

    let index = 0;
    let startX = 0;
    let isDragging = false;

    // dots
    const dots = slides.map((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "pp-dot" + (i === 0 ? " active" : "");
      b.setAttribute("aria-label", `Ir para o slide ${i + 1}`);
      b.addEventListener("click", () => goTo(i));
      dotsWrap && dotsWrap.appendChild(b);
      return b;
    });

    function update() {
      track.style.transform = `translateX(${-index * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle("active", i === index));
      if (prevBtn) prevBtn.disabled = slides.length <= 1;
      if (nextBtn) nextBtn.disabled = slides.length <= 1;
    }

    function clamp(i) {
      if (i < 0) return slides.length - 1;
      if (i >= slides.length) return 0;
      return i;
    }

    function goTo(i) {
      index = clamp(i);
      update();
    }

    function next() {
      goTo(index + 1);
    }

    function prev() {
      goTo(index - 1);
    }

    prevBtn && prevBtn.addEventListener("click", prev);
    nextBtn && nextBtn.addEventListener("click", next);

    // Swipe (mobile)
    const onDown = (clientX) => {
      isDragging = true;
      startX = clientX;
    };

    const onUp = (clientX) => {
      if (!isDragging) return;
      isDragging = false;
      const dx = clientX - startX;
      const threshold = 40;
      if (dx > threshold) prev();
      else if (dx < -threshold) next();
    };

    carousel.addEventListener("touchstart", (e) => onDown(e.touches[0].clientX), { passive: true });
    carousel.addEventListener("touchend", (e) => {
      const x = (e.changedTouches && e.changedTouches[0] && e.changedTouches[0].clientX) || startX;
      onUp(x);
    });

    // Keyboard (acessível quando focado)
    carousel.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    });
    carousel.tabIndex = 0;

    update();
  });
});
