(function () {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const browseBtn = document.getElementById('browseBtn');
  const selectX = document.getElementById('selectX');
  const selectY = document.getElementById('selectY');
  const selectChartType = document.getElementById('selectChartType');
  const btnClear = document.getElementById('btnClear');
  const btnExportPng = document.getElementById('btnExportPng');
  const loadSampleBtn = document.getElementById('loadSampleBtn');
  const messageEl = document.getElementById('message');
  const uploadSection = document.getElementById('uploadSection');
  const controlsSection = document.getElementById('controlsSection');
  const previewSection = document.getElementById('previewSection');
  const chartSection = document.getElementById('chartSection');

  let currentData = [];
  let currentColumns = [];

  function showMessage(text, type = 'success') {
    messageEl.textContent = text;
    messageEl.className = 'message ' + type;
    messageEl.classList.remove('hidden');
    setTimeout(() => {
      messageEl.classList.add('hidden');
    }, 5000);
  }

  function showError(text) {
    showMessage(text, 'error');
  }

  function setSections(showUpload, showRest) {
    uploadSection.classList.toggle('hidden', !showUpload);
    controlsSection.classList.toggle('hidden', !showRest);
    previewSection.classList.toggle('hidden', !showRest);
    chartSection.classList.toggle('hidden', !showRest);
  }

  function processFile(file) {
    if (!file) return;
    const ext = (file.name || '').toLowerCase();
    if (!ext.endsWith('.csv') && !ext.endsWith('.json')) {
      showError('Please choose a .csv or .json file.');
      return;
    }

    FileHandler.parseFile(file)
      .then((data) => {
        currentData = Array.isArray(data) ? data : [];
        currentColumns = FileHandler.getColumns(currentData);
        if (currentColumns.length === 0) {
          showError('No columns found in the file.');
          return;
        }

        setSections(false, true);
        DataTable.render('previewTable', currentData);
        DataTable.fillSelect('selectX', currentColumns, 'X-axis');
        DataTable.fillSelect('selectY', currentColumns, 'Y-axis');

        if (currentColumns.length >= 2) {
          selectX.value = currentColumns[0];
          selectY.value = currentColumns[1];
        } else {
          selectX.value = currentColumns[0] || '';
          selectY.value = currentColumns[0] || '';
        }
        updateChart();
      })
      .catch((err) => {
        showError(err.message || 'Failed to parse file.');
      });
  }

  function updateChart() {
    const x = selectX.value;
    const y = selectY.value;
    const type = selectChartType.value;
    if (!x || !y || !currentData.length) return;
    ChartManager.render('chartCanvas', type, currentData, x, y);
  }

  browseBtn?.addEventListener('click', () => fileInput?.click());

  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    processFile(file);
    e.target.value = '';
  });

  dropzone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone?.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    const file = e.dataTransfer?.files?.[0];
    processFile(file);
  });

  selectX?.addEventListener('change', updateChart);
  selectY?.addEventListener('change', updateChart);
  selectChartType?.addEventListener('change', updateChart);

  btnExportPng?.addEventListener('click', () => {
    if (ChartManager.exportAsPng()) {
      showMessage('Chart exported as PNG.');
    } else {
      showError('No chart to export. Load data first.');
    }
  });

  btnClear?.addEventListener('click', () => {
    ChartManager.destroy();
    currentData = [];
    currentColumns = [];
    setSections(true, false);
    messageEl.classList.add('hidden');
  });

  loadSampleBtn?.addEventListener('click', () => {
    fetch('sample-data.csv')
      .then((r) => r.text())
      .then((text) => {
        const result = typeof Papa !== 'undefined'
          ? Papa.parse(text, { header: true, skipEmptyLines: true })
          : FileHandler.parseCSVManual(text);
        const data = result.data || result;
        if (!data?.length) {
          showError('Sample data could not be loaded.');
          return;
        }
        currentData = data;
        currentColumns = FileHandler.getColumns(currentData);
        setSections(false, true);
        DataTable.render('previewTable', currentData);
        DataTable.fillSelect('selectX', currentColumns, 'X-axis');
        DataTable.fillSelect('selectY', currentColumns, 'Y-axis');
        selectX.value = currentColumns[0] || '';
        selectY.value = currentColumns[1] || currentColumns[0] || '';
        updateChart();
      })
      .catch(() => showError('Failed to load sample data. Open the app via a local server (e.g. npx serve .).'));
  });
})();
