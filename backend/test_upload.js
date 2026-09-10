const fs = require('fs');
const path = require('path');

async function test() {
  const dummyPath = path.join(__dirname, 'dummy.jpg');
  fs.writeFileSync(dummyPath, 'dummy data');
  
  const blob = new Blob([fs.readFileSync(dummyPath)], { type: 'image/jpeg' });
  const form = new FormData();
  form.append('files', blob, 'dummy.jpg');

  try {
    const res = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      body: form
    });
    const data = await res.json();
    console.log("STATUS:", res.status);
    console.log("RESPONSE:", data);
  } catch (error) {
    console.log("ERROR:", error.message);
  }
}
test();
