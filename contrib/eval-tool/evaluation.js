document.getElementById('videoFile').addEventListener('change', handleVideoFile);
document.getElementById('metadataJSONFile').addEventListener('change', handleMetadataJSONFile);
document.getElementById('groundTruthJSONFile').addEventListener('change', handleGroundTruthJSONFile);
document.getElementById('workflowJSONFile').addEventListener('change', handleWorkflowJSONFile);
document.getElementById('previousEvaluationJSONFile').addEventListener('change', handlePreviousEvaluationJSONFile);
document.getElementById('downloadEvaluation').addEventListener('click', downloadEvaluation);

let metadata = [];
let groundTruth = [];
let workflow = [];
let evaluationData = [];
let previousEvaluation = [];

function handleVideoFile(event) {
    const file = event.target.files[0];
    const videoPlayer = document.getElementById('videoPlayer');
    const url = URL.createObjectURL(file);
    videoPlayer.src = url;
}

function handleMetadataJSONFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
        try {
            metadata = JSON.parse(event.target.result);
            generateEvaluationForms();
        } catch (error) {
            console.error("Error parsing metadata:", error);
        }
    };
    reader.readAsText(file);
}

function handleGroundTruthJSONFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
        try {
            groundTruth = JSON.parse(event.target.result);
            generateEvaluationForms();
        } catch (error) {
            console.error("Error parsing ground truth:", error);
        }
    };
    reader.readAsText(file);
}

function handleWorkflowJSONFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
        try {
            workflow = JSON.parse(event.target.result);
            generateEvaluationForms();
        } catch (error) {
            console.error("Error parsing workflow:", error);
        }
    };
    reader.readAsText(file);
}

function handlePreviousEvaluationJSONFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
        try {
            previousEvaluation = JSON.parse(event.target.result);
            generateEvaluationForms();
        } catch (error) {
            console.error("Error parsing previous evaluation:", error);
        }
    };
    reader.readAsText(file);
}

function generateEvaluationForms() {
    const formsContainer = document.getElementById('evaluationForms');
    formsContainer.innerHTML = '';
    evaluationData = []; // Clear existing evaluation data

    if (metadata.events && metadata.events.length > 0) {
        for (let i = 0; i < metadata.events.length; i++) {
            const columnDiv = createColumnDiv(i);
            formsContainer.appendChild(columnDiv);
        }
    }
}

function createColumnDiv(index) {
    const columnDiv = document.createElement('div');
    columnDiv.classList.add('columns');

    const metadataCol = (metadata.events && metadata.events[index]) ? createMetadataColumn(index, metadata.events[index]) : createColumn({ error: "No data" }, 'Metadata');
    const comparisonCol = createComparisonColumn(index, groundTruth[index], workflow[index]);
    const evaluationCol = createEvaluationColumn(index);

    columnDiv.appendChild(metadataCol);
    columnDiv.appendChild(comparisonCol);
    columnDiv.appendChild(evaluationCol);

    return columnDiv;
}

function createMetadataColumn(index, data) {
    const colDiv = document.createElement('div');
    colDiv.classList.add('column');

    const indexElement = document.createElement('p');
    indexElement.classList.add('event-index');
    indexElement.innerText = `Event ${index + 1}`;

    const titleLabel = document.createElement('h3');
    titleLabel.innerText = 'Metadata';

    colDiv.appendChild(indexElement);
    colDiv.appendChild(titleLabel);

    const eventElement = document.createElement('p');
    eventElement.innerText = `Event: ${data.event}`;
    colDiv.appendChild(eventElement);

    if (data.time) {
        const timeElement = document.createElement('p');
        const link = document.createElement('a');
        link.innerText = `Time: ${data.time}`;
        link.addEventListener('click', () => {
            const videoPlayer = document.getElementById('videoPlayer');
            videoPlayer.currentTime = data.time / 1000; // Assuming time is in milliseconds
        });
        timeElement.appendChild(link);
        colDiv.appendChild(timeElement);
    }

    return colDiv;
}

function createComparisonColumn(index, groundTruth, workflow) {
    const colDiv = document.createElement('div');
    colDiv.classList.add('column');

    const indexElement = document.createElement('p');
    indexElement.classList.add('event-index');
    indexElement.innerText = `Event ${index + 1}`;

    const titleLabel = document.createElement('h3');
    titleLabel.innerText = 'Comparison';

    colDiv.appendChild(indexElement);
    colDiv.appendChild(titleLabel);

    if (groundTruth && workflow) {
        const preconditionItem = createComparisonItem('Precondition', groundTruth.precondition, workflow.precondition);
        const actionItem = createComparisonItem('Action', groundTruth.action, workflow.action);
        const expectedResultsItem = createComparisonItem('Expected Results', groundTruth.expected_results, workflow.expected_results);

        colDiv.appendChild(preconditionItem);
        colDiv.appendChild(actionItem);
        colDiv.appendChild(expectedResultsItem);
    } else {
        colDiv.innerHTML += "<p>No data available for comparison</p>";
    }

    return colDiv;
}

function createComparisonItem(label, groundTruthValue, workflowValue) {
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('comparison-item');

    const groundTruthDiv = document.createElement('div');
    groundTruthDiv.innerHTML = `<strong>${label} (GT):</strong> ${groundTruthValue}`;
    groundTruthDiv.className = groundTruthValue === workflowValue ? 'highlight-same' : 'highlight-diff';

    const workflowDiv = document.createElement('div');
    workflowDiv.innerHTML = `<strong>${label} (WF):</strong> ${workflowValue}`;
    workflowDiv.className = groundTruthValue === workflowValue ? 'highlight-same' : 'highlight-diff';

    itemDiv.appendChild(groundTruthDiv);
    itemDiv.appendChild(workflowDiv);

    return itemDiv;
}

function createEvaluationColumn(index) {
    const colDiv = document.createElement('div');
    colDiv.classList.add('evaluation-column');

    const indexElement = document.createElement('p');
    indexElement.classList.add('event-index');
    indexElement.innerText = `Event ${index + 1}`;

    const titleLabel = document.createElement('h3');
    titleLabel.innerText = 'Evaluation';

    colDiv.appendChild(indexElement);
    colDiv.appendChild(titleLabel);

    const goodFrameRadio = createRadioInput(index, 'good', isPreviousValue(index, 'accuracy', 'good'));
    const inaccurateFrameRadio = createRadioInput(index, 'inaccurate', isPreviousValue(index, 'accuracy', 'inaccurate'));

    colDiv.appendChild(createRadioLabel('Good', goodFrameRadio));
    colDiv.appendChild(createRadioLabel('Inaccurate', inaccurateFrameRadio));

    const inaccurateOptions = createInaccurateOptions(index, isPreviousValue(index, 'accuracy', 'inaccurate'));
    colDiv.appendChild(inaccurateOptions);

    evaluationData.push({
        index,
        accuracy: getPreviousValue(index, 'accuracy') || 'good', // default value
        preconditionInaccurate: getPreviousValue(index, 'preconditionInaccurate') || false,
        actionInaccurate: getPreviousValue(index, 'actionInaccurate') || false,
        expectedResultsInaccurate: getPreviousValue(index, 'expectedResultsInaccurate') || false
    });

    return colDiv;
}

function getPreviousValue(index, key) {
    const prevEval = previousEvaluation.find(ev => ev.index === index);
    return prevEval ? prevEval[key] : null;
}

function isPreviousValue(index, key, value) {
    return getPreviousValue(index, key) === value;
}

function createRadioLabel(text, input) {
    const label = document.createElement('label');
    label.innerText = text;
    label.appendChild(input);
    return label;
}

function createRadioInput(index, value, checked) {
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = `accuracy-${index}`;
    radio.value = value;
    radio.checked = checked;
    radio.addEventListener('change', onRadioChange);

    return radio;
}

function createInaccurateOptions(index, show) {
    const div = document.createElement('div');
    div.classList.add('inaccurate-options');
    div.id = `inaccurate-options-${index}`;

    const preconditionInput = createCheckboxInput(index, 'precondition', 'Precondition', getPreviousValue(index, 'preconditionInaccurate'));
    const actionInput = createCheckboxInput(index, 'action', 'Action', getPreviousValue(index, 'actionInaccurate'));
    const expectedResultsInput = createCheckboxInput(index, 'expectedResults', 'Expected Results', getPreviousValue(index, 'expectedResultsInaccurate'));

    div.appendChild(preconditionInput.container);
    div.appendChild(actionInput.container);
    div.appendChild(expectedResultsInput.container);

    if (show) {
        div.style.display = 'block';
    }

    return div;
}

function createCheckboxInput(index, field, text, checked) {
    const container = document.createElement('div');

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = `${field}-${index}`;
    input.value = field;
    input.checked = checked || false;
    input.addEventListener('change', () => onCheckboxChange(index, field));

    const label = document.createElement('label');
    label.innerText = text;
    label.htmlFor = input.name;

    container.appendChild(input);
    container.appendChild(label);

    return { input, container };
}

function onRadioChange(event) {
    const index = parseInt(event.target.name.split('-')[1], 10);
    const inaccurateOptions = document.getElementById(`inaccurate-options-${index}`);

    if (event.target.value === 'good') {
        inaccurateOptions.style.display = 'none';
        updateEvaluationData(index, 'accuracy', 'good');
    } else {
        inaccurateOptions.style.display = 'block';
        updateEvaluationData(index, 'accuracy', 'inaccurate');
    }
}

function onCheckboxChange(index, field) {
    updateEvaluationData(index, `${field}Inaccurate`, !getPreviousValue(index, `${field}Inaccurate`));
}

function updateEvaluationData(index, key, value) {
    const data = evaluationData.find(item => item.index == index);
    if (data) {
        data[key] = value;
    }
}

function downloadEvaluation() {
    const evaluatedData = evaluationData.map(data => ({
        index: data.index,
        accuracy: data.accuracy,
        preconditionInaccurate: data.preconditionInaccurate,
        actionInaccurate: data.actionInaccurate,
        expectedResultsInaccurate: data.expectedResultsInaccurate
    }));

    const blob = new Blob([JSON.stringify(evaluatedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'evaluation.json';
    a.click();
}
