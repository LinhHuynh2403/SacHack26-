import { env, AutoProcessor, Florence2ForConditionalGeneration, RawImage } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.3.3';

// Setup environment
env.allowLocalModels = false;
env.backends.onnx.wasm.numThreads = 1; // Can adjust based on hardware for perf

class Florence2Pipeline {
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            // Check hardware capabilities to determine model size
            const cores = navigator.hardwareConcurrency || 4;
            // florence-2-base works robustly in the browser. 
            // We use standard base as default here to avoid memory crashes on low-end
            const model_id = cores >= 8 ? 'Xenova/florence-2-large' : 'Xenova/florence-2-base';

            this.instance = Promise.all([
                Florence2ForConditionalGeneration.from_pretrained(model_id, {
                    progress_callback,
                    dtype: 'q4' // Use 4-bit quantization to minimize memory use and improve speeds
                }),
                AutoProcessor.from_pretrained(model_id, { progress_callback }),
            ]);
        }
        return this.instance;
    }
}

// Pre-load model in background when worker starts
Florence2Pipeline.getInstance((progressData) => {
    self.postMessage({
        status: progressData.status,
        file: progressData.file,
        progress: progressData.progress
    });
}).then(() => {
    self.postMessage({ status: 'ready' });
}).catch(err => {
    console.error("Failed to load model", err);
    self.postMessage({ status: 'error', error: err.message });
});

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
    if (event.data.type === 'analyze') {
        const { image } = event.data;

        try {
            const [model, processor] = await Florence2Pipeline.getInstance();

            // Load the image from the data URL
            const rawImage = await RawImage.fromURL(image);

            // We use the <MORE_DETAILED_CAPTION> prompt to get rich scene descriptions
            const task = '<MORE_DETAILED_CAPTION>';

            // Prepare inputs for the model
            const inputs = await processor(rawImage, task);

            // Generate the output
            const outputs = await model.generate({
                ...inputs,
                max_new_tokens: 100,
            });

            // Decode output
            const decoded = processor.batch_decode(outputs, { skip_special_tokens: false })[0];

            // Post-process the output string (strip prompt and EOS tokens)
            const cleanOutput = decoded.replace(task, '').replace('</s>', '').replace('<s>', '').trim();

            self.postMessage({
                status: 'complete',
                output: cleanOutput
            });

        } catch (err) {
            console.error(err);
            self.postMessage({
                status: 'error',
                error: err.message
            });
        }
    }
});
