// Lives in: Publications spreadsheet -> Extensions -> Apps Script.
// Reference copy only -- see apps-script/README.md and the main
// README's "Slug auto-generation" section for what this does.

function onEdit(e) {
  var SHEET_NAME = "Publications"; // exact tab name -- verify against the live sheet
  var SOURCE_COL = 1;  // Title
  var SLUG_COL = 2;    // Slug
  var HEADER_ROW = 1;

  var range = e.range;
  var sheet = range.getSheet();
  if (sheet.getName() !== SHEET_NAME) return;
  if (range.getRow() <= HEADER_ROW) return;

  var touchesSource = range.getColumn() <= SOURCE_COL && range.getLastColumn() >= SOURCE_COL;
  var touchesSlug = range.getColumn() <= SLUG_COL && range.getLastColumn() >= SLUG_COL;

  // Case 1: Title edited -> generate the slug if it's still empty
  if (touchesSource) {
    var startRow = Math.max(range.getRow(), HEADER_ROW + 1);
    var endRow = range.getLastRow();
    for (var row = startRow; row <= endRow; row++) {
      var titleCell = sheet.getRange(row, SOURCE_COL);
      var slugCell = sheet.getRange(row, SLUG_COL);
      var title = titleCell.getValue();
      var currentSlug = slugCell.getValue();
      if (title !== "" && (currentSlug === "" || currentSlug === null)) {
        slugCell.setValue(slugify(title));
      }
    }
  }

  // Case 2: Slug edited by hand -> warn, single-cell edits only
  if (touchesSlug && range.getNumRows() === 1 && range.getNumColumns() === 1) {
    var oldValue = e.oldValue;
    var newValue = range.getValue();
    if (oldValue && oldValue !== newValue) {
      SpreadsheetApp.getUi().alert(
        "Warning: you changed an existing Slug, from \"" + oldValue + "\" to \"" +
        (newValue || "(empty)") + "\". If this slug was already used elsewhere " +
        "(publications, activities, external links), those links will stop " +
        "working until you update them manually."
      );
    }
  }
}

function slugify(text) {
  return text.toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
