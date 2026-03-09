const getGrid = async (containerElement) => {
  for (let i = 0; i < 50; i++) {
    const grid = containerElement.querySelector('igc-grid');
    if (grid) return grid;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('Grid not found within the specified time.');
}

export const setDataSource = async (containerElement, dataSourceObject) => {
  const grid = await getGrid(containerElement);
  grid.data = dataSourceObject;
  await new Promise(resolve => setTimeout(resolve, 1)); // Allow time for the grid to update
  grid.columns.forEach(column => {
    column.sortable = true;
    column.resizable = true;
  });
};
