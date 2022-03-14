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
    let isValid =
        validateText(dataToTranslate.toLowerCase()) &&
        aboveMinLength(dataToTranslate);
    if (isValid === false) {
        msg =
            'Please enter text between 15 and 1500 characters and without special characters';
        errorMessage(msg);
        return;
    }

    if (containsHelloHi(dataToTranslate.toLowerCase())) {
        msg = `Note: There is no direct translation of "hello", "hey" or "hi" in most Ugandan local languages. 
               Would you like to try some of the sample phrases below instead?`;
        errorMessage(msg);
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
    show_phrasebook();
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

function containsHelloHi(text) {
    return (
        text.includes(' hello') || text.includes(' hi') || text.includes(' hey')
    );
}

function aboveMinLength(text) {
    return text.length > 15;
}

function errorMessage(msg) {
    var error = document.getElementById('error');
    if (isNaN(document.getElementById('sourceData').value)) {
        // Changing content and color of content
        error.textContent = msg;
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

//Collapsible
var coll = document.getElementsByClassName('collapsible');
var i;

for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener('click', function () {
        this.classList.toggle('active');
        var content = this.nextElementSibling;
        if (content.style.display === 'block') {
            content.style.display = 'none';
        } else {
            content.style.display = 'block';
        }
    });
}

var coll = document.getElementsByClassName('collapsible');
var i;

for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener('click', function () {
        this.classList.toggle('active');
        var content = this.nextElementSibling;
        if (content.style.maxHeight) {
            content.style.maxHeight = null;
        } else {
            content.style.maxHeight = content.scrollHeight + 'px';
        }
    });
}

// Tab lists
function openPhraseBook(evt, phraseCategory) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName('tabcontent');
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = 'none';
    }
    tablinks = document.getElementsByClassName('tablinks');
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(' active', '');
    }
    document.getElementById(phraseCategory).style.display = 'block';
    evt.currentTarget.className += ' active';
}

// Get the element with id="defaultOpen" and click on it
document.getElementById('defaultOpen').click();

// Automatic copy from pressed button to the textarea
function copyToClipboard(elementId) {
    var text = document.getElementById(elementId).innerHTML;
    let textarea = document.getElementById('sourceData');
    textarea.innerHTML = text;
    textarea.focus();
}

// show phrasebook only when selected language is English
function show_phrasebook() {
    //getting language from the selection.
    let selectLanguageFrom = document.getElementById('languageFrom');

    if ($('#languageFrom').val() == 'mul') {
        document.getElementById('phrasebook-tab').style.visibility = 'hidden';
    } else {
        document.getElementById('phrasebook-tab').style.visibility = 'visible';
    }
}
