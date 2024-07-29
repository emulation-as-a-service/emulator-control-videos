document.getElementById('videoFile').addEventListener('change', handleVideoFile);
document.getElementById('eventJSONFile').addEventListener('change', handleEventJSONFile);
document.getElementById('prefillJSONFile').addEventListener('change', handlePrefillJSONFile);
document.getElementById('downloadAnnotations').addEventListener('click', downloadAnnotations);

let annotations = [];
let prefillData = [];

function handleVideoFile(event) {
    const file = event.target.files[0];
    const videoPlayer = document.getElementById('videoPlayer');
    const url = URL.createObjectURL(file);
    videoPlayer.src = url;
}

function handleEventJSONFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
        const data = JSON.parse(event.target.result);
        generateForms(data.events);
    };
    reader.readAsText(file);
}

function handlePrefillJSONFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
        prefillData = JSON.parse(event.target.result);
        prefillForms(prefillData);
    };
    reader.readAsText(file);
}

function generateForms(events) {
    const formsContainer = document.getElementById('annotationForms');
    formsContainer.innerHTML = '';
    annotations = [];

    events.forEach((e, index) => {
        const form = document.createElement('div');
        form.classList.add('event-form');

        const jumpLink = document.createElement('a');
        jumpLink.href = '#';
        jumpLink.innerText = `Event ${index + 1} (Time: ${e.time / 1000}s)`;
        jumpLink.addEventListener('click', () => {
            const videoPlayer = document.getElementById('videoPlayer');
            videoPlayer.currentTime = e.time / 1000;
        });

        form.appendChild(jumpLink);
        form.appendChild(document.createElement('br'));

        const preconditionInput = createInput('Precondition', index);
        const actionInput = createInput('Action', index);
        const expectedResultInput = createInput('Expected Result', index);

        form.appendChild(preconditionInput.label);
        form.appendChild(preconditionInput.input);
        form.appendChild(document.createElement('br'));

        form.appendChild(actionInput.label);
        form.appendChild(actionInput.input);
        form.appendChild(document.createElement('br'));

        form.appendChild(expectedResultInput.label);
        form.appendChild(expectedResultInput.input);
        form.appendChild(document.createElement('br'));

        formsContainer.appendChild(form);

        // Store references to inputs for generating annotations later
        annotations.push({
            precondition: preconditionInput.input,
            action: actionInput.input,
            expected_results: expectedResultInput.input,
        });
    });
}

function prefillForms(data) {
    if (annotations.length === 0) {
        alert("Please upload the event JSON file first.");
        return;
    }

    data.forEach((value, index) => {
        if (annotations[index]) {
            annotations[index].precondition.value = value.precondition || '';
            annotations[index].action.value = value.action || '';
            annotations[index].expected_results.value = value.expected_results || '';
        }
    });
}

function createInput(placeholder, index) {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = placeholder;
    input.dataset.index = index;

    const label = document.createElement('label');
    label.innerText = placeholder + ': ';
    
    return { input, label };
}

function downloadAnnotations() {
    const annotationData = annotations.map(annotation => ({
        precondition: annotation.precondition.value,
        action: annotation.action.value,
        expected_results: annotation.expected_results.value,
    }));

    const blob = new Blob([JSON.stringify(annotationData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ground_truth.json';
    a.click();
}
