class HashTable {
    constructor(size = 10000, method = 'linear') {
        this.size = size;
        this.table = new Array(size).fill(null);
        this.deleted = new Array(size).fill(false);
        this.method = method;
        this.currentClusterLength = 0;
    }

    async _hash(key) {
        if (this.method === 'cryptographic') {
            const encoder = new TextEncoder();
            const data = encoder.encode(key);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return parseInt(hashHex, 16) % this.size;
        } else if (this.method === 'random') {
            return this._randomHash(key);
        } else {
            if (typeof key === 'number') {
                return key % this.size;
            } else {
                let hash = 0;
                for (let i = 0; i < key.length; i++) {
                    hash = (hash << 5) - hash + key.charCodeAt(i);
                    hash = hash & hash;
                }
                return Math.abs(hash) % this.size;
            }
        }
    }

    _randomHash() {
        return Math.floor(Math.random() * this.size); // Use this.size instead of 10000
    }

    async _secondHash(key) {
        if (typeof key === 'number') {
            return (key % (this.size - 1)) + 1;
        } else {
            let hash = 0;
            for (let i = 0; i < key.length; i++) {
                hash = (hash << 5) + key.charCodeAt(i);
                hash = hash & hash;
            }
            return Math.abs(hash) % (this.size - 1) + 1;
        }
    }

    async _probe(key, i) {
        if (this.method === 'linear') {
            return (await this._hash(key) + i) % this.size;
        } else if (this.method === 'quadratic') {
            const c1 = 1, c2 = 3;
            return (await this._hash(key) + c1 * i + c2 * i * i) % this.size;
        } else if (this.method === 'double') {
            return (await this._hash(key) + i * await this._secondHash(key)) % this.size;
        } else if (this.method === 'cryptographic') {
            return (await this._hash(key) + i) % this.size;
        } else if (this.method === 'random') {
            return (await this._randomHash() + i) % this.size;
        }
    }

    async insert(key, value) {
        let i = 0;
        while (i < this.size) {
            let index = await this._probe(key, i);
            if (this.table[index] === null || this.deleted[index]) {
                this.table[index] = { key, value };
                this.deleted[index] = false;
                this.display();
                return;
            }
            i++;
        }
        throw new Error("Hash table overflow");
    }

    async insertTask2(key, value) {
        let i = 0;
        while (i < this.size) {
            let index = await this._probe(key, i);
            if (this.table[index] === null || this.deleted[index]) {
                this.table[index] = { key, value };
                this.deleted[index] = false;
                return;
            }
            i++;
        }
        throw new Error("Hash table overflow");
    }

    async search(key) {
        let i = 0;
        while (i < this.size) {
            let index = await this._probe(key, i);
            if (this.table[index] === null) {
                return null;
            }
            if (this.table[index].key === key && !this.deleted[index]) {
                return this.table[index].value;
            }
            i++;
        }
        return null;
    }

    async delete(key, value) {
        let i = 0;
        while (i < this.size) {
            let index = await this._probe(key, i);
            if (this.table[index] === null) {
                return false;
            }
            if (this.table[index].key === key && this.table[index].value === value && !this.deleted[index]) {
                this.table[index] = null;
                this.deleted[index] = true;
                this.display();
                return true;
            }
            i++;
        }
        return false;
    }

    display() {
        const hashTableBody = document.querySelector('#hashTable tbody');
        hashTableBody.innerHTML = '';
        this.table.forEach((item, index) => {
            if (item !== null) {
                const row = document.createElement('tr');
                const indexCell = document.createElement('td');
                const keyCell = document.createElement('td');
                const valueCell = document.createElement('td');

                indexCell.textContent = index;
                keyCell.textContent = item.key;
                valueCell.textContent = item.value;

                row.appendChild(indexCell);
                row.appendChild(keyCell);
                row.appendChild(valueCell);

                hashTableBody.appendChild(row);
            }
        });
    }

    getLongestClusterLength(max, i) {
        let maxClusterLength = max;

        if (this.table[i] !== null && !this.deleted[i]) {
            this.currentClusterLength++;
        } else {
            if (this.currentClusterLength > maxClusterLength) {
                maxClusterLength = this.currentClusterLength;
            }
            this.currentClusterLength = 0;
        }

        return maxClusterLength;
    }
}

let ht;

function updateHashTable() {
    const method = document.getElementById('hashMethod').value;
    ht = new HashTable(10000, method);
}

async function insert() {
    const key = document.getElementById('key').value;
    const value = document.getElementById('value').value;
    await ht.insert(isNaN(key) ? key : Number(key), value);
}

async function search() {
    const key = document.getElementById('searchKey').value;
    const result = await ht.search(isNaN(key) ? key : Number(key));
    document.getElementById('searchResult').innerText = result !== null ? `Found: ${result}` : 'Not found';
}

async function remove() {
    const key = document.getElementById('deleteKey').value;
    const value = document.getElementById('deleteValue').value;
    const result = await ht.delete(isNaN(key) ? key : Number(key), value);
    document.getElementById('searchResult').innerText = result ? `Deleted: ${key}` : 'Key and value not found';
}

document.getElementById('hashMethod').addEventListener('change', updateHashTable);
updateHashTable();

async function generateAndInsertElements() {
    const analysisTableBody = document.querySelector('#analysisTable tbody');
    analysisTableBody.innerHTML = '';
    const methods = ['linear', 'quadratic', 'double', 'cryptographic', 'random'];
    
    for (const method of methods) {
        let longestClusterLength = 0;
        let currentClusterLength = 0; // Use local variable
        const ht = new HashTable(10000, method);
        const startTime = performance.now();

        for (let i = 0; i < 10000; i++) {
            longestClusterLength = ht.getLongestClusterLength(longestClusterLength, i);
            const key = generateRandomString(0, 100000); // Генерация случайного ключа
            const value = generateRandomString(0, 100000); // Генерация случайного значения
            try {
                await ht.insertTask2(key, value);
            } catch (error) {
                console.error(error.message);
                break;
            }
        }
        
        const endTime = performance.now();
        
        const row = document.createElement('tr');
        const methodCell = document.createElement('td');
        const clusterCell = document.createElement('td');
        const timeCell = document.createElement('td');

        methodCell.textContent = method;
        clusterCell.textContent = longestClusterLength;
        timeCell.textContent = ((endTime - startTime) / 1000).toFixed(2); // Convert time to seconds

        row.appendChild(methodCell);
        row.appendChild(clusterCell);
        row.appendChild(timeCell);

        analysisTableBody.appendChild(row);
    }
}

function generateRandomString(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}