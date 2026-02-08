const DataTable = {
  render(containerId, rows, maxRows = CONFIG.maxPreviewRows) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const slice = (rows || []).slice(0, maxRows);
    const columns = FileHandler.getColumns(slice);
    if (columns.length === 0) {
      container.innerHTML = '';
      return;
    }

    let html = '<thead><tr>';
    columns.forEach((col) => {
      html += `<th>${escapeHtml(col)}</th>`;
    });
    html += '</tr></thead><tbody>';

    slice.forEach((row) => {
      html += '<tr>';
      columns.forEach((col) => {
        const val = row[col];
        html += `<td>${escapeHtml(String(val ?? ''))}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody>';

    container.innerHTML = html;
  },

  fillSelect(selectId, columns, placeholder = 'Select...') {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = '';
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = placeholder;
    select.appendChild(opt);
    (columns || []).forEach((col) => {
      const o = document.createElement('option');
      o.value = col;
      o.textContent = col;
      select.appendChild(o);
    });
  },
};

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
