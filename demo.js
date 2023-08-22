import { ID_CHARS, createId, genChecksumIndices, findPossibleErrors, correctId, addDashes, randomData } from './checked_id.js';


function getId(inputs) {
    return inputs.map((i) => i.value).join('');
}


function clearErrors(inputs) {
    var checksums = genChecksumIndices(inputs.length);
    var nextChecksum = 0;
    for (var i=0; i<inputs.length; i++) {
        if (i === nextChecksum) {
            nextChecksum = checksums.next().value;
            inputs[i].className = 'check';
        }
        else {
            inputs[i].className = '';
        }
    }
}


function setInputs(inputs, rawId) {
    for (var i=0; i<rawId.length; i++) {
        inputs[i].value = rawId[i];
    }
    clearErrors(inputs);
}


function update(length, inputs, output) {
    var rawId = getId(inputs);
    if (rawId.length < length) return;
    
    var errors = findPossibleErrors(rawId);

    clearErrors(inputs);

    for (var i of errors) {
        inputs[i].className = 'error';
    }

    var corrections = correctId(rawId);
    if (corrections.length === 1) {
        if (corrections[0] === rawId) {
            output.innerText = 'Correctly Entered';
        }
        else {
            output.innerText = `Did you mean "${addDashes(corrections[0])}"?`;
        }
    }
    else {
        output.innerText = 'Unable to recognize ID';
    }
}


function inputKeyUp(e, length, inputs, input, output, prev, next) {
    if (e.key === 'ArrowLeft') {
        inputs[prev].focus();
        inputs[prev].select();
    }
    else if (e.key === 'ArrowRight') {
        inputs[next].focus();
        inputs[next].select();
    }
    else if (e.key === 'Home') {
        inputs[0].focus();
        inputs[0].select();
    }
    else if (e.key === 'End') {
        inputs[15].focus();
        inputs[15].select();
    }
    else if (ID_CHARS.indexOf(e.key.toUpperCase()) > -1 && !e.ctrlKey) {
        input.value = input.value.toUpperCase();
        inputs[next].focus();
        inputs[next].select();
    }

    update(length, inputs, output);

    e.preventDefault();
}


function reset(context, size) {
    context.length = size;
    context.input_div.innerHTML = '';
    context.output_div.innerHTML = '';
    let inputs = [];
    for (var i=0; i<size; i++) {
        let input = document.createElement('input');
        input.maxLength = 1;
        input.size = 1;

        inputs.push(input);

        let prev = (i+15) % size;
        let next = (i+1) % size;
        input.addEventListener("keyup", (e) => {
            inputKeyUp(e, size, inputs, input, context.output_div, prev, next);
        });

        context.input_div.appendChild(input);
        if ((i+1) % 4 === 0 && i < size-1) {
            let spacer = document.createElement('span');
            spacer.innerText = '-';
            context.input_div.appendChild(spacer);
        }
    }
    context.inputs = inputs;

    context.id = createId(size, randomData(size));
    setInputs(inputs, context.id);
}


window.addEventListener("load", () => {
    let input_div = document.getElementById('id-input');
    let output_div = document.getElementById('id-output');

    let btnSize8 = document.getElementById('btn-size-8');
    let btnSize12 = document.getElementById('btn-size-12');
    let btnSize16 = document.getElementById('btn-size-16');
    let btnSize20 = document.getElementById('btn-size-20');
    let btnSize24 = document.getElementById('btn-size-24');
    let btnSize28 = document.getElementById('btn-size-28');
    let btnSize32 = document.getElementById('btn-size-32');
    let btnRandomize = document.getElementById('btn-randomize');

    let context = {
        input_div,
        output_div
    };

    btnSize8.addEventListener('click', (e) => reset(context, 8));
    btnSize12.addEventListener('click', (e) => reset(context, 12));
    btnSize16.addEventListener('click', (e) => reset(context, 16));
    btnSize20.addEventListener('click', (e) => reset(context, 20));
    btnSize24.addEventListener('click', (e) => reset(context, 24));
    btnSize28.addEventListener('click', (e) => reset(context, 28));
    btnSize32.addEventListener('click', (e) => reset(context, 32));
    btnRandomize.addEventListener('click', (e) => reset(context, context.length));

    reset(context, 16);
});