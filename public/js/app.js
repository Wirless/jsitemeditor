// Global Variables
const SPRITE_SIZE = 32; // Size of each sprite in pixels
let scale = 1;
let offsetX = 0;
let offsetY = 0;
let spriteSheet = new Image();
let selectedX = -1;
let selectedY = -1;
let items = [];
let currentItemIndex = -1;

// Map Editor Variables
let mapData = {
  width: 20,
  height: 20,
  layers: []
};
let currentLayer = 0;
let selectedItemId = null;
let selectedTileX = -1;
let selectedTileY = -1;
let selectedTileItemIndex = -1;

// DOM Elements - Item Editor
const spriteSheetCanvas = document.getElementById('spriteSheetCanvas');
const selectedSpriteCanvas = document.getElementById('selectedSpriteCanvas');
const spriteSheetCtx = spriteSheetCanvas.getContext('2d');
const selectedSpriteCtx = selectedSpriteCanvas.getContext('2d');
const coordinatesSpan = document.getElementById('coordinates');
const selectedPositionSpan = document.getElementById('selectedPosition');
const zoomInBtn = document.getElementById('zoomIn');
const zoomOutBtn = document.getElementById('zoomOut');
const addItemBtn = document.getElementById('addItemBtn');
const clearItemBtn = document.getElementById('clearItemBtn');
const downloadItemsBtn = document.getElementById('downloadItemsBtn');
const newItemsJsonBtn = document.getElementById('newItemsJsonBtn');
const itemsList = document.getElementById('itemsList');

// DOM Elements - Map Editor
const mapCanvas = document.getElementById('mapCanvas');
const mapCtx = mapCanvas.getContext('2d');
const mapWidthInput = document.getElementById('mapWidth');
const mapHeightInput = document.getElementById('mapHeight');
const currentLayerInput = document.getElementById('currentLayer');
const createMapBtn = document.getElementById('createMapBtn');
const layerUpBtn = document.getElementById('layerUpBtn');
const layerDownBtn = document.getElementById('layerDownBtn');
const saveMapBtn = document.getElementById('saveMapBtn');
const loadMapBtn = document.getElementById('loadMapBtn');
const downloadMapBtn = document.getElementById('downloadMapBtn');
const clearMapBtn = document.getElementById('clearMapBtn');
const itemPalette = document.getElementById('itemPalette');
const selectedTilePosition = document.getElementById('selectedTilePosition');
const selectedTileLayer = document.getElementById('selectedTileLayer');
const tileItems = document.getElementById('tileItems');
const removeItemBtn = document.getElementById('removeItemBtn');

// Tab Elements
const itemEditorTab = document.getElementById('itemEditorTab');
const mapEditorTab = document.getElementById('mapEditorTab');
const itemEditorSection = document.getElementById('itemEditorSection');
const mapEditorSection = document.getElementById('mapEditorSection');

// Form Elements
const itemNameInput = document.getElementById('itemName');
const itemIdInput = document.getElementById('itemId');
const walkableCheckbox = document.getElementById('walkable');
const blockingCheckbox = document.getElementById('blocking');
const useableCheckbox = document.getElementById('useable');
const pickupableCheckbox = document.getElementById('pickupable');
const actionScriptInput = document.getElementById('actionScript');
const containerSizeInput = document.getElementById('containerSize');
const floorChangeSelect = document.getElementById('floorChange');

// Initialize the application
function init() {
  // Load the sprite sheet
  spriteSheet.src = '/tileset.png';
  spriteSheet.onload = function() {
    drawSpriteSheet();
    // Fetch any existing items
    fetchItems();
    // Fetch any existing map
    fetchMap();
  };

  // Add event listeners for Item Editor
  spriteSheetCanvas.addEventListener('mousemove', handleMouseMove);
  spriteSheetCanvas.addEventListener('click', handleSpriteClick);
  zoomInBtn.addEventListener('click', zoomIn);
  zoomOutBtn.addEventListener('click', zoomOut);
  addItemBtn.addEventListener('click', addOrUpdateItem);
  clearItemBtn.addEventListener('click', clearForm);
  downloadItemsBtn.addEventListener('click', downloadItemsJson);
  newItemsJsonBtn.addEventListener('click', newItemsJson);
  
  // Add event listeners for Map Editor
  mapCanvas.addEventListener('mousemove', handleMapMouseMove);
  mapCanvas.addEventListener('click', handleMapClick);
  createMapBtn.addEventListener('click', createOrResetMap);
  layerUpBtn.addEventListener('click', layerUp);
  layerDownBtn.addEventListener('click', layerDown);
  saveMapBtn.addEventListener('click', saveMap);
  loadMapBtn.addEventListener('click', fetchMap);
  downloadMapBtn.addEventListener('click', downloadMapJson);
  clearMapBtn.addEventListener('click', clearMap);
  removeItemBtn.addEventListener('click', removeSelectedTileItem);
  
  // Tab switching
  itemEditorTab.addEventListener('click', () => switchTab('item'));
  mapEditorTab.addEventListener('click', () => switchTab('map'));
  
  // Map dimension inputs
  mapWidthInput.addEventListener('change', validateMapDimensions);
  mapHeightInput.addEventListener('change', validateMapDimensions);
  currentLayerInput.addEventListener('change', changeLayer);
}

// ==================== ITEM EDITOR FUNCTIONS ====================

// Draw the sprite sheet on the canvas
function drawSpriteSheet() {
  // Resize canvas if needed to fit sprite sheet
  if (spriteSheetCanvas.width < spriteSheet.width * scale || 
      spriteSheetCanvas.height < spriteSheet.height * scale) {
    spriteSheetCanvas.width = Math.max(800, spriteSheet.width * scale);
    spriteSheetCanvas.height = Math.max(600, spriteSheet.height * scale);
  }
  
  // Clear the canvas
  spriteSheetCtx.clearRect(0, 0, spriteSheetCanvas.width, spriteSheetCanvas.height);
  
  // Draw the sprite sheet with the current scale and offset
  spriteSheetCtx.drawImage(
    spriteSheet, 
    offsetX, offsetY, 
    spriteSheetCanvas.width / scale, 
    spriteSheetCanvas.height / scale, 
    0, 0, 
    spriteSheetCanvas.width, 
    spriteSheetCanvas.height
  );
  
  // Draw the grid
  drawGrid();
  
  // Highlight the selected sprite if any
  if (selectedX >= 0 && selectedY >= 0) {
    highlightSelectedSprite();
  }
}

// Draw the grid overlay on the sprite sheet
function drawGrid() {
  spriteSheetCtx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
  spriteSheetCtx.lineWidth = 1;
  
  // Calculate the starting points based on offset and scale
  const startX = (offsetX % SPRITE_SIZE) * scale;
  const startY = (offsetY % SPRITE_SIZE) * scale;
  
  // Draw vertical lines
  for (let x = -startX; x < spriteSheetCanvas.width; x += SPRITE_SIZE * scale) {
    spriteSheetCtx.beginPath();
    spriteSheetCtx.moveTo(x, 0);
    spriteSheetCtx.lineTo(x, spriteSheetCanvas.height);
    spriteSheetCtx.stroke();
  }
  
  // Draw horizontal lines
  for (let y = -startY; y < spriteSheetCanvas.height; y += SPRITE_SIZE * scale) {
    spriteSheetCtx.beginPath();
    spriteSheetCtx.moveTo(0, y);
    spriteSheetCtx.lineTo(spriteSheetCanvas.width, y);
    spriteSheetCtx.stroke();
  }
}

// Highlight the selected sprite
function highlightSelectedSprite() {
  const spriteX = (selectedX * SPRITE_SIZE - offsetX) * scale;
  const spriteY = (selectedY * SPRITE_SIZE - offsetY) * scale;
  
  spriteSheetCtx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
  spriteSheetCtx.lineWidth = 2;
  spriteSheetCtx.strokeRect(spriteX, spriteY, SPRITE_SIZE * scale, SPRITE_SIZE * scale);
}

// Handle mouse movement over the sprite sheet
function handleMouseMove(event) {
  const rect = spriteSheetCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  // Calculate sprite coordinates
  const spriteX = Math.floor((x / scale) + offsetX) / SPRITE_SIZE;
  const spriteY = Math.floor((y / scale) + offsetY) / SPRITE_SIZE;
  
  // Update the coordinates display
  coordinatesSpan.textContent = `X: ${Math.floor(spriteX)}, Y: ${Math.floor(spriteY)}`;
}

// Handle clicking on a sprite
function handleSpriteClick(event) {
  const rect = spriteSheetCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  // Calculate sprite coordinates
  selectedX = Math.floor((x / scale + offsetX) / SPRITE_SIZE);
  selectedY = Math.floor((y / scale + offsetY) / SPRITE_SIZE);
  
  // Update the selected position display
  selectedPositionSpan.textContent = `(${selectedX}, ${selectedY})`;
  
  // Draw the selected sprite in the preview
  drawSelectedSprite();
  
  // Redraw the sprite sheet to show the selection
  drawSpriteSheet();
}

// Draw the selected sprite in the preview
function drawSelectedSprite() {
  // Clear the canvas
  selectedSpriteCtx.clearRect(0, 0, selectedSpriteCanvas.width, selectedSpriteCanvas.height);
  
  // Draw the selected sprite
  selectedSpriteCtx.drawImage(
    spriteSheet,
    selectedX * SPRITE_SIZE,
    selectedY * SPRITE_SIZE,
    SPRITE_SIZE,
    SPRITE_SIZE,
    0, 0,
    selectedSpriteCanvas.width,
    selectedSpriteCanvas.height
  );
}

// Zoom in function
function zoomIn() {
  if (scale < 3) {
    scale += 0.25;
    drawSpriteSheet();
  }
}

// Zoom out function
function zoomOut() {
  if (scale > 0.5) {
    scale -= 0.25;
    drawSpriteSheet();
  }
}

// Add or update an item
function addOrUpdateItem() {
  // Validate inputs
  if (!itemNameInput.value) {
    alert('Please enter an item name');
    return;
  }
  
  if (selectedX < 0 || selectedY < 0) {
    alert('Please select a sprite first');
    return;
  }
  
  // Create the item object
  const item = {
    id: itemIdInput.value ? parseInt(itemIdInput.value) : items.length + 1,
    name: itemNameInput.value,
    sprite: {
      x: selectedX,
      y: selectedY
    },
    properties: {
      walkable: walkableCheckbox.checked,
      blocking: blockingCheckbox.checked,
      useable: useableCheckbox.checked,
      pickupable: pickupableCheckbox.checked
    }
  };
  
  // Add optional properties
  if (actionScriptInput.value) {
    item.action = actionScriptInput.value;
  }
  
  if (containerSizeInput.value) {
    item.containerSize = parseInt(containerSizeInput.value);
  }
  
  if (floorChangeSelect.value) {
    item.floorChange = parseInt(floorChangeSelect.value);
  }
  
  // Check if we're editing an existing item
  if (currentItemIndex >= 0) {
    items[currentItemIndex] = item;
  } else {
    items.push(item);
  }
  
  // Reset form and update UI
  clearForm();
  renderItemsList();
  renderItemPalette();
  saveItems();
}

// Clear the item form
function clearForm() {
  itemNameInput.value = '';
  itemIdInput.value = '';
  walkableCheckbox.checked = false;
  blockingCheckbox.checked = false;
  useableCheckbox.checked = false;
  pickupableCheckbox.checked = false;
  actionScriptInput.value = '';
  containerSizeInput.value = '';
  floorChangeSelect.value = '';
  
  currentItemIndex = -1;
  addItemBtn.textContent = 'Add Item';
}

// Render the items list
function renderItemsList() {
  itemsList.innerHTML = '';
  
  if (items.length === 0) {
    itemsList.innerHTML = '<p>No items created yet</p>';
    return;
  }
  
  items.forEach((item, index) => {
    const itemCard = document.createElement('div');
    itemCard.className = 'item-card';
    
    // Create a small canvas for the sprite
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = 32;
    spriteCanvas.height = 32;
    spriteCanvas.className = 'item-sprite';
    const spriteCtx = spriteCanvas.getContext('2d');
    
    // Draw the sprite
    spriteCtx.drawImage(
      spriteSheet,
      item.sprite.x * SPRITE_SIZE,
      item.sprite.y * SPRITE_SIZE,
      SPRITE_SIZE,
      SPRITE_SIZE,
      0, 0,
      32, 32
    );
    
    // Create the card header
    const header = document.createElement('div');
    header.className = 'item-card-header';
    
    const title = document.createElement('h3');
    title.textContent = `${item.name} (ID: ${item.id})`;
    
    header.appendChild(spriteCanvas);
    header.appendChild(title);
    
    // Create properties list
    const propertiesList = document.createElement('div');
    propertiesList.className = 'item-properties';
    
    // Add properties
    addProperty(propertiesList, 'Walkable', item.properties.walkable ? 'Yes' : 'No');
    addProperty(propertiesList, 'Blocking', item.properties.blocking ? 'Yes' : 'No');
    addProperty(propertiesList, 'Useable', item.properties.useable ? 'Yes' : 'No');
    addProperty(propertiesList, 'Pickupable', item.properties.pickupable ? 'Yes' : 'No');
    
    if (item.action) {
      addProperty(propertiesList, 'Action', item.action);
    }
    
    if (item.containerSize) {
      addProperty(propertiesList, 'Container Size', item.containerSize);
    }
    
    if (item.floorChange) {
      addProperty(propertiesList, 'Floor Change', item.floorChange);
    }
    
    // Create action buttons
    const actions = document.createElement('div');
    actions.className = 'item-actions';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => editItem(index);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => deleteItem(index);
    
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    
    // Assemble the card
    itemCard.appendChild(header);
    itemCard.appendChild(propertiesList);
    itemCard.appendChild(actions);
    
    itemsList.appendChild(itemCard);
  });
}

// Helper function to add a property to the properties list
function addProperty(container, label, value) {
  const prop = document.createElement('div');
  
  const propLabel = document.createElement('span');
  propLabel.className = 'property-label';
  propLabel.textContent = `${label}: `;
  
  const propValue = document.createElement('span');
  propValue.textContent = value;
  
  prop.appendChild(propLabel);
  prop.appendChild(propValue);
  
  container.appendChild(prop);
}

// Edit an item
function editItem(index) {
  const item = items[index];
  
  // Set form values
  itemNameInput.value = item.name;
  itemIdInput.value = item.id;
  walkableCheckbox.checked = item.properties.walkable;
  blockingCheckbox.checked = item.properties.blocking;
  useableCheckbox.checked = item.properties.useable;
  pickupableCheckbox.checked = item.properties.pickupable;
  actionScriptInput.value = item.action || '';
  containerSizeInput.value = item.containerSize || '';
  floorChangeSelect.value = item.floorChange || '';
  
  // Set the selected sprite
  selectedX = item.sprite.x;
  selectedY = item.sprite.y;
  selectedPositionSpan.textContent = `(${selectedX}, ${selectedY})`;
  drawSelectedSprite();
  drawSpriteSheet();
  
  // Update the current item index
  currentItemIndex = index;
  addItemBtn.textContent = 'Update Item';
}

// Delete an item
function deleteItem(index) {
  if (confirm(`Are you sure you want to delete "${items[index].name}"?`)) {
    items.splice(index, 1);
    renderItemsList();
    renderItemPalette();
    saveItems();
  }
}

// Save items to the server
function saveItems() {
  fetch('/api/items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(items)
  })
  .then(response => response.json())
  .then(data => {
    console.log('Items saved:', data);
  })
  .catch(error => {
    console.error('Error saving items:', error);
  });
}

// Fetch items from the server
function fetchItems() {
  fetch('/api/items')
    .then(response => response.json())
    .then(data => {
      items = data;
      renderItemsList();
      renderItemPalette();
    })
    .catch(error => {
      console.error('Error fetching items:', error);
    });
}

// Download the items JSON
function downloadItemsJson() {
  if (items.length === 0) {
    alert('No items to download');
    return;
  }
  
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "items.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

// Create a new items JSON (clear all items)
function newItemsJson() {
  if (items.length > 0 && confirm('Are you sure you want to clear all items?')) {
    items = [];
    renderItemsList();
    renderItemPalette();
    saveItems();
  }
}

// ==================== MAP EDITOR FUNCTIONS ====================

// Tab switching function
function switchTab(tab) {
  if (tab === 'item') {
    itemEditorTab.classList.add('active');
    mapEditorTab.classList.remove('active');
    itemEditorSection.classList.add('active');
    mapEditorSection.classList.remove('active');
  } else {
    itemEditorTab.classList.remove('active');
    mapEditorTab.classList.add('active');
    itemEditorSection.classList.remove('active');
    mapEditorSection.classList.add('active');
    
    // Refresh map canvas when switching to map tab
    drawMap();
  }
}

// Render the item palette for the map editor
function renderItemPalette() {
  itemPalette.innerHTML = '';
  
  if (items.length === 0) {
    itemPalette.innerHTML = '<p>No items available</p>';
    return;
  }
  
  items.forEach(item => {
    const paletteItem = document.createElement('div');
    paletteItem.className = 'palette-item';
    paletteItem.dataset.itemId = item.id;
    
    if (selectedItemId === item.id) {
      paletteItem.classList.add('selected');
    }
    
    const itemCanvas = document.createElement('canvas');
    itemCanvas.width = 64;
    itemCanvas.height = 64;
    const itemCtx = itemCanvas.getContext('2d');
    
    // Draw the sprite
    itemCtx.drawImage(
      spriteSheet,
      item.sprite.x * SPRITE_SIZE,
      item.sprite.y * SPRITE_SIZE,
      SPRITE_SIZE,
      SPRITE_SIZE,
      0, 0,
      64, 64
    );
    
    paletteItem.appendChild(itemCanvas);
    
    // Add a small label with item name
    const label = document.createElement('div');
    label.style.fontSize = '9px';
    label.style.textAlign = 'center';
    label.style.overflow = 'hidden';
    label.style.textOverflow = 'ellipsis';
    label.style.whiteSpace = 'nowrap';
    label.textContent = item.name;
    
    paletteItem.appendChild(label);
    
    // Event listener for selecting an item
    paletteItem.addEventListener('click', () => {
      // Deselect all items
      document.querySelectorAll('.palette-item').forEach(el => {
        el.classList.remove('selected');
      });
      
      // Select this item
      paletteItem.classList.add('selected');
      selectedItemId = item.id;
    });
    
    itemPalette.appendChild(paletteItem);
  });
}

// Create or reset the map with current dimensions
function createOrResetMap() {
  const width = parseInt(mapWidthInput.value);
  const height = parseInt(mapHeightInput.value);
  
  if (confirm(`Are you sure you want to create a new ${width}x${height} map? This will clear any existing map data.`)) {
    mapData = {
      width: width,
      height: height,
      layers: []
    };
    
    // Initialize with an empty layer
    currentLayer = 0;
    currentLayerInput.value = currentLayer;
    mapData.layers[currentLayer] = [];
    
    // Reset selections
    selectedTileX = -1;
    selectedTileY = -1;
    selectedTileItemIndex = -1;
    
    drawMap();
    saveMap();
  }
}

// Validate map dimensions
function validateMapDimensions() {
  const width = parseInt(mapWidthInput.value);
  const height = parseInt(mapHeightInput.value);
  
  if (width < 5) mapWidthInput.value = 5;
  if (width > 100) mapWidthInput.value = 100;
  if (height < 5) mapHeightInput.value = 5;
  if (height > 100) mapHeightInput.value = 100;
}

// Change the current layer
function changeLayer() {
  const layer = parseInt(currentLayerInput.value);
  
  if (layer < 0) {
    currentLayerInput.value = 0;
    currentLayer = 0;
  } else {
    currentLayer = layer;
    
    // Initialize the layer if it doesn't exist
    if (!mapData.layers[currentLayer]) {
      mapData.layers[currentLayer] = [];
    }
  }
  
  selectedTileLayer.textContent = currentLayer;
  drawMap();
}

// Layer up function
function layerUp() {
  currentLayer++;
  currentLayerInput.value = currentLayer;
  
  // Initialize the layer if it doesn't exist
  if (!mapData.layers[currentLayer]) {
    mapData.layers[currentLayer] = [];
  }
  
  selectedTileLayer.textContent = currentLayer;
  drawMap();
}

// Layer down function
function layerDown() {
  if (currentLayer > 0) {
    currentLayer--;
    currentLayerInput.value = currentLayer;
    selectedTileLayer.textContent = currentLayer;
    drawMap();
  }
}

// Draw the map
function drawMap() {
  // Set canvas size based on map dimensions
  const tileSize = 32; // Size to draw each tile
  mapCanvas.width = mapData.width * tileSize;
  mapCanvas.height = mapData.height * tileSize;
  
  // Clear canvas
  mapCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
  
  // Draw background grid
  mapCtx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
  mapCtx.lineWidth = 1;
  
  // Draw vertical lines
  for (let x = 0; x <= mapData.width; x++) {
    mapCtx.beginPath();
    mapCtx.moveTo(x * tileSize, 0);
    mapCtx.lineTo(x * tileSize, mapCanvas.height);
    mapCtx.stroke();
  }
  
  // Draw horizontal lines
  for (let y = 0; y <= mapData.height; y++) {
    mapCtx.beginPath();
    mapCtx.moveTo(0, y * tileSize);
    mapCtx.lineTo(mapCanvas.width, y * tileSize);
    mapCtx.stroke();
  }
  
  // Draw tiles from each layer up to the current layer
  for (let layer = 0; layer <= currentLayer; layer++) {
    if (!mapData.layers[layer]) continue;
    
    mapData.layers[layer].forEach(tile => {
      const item = items.find(i => i.id === tile.itemId);
      if (!item) return;
      
      mapCtx.drawImage(
        spriteSheet,
        item.sprite.x * SPRITE_SIZE,
        item.sprite.y * SPRITE_SIZE,
        SPRITE_SIZE,
        SPRITE_SIZE,
        tile.x * tileSize,
        tile.y * tileSize,
        tileSize,
        tileSize
      );
    });
  }
  
  // Highlight selected tile
  if (selectedTileX >= 0 && selectedTileX < mapData.width &&
      selectedTileY >= 0 && selectedTileY < mapData.height) {
    mapCtx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
    mapCtx.lineWidth = 2;
    mapCtx.strokeRect(
      selectedTileX * tileSize,
      selectedTileY * tileSize,
      tileSize,
      tileSize
    );
  }
}

// Handle mouse movement over the map
function handleMapMouseMove(event) {
  const rect = mapCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  const tileSize = 32;
  const tileX = Math.floor(x / tileSize);
  const tileY = Math.floor(y / tileSize);
  
  // Update coordinates display if we have one
  if (document.getElementById('mapCoordinates')) {
    document.getElementById('mapCoordinates').textContent = `X: ${tileX}, Y: ${tileY}`;
  }
}

// Handle clicking on the map
function handleMapClick(event) {
  const rect = mapCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  const tileSize = 32;
  const tileX = Math.floor(x / tileSize);
  const tileY = Math.floor(y / tileSize);
  
  // Make sure the click is within the map bounds
  if (tileX < 0 || tileX >= mapData.width || tileY < 0 || tileY >= mapData.height) {
    return;
  }
  
  // Update selected tile
  selectedTileX = tileX;
  selectedTileY = tileY;
  selectedTileItemIndex = -1; // Reset selected item index
  
  // Update selected tile display
  selectedTilePosition.textContent = `(${selectedTileX}, ${selectedTileY})`;
  
  // If we have a selected item, add it to the map
  if (selectedItemId !== null) {
    addItemToTile(selectedTileX, selectedTileY, currentLayer, selectedItemId);
  }
  
  // Display items on this tile
  displayTileItems(selectedTileX, selectedTileY);
  
  // Redraw the map
  drawMap();
}

// Add an item to a tile
function addItemToTile(x, y, layer, itemId) {
  // Ensure the layer exists
  if (!mapData.layers[layer]) {
    mapData.layers[layer] = [];
  }
  
  // Check if the item already exists at this location
  const existingTileIndex = mapData.layers[layer].findIndex(tile => 
    tile.x === x && tile.y === y && tile.itemId === itemId
  );
  
  if (existingTileIndex >= 0) {
    // Item already exists, do nothing
    return;
  }
  
  // Add the item to the layer
  mapData.layers[layer].push({
    x: x,
    y: y,
    itemId: itemId
  });
  
  // Save the map
  saveMap();
}

// Display items on a tile
function displayTileItems(x, y) {
  tileItems.innerHTML = '';
  removeItemBtn.disabled = true;
  
  // Collect all items on this tile across all layers
  const tileItemsList = [];
  
  for (let layer = 0; layer < mapData.layers.length; layer++) {
    if (!mapData.layers[layer]) continue;
    
    const layerItems = mapData.layers[layer].filter(tile => tile.x === x && tile.y === y);
    
    layerItems.forEach(tile => {
      const item = items.find(i => i.id === tile.itemId);
      if (item) {
        tileItemsList.push({
          item: item,
          layer: layer,
          index: mapData.layers[layer].indexOf(tile)
        });
      }
    });
  }
  
  if (tileItemsList.length === 0) {
    tileItems.innerHTML = '<p>No items on this tile</p>';
    return;
  }
  
  tileItemsList.forEach((tileItem, index) => {
    const tileItemElement = document.createElement('div');
    tileItemElement.className = 'tile-item';
    
    if (index === selectedTileItemIndex) {
      tileItemElement.classList.add('selected');
      removeItemBtn.disabled = false;
    }
    
    const itemCanvas = document.createElement('canvas');
    itemCanvas.width = 32;
    itemCanvas.height = 32;
    itemCanvas.className = 'tile-item-sprite';
    const itemCtx = itemCanvas.getContext('2d');
    
    // Draw the sprite
    itemCtx.drawImage(
      spriteSheet,
      tileItem.item.sprite.x * SPRITE_SIZE,
      tileItem.item.sprite.y * SPRITE_SIZE,
      SPRITE_SIZE,
      SPRITE_SIZE,
      0, 0,
      32, 32
    );
    
    const itemInfo = document.createElement('div');
    itemInfo.innerHTML = `
      <div>${tileItem.item.name}</div>
      <div style="font-size: 0.8em; color: #666;">Layer: ${tileItem.layer}</div>
    `;
    
    tileItemElement.appendChild(itemCanvas);
    tileItemElement.appendChild(itemInfo);
    
    // Event listener for selecting this item
    tileItemElement.addEventListener('click', () => {
      // Deselect all items
      document.querySelectorAll('.tile-item').forEach(el => {
        el.classList.remove('selected');
      });
      
      // Select this item
      tileItemElement.classList.add('selected');
      selectedTileItemIndex = index;
      removeItemBtn.disabled = false;
    });
    
    tileItems.appendChild(tileItemElement);
  });
}

// Remove the selected item from the tile
function removeSelectedTileItem() {
  if (selectedTileX < 0 || selectedTileY < 0 || selectedTileItemIndex < 0) {
    return;
  }
  
  // Collect all items on this tile across all layers
  const tileItemsList = [];
  
  for (let layer = 0; layer < mapData.layers.length; layer++) {
    if (!mapData.layers[layer]) continue;
    
    const layerItems = mapData.layers[layer].filter(tile => tile.x === selectedTileX && tile.y === selectedTileY);
    
    layerItems.forEach(tile => {
      const item = items.find(i => i.id === tile.itemId);
      if (item) {
        tileItemsList.push({
          item: item,
          layer: layer,
          index: mapData.layers[layer].indexOf(tile)
        });
      }
    });
  }
  
  if (selectedTileItemIndex >= tileItemsList.length) {
    return;
  }
  
  const tileItem = tileItemsList[selectedTileItemIndex];
  
  // Remove the item from the map
  mapData.layers[tileItem.layer].splice(tileItem.index, 1);
  
  // Reset selection
  selectedTileItemIndex = -1;
  
  // Update display
  displayTileItems(selectedTileX, selectedTileY);
  drawMap();
  saveMap();
}

// Save map to the server
function saveMap() {
  fetch('/api/map', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(mapData)
  })
  .then(response => response.json())
  .then(data => {
    console.log('Map saved:', data);
  })
  .catch(error => {
    console.error('Error saving map:', error);
  });
}

// Fetch map from the server
function fetchMap() {
  fetch('/api/map')
    .then(response => response.json())
    .then(data => {
      mapData = data;
      mapWidthInput.value = mapData.width;
      mapHeightInput.value = mapData.height;
      
      // Ensure at least one layer exists
      if (!mapData.layers || mapData.layers.length === 0) {
        mapData.layers = [[]];
      }
      
      currentLayer = 0;
      currentLayerInput.value = currentLayer;
      selectedTileLayer.textContent = currentLayer;
      
      // Reset selections
      selectedTileX = -1;
      selectedTileY = -1;
      selectedTileItemIndex = -1;
      
      drawMap();
    })
    .catch(error => {
      console.error('Error fetching map:', error);
    });
}

// Download the map JSON
function downloadMapJson() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mapData, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "map.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

// Clear the map
function clearMap() {
  if (confirm('Are you sure you want to clear the map? This will remove all items from all layers.')) {
    mapData.layers = [[]];
    currentLayer = 0;
    currentLayerInput.value = currentLayer;
    selectedTileLayer.textContent = currentLayer;
    
    // Reset selections
    selectedTileX = -1;
    selectedTileY = -1;
    selectedTileItemIndex = -1;
    
    drawMap();
    saveMap();
  }
}

// Start the application when the page loads
window.onload = init; 