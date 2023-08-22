export const ID_CHARS = '0123456789ABCDFGHIJKLMNQRSUVWXYZ';

// cccd-cddd-cddd-dddd
// 0123-4567-89AB-CDEF
// .c.*-.*.*-.*.*-.*.*
// ..c*-..**-..**-..**
// ....-c***-....-****
// ....-....-c***-****
// c**.-*...-*...-....


export function* genChecksumIndices(length) {
    for(var i=0; i<Math.ceil(Math.log2(length)); i++) {
        yield Math.pow(2, i);
    }
}


function* genDataIndices(length) {
    var g = genChecksumIndices(length);
    var checksumIndex = g.next().value;
    for(var i=1; i<length; i++) {
        if (i === checksumIndex) {
            checksumIndex = g.next().value;
        }
        else {
            yield i;
        }
    }
}


function* genChecksumPattern(length, level) {
    var stride = Math.floor(Math.pow(2, level));
    var start = stride;

    var skipFirst = true;
    for (var i=start; i<length; i+=stride*2) {
        for (var j=0; j<stride; j++) {
            if (skipFirst) {
                skipFirst = false;
            }
            else if (i+j < length) {
                yield i+j;
            }
        }
    }
}


export function getDataLength(length) {
    return length - Math.ceil(Math.log2(length));
}


export function randomData(size) {
    var dataLength = getDataLength(size);
    var data = [];1
    for (var i=0; i<dataLength; i++) {
        data.push(ID_CHARS[Math.floor(Math.random() * ID_CHARS.length)]);
    }
    return data.join('');
}


function verifyData(length, data) {
    var dataLength = getDataLength(length);
    if (data.length !== dataLength) return false;
    for (var i=0; i<data.length; i++) {
        if (ID_CHARS.indexOf(data[i]) < 0) {
            return false;
        }
    }
    return true;
}


export function removeDashes(id) {
    return id.split('-').join('');
}


export function addDashes(rawId) {
    var id = rawId.substring(0, 4);
    for (var i=4; i<rawId.length; i+=4) {
        id += '-' + rawId.substring(i, i+4);
    }
    return id;
}


export function extractData(rawId) {
    var data = [];
    for (var i of genDataIndices(rawId.length)) {
        data.push(rawId[i]);
    }
    return data.join('');
}


function calculateChecksum(data, pattern) {
    var sum = 0;
    for (var i of pattern) {
        sum += ID_CHARS.indexOf(data[i]);
    }
    //return ID_CHARS[ID_CHARS.length - sum % ID_CHARS.length - 1];
    return ID_CHARS[ID_CHARS.length - sum % ID_CHARS.length - 1];
}


export function createId(length, data) {
    if (!verifyData(length, data)) {
        throw new Error('Invalid data format');
    }
    
    var id = [];
    var dataIndices = genDataIndices(length);
    for (var i=0; i<data.length; i++) {
        id[dataIndices.next().value] = data[i];
    }

    var level = 0;
    for (var i of genChecksumIndices(length)) {
        var pattern = genChecksumPattern(length, level);
        var checksum = calculateChecksum(id, pattern);
        id[i] = checksum;
        level++;
    }

    var checksum = calculateChecksum(id, genChecksumIndices(length));
    id[0] = checksum;

    return id.join('');
}


export function verifyId(rawId) {    
    var checksumIndices = genChecksumIndices(rawId.length);
    for (var i=0; i<Math.ceil(Math.log2(rawId.length)); i++) {
        var pattern = genChecksumPattern(rawId.length, i);
        if (calculateChecksum(rawId, pattern) !== rawId[checksumIndices.next().value]) {
            return false;
        }
    }

    if (calculateChecksum(rawId, genChecksumIndices(rawId.length)) !== rawId[0]) {
        return false;
    }

    return true;
}


export function findPossibleErrors(rawId) {
    var errors = new Set();

    var checksumIndices = genChecksumIndices(rawId.length);
    for (var i=0; i<Math.ceil(Math.log2(rawId.length)); i++) {
        var pattern = genChecksumPattern(rawId.length, i);
        var checksum = calculateChecksum(rawId, pattern);
        var checksumIndex = checksumIndices.next().value;
        if (rawId[checksumIndex] !== checksum) {
            errors.add(checksumIndex);
            for (var j of genChecksumPattern(rawId.length, i)) {
                errors.add(j);
            }
        }
    }

    var checksum = calculateChecksum(rawId, genChecksumIndices(rawId.length));
    if (rawId[0] !== checksum) {
        errors.add(0);
        for (var j of genChecksumPattern(rawId.length, i)) {
            errors.add(j);
        }
    }

    var checksumIndices = genChecksumIndices(rawId.length);
    for (var i=0; i<Math.log2(rawId.length); i++) {
        var pattern = genChecksumPattern(rawId.length, i);
        var checksum = calculateChecksum(rawId, pattern);
        var checksumIndex = checksumIndices.next().value;
        if (rawId[checksumIndex] === checksum) {
            errors.delete(checksumIndex);
            for (var j of genChecksumPattern(rawId.length, i)) {
                errors.delete(j);
            }
        }
    }

    var checksum = calculateChecksum(rawId, genChecksumIndices(rawId.length));
    if (rawId[0] === checksum) {
        errors.delete(0);
        for (var j of genChecksumPattern(rawId.length, i)) {
            errors.delete(j);
        }
    }

    return Array.from(errors).sort((a,b) => a - b);
}


export function correctId(rawId, earlyTermination=1) {
    var possiblyCorrect = new Set();
    var possibleErrors = findPossibleErrors(rawId, true).reverse();
    if (possibleErrors.length === 0) {
        // This id is already correct
        return [rawId];
    }

    var stack = [[rawId, 0, 0]];
    while (stack.length > 0) {
        var [currentId, currentIndex, currentStep] = stack.pop();
        var charIndex = possibleErrors[currentIndex];
        for (var c of ID_CHARS) {
            var new_id = currentId.substring(0, charIndex) + c + currentId.substring(charIndex+1);
            if (verifyId(new_id, true)) {
                possiblyCorrect.add(new_id);
            }
            if (currentIndex < possibleErrors.length-1 && currentStep < earlyTermination) {
                stack.push([new_id, currentIndex+1, currentStep+1]);
            }
        }
    }

    return Array.from(possiblyCorrect).sort();
}
