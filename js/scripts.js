async function sendData() {
    // Clear any translated text from the output panel.
    $('#translatedData').val('');

    //translated data
    let dataFromModel = '';

    //getting language from
    let selectLanguageFrom = document.getElementById('languageFrom');

    //getting language to
    let selectLanguageTo = document.getElementById('languageTo');
    let selectLanguageToText =
        selectLanguageTo.options[selectLanguageTo.selectedIndex].value;

    //getting data to translate
    let dataToTranslate = document.getElementById('sourceData').value;
    let isValid = validateText(dataToTranslate);
    if (isValid === false) {
        errorMessage();
        return;
    }

    //getting the model
    let model = '';
    if ($('#languageFrom').val() == 'en') {
        model = 'en-mul';
        // Add a tag specifying the target language
        dataToTranslate = `>>${selectLanguageToText}<< ${dataToTranslate}`;
    } else {
        model = 'mul-en';
    }

    // Don't do anything if the source text is empty or just spaces
    if (/^ *$/.test(dataToTranslate)) {
        return;
    }

    $('#translation-in-progress-spinner').show();

    let dataObj = {
        model: model,
        inputs: dataToTranslate.trim()
    };

    await postData(dataObj)
        .then((data) => {
            console.log(data);
            dataFromModel = data[0]['generated_text'];
        })
        .catch((err) => {
            console.log('error', err);
        });
    document.getElementById('translatedData').value = `${dataFromModel}`;
    $('#translation-in-progress-spinner').hide();
}

async function postData(data) {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Accept', 'application/json');
    var raw = JSON.stringify(data);
    var requestOptions = {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: myHeaders,
        body: raw,
        Accept: '*/*',
        redirect: 'follow'
    };
    const response = await fetch(
        'https://8c8jirboi0.execute-api.eu-west-1.amazonaws.com/prod/',
        requestOptions
    );
    return response.json();
}

// Make enter key submit the text for translation
$('#sourceData').keypress(function (e) {
    if (e.which === 13) {
        e.preventDefault();
        sendData();
    }
});

// Update the target language options depending on the source language
var preferredNonEnglishTarget = $('#languageTo').val();
var nonEnglishOptions = [
    ['Acholi', 'ach'],
    ['Ateso', 'teo'],
    ['Luganda', 'lug'],
    ['Lugbara', 'lgg'],
    ['Runyankole', 'nyn']
];

function updateTargetLanguages() {
    targetSelect = $('#languageTo');
    if ($('#languageFrom').val() == 'en') {
        targetSelect.empty();
        for (const option of nonEnglishOptions) {
            isPreferred = option[1] == preferredNonEnglishTarget;
            targetSelect.append(
                new Option(option[0], option[1], isPreferred, isPreferred)
            );
        }
    } else {
        // Remember what the target language was before clearing the options.
        preferredNonEnglishTarget = $('#languageTo').val();
        targetSelect.empty();
        targetSelect.append(new Option('English', 'en', true, true));
    }
}

async function sendFeedback(feedback) {
    if ($('#sourceData').val() == '' || $('#translatedData').val() == '') {
        return;
    }

    var Timestamp = Date.now();
    var SourceText = document.getElementById('sourceData').value;
    var LanguageFrom = document.getElementById('languageFrom').value;
    var LanguageTo = document.getElementById('languageTo').value;
    var TranslatedText = document.getElementById('translatedData').value;

    fetch(
        'https://l0jsqxhmgl.execute-api.us-east-1.amazonaws.com/prod/feedback',
        {
            method: 'POST',
            body: JSON.stringify({
                Timestamp: Timestamp,
                feedback: feedback,
                SourceText: SourceText,
                LanguageFrom: LanguageFrom,
                LanguageTo: LanguageTo,
                TranslatedText: TranslatedText
            })
        }
    )
        .then((response) => response.json())
        .then((response) => {
            console.log(response);
        });
}

function validateText(text) {
    if (text === '' || !text) return false;
    document.getElementById('error').textContent = '';
    return !/[^A-Za-z0-9 ,.'":;!?]/.test(text);
}

function errorMessage() {
    var error = document.getElementById('error');
    if (isNaN(document.getElementById('sourceData').value)) {
        // Changing content and color of content
        error.textContent =
            'Please enter text below 1000 characters and without special characters';
        error.style.color = 'red';
    } else {
        error.textContent = '';
    }
}

const posFeedback = document.getElementById('feedback-good');
const negFeedback = document.getElementById('feedback-bad');
posFeedback.addEventListener(
    'click',
    function () {
        sendFeedback('Good');
    },
    false
);
negFeedback.addEventListener(
    'click',
    function () {
        sendFeedback('Bad');
    },
    false
);
