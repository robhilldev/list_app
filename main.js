import {
  addRemoveButton,
  addEditButton,
  swapToEditButtons,
} from "./modules/Button.js";
import { toggleListMenu, closeListMenu } from "./modules/Interaction.js";
import { initializeState } from "./modules/State.js";

const DEFAULT_INITIAL_TITLE = "0_My Thoughts";
let [titles, currentTitle, currentTitleKey, userFacingTitle, currentList] =
  initializeState(DEFAULT_INITIAL_TITLE);

// add current title to page, clear input box, set up event listeners, display notes
window.onload = () => {
  document.getElementsByTagName("h1")[0].textContent = userFacingTitle;
  document.getElementsByTagName("h1")[0].id = `title-${currentTitleKey}`;
  document
    .getElementById("list-select-button")
    .addEventListener("click", toggleListMenu);
  document.addEventListener("click", closeListMenu);
  document.getElementById("add-list-button").addEventListener("click", addList);
  document
    .getElementById("edit-button-header")
    .addEventListener("click", editText);
  document
    .getElementById("remove-button-header")
    .addEventListener("click", removeList);
  document.getElementById("form-button").addEventListener("click", addNote);
  document.getElementById("text-to-add").value = "";

  sortTitlesArray();
  initializeCurrentList();
  generateListMenu();
};

// make sure titles array is sorted based on preceding key values
function sortTitlesArray() {
  titles.sort((a, b) => {
    if (
      Number(a.substring(0, a.indexOf("_"))) <
      Number(b.substring(0, b.indexOf("_")))
    )
      return -1;
    if (
      Number(a.substring(0, a.indexOf("_"))) >
      Number(b.substring(0, b.indexOf("_")))
    )
      return 1;
    return 0;
  });
}

// retrieve the current list from localstorage and display it on the page
function initializeCurrentList() {
  for (let i = 0; i < currentList.length; i++) {
    // only show note if not marked for deletion
    if (!currentList[i].startsWith("x_", 0) && !currentList[i].endsWith("_x")) {
      const currentLi = document.createElement("li");
      currentLi.innerHTML = `<div id=note-${i}>` + currentList[i] + "</div>";
      currentLi.id = i;
      currentLi
        .appendChild(addEditButton(i))
        .addEventListener("click", editText);
      currentLi
        .appendChild(addRemoveButton(i))
        .addEventListener("click", removeNote);
      document.getElementById("list").appendChild(currentLi);
    }
  }
}

// add list titles to title menu and attach event listeners
function generateListMenu() {
  const menuContent = document.getElementById("list-select-content");
  const pageTitleId = document.getElementById("header").firstElementChild.id;

  // remove previous menu titles if any
  while (menuContent.children.length > 1) {
    menuContent.removeChild(
      menuContent.children[menuContent.children.length - 1]
    );
  }

  // generate new menu titles
  for (let i = 0; i < titles.length; i++) {
    let menuItemDivider = document.createElement("hr");
    let menuItemElement = document.createElement("span");
    let menuItemKey = titles[i].substring(0, titles[i].indexOf("_"));
    menuItemElement.id = `title-menu-${menuItemKey}`;
    menuItemDivider.id = `title-menu-divider-${menuItemKey}`;

    menuItemElement.textContent = titles[i].substring(
      titles[i].indexOf("_") + 1
    );

    // add arrow to currently viewed list title and make it bold
    if (
      menuItemKey === pageTitleId.substring(pageTitleId.lastIndexOf("-") + 1)
    ) {
      menuItemElement.innerHTML = `&rArr;&nbsp;&nbsp;${menuItemElement.textContent}`;
      menuItemElement.style.fontWeight = "900";
    }

    // add divider and title to menu
    menuContent.appendChild(menuItemDivider);
    menuContent.appendChild(menuItemElement);
    menuItemElement.addEventListener("click", changeList);
  }
}

// add list to page and localstorage, update title variables
function addList() {
  // make new title key one higher than the max existing title key value
  const newKey = String(
    Number(titles.at(-1).substring(0, titles.at(-1).indexOf("_"))) + 1
  );
  const newTitle = `${newKey}_New List`;

  // update local storage
  localStorage.setItem(currentTitle, JSON.stringify(currentList));
  localStorage.removeItem(`${currentTitle}_current`);
  localStorage.setItem(`${newTitle}_current`, "[]");

  // update state variables
  titles.push(newTitle);
  currentTitle = newTitle;
  currentTitleKey = newKey;
  userFacingTitle = currentTitle.substring(currentTitle.indexOf("_") + 1);
  currentList = [];

  // update page and open title edit box
  document.getElementById("list").innerHTML = "";
  document.getElementsByTagName("h1")[0].textContent = userFacingTitle;
  document.getElementsByTagName("h1")[0].id = `title-${newKey}`;
  generateListMenu();
  document.getElementById("edit-button-header").click();
}

// add note to page and localstorage, update list variables
function addNote(e) {
  e.preventDefault();
  const textToAdd = document.getElementById("text-to-add");

  if (textToAdd.value) {
    // create li element for housing new note and create id
    const newLi = document.createElement("li");
    const newId = String(currentList.length === 0 ? 0 : currentList.length);

    // add note to list array
    currentList.push(textToAdd.value);

    // add note to localstorage
    localStorage.setItem(
      `${currentTitle}_current`,
      JSON.stringify(currentList)
    );

    // add note to page with an id, edit button, and remove button
    newLi.innerHTML = `<div id=note-${newId}>` + textToAdd.value + "</div>";
    newLi.id = newId;
    newLi.appendChild(addEditButton(newId)).addEventListener("click", editText);
    newLi
      .appendChild(addRemoveButton(newId))
      .addEventListener("click", removeNote);
    document.getElementById("list").appendChild(newLi);

    // clear input box
    textToAdd.value = "";
  }
}

// remove note from page and list array, mark note for deletion in localstorage
function removeNote(e) {
  const note = e.target.parentElement;
  note.remove();
  currentList.splice(note.id, 1, `x_${note.firstElementChild.textContent}_x`);
  localStorage.setItem(`${currentTitle}_current`, JSON.stringify(currentList));
}

// remove current list from page and localstorage, update state variables
function removeList() {
  if (localStorage.length > 0) {
    // determine next title and list to display
    let nextTitle = DEFAULT_INITIAL_TITLE;
    if (titles.length > 1 && titles[0] !== currentTitle) nextTitle = titles[0];
    if (titles.length > 1 && titles[0] === currentTitle) nextTitle = titles[1];
    const nextTitleKey = nextTitle.substring(0, nextTitle.indexOf("_"));
    const nextList = JSON.parse(localStorage.getItem(nextTitle)) || [];

    // update local storage
    localStorage.removeItem(`${currentTitle}_current`);
    if (localStorage.getItem(nextTitle)) {
      localStorage.setItem(`${nextTitle}_current`, JSON.stringify(nextList));
      localStorage.removeItem(nextTitle);
    }

    // update state variables
    userFacingTitle = nextTitle.substring(nextTitle.indexOf("_") + 1);
    titles.splice(titles.indexOf(currentTitle), 1);
    if (titles.length === 0) titles.push(nextTitle);
    currentTitle = nextTitle;
    currentTitleKey = nextTitleKey;
    currentList = nextList;

    // update page
    document.getElementById("list").innerHTML = "";
    document.getElementsByTagName("h1")[0].textContent = userFacingTitle;
    document.getElementsByTagName("h1")[0].id = `title-${nextTitleKey}`;
    initializeCurrentList();
    generateListMenu();
  }
}

// change to the list selected in the list select menu
function changeList(e) {
  const nextTitleKey = e.target.id.substring(
    e.target.id.lastIndexOf("-") + 1,
    e.target.id.length
  );

  // given the menu item selected is not the already viewed list
  if (nextTitleKey !== currentTitleKey) {
    // store new title and list
    const nextTitle = titles.find((t) => t.startsWith(nextTitleKey));
    const nextList = JSON.parse(localStorage.getItem(nextTitle));

    // update localstorage
    localStorage.setItem(`${nextTitle}_current`, JSON.stringify(nextList));
    localStorage.removeItem(nextTitle);
    localStorage.setItem(currentTitle, JSON.stringify(currentList));
    localStorage.removeItem(`${currentTitle}_current`);

    // update state variables
    currentTitle = nextTitle;
    currentTitleKey = nextTitleKey;
    userFacingTitle = nextTitle.substring(nextTitle.indexOf("_") + 1);
    currentList = nextList;

    // update page
    document.getElementById("list").innerHTML = "";
    document.getElementsByTagName("h1")[0].textContent = userFacingTitle;
    document.getElementsByTagName("h1")[0].id = `title-${nextTitleKey}`;
    initializeCurrentList();
    generateListMenu();
  }
}

// open input box with existing content to allow editing of content
function editText(e) {
  // store existing parent element, text element, and text content
  const parent = e.target.parentElement;
  const textElement = parent.firstElementChild;
  const currentText = parent.firstElementChild.textContent;

  // create and populate new input box for editing
  const editInputBox = document.createElement("span");
  editInputBox.id = `edit-input-box-${textElement.id.substring(
    textElement.id.lastIndexOf("-") + 1
  )}`;
  editInputBox.className = "edit-input-box";
  editInputBox.role = "textbox";
  editInputBox.contentEditable = true;
  editInputBox.textContent = currentText;

  // hide list select menu button on title edit
  if (parent.id === "header") {
    document.getElementById("list-select-dropdown").style.display = "none";
  }

  // swap existing text element for editing input box on page
  parent.replaceChild(editInputBox, textElement);

  // focus the input box and place the text cursor at end of it
  editInputBox.focus();
  document.getSelection().collapse(editInputBox, 1);

  // swap to edit mode buttons, store default mode buttons
  const [discardEditButton, saveEditButton, editButton, removeButton] =
    swapToEditButtons(parent.id);

  // pass event object, removed buttons, and text element to event handler on click
  discardEditButton.addEventListener("click", (e) => {
    const dataToPass = {
      e: e,
      args: [editButton, removeButton, textElement],
    };
    exitTextEdit(dataToPass);
  });
  saveEditButton.addEventListener("click", (e) => {
    const dataToPass = {
      e: e,
      args: [editButton, removeButton, textElement],
    };
    exitTextEdit(dataToPass);
  });

  // within input box, make enter trigger save edit and escape trigger discard edit
  editInputBox.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById(saveEditButton.id).click();
    } else if (e.key === "Escape") {
      document.getElementById(discardEditButton.id).click();
    }
  });
}

// handle saving of edited content to page and localstorage, or discarding edit
function exitTextEdit(dataToPass) {
  const editButton = dataToPass.args[0];
  const removeButton = dataToPass.args[1];
  const textElement = dataToPass.args[2];

  // store existing parent element, child input box, text content, and buttons
  const parent = dataToPass.e.target.parentElement;
  const childInputBox = parent.firstElementChild;
  const edittedText = parent.firstElementChild.textContent;
  const discardEditButton = parent.lastElementChild;
  const saveEditButton = parent.lastElementChild.previousElementSibling;

  // swap back to text element, populate with editted text or old text
  if (parent.tagName === "LI") {
    // on note edit
    if (dataToPass.e.target.className == "save-edit") {
      // update list array and localstorage, populate new text element
      currentList.splice(parent.id, 1, edittedText);
      localStorage.setItem(
        `${currentTitle}_current`,
        JSON.stringify(currentList)
      );
      textElement.textContent = edittedText;
    } else {
      // on discard edit, put back existing text
      textElement.textContent = currentList[parent.id];
    }
  } else if (parent.tagName === "HEADER") {
    // on title edit
    if (dataToPass.e.target.className == "save-edit") {
      // create new title
      const newTitle = `${currentTitleKey}_${edittedText}`;

      // update localstorage
      localStorage.setItem(`${newTitle}_current`, JSON.stringify(currentList));
      if (newTitle !== currentTitle) {
        localStorage.removeItem(`${currentTitle}_current`);
      }

      // update state variables
      titles.splice(titles.indexOf(currentTitle), 1, newTitle);
      currentTitle = newTitle;
      userFacingTitle = edittedText;

      // update page
      textElement.textContent = edittedText;
      generateListMenu();
    } else {
      // on discard edit, put back existing text
      textElement.textContent = userFacingTitle;
    }

    // make list select menu button visible again
    document
      .getElementById("list-select-dropdown")
      .style.removeProperty("display");
  }

  // swap in updated text element, edit button, and remove button
  parent.replaceChild(textElement, childInputBox);
  parent.replaceChild(editButton, saveEditButton);
  parent.replaceChild(removeButton, discardEditButton);
}

// TO IMPLEMENT:
// function emptyTrash(e) {}
