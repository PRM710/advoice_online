export function handleRecognition() {
  const resultText = document.getElementById('speech-text');
  const start = document.getElementById('start');
  const stop = document.getElementById('stop');
  const languageSelect = document.getElementById('lang');
  const fontName = document.getElementById('fonts');
  const fontSizeRef = document.getElementById('size');

  let speechRecognition = window.speechRecognition || window.webkitSpeechRecognition;
  let recognition;
  let speechGrammarList = new (window.SpeechGrammarList || window.webkitSpeechGrammarList)();

  const courtPhrases = [
    'writ', 'subpoena', 'affidavit', 'testimony', 'injunction', 'plea', 
    'defendant', 'plaintiff', 'deposition', 'court order', 'cross-examination',
    'voir dire', 'arraignment', 'bench warrant', 'bailiff'
  ];

  function handleTextTransformations(text) {
    const lowerCasePhrase = "off capital";
    const capitalPhrase = "on capital";
    const backspacePhrase = "delete";

    let lowerCaseIndex = text.toLowerCase().indexOf(lowerCasePhrase);
    let capitalIndex = text.toLowerCase().indexOf(capitalPhrase);
    let backspaceIndex = text.toLowerCase().indexOf(backspacePhrase);

    if (backspaceIndex !== -1) {
      text = deleteLastWord(text, backspaceIndex);
    }

    if (lowerCaseIndex !== -1 && capitalIndex !== -1) {
      if (lowerCaseIndex < capitalIndex) {
        text = text.slice(0, lowerCaseIndex) + text.slice(lowerCaseIndex + lowerCasePhrase.length).toLowerCase();
        text = text.slice(0, capitalIndex) + text.slice(capitalIndex + capitalPhrase.length).toUpperCase();
      } else {
        text = text.slice(0, capitalIndex) + text.slice(capitalIndex + capitalPhrase.length).toUpperCase();
        text = text.slice(0, lowerCaseIndex) + text.slice(lowerCaseIndex + lowerCasePhrase.length).toLowerCase();
      }
    } else if (lowerCaseIndex !== -1) {
      text = text.slice(0, lowerCaseIndex) + text.slice(lowerCaseIndex + lowerCasePhrase.length).toLowerCase();
    } else if (capitalIndex !== -1) {
      text = text.slice(0, capitalIndex) + text.slice(capitalIndex + capitalPhrase.length).toUpperCase();
    }

    courtPhrases.forEach(phrase => {
      const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
      text = text.replace(regex, phrase.toUpperCase());
    });

    text = wordConcat(text, recognition.lang);
    text = text.charAt(0).toUpperCase() + text.slice(1);
    text = text.replace(/([.!?]\s*)([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase());

    return text;
  }

  function deleteLastWord(text, commandIndex) {
    const lastSpaceIndex = text.lastIndexOf(' ', commandIndex);
    return lastSpaceIndex === -1 ? '' : text.slice(0, lastSpaceIndex).trim();
  }

  function wordConcat(text, lang) {
    const abbreviations = {
      "number": "No.",
      "doctor": "Dr.",
      "honorable": "Hon'ble",
      "mister": "Mr."
    };

    Object.keys(abbreviations).forEach((key) => {
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      text = text.replace(regex, abbreviations[key]);
    });

    const numberedPoints = {
      "first point": "1)",
      "second point": "2)",
      "third point": "3)",
      "fourth point": "4)",
      "fifth point": "5)",
      "sixth point": "6)",
      "seventh point": "7)",
      "eighth point": "8)",
      "ninth point": "9)",
      "tenth point": "10)"
    };

    Object.keys(numberedPoints).forEach(key => {
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      text = text.replace(regex, numberedPoints[key]);
    });

    const spokenDatePattern = /(\d{1,2})(?:st|nd|rd|th)?\s+([a-zA-Z]+)\s+(\d{4})/;
    text = text.replace(spokenDatePattern, (match, day, month, year) => {
      const months = {
        january: "01", february: "02", march: "03", april: "04",
        may: "05", june: "06", july: "07", august: "08",
        september: "09", october: "10", november: "11", december: "12"
      };
      return months[month.toLowerCase()] 
        ? `${day.padStart(2, '0')}/${months[month.toLowerCase()]}/${year}`
        : match;
    });

    if (lang === 'en') {
      text = text
        .replaceAll(/\bunderscore\b/gi, "_")
        .replaceAll(/\bcopyright symbol\b/gi, "©")
        .replaceAll(/\bvertical bar\b/gi, "|")
        .replaceAll(/\bfull[ -]?stop\b/gi, ". ")
        .replaceAll(/\bstop\b/gi, ". ")
        .replaceAll(/\bcolon\b/gi, ":")
        .replaceAll(/\bsemi[ -]?colon\b/gi, ";")
        .replaceAll(/\bdash\b/gi, "-")
        .replaceAll(/\bspace\b/gi, " ")
        .replaceAll(/\bapostrophe\b/gi, "'")
        .replaceAll(/\bcoma\b/gi, ",")
        .replaceAll(/\bcomma\b/gi, ",")
        .replaceAll(/\bsingle inverted\b/gi, "'")
        .replaceAll(/\bdouble inverted\b/gi, '"')
        .replaceAll(/\bdouble[ -]?quote\b/gi, '"')
        .replaceAll(/\bopen[ -]?bracket\b/gi, "(")
        .replaceAll(/\bclose[ -]?bracket\b/gi, ")")
        .replaceAll(/\bpercent(?:age)?\b/gi, "%")
        .replaceAll(/\bat[ -]?the[ -]?rate\b/gi, "@")
        .replaceAll(/\bexclamation[ -]?mark\b/gi, "!")
        .replaceAll(/\bquestion[ -]?mark\b/gi, "?")
        .replaceAll(/\bampersand\b/gi, "&")
        .replaceAll(/\band[ -]?sign\b/gi, "&")
        .replaceAll(/\bnew[ -]?line\b/gi, "<br/>")
        .replaceAll(/\bnew[ -]?paragraph\b/gi, "&nbsp;".repeat(14))
        .replaceAll(/\bbold\b/gi, "<strong>")
        .replaceAll(/\bno[ -]?bold\b/gi, "</strong>")
        .replaceAll(/\bitalic\b/gi, "<em>")
        .replaceAll(/\bno[ -]?italic\b/gi, "</em>")
        .replaceAll(/\bunderline\b/gi, "<u>")
        .replaceAll(/\bno[ -]?underline\b/gi, "</u>")
        .replaceAll(/\bstrike\b/gi, "<s>")
        .replaceAll(/\bno[ -]?strike\b/gi, "</s>")
        .replaceAll(/\bsub\b/gi, "<sub>")
        .replaceAll(/\bno[ -]?sub\b/gi, "</sub>")
        .replaceAll(/\bsuper\b/gi, "<sup>")
        .replaceAll(/\bno[ -]?super\b/gi, "</sup>");
    } else if (lang === 'mr') { // Marathi
      text = text
        .replaceAll("अंडरस्कोर", "_")
        .replaceAll("कॉपीराइट", "©")
        .replaceAll("वर्टिकल बार", "|")
        .replaceAll("फुलस्टॉप", ". ")
        .replaceAll("स्टॉप", ". ")
        .replaceAll("कोलन", ":")
        .replaceAll("सेमीकोलन", ";")
        .replaceAll("डॅश", "-")
        .replaceAll("स्पेस", " ")
        .replaceAll("अपोस्ट्रॉफी", "'")
        .replaceAll("सिंगल इन्व्हर्टेड", "'")
        .replaceAll("डबल इन्व्हर्टेड", '"')
        .replaceAll("कोमा", ",")
        .replaceAll("डबल कोट", '"')
        .replaceAll("ओपन ब्रॅकेट", "(")
        .replaceAll("क्लोज ब्रॅकेट", ")")
        .replaceAll("टक्के", "%")
        .replaceAll("अॅट द रेट", "@")
        .replaceAll("एक्सक्लमेशन मार्क", "!")
        .replaceAll("प्रश्नचिन्ह", "?")
        .replaceAll("अँपरसँड", "&")
        .replaceAll("नवीन ओळ", "<br/>")
        .replaceAll("नवीन परिच्छेद", "&nbsp;".repeat(14))
        .replaceAll("बोल्ड सुरू", "<strong>")
        .replaceAll("बोल्ड समाप्त", "</strong>")
        .replaceAll("इटॅलिक सुरू", "<em>")
        .replaceAll("इटॅलिक समाप्त", "</em>")
        .replaceAll("अंडरलाइन सुरू", "<u>")
        .replaceAll("अंडरलाइन समाप्त", "</u>")
        .replaceAll("स्ट्राइक सुरू", "<s>")
        .replaceAll("स्ट्राइक समाप्त", "</s>")
        .replaceAll("सब सुरू", "<sub>")
        .replaceAll("सब समाप्त", "</sub>")
        .replaceAll("सुपर सुरू", "<sup>")
        .replaceAll("सुपर समाप्त", "</sup>");
    } else if (lang === 'gu') { // Gujarati
      text = text
        .replaceAll("અન્ડરસ્કોર", "_")
        .replaceAll("કોપીરાઇટ", "©")
        .replaceAll("વર્ટિકલ બાર", "|")
        .replaceAll("ફુલસ્ટોપ", ". ")
        .replaceAll("સ્ટોપ", ". ")
        .replaceAll("કોલન", ":")
        .replaceAll("સેમીકોલન", ";")
        .replaceAll("ડેશ", "-")
        .replaceAll("સ્પેસ", " ")
        .replaceAll("એપોસ્ટ્રોફી", "'")
        .replaceAll("સિંગલ ઇન્વર્ટેડ", "'")
        .replaceAll("ડબલ ઇન્વર્ટેડ", '"')
        .replaceAll("કોમા", ",")
        .replaceAll("ડબલ કોટ", '"')
        .replaceAll("ઓપન બ્રેકેટ", "(")
        .replaceAll("ક્લોઝ બ્રેકેટ", ")")
        .replaceAll("ટકા", "%")
        .replaceAll("એટ ધ રેટ", "@")
        .replaceAll("એક્સક્લેમેશન માર્ક", "!")
        .replaceAll("પ્રશ્નચિહ્ન", "?")
        .replaceAll("એમ્પરસેન્ડ", "&")
        .replaceAll("નવી લાઇન", "<br/>")
        .replaceAll("નવો ફકરો", "&nbsp;".repeat(14))
        .replaceAll("બોલ્ડ શરૂ", "<strong>")
        .replaceAll("બોલ્ડ સમાપ્ત", "</strong>")
        .replaceAll("ઇટાલિક શરૂ", "<em>")
        .replaceAll("ઇટાલિક સમાપ્ત", "</em>")
        .replaceAll("અન્ડરલાઇન શરૂ", "<u>")
        .replaceAll("અન્ડરલાઇન સમાપ્ત", "</u>")
        .replaceAll("સ્ટ્રાઇક શરૂ", "<s>")
        .replaceAll("સ્ટ્રાઇક સમાપ્ત", "</s>")
        .replaceAll("સબ શરૂ", "<sub>")
        .replaceAll("સબ સમાપ્ત", "</sub>")
        .replaceAll("સુપર શરૂ", "<sup>")
        .replaceAll("સુપર સમાપ્ત", "</sup>");
    } else { // Hindi
      text = text
        .replaceAll("अंडरस्कोर", "_")
        .replaceAll("कॉपीराइट", "©")
        .replaceAll("वर्टीकल बार", "|")
        .replaceAll("फुलस्टॉप", ". ")
        .replaceAll("स्टॉप", ". ")
        .replaceAll("कोलन", ":")
        .replaceAll("सेमी कोलन", ";")
        .replaceAll("डॅश", "-")
        .replaceAll("स्पेस", " ")
        .replaceAll("अपोस्ट्रॉफी", "'")
        .replaceAll("सिंगल इनवर्टेड", "'")
        .replaceAll("डबल इनवर्टेड", '"')
        .replaceAll("कॉमा", ",")
        .replaceAll("डबल कोट", '"')
        .replaceAll("ओपन ब्रॅकेट", "(")
        .replaceAll("क्लोज ब्रॅकेट", ")")
        .replaceAll("पर्सेंट", "%")
        .replaceAll("एट द रेट", "@")
        .replaceAll("एक्सक्लेमेशन मार्क", "!")
        .replaceAll("क्वेश्चन मार्क", "?")
        .replaceAll("अँपरसँड", "&")
        .replaceAll("न्यू लाइन", "<br/>")
        .replaceAll("न्यू पैरा", "&nbsp;".repeat(14))
        .replaceAll("बोल्ड सुरू", "<strong>")
        .replaceAll("बोल्ड समाप्त", "</strong>")
        .replaceAll("इटैलिक सुरू", "<em>")
        .replaceAll("इटैलिक समाप्त", "</em>")
        .replaceAll("अंडरलाइन सुरू", "<u>")
        .replaceAll("अंडरलाइन समाप्त", "</u>")
        .replaceAll("स्ट्राइक सुरू", "<s>")
        .replaceAll("स्ट्राइक समाप्त", "</s>")
        .replaceAll("सब सुरू", "<sub>")
        .replaceAll("सब समाप्त", "</sub>")
        .replaceAll("सुपर सुरू", "<sup>")
        .replaceAll("सुपर समाप्त", "</sup>");
    }

    return text;
  }

  function speechtoText() {
    if (!speechRecognition) {
      console.error("Speech Recognition API is not supported in this browser.");
      return;
    }

    recognition = new speechRecognition();
    recognition.lang = languageSelect.value;
    recognition.interimResults = true;
    recognition.continuous = true;
    
    let p = document.createElement("span");
    resultText.appendChild(p);

    recognition.addEventListener('result', (e) => {
      const transcript = Array.from(e.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join('');

      let processedTranscript = handleTextTransformations(transcript);
      p.style.fontFamily = fontName.value;
      p.style.fontSize = fontSizeRef.value;
      p.innerHTML = processedTranscript;
    }); 

    recognition.onerror = (event) => {
      console.error("Error:", event.error);
    };
  }

  start.addEventListener('click', () => {
    speechtoText();
    recognition.start();
  });

  stop.addEventListener('click', () => {
    if (recognition) recognition.stop();
  });
}
