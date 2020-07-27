const fetch = require('node-fetch');
const fs = require('fs');
const apiToken = getApiToken();
const apiEndpointPath = 'assignments';

console.log('Starting passed vocabulary extraction from WaniKani!');
console.log('Getting all the vocabulary...');
fetchSubjects()
    .then(subjects => {
        console.log('Getting passed vocabulary references...');
        getPassedVocabulary()
          .then(passed => {
              console.log('Extracting passed morphemes...');
              const extracted = new Set();
              passed.forEach(p => {
                  const found = subjects.filter(s => s.id === p.data.subject_id)[0];
                  extracted.add(found.data.characters);
              });
              console.log('Extracted ' + extracted.length + ' morphemes.');
              return extracted;
          })
            .then(extracted => {
                console.log('Adding custom known morphemes to the list...');
                let data;
                try {
                    data = fs.readFileSync('known.txt', 'UTF-8');
                    const lines = data.split(/\r?\n/);

                    lines.forEach((line) => {
                    extracted.add(line);
                    });
                } catch (err) {
                    if (err.code === 'ENOENT') {
                        console.log('No personalized known words file found!');
                    } else {
                        throw err;
                    }
                }
                return extracted;
            })
            .then(extracted => {
                console.log('Writing known morphemes to file...');
                const file = fs.createWriteStream('passed_words.txt');
                extracted.forEach(function(v) { file.write(v + '\n'); });
                file.end();
                console.log('Done!');
            });
    });

function getApiToken() {
    try {
        const data = fs.readFileSync('.apiToken', 'UTF-8');
        const lines = data.split(/\r?\n/);
        return lines[0];
    } catch (err) {
        console.error("Impossible to get the API token. Create .apiToken in this same folder.");
        throw err;
    }
}

async function getKnownMorphemes() {
    return new Promise((resolve, reject) => {
        fs.readFile('known.txt', {encoding: 'utf-8'}, function(err, data) {
            if (err)
                reject(err);
            console.log(data);
            resolve(data);
        });
    });
}

async function fetchSubjects(pageUrl) {
  try {
    const url = pageUrl ? pageUrl : 'https://api.wanikani.com/v2/subjects?types=vocabulary';
    const response = await fetch(url, {headers: {'Authorization': `Bearer ${apiToken}`}});
    let data = await response.json();

    let next_page = data.pages.next_url;
    data = data.data;

    if (next_page) {
      let temp_data = await fetchSubjects(next_page);
      data = data.concat(temp_data);
    }

    return data;
  } catch (err) {
    return console.error(err);
  }
}

async function getPassedVocabulary(pageUrl) {
  try {
    const url = pageUrl ? pageUrl : 'https://api.wanikani.com/v2/assignments?passed=true&subject_types=vocabulary';
    const response = await fetch(url, {headers: {'Authorization': `Bearer ${apiToken}`}});
    let data = await response.json();

    let next_page = data.pages.next_url;
    data = data.data;

    if (next_page) {
      let temp_data = await getPassedVocabulary(next_page);
      data = data.concat(temp_data);
    }

    return data;
  } catch (err) {
    return console.error(err);
  }
}
