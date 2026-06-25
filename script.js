document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURAÇÃO ---
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyAD5v23gghRciAwRq2R4bV3ePa1zEMhPsbIb4hj_sA0HGTXBCc5ibSI947NGGAwOsL0A/exec';
    const CTA_EXTERNAL_LINK = 'https://moverconnect.com.br';

    // --- ESTADO DA APLICAÇÃO ---
    let currentStep = 1;
    const totalSteps = 7;
    const userData = {
        nome: '',
        email: '',
        whatsapp: '',
        areaAtuacao: '',
        clareza: { resp: '', pts: 0 },
        oportunidades: { resp: '', pts: 0 },
        networking: { resp: '', pts: 0 },
        metaFaturamento: '',
        notaFinal: 0,
        classificacao: ''
    };

    // --- ELEMENTOS ---
    const steps = document.querySelectorAll('.step');
    const progressBar = document.getElementById('progressBar');
    const progressPercent = document.getElementById('progressPercent');
    const progressContainer = document.getElementById('progressContainer');
    const leadForm = document.getElementById('leadForm');
    const finalScoreEl = document.getElementById('finalScore');
    const classificationTitleEl = document.getElementById('classificationTitle');
    const classificationTextEl = document.getElementById('classificationText');
    const ctaButton = document.getElementById('ctaButton');
    const loadingEl = document.getElementById('loading');
    const resultContentEl = document.getElementById('resultContent');

    // --- MAPA DE PROGRESSO ---
    const progressMap = {
        1: 10,
        2: 25,
        3: 40,
        4: 60,
        5: 80,
        6: 95,
        7: 100
    };

    // --- NAVEGAÇÃO ---
    function showStep(stepNumber) {
        steps.forEach(step => step.classList.remove('active'));
        document.getElementById(`step-${stepNumber}`).classList.add('active');
        
        // Atualizar barra de progresso
        const progress = progressMap[stepNumber];
        progressBar.style.width = `${progress}%`;
        progressPercent.textContent = `${progress}%`;
        
        window.scrollTo(0, 0);
    }

    // --- VALIDAÇÕES ---
    function validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    function validateWhatsApp(whatsapp) {
        // Remove caracteres especiais
        const cleaned = whatsapp.replace(/\D/g, '');
        // Valida se tem DDD (2 dígitos) + número (8 ou 9 dígitos)
        return cleaned.length >= 10 && cleaned.length <= 11;
    }

    function clearErrors() {
        document.getElementById('nomeError').textContent = '';
        document.getElementById('emailError').textContent = '';
        document.getElementById('whatsappError').textContent = '';
    }

    // --- CAPTURA DE LEADS (PASSO 1) ---
    leadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearErrors();
        
        const nome = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim();
        const whatsapp = document.getElementById('whatsapp').value.trim();
        
        let hasError = false;

        if (!nome || nome.length < 3) {
            document.getElementById('nomeError').textContent = 'Nome deve ter pelo menos 3 caracteres';
            hasError = true;
        }

        if (!validateEmail(email)) {
            document.getElementById('emailError').textContent = 'E-mail inválido';
            hasError = true;
        }

        if (!validateWhatsApp(whatsapp)) {
            document.getElementById('whatsappError').textContent = 'WhatsApp inválido (mínimo 10 dígitos com DDD)';
            hasError = true;
        }

        if (hasError) return;

        userData.nome = nome;
        userData.email = email;
        userData.whatsapp = whatsapp;
        
        currentStep = 2;
        showStep(currentStep);
    });

    // --- SELEÇÃO DE OPÇÕES (PASSOS 2 A 6) ---
    document.querySelectorAll('.option-radio').forEach(radio => {
        radio.addEventListener('change', () => {
            const stepEl = radio.closest('.step');
            const stepId = stepEl.id;
            const value = radio.value;
            const points = parseInt(radio.getAttribute('data-points')) || 0;
            const nextBtn = stepEl.querySelector('.next-btn');

            // Mostrar botão de próxima pergunta
            if (nextBtn) {
                nextBtn.style.display = 'block';
            }

            // Salvar dados conforme o passo
            if (stepId === 'step-2') userData.areaAtuacao = value;
            if (stepId === 'step-3') userData.clareza = { resp: value, pts: points };
            if (stepId === 'step-4') userData.oportunidades = { resp: value, pts: points };
            if (stepId === 'step-5') userData.networking = { resp: value, pts: points };
            if (stepId === 'step-6') userData.metaFaturamento = value;
        });
    });

    // --- BOTÕES PRÓXIMA PERGUNTA ---
    document.querySelectorAll('.next-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep < 6) {
                currentStep++;
                showStep(currentStep);
            } else if (currentStep === 6) {
                finishDiagnostic();
            }
        });
    });

    // --- BOTÕES VOLTAR ---
    document.querySelectorAll('.prev-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                showStep(currentStep);
            }
        });
    });

    // --- CÁLCULO E FINALIZAÇÃO ---
    function finishDiagnostic() {
        currentStep = 7;
        showStep(currentStep);
        
        // Mostrar Loading
        resultContentEl.style.display = 'none';
        loadingEl.style.display = 'block';

        // Calcular Nota: (soma / 30) * 10
        const totalPoints = userData.clareza.pts + userData.oportunidades.pts + userData.networking.pts;
        const finalScore = (totalPoints / 30) * 10;
        userData.notaFinal = finalScore.toFixed(1);

        // Definir Classificação e Texto
        let classif = '';
        let classifHtml = '';

        if (finalScore <= 3) {
            classif = '🔴 COMUNICAÇÃO DE ALTO RISCO';
            classifHtml = `<strong>${classif}</strong><br><br>Você possui conhecimentos ainda superficiais sobre comunicação estratégica e networking, mas apresenta um enorme potencial de desenvolvimento.<br><br>Neste momento, sua comunicação provavelmente está impedindo que oportunidades se transformem em negócios concretos. Muitas vezes, o problema não está na qualidade do seu produto, serviço ou empresa, mas sim na forma como você se apresenta, se posiciona e cria conexões.<br><br>Sem uma comunicação clara e estratégica, excelentes oportunidades podem passar despercebidas todos os dias.<br><br>Seu principal desafio é construir uma base sólida de comunicação, posicionamento e influência para gerar mais credibilidade e melhores resultados.`;
        } else if (finalScore <= 6) {
            classif = '🟠 COMUNICAÇÃO DE RISCO';
            classifHtml = `<strong>${classif}</strong><br><br>Você já possui algumas habilidades importantes de comunicação, porém ainda perde muitas oportunidades por falta de posicionamento, conexão e influência.<br><br>Sua comunicação ainda representa um obstáculo relevante para o crescimento dos seus resultados e da sua empresa.<br><br>Em muitos momentos, você sabe o que precisa dizer, mas não consegue transmitir sua mensagem com a clareza, segurança e impacto necessários para gerar confiança e conversão.<br><br>O próximo passo é desenvolver técnicas mais avançadas de comunicação estratégica, networking e influência para transformar mais conversas em oportunidades reais de negócio.`;
        } else if (finalScore <= 8) {
            classif = '🟡 COMUNICAÇÃO EM DESENVOLVIMENTO';
            classifHtml = `<strong>${classif}</strong><br><br>Você possui boas habilidades de comunicação e já consegue gerar oportunidades através do networking e dos relacionamentos profissionais.<br><br>Sua comunicação funciona, porém ainda existem gargalos que impedem que mais oportunidades sejam convertidas em negócios concretos.<br><br>Você já domina os fundamentos, mas ainda precisa aprimorar técnicas de influência, persuasão, posicionamento e condução de conversas estratégicas.<br><br>Com alguns ajustes e técnicas específicas, é possível aumentar significativamente sua capacidade de conversão e potencializar seus resultados comerciais.`;
        } else {
            classif = '🟢 COMUNICAÇÃO ESTRATÉGICA';
            classifHtml = `<strong>${classif}</strong><br><br>Parabéns!<br><br>Você está entre os profissionais que utilizam a comunicação como uma verdadeira ferramenta de crescimento empresarial.<br><br>Sua capacidade de se posicionar, criar conexões, gerar confiança e transformar relacionamentos em oportunidades é um diferencial competitivo importante.<br><br>Mesmo profissionais com alto desempenho continuam evoluindo constantemente suas habilidades de comunicação, influência e liderança.<br><br>O desafio agora não é apenas melhorar sua comunicação, mas utilizá-la para acelerar ainda mais o crescimento dos seus negócios e ampliar sua influência no mercado.`;
        }

        userData.classificacao = classif;

        // Atualizar UI
        finalScoreEl.innerText = userData.notaFinal;
        classificationTitleEl.innerText = classif;
        classificationTextEl.innerHTML = classifHtml;
        ctaButton.href = CTA_EXTERNAL_LINK;

        // Enviar para Google Sheets
        sendDataToGoogleSheets();
    }

    async function sendDataToGoogleSheets() {
        if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('SUA_URL')) {
            console.warn('URL do Google Script não configurada.');
            loadingEl.style.display = 'none';
            resultContentEl.style.display = 'block';
            return;
        }

        const payload = {
            timestamp: new Date().toLocaleString('pt-BR'),
            nome: userData.nome,
            email: userData.email,
            whatsapp: userData.whatsapp,
            areaAtuacao: userData.areaAtuacao,
            clareza_resp: userData.clareza.resp,
            clareza_pts: userData.clareza.pts,
            oportunidades_resp: userData.oportunidades.resp,
            oportunidades_pts: userData.oportunidades.pts,
            networking_resp: userData.networking.resp,
            networking_pts: userData.networking.pts,
            metaFaturamento: userData.metaFaturamento,
            notaFinal: userData.notaFinal,
            classificacao: userData.classificacao
        };

        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                cache: 'no-cache',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (error) {
            console.error('Erro ao enviar dados:', error);
        } finally {
            loadingEl.style.display = 'none';
            resultContentEl.style.display = 'block';
        }
    }

    // Inicializar na tela 1
    showStep(1);
});
