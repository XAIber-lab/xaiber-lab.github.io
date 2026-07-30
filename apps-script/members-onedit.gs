// Lives in: Members spreadsheet -> Extensions -> Apps Script.
// Reference copy only -- see apps-script/README.md and the main
// README's "Slug auto-generation" section for what this does.

function onEdit(e) {
  var SHEET_NAME = "Members";
  var SOURCE_COL = 1;  // Name
  var SLUG_COL = 2;    // Slug
  var RANK_COL = 3;    // Rank
  var ROLE_COL = 4;    // Role
  var HEADER_ROW = 1;

  var ROLE_DEFAULTS = {
    "director": "Director",
    "professor": "Professor",
    "phd": "PhD Candidate",
    "collaborator": "Collaborator"
  };

  var range = e.range;
  var sheet = range.getSheet();
  if (sheet.getName() !== SHEET_NAME) return;
  if (range.getRow() <= HEADER_ROW) return;

  var touchesSource = range.getColumn() <= SOURCE_COL && range.getLastColumn() >= SOURCE_COL;
  var touchesSlug = range.getColumn() <= SLUG_COL && range.getLastColumn() >= SLUG_COL;
  var touchesRank = range.getColumn() <= RANK_COL && range.getLastColumn() >= RANK_COL;

  // Case 1: Name edited -> generate the slug if it's still empty
  if (touchesSource) {
    var startRow = Math.max(range.getRow(), HEADER_ROW + 1);
    var endRow = range.getLastRow();
    for (var row = startRow; row <= endRow; row++) {
      var nameCell = sheet.getRange(row, SOURCE_COL);
      var slugCell = sheet.getRange(row, SLUG_COL);
      var name = nameCell.getValue();
      var currentSlug = slugCell.getValue();
      if (name !== "" && (currentSlug === "" || currentSlug === null)) {
        slugCell.setValue(slugify(name));
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

  // Case 3: Rank chosen -> suggest a default Role, only if Role is still empty
  if (touchesRank) {
    var startRow2 = Math.max(range.getRow(), HEADER_ROW + 1);
    var endRow2 = range.getLastRow();
    for (var row2 = startRow2; row2 <= endRow2; row2++) {
      var rankCell = sheet.getRange(row2, RANK_COL);
      var roleCell = sheet.getRange(row2, ROLE_COL);
      var rank = rankCell.getValue();
      var currentRole = roleCell.getValue();
      if (rank && ROLE_DEFAULTS[rank] && (currentRole === "" || currentRole === null)) {
        roleCell.setValue(ROLE_DEFAULTS[rank]);
      }
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
