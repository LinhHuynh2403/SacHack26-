const uploadSection = document.getElementById('upload-section');
const imageUpload = document.getElementById('image-upload');
const workspace = document.getElementById('workspace');
const previewImage = document.getElementById('preview-image');
const resultBox = document.getElementById('diagnosis-result');
const statusBadge = document.getElementById('ai-status');
const progressBarContainer = document.getElementById('progress-bar-container');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const actionButtons = document.getElementById('action-buttons');
const btnAccept = document.getElementById('btn-accept');
const btnReject = document.getElementById('btn-reject');
const correctionPanel = document.getElementById('correction-panel');
const btnSubmitCorrection = document.getElementById('btn-submit-correction');

// Create the Web Worker
const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });

// Listen for messages from the worker
worker.addEventListener('message', (event) => {
    const message = event.data;

    switch (message.status) {
        case 'initiate':
            progressBarContainer.style.display = 'block';
            progressText.textContent = `Loading ${message.file}...`;
            break;
        case 'progress':
            progressBarContainer.style.display = 'block';
            progressFill.style.width = `${message.progress}%`;
            break;
        case 'done':
            progressText.textContent = `Loaded ${message.file}`;
            break;
        case 'ready':
            progressBarContainer.style.display = 'none';
            statusBadge.textContent = 'Model Ready! Awaiting image...';
            statusBadge.className = 'status-badge complete';
            break;
        case 'update':
            // Partial generation output
            resultBox.textContent = message.output;
            break;
        case 'complete':
            statusBadge.textContent = 'Inference Complete';
            statusBadge.className = 'status-badge complete';
            resultBox.textContent = message.output;
            actionButtons.style.display = 'flex';
            break;
        case 'error':
            statusBadge.textContent = 'Error';
            statusBadge.className = 'status-badge loading';
            statusBadge.style.backgroundColor = 'var(--danger)';
            resultBox.textContent = `Error: ${message.error}`;
            break;
    }
});

// Drag and drop support
uploadSection.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadSection.style.borderColor = 'var(--accent-color)';
});
uploadSection.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadSection.style.borderColor = 'var(--border)';
});
uploadSection.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadSection.style.borderColor = 'var(--border)';
    if (e.dataTransfer.files.length) {
        handleFile(e.dataTransfer.files[0]);
    }
});

imageUpload.addEventListener('change', (e) => {
    if (e.target.files.length) {
        handleFile(e.target.files[0]);
    }
});

function handleFile(file) {
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            // Update UI
            uploadSection.style.display = 'none';
            workspace.style.display = 'grid';
            previewImage.src = dataUrl;
            
            // Reset state
            resultBox.textContent = 'Analyzing radiograph details...';
            statusBadge.textContent = 'Running Inference...';
            statusBadge.className = 'status-badge loading';
            statusBadge.style.backgroundColor = ''; // reset error color if any
            actionButtons.style.display = 'none';
            correctionPanel.style.display = 'none';

            // Send to worker
            worker.postMessage({
                type: 'analyze',
                image: dataUrl
            });
        };
        reader.readAsDataURL(file);
    }
}

btnAccept.addEventListener('click', () => {
    alert('Diagnosis accepted and saved to patient record!');
    resetWorkspace();
});

btnReject.addEventListener('click', () => {
    actionButtons.style.display = 'none';
    correctionPanel.style.display = 'flex';
});

btnSubmitCorrection.addEventListener('click', () => {
    const correction = document.getElementById('correction-text').value;
    if (!correction) return alert('Please enter a correction!');
    
    // In a real app, this would hit an API endpoint to save the fine-tuning data
    console.log('Saved corrected data for continuous learning:', {
        image: previewImage.src,
        correction: correction
    });
    
    alert('Correction submitted! Your feedback helps improve the AI model later.');
    resetWorkspace();
});

function resetWorkspace() {
    uploadSection.style.display = 'block';
    workspace.style.display = 'none';
    imageUpload.value = '';
    document.getElementById('correction-text').value = '';
}
