class Node {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.next = null;
  }
}

class HashTable {
  constructor(size) {
    this.size = size;
    this.table = new Array(size).fill(null);
    this._const = 0.14; // Константа для метода BitPi
    this.A = (Math.sqrt(5) - 1) / 2; // Константа золотого сечения для метода умножения
  }

  // Метод деления
  hashDivision(key) {
    return key % this.size;
  }

  // Метод умножения (золотое сечение)
  hashMultiplication(key) {
    const fractionalPart = (key * this.A) % 1; // Извлечение дробной части
    return Math.floor(this.size * fractionalPart); // Вычисление индекса
  }

  // Метод BitPi
  hashBitPi(key) {
    return (
      Math.abs(
        ((key >> this.setSize(this.size)) % this.size) +
          Math.floor(Math.PI * this._const)
      ) % this.size
    );
  }

  // Метод сложения
  hashAddition(key) {
    const sum = key
      .toString()
      .split("")
      .reduce((acc, digit) => acc + parseInt(digit, 10), 0);
    return sum % this.size;
  }

  // Метод XOR
  hashXOR(key) {
    let hash = 0;
    const keyStr = key.toString();
    for (let i = 0; i < keyStr.length; i++) {
      hash ^= keyStr.charCodeAt(i);
    }
    return hash % this.size;
  }

  setSize(val) {
    let storage = 0;
    for (let i = 1; ; i++) {
      if (Math.pow(2, i) > val) {
        break;
      }
      storage = i;
    }
    return storage;
  }

  // Вставка элемента
  insert(key, value, hashMethod = "hashBitPi") {
    let index;
    switch (hashMethod) {
      case "hashDivision":
        index = this.hashDivision(key);
        break;
      case "hashMultiplication":
        index = this.hashMultiplication(key);
        break;
      case "hashBitPi":
        index = this.hashBitPi(key);
        break;
      case "hashAddition":
        index = this.hashAddition(key);
        break;
      case "hashXOR":
        index = this.hashXOR(key);
        break;
      default:
        index = this.hashBitPi(key); // Метод по умолчанию
    }

    const newNode = new Node(key, value);
    if (this.table[index] === null) {
      this.table[index] = newNode;
    } else {
      let current = this.table[index];
      while (current.next !== null) {
        current = current.next;
      }
      current.next = newNode;
    }

    // Отладочный вывод для вставки
    console.log(
      `Вставлен ключ: ${key}, значение: ${value}, индекс: ${index}, метод: ${hashMethod}`
    );
  }

  // Поиск элемента по ключу
  get(key, hashMethod = "hashBitPi") {
    let index;
    switch (hashMethod) {
      case "hashDivision":
        index = this.hashDivision(key);
        break;
      case "hashMultiplication":
        index = this.hashMultiplication(key);
        break;
      case "hashBitPi":
        index = this.hashBitPi(key);
        break;
      case "hashAddition":
        index = this.hashAddition(key);
        break;
      case "hashXOR":
        index = this.hashXOR(key);
        break;
      default:
        index = this.hashBitPi(key); // Метод по умолчанию
    }

    let current = this.table[index];
    while (current !== null) {
      if (current.key === key) {
        return { value: current.value, index: index }; // Возвращаем значение и индекс
      }
      current = current.next;
    }
    return null; // Если элемент не найден
  }

  // Удаление элемента по ключу и значению
  delete(key, value, hashMethod = "hashBitPi") {
    let index;
    switch (hashMethod) {
      case "hashDivision":
        index = this.hashDivision(key);
        break;
      case "hashMultiplication":
        index = this.hashMultiplication(key);
        break;
      case "hashBitPi":
        index = this.hashBitPi(key);
        break;
      case "hashAddition":
        index = this.hashAddition(key);
        break;
      case "hashXOR":
        index = this.hashXOR(key);
        break;
      default:
        index = this.hashBitPi(key); // Метод по умолчанию
    }

    let current = this.table[index];
    let prev = null;
    while (current !== null) {
      if (current.key === key && current.value === value) {
        if (prev === null) {
          this.table[index] = current.next;
        } else {
          prev.next = current.next;
        }
        return true; // Успешно удален
      }
      prev = current;
      current = current.next;
    }
    return false; // Если ключ или значение не найдены
  }

  // Очистка хеш-таблицы
  clear() {
    this.table = new Array(this.size).fill(null);
  }

  // Анализ хеш-таблицы
  analyze() {
    let filledCells = 0;
    let longestChain = 0;
    let shortestChain = Infinity;

    for (let chain of this.table) {
      if (chain !== null) {
        filledCells++;
        let chainLength = 0;
        let current = chain;
        while (current !== null) {
          chainLength++;
          current = current.next;
        }
        longestChain = Math.max(longestChain, chainLength);
        shortestChain = Math.min(shortestChain, chainLength);
      }
    }

    const loadFactor = filledCells / this.size;
    shortestChain = shortestChain === Infinity ? 0 : shortestChain;

    return { loadFactor, longestChain, shortestChain };
  }
}

// Генерация 100,000 элементов с различными ключами
function generateData(numElements) {
  return Array.from({ length: numElements }, () => ({
    key: Math.floor(Math.random() * 1000000),
    value: `Value_${Math.random().toString(36).substring(7)}`,
  }));
}

// Выполнение анализа для различных методов хеширования
function performAnalysis(hashTable, data) {
  const hashMethods = [
    "hashDivision",
    "hashMultiplication",
    "hashBitPi",
    "hashAddition",
    "hashXOR",
  ];
  const results = [];

  for (const method of hashMethods) {
    hashTable.clear();
    data.forEach(({ key, value }) => hashTable.insert(key, value, method));
    const analysis = hashTable.analyze();
    results.push({ method, ...analysis });
    console.log(
      `Метод: ${method}, Коэффициент заполнения: ${analysis.loadFactor}, Самая длинная цепочка: ${analysis.longestChain}, Самая короткая цепочка: ${analysis.shortestChain}`
    );
  }

  return results;
}

// Определение лучшего метода хеширования на основе анализа
function determineBestFunction(results) {
  let bestMethod = null;
  let bestScore = Infinity;

  results.forEach((result) => {
    const score =
      result.loadFactor + result.longestChain - result.shortestChain;
    if (score < bestScore) {
      bestScore = score;
      bestMethod = result.method;
    }
  });

  return bestMethod;
}

// Обработчики событий для DOM
document.addEventListener("DOMContentLoaded", () => {
  const output = document.getElementById("output");
  const analysisOutput = document.getElementById("analysisOutput");
  const tableOutput = document.getElementById("tableOutput");

  // Инициализация хеш-таблицы с размером 1000
  const hashTable = new HashTable(1000);

  // Вставка элемента
  document.getElementById("insertButton").addEventListener("click", () => {
    const key = parseInt(document.getElementById("key").value, 10);
    const value = document.getElementById("value").value;
    const hashMethod = document.getElementById("hashMethod").value;

    if (isNaN(key) || !value) {
      output.textContent = "Пожалуйста, укажите корректные ключ и значение.";
      return;
    }

    hashTable.insert(key, value, hashMethod);
    output.textContent = `Вставлено: { ключ: ${key}, значение: ${value} }`;

    document.getElementById("key").value = "";
    document.getElementById("value").value = "";
  });

  // Поиск элемента
  document.getElementById("searchButton").addEventListener("click", () => {
    const key = parseInt(document.getElementById("key").value, 10);
    const hashMethod = document.getElementById("hashMethod").value;

    if (isNaN(key)) {
      output.textContent = "Пожалуйста, укажите корректный ключ.";
      return;
    }

    const result = hashTable.get(key, hashMethod);
    if (result !== null) {
      output.textContent = `Найдено: ${result.value} на индексе ${result.index}`;

      // Прокрутка до найденного элемента
      const targetRow = document.getElementById(`row-${result.index}`);
      if (targetRow) {
        targetRow.scrollIntoView({ behavior: "smooth", block: "center" });
        targetRow.style.backgroundColor = "yellow"; // Подсветка строки
        setTimeout(() => {
          targetRow.style.backgroundColor = ""; // Убрать подсветку после задержки
        }, 2000);
      }
    } else {
      output.textContent = "Ключ не найден.";
    }

    document.getElementById("key").value = "";
  });

  // Удаление элемента по ключу и значению
  document.getElementById("deleteButton").addEventListener("click", () => {
    const key = parseInt(document.getElementById("key").value, 10);
    const value = document.getElementById("value").value;
    const hashMethod = document.getElementById("hashMethod").value;

    if (isNaN(key) || !value) {
      output.textContent = "Пожалуйста, укажите корректные ключ и значение.";
      return;
    }

    const success = hashTable.delete(key, value, hashMethod);
    output.textContent = success
      ? `Удалено: ключ: ${key}, значение: ${value}`
      : "Ключ или значение не найдены.";

    document.getElementById("key").value = "";
    document.getElementById("value").value = "";
  });

  // Показать таблицу
  document.getElementById("showTableButton").addEventListener("click", () => {
    let tableContent =
      "<table><tr><th>Индекс</th><th>Цепочка (Ключ -> Значение)</th></tr>";

    for (let i = 0; i < hashTable.size; i++) {
      const chain = hashTable.table[i];
      if (chain !== null) {
        let chainStr = "";
        let current = chain;
        while (current !== null) {
          chainStr += `${current.key} -> ${current.value}, `;
          current = current.next;
        }
        tableContent += `<tr id="row-${i}"><td>${i}</td><td>${chainStr.slice(
          0,
          -2
        )}</td></tr>`;
      } else {
        tableContent += `<tr id="row-${i}"><td>${i}</td><td>Пусто</td></tr>`;
      }
    }

    tableContent += "</table>";
    tableOutput.innerHTML = tableContent;
  });

  // Генерация и анализ 100,000 данных
  document
    .getElementById("generateDataButton")
    .addEventListener("click", () => {
      const data = generateData(100000); // Генерация случайных данных

      // Выполнение анализа для каждого метода хеширования
      const results = performAnalysis(hashTable, data);

      // Определение лучшего метода хеширования
      const bestMethod = determineBestFunction(results);

      // Отображение результатов анализа
      let analysisContent = results
        .map(
          (result) => `
      <strong>Метод:</strong> ${result.method}<br>
      <strong>Коэффициент заполнения:</strong> ${result.loadFactor.toFixed(
        4
      )}<br>
      <strong>Самая длинная цепочка:</strong> ${result.longestChain}<br>
      <strong>Самая короткая цепочка:</strong> ${result.shortestChain}<br>
      <br>
    `
        )
        .join("");

      analysisContent += `<strong>Лучший метод хеширования:</strong> ${bestMethod}`;

      analysisOutput.innerHTML = analysisContent;
    });
});
