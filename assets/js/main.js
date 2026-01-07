tailwind.config = {
    theme: {
        extend: {
            colors: {
                brand: {
                    blue: '#0b0e2a',
                    orange: '#ff6a00',
                    orangeHover: '#e55f00',
                    light: '#f8f9fa',
                }
            },
            fontFamily: {
                sans: ['Montserrat', 'sans-serif'],
            }
        }
    }
};

// --- 1. CONFIGURAÇÃO CENTRAL DO WHATSAPP ---
const whatsappConfig = {
    number: "5565992726478",
    message: "Olá! Vim pelo site do FotoPronto e quero melhorar minhas fotos."
};
const apiKey = "";

function getEmoji(type) {
    if(type === 'user') return String.fromCodePoint(0x1F464);
    if(type === 'package') return String.fromCodePoint(0x1F4E6);
    if(type === 'money') return String.fromCodePoint(0x1F4B0);
    if(type === 'clock') return String.fromCodePoint(0x1F570);
    return '';
}

let currentStep = 1;
const initialData = { qty: 0, price: 0, pkgName: '', styles: [], restoration: { qty: 0, price: 0 }, customer: { name: '', phone: '', email: '' } };
let selectedData = JSON.parse(JSON.stringify(initialData));
const steps = 4;
const phone = "5565992726478"; 

function saveProgress() {
    if(document.getElementById('customerName')) {
        selectedData.customer.name = document.getElementById('customerName').value;
        selectedData.customer.phone = document.getElementById('customerPhone').value;
        selectedData.customer.email = document.getElementById('customerEmail').value;
    }
    const state = { step: currentStep, data: selectedData };
    localStorage.setItem('fotoProntoState', JSON.stringify(state));
}

function loadProgress() {
    const saved = localStorage.getItem('fotoProntoState');
    if (saved) {
        const state = JSON.parse(saved);
        selectedData = state.data;
        if (typeof selectedData.styles === 'undefined' && selectedData.style) { selectedData.styles = [selectedData.style]; } 
        else if (!selectedData.styles) { selectedData.styles = []; }
        currentStep = state.step;
        if (currentStep === 4) {
            setTimeout(() => {
                document.getElementById('customerName').value = selectedData.customer.name || '';
                document.getElementById('customerPhone').value = selectedData.customer.phone || '';
                document.getElementById('customerEmail').value = selectedData.customer.email || '';
                validateForm();
            }, 100);
        }
        restoreVisuals();
    }
    updateUI();
}

function restoreVisuals() {
    if (selectedData.qty > 0) {
        const qtyCard = document.querySelector(`#step1 .option-card[onclick*="${selectedData.qty},"]`);
        if(qtyCard) qtyCard.classList.add('selected');
    }
    if (selectedData.styles && selectedData.styles.length > 0) {
        selectedData.styles.forEach(style => {
            const buttons = document.querySelectorAll('#step2 .option-style');
            buttons.forEach(btn => { if(btn.innerText.includes(style)) btn.classList.add('selected'); });
        });
    }
    if (selectedData.restoration.qty > 0) {
        const restCard = document.querySelector(`#step3 .option-card[onclick*="${selectedData.restoration.qty},"]`);
        if(restCard) restCard.classList.add('selected');
    }
}

function updateUI() {
    document.querySelectorAll('.step').forEach((el, index) => { el.classList.toggle('active', index + 1 === currentStep); });
    const progress = ((currentStep - 1) / (steps - 1)) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
    document.querySelectorAll('.step-indicator').forEach((el, index) => {
        if (index + 1 <= currentStep) { el.classList.remove('bg-gray-200', 'text-gray-500'); el.classList.add('bg-brand-orange', 'text-white'); } 
        else { el.classList.add('bg-gray-200', 'text-gray-500'); el.classList.remove('bg-brand-orange', 'text-white'); }
    });
    const styleSubtitle = document.getElementById('styleSubtitle');
    if (currentStep === 2) {
        if (selectedData.qty === 10) { styleSubtitle.innerHTML = `<span class="text-brand-orange font-bold">Pacote 10 Fotos:</span> Escolha até <span class="font-bold">2 estilos</span>.`; } 
        else { styleSubtitle.innerText = "Escolha o estilo ideal para suas fotos."; }
    }
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const navButtons = document.getElementById('navButtons');
    prevBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
    if (currentStep === steps) { navButtons.style.display = 'none'; updateSummary(); } 
    else {
        navButtons.style.display = 'flex';
        let canProceed = false;
        if (currentStep === 1 && selectedData.qty > 0) canProceed = true;
        if (currentStep === 2 && selectedData.styles.length > 0) canProceed = true;
        if (currentStep === 3) canProceed = true;
        nextBtn.disabled = !canProceed;
    }
    saveProgress();
}

function changeStep(dir) {
    currentStep += dir;
    if(currentStep < 1) currentStep = 1;
    if(currentStep > steps) currentStep = steps;
    updateUI();
}

function selectQty(qty, price, pkgName, el) {
    selectedData.qty = qty; selectedData.price = price; selectedData.pkgName = pkgName; selectedData.styles = [];
    document.querySelectorAll('#step2 .option-style').forEach(c => c.classList.remove('selected'));
    document.querySelectorAll('#step1 .option-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    updateUI(); setTimeout(() => { changeStep(1); }, 300);
}

function selectStyle(styleName, el) {
    const isMultiSelect = selectedData.qty === 10;
    if (isMultiSelect) {
        const index = selectedData.styles.indexOf(styleName);
        if (index > -1) { selectedData.styles.splice(index, 1); el.classList.remove('selected'); } 
        else {
            if (selectedData.styles.length < 2) { selectedData.styles.push(styleName); el.classList.add('selected'); } 
            else {
                const firstStyle = selectedData.styles[0];
                const buttons = document.querySelectorAll('#step2 .option-style');
                buttons.forEach(btn => { if(btn.innerText.includes(firstStyle)) btn.classList.remove('selected'); });
                selectedData.styles.shift(); selectedData.styles.push(styleName); el.classList.add('selected');
            }
        }
    } else {
        selectedData.styles = [styleName];
        document.querySelectorAll('#step2 .option-style').forEach(c => c.classList.remove('selected'));
        el.classList.add('selected');
        setTimeout(() => { changeStep(1); }, 300);
    }
    updateUI();
}

function selectRestoration(qty, price, el) {
    selectedData.restoration.qty = qty; selectedData.restoration.price = price;
    document.querySelectorAll('#step3 .option-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    updateUI(); setTimeout(() => { changeStep(1); }, 300);
}

function skipRestoration() {
    selectedData.restoration.qty = 0; selectedData.restoration.price = 0;
    document.querySelectorAll('#step3 .option-card').forEach(c => c.classList.remove('selected'));
    changeStep(1);
}

function validateForm() {
    const name = document.getElementById('customerName').value.trim();
    const phoneVal = document.getElementById('customerPhone').value.trim();
    const btn = document.getElementById('finalWhatsappBtn');
    const isValid = name.length > 2 && phoneVal.length > 8;
    if (isValid) {
        btn.classList.remove('bg-gray-300', 'pointer-events-none', 'opacity-70');
        btn.classList.add('bg-green-500', 'hover:bg-green-600');
        btn.style.pointerEvents = 'auto';
        updateSummary(); 
    } else {
        btn.classList.add('bg-gray-300', 'pointer-events-none', 'opacity-70');
        btn.classList.remove('bg-green-500', 'hover:bg-green-600');
        btn.style.pointerEvents = 'none';
    }
}

function updateSummary() {
    if(document.getElementById('customerName')) {
        selectedData.customer.name = document.getElementById('customerName').value;
        selectedData.customer.phone = document.getElementById('customerPhone').value;
        selectedData.customer.email = document.getElementById('customerEmail').value;
    }
    document.getElementById('summaryPackageName').innerText = selectedData.pkgName + " (" + selectedData.qty + " Fotos)";
    document.getElementById('summaryPackagePrice').innerText = 'R$ ' + selectedData.price.toFixed(2).replace('.', ',');
    document.getElementById('summaryStyle').innerText = selectedData.styles.join(" + ");
    
    const restorationDiv = document.getElementById('restorationSummary');
    let restorationMsg = "";
    if (selectedData.restoration.qty > 0) {
        restorationDiv.classList.remove('hidden');
        document.getElementById('summaryRestorationQty').innerText = selectedData.restoration.qty + ' Fotos Antigas';
        document.getElementById('summaryRestorationPrice').innerText = '+ R$ ' + selectedData.restoration.price.toFixed(2).replace('.', ',');
        const clockEmoji = getEmoji('clock');
        restorationMsg = `\n${clockEmoji} *Restauração:* ${selectedData.restoration.qty} foto(s) - R$ ${selectedData.restoration.price.toFixed(2).replace('.', ',')}`;
    } else { restorationDiv.classList.add('hidden'); }

    const totalPrice = selectedData.price + selectedData.restoration.price;
    document.getElementById('summaryPrice').innerText = 'R$ ' + totalPrice.toFixed(2).replace('.', ',');
    const emailText = selectedData.customer.email ? selectedData.customer.email : "—";
    const userEmoji = getEmoji('user');
    const pkgEmoji = getEmoji('package');
    const moneyEmoji = getEmoji('money');
    const msg = `Olá! Gostaria de fazer um pedido.\n\n${userEmoji} *MEUS DADOS*\nNome: ${selectedData.customer.name}\nZap: ${selectedData.customer.phone}\nEmail: ${emailText}\n\n${pkgEmoji} *PEDIDO*\nPacote: ${selectedData.pkgName} (${selectedData.qty} fotos)\nEstilo: ${selectedData.styles.join(" + ")}${restorationMsg}\n\n${moneyEmoji} *TOTAL: R$ ${totalPrice.toFixed(2).replace('.', ',')}*`;
    const finalBtn = document.getElementById('finalWhatsappBtn');
    finalBtn.href = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

function resetForm() {
    localStorage.removeItem('fotoProntoState');
    selectedData = JSON.parse(JSON.stringify(initialData));
    currentStep = 1;
    if(document.getElementById('customerName')) document.getElementById('customerName').value = '';
    if(document.getElementById('customerPhone')) document.getElementById('customerPhone').value = '';
    if(document.getElementById('customerEmail')) document.getElementById('customerEmail').value = '';
    document.querySelectorAll('.selected').forEach(c => c.classList.remove('selected'));
    updateUI();
}

function toggleAIConsultant() {
    const panel = document.getElementById('aiConsultantPanel');
    panel.classList.toggle('hidden');
}

async function askGemini() {
    const userInput = document.getElementById('aiInput').value.trim();
    if (!userInput) return;

    const loading = document.getElementById('aiLoading');
    const resultDiv = document.getElementById('aiResult');
    const resultText = document.getElementById('aiTextResult');
    const selectBtn = document.getElementById('aiSelectStyleBtn');

    loading.classList.remove('hidden');
    resultDiv.classList.add('hidden');

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Você é um consultor do FotoPronto. Estilos disponíveis: Perfil Profissional, Sua Melhor Versão, Personagem 3D, Foto de Cinema, Desenho a Lápis, Vire Quadro, Dramático (P&B). O usuário dirá o que quer. Responda APENAS com o nome do estilo mais adequado seguido de uma frase curta e divertida explicando o porquê. Exemplo: 'Personagem 3D: Vai ficar incrível e divertido!'. Entrada do usuário: ${userInput}`
                    }]
                }]
            })
        });

        if (!response.ok) throw new Error('API Error');

        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;
        
        let matchedStyle = "";
        const styles = ['Perfil Profissional', 'Sua Melhor Versão', 'Personagem 3D', 'Foto de Cinema', 'Desenho a Lápis', 'Vire Quadro', 'Dramático (P&B)'];
        
        for (let s of styles) {
            if (aiResponse.includes(s)) {
                matchedStyle = s;
                break;
            }
        }

        resultText.innerText = aiResponse;
        resultDiv.classList.remove('hidden');
        
        if (matchedStyle) {
            selectBtn.style.display = 'block';
            selectBtn.onclick = function() {
                const buttons = document.querySelectorAll('#step2 .option-style');
                buttons.forEach(btn => {
                     if(btn.innerText.includes(matchedStyle)) {
                         selectStyle(matchedStyle, btn);
                         toggleAIConsultant();
                     }
                });
            };
        } else {
            selectBtn.style.display = 'none';
        }

    } catch (error) {
        console.error(error);
        resultText.innerText = "Desculpe, não consegui conectar com o consultor agora. Tente escolher manualmente!";
        resultDiv.classList.remove('hidden');
        selectBtn.style.display = 'none';
    } finally {
        loading.classList.add('hidden');
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const sliders = document.querySelectorAll('.comparison-slider, .style-slider-container');
    
    sliders.forEach(slider => {
        const isStyleCard = slider.classList.contains('style-slider-container');
        const resizeDiv = isStyleCard ? slider.querySelector('.style-slider-overlay') : slider.querySelector('.resize-image');
        const handle = isStyleCard ? slider.querySelector('.style-slider-handle') : slider.querySelector('.handle');

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
        };

        slider.addEventListener('mousedown', (e) => { isDown = true; move(e); });
        window.addEventListener('mouseup', () => isDown = false);
        slider.addEventListener('mousemove', (e) => { if(isDown) move(e); });
        
        slider.addEventListener('touchstart', (e) => { isDown = true; move(e); }, {passive: false});
        window.addEventListener('touchend', () => isDown = false);
        slider.addEventListener('touchmove', (e) => { 
            if(isDown) {
                e.preventDefault();
                move(e); 
            }
        }, {passive: false});
    });

    const standardButtons = document.querySelectorAll('.wa-hero-btn, .wa-link-btn');
    standardButtons.forEach(btn => {
        const msg = btn.getAttribute('data-message') || whatsappConfig.message;
        const url = `https://wa.me/${whatsappConfig.number}?text=${encodeURIComponent(msg)}`;
        btn.href = url;
    });
    
    const policiesModal = document.getElementById('policiesModal');
    if (policiesModal) {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !policiesModal.classList.contains('hidden')) {
                policiesModal.classList.add('hidden');
            }
        });
        
        policiesModal.addEventListener('click', (e) => {
             if (e.target === policiesModal) {
                policiesModal.classList.add('hidden');
            }
        });
    }

    loadProgress();
});
