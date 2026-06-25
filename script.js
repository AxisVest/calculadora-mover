document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURAÇÃO ---
    // Insira aqui a URL do seu Google Apps Script após a publicação
    const GOOGLE_SCRIPT_URL = 'SUA_URL_DO_GOOGLE_APPS_SCRIPT_AQUI';
    
    // Link para o botão final de CTA
    const CTA_EXTERNAL_LINK = 'https://moverconnect.com.br'; // Altere conforme necessário

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
    const progressContainer = document.getElementById('progressContainer');
    const leadForm = document.getElementById('leadForm');
    const finalScoreEl = document.getElementById('finalScore');
    const classificationTitleEl = document.getElementById('classificationTitle');
    const classificationTextEl = document.getElementById('classificationText');
    const ctaButton = document.getElementById('ctaButton');
    const loadingEl = document.getElementById('loading');
    const resultContentEl = document.getElementById('resultContent');

    // --- NAVEGAÇÃO ---
    function showStep(stepNumber) {
        steps.forEach(step => step.classList.remove('active'));
        document.getElementById(`step-${stepNumber}`).classList.add('active');
        
        // Gerenciar Barra de Progresso
        if (stepNumber > 1 && stepNumber < totalSteps) {
            progressContainer.style.display = 'block';
            const progressMap = { 2: 25, 3: 40, 4: 60, 5: 80, 6: 95 };
            progressBar.style.width = `${progressMap[stepNumber]}%`;
        } else {
            progressContainer.style.display = 'none';
        }
        
        window.scrollTo(0, 0);
    }

    // --- CAPTURA DE LEADS (PASSO 1) ---
    leadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        userData.nome = document.getElementById('nome').value;
        userData.email = document.getElementById('email').value;
        userData.whatsapp = document.getElementById('whatsapp').value;
        
        currentStep = 2;
        showStep(currentStep);
    });

    // --- SELEÇÃO DE OPÇÕES (PASSOS 2 A 6) ---
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const value = btn.getAttribute('data-value');
            const points = parseInt(btn.getAttribute('data-points')) || 0;
            const stepId = btn.closest('.step').id;

            // Salvar dados conforme o passo
            if (stepId === 'step-2') userData.areaAtuacao = value;
            if (stepId === 'step-3') userData.clareza = { resp: value, pts: points };
            if (stepId === 'step-4') userData.oportunidades = { resp: value, pts: points };
            if (stepId === 'step-5') userData.networking = { resp: value, pts: points };
            if (stepId === 'step-6') userData.metaFaturamento = value;

            // Avançar
            if (currentStep < 6) {
                currentStep++;
                showStep(currentStep);
            } else {
                // Chegou ao fim das perguntas
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

        // Definir Classificação
        let classif = '';
        let classifHtml = '';
        let classifColor = '';

        if (finalScore <= 3) {
            classif = 'COMUNICAÇÃO DE ALTO RISCO';
            classifColor = 'var(--color-low)';
            classifHtml = `<strong>🔴 ${classif}</strong><br><br>Você possui conhecimentos ainda superficiais sobre comunicação estratégica e networking, mas apresenta um enorme potencial de desenvolvimento. Sem uma comunicação clara, excelentes oportunidades podem passar despercebidas todos os dias.`;
        } else if (finalScore <= 6) {
            classif = 'COMUNICAÇÃO DE RISCO';
            classifColor = 'var(--color-mid)';
            classifHtml = `<strong>🟠 ${classif}</strong><br><br>Você já possui algumas habilidades importantes, porém ainda perde muitas oportunidades por falta de posicionamento. Sua comunicação ainda representa um obstáculo relevante para o crescimento dos seus resultados.`;
        } else if (finalScore <= 8) {
            classif = 'COMUNICAÇÃO EM DESENVOLVIMENTO';
            classifColor = 'var(--color-high)';
            classifHtml = `<strong>🟡 ${classif}</strong><br><br>Você possui boas habilidades e já gera oportunidades, mas ainda existem gargalos. Você domina os fundamentos, mas precisa aprimorar técnicas de influência e posicionamento estratégico.`;
        } else {
            classif = 'COMUNICAÇÃO ESTRATÉGICA';
            classifColor = 'var(--color-expert)';
            classifHtml = `<strong>🟢 ${classif}</strong><br><br>Parabéns! Você utiliza a comunicação como uma verdadeira ferramenta de crescimento empresarial. Sua capacidade de criar conexões e gerar confiança é um diferencial competitivo importante.`;
        }

        userData.classificacao = classif;

        // Atualizar UI
        finalScoreEl.innerText = userData.notaFinal;
        classificationTitleEl.innerText = classif;
        classificationTitleEl.style.color = classifColor;
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
            // Usando fetch com modo no-cors pois Apps Script redireciona
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
});
