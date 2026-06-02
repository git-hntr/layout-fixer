#!/usr/bin/gjs -m

const EN = "qwertyuiop[]asdfghjkl;'zxcvbnm,./QWERTYUIOP{}ASDFGHJKL:\"ZXCVBNM<>?@#$^&`~";
const UA = "йцукенгшщзхїфівапролджєячсмитьбю.ЙЦУКЕНГШЩЗХЇФІВАПРОЛДЖЄЯЧСМИТЬБЮ,\"№;:?'₴";

function _convertText(text) {
    let isEng = false;
    
    for (let i = 0; i < text.length; i++) {
        let isE = EN.includes(text[i]);
        let isU = UA.includes(text[i]);
        
        if (isE && !isU) { isEng = true; break; }
        if (isU && !isE) { isEng = false; break; }
    }

    let from = isEng ? EN : UA;
    let to = isEng ? UA : EN;
    return text.split('').map(c => {
        let idx = from.indexOf(c);
        return idx !== -1 ? to[idx] : c;
    }).join('');
}


const testCases = [
    { input: "ghbdsn", expected: "привіт" },
    { input: "gthtvjuf", expected: "перемога" },
    { input: "vnbhj4rf", expected: "мтиро4ка" },
    { input: "ghjcnj ntrcn", expected: "просто текст" },
    { input: "ecgsiyj", expected: "успішно" },
    { input: "lhfne '", expected: "драту є" },
    { input: "g'gldf", expected: "пєпдва" },
    { input: "h`zybq", expected: "р'яний" },
    { input: "~100", expected: "₴100" },
    { input: ".рщьу.вр", expected: "/home/dh" },
    { input: "юрщьуювр", expected: ".home.dh" }
];

let passed = 0;

print("=== Running LayoutFixer Text Conversion Tests ===\n");

for (let i = 0; i < testCases.length; i++) {
    let tc = testCases[i];
    let result = _convertText(tc.input);
    
    if (result === tc.expected) {
        print(`[PASS] ${tc.input} -> ${result}`);
        passed++;
    } else {
        print(`[FAIL] ${tc.input} | Expected: ${tc.expected} | Got: ${result}`);
    }
}

print(`\nResult: ${passed}/${testCases.length} tests passed.`);

if (passed !== testCases.length) {
    imports.system.exit(1);
}
