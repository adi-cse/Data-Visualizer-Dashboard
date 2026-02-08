const FileHandler = {
  parseFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          reject(new Error('Could not read file as text'));
          return;
        }
        const ext = (file.name || '').toLowerCase();
        if (ext.endsWith('.json')) {
          try {
            const data = JSON.parse(text);
            resolve(FileHandler.normalizeJSON(data));
          } catch (err) {
            reject(new Error('Invalid JSON: ' + err.message));
          }
        } else if (ext.endsWith('.csv')) {
          const result = typeof Papa !== 'undefined'
            ? Papa.parse(text, { header: true, skipEmptyLines: true })
            : FileHandler.parseCSVManual(text);
          if (result.errors?.length) {
            reject(new Error(result.errors[0].message || 'CSV parse error'));
          } else {
            resolve(result.data || result);
          }
        } else {
          reject(new Error('Unsupported format. Use .csv or .json'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file, 'UTF-8');
    });
  },

  parseCSVManual(text) {
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length === 0) return { data: [] };
    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const data = lines.slice(1, CONFIG.maxDataRows + 1).map((line) => {
      const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
      const row = {};
      headers.forEach((h, i) => (row[h] = values[i] ?? ''));
      return row;
    });
    return { data };
  },

  normalizeJSON(data) {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const keys = Object.keys(data);
      const first = data[keys[0]];
      if (Array.isArray(first)) {
        return first.slice(0, CONFIG.maxDataRows);
      }
    }
    return [];
  },

  getColumns(rows) {
    if (!rows?.length) return [];
    const set = new Set();
    rows.forEach((row) => Object.keys(row).forEach((k) => set.add(k)));
    return Array.from(set);
  },
};
