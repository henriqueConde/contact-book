const INITIAL_STATE = {
    contacts: [],
    favorites: [],
    selected: [],
    isTooltipActive: false,
    isEditing: false,
    isSelecting: false,
}
let state = INITIAL_STATE;
const MAIN = document.querySelector('#main');

const FORM_FIELDS = [
    {
        name: 'name',
        label: 'Name',
        type: 'text',
        className: 'form__name',
        validations: {
            isRequired: true,
            regexVal: /^[a-z ,.'-]+$/i,
            minLength: 2,
            maxLength: 20,
        }
    },
    {
        name: 'surname',
        label: 'Surname',
        type: 'text',
        className: 'form__surname',
        validations: {
            isRequired: true,
            regexVal: /^[a-z ,.'-]+$/i,
            minLength: 2,
            maxLength: 20,
        }
    },
    {
        name: 'email',
        label: 'Email',
        type: 'email',
        className: 'form__email',
        validations: {
            isRequired: true,
            regexVal: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/i,
        }
    },
    {
        name: 'phone-number',
        label: 'Phone Number',
        type: 'tel',
        className: 'form__phone-number',
        validations: {
            isRequired: true,
            regexVal: /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{3})(?: *x(\d+))?\s*$/i,
        }
    },
];

const CONTACT_FORM_TYPES = {
    add: 'Add',
    edit: 'Edit'
}

const FOOTER_BUTTON_TYPES = {
    cancel: 'Cancel',
    delete: 'Delete',
}

const getLocalStorageState = () => JSON.parse(localStorage.getItem('state'));
const setLocalStorageState = newState => localStorage.setItem('state', JSON.stringify(newState));

const createEl = (tag, attributes={}, events = {}) => {
    const el = document.createElement(tag);

    Object.entries(attributes).forEach(([attr, value]) => {
        if(typeof value !== 'object') {
            el[attr] = value;
        } else if (attr === 'data') {
            Object.keys(value).forEach(key => {
                el.dataset[key] = value[key]
            });
        }
    });

    Object.entries(events).forEach(([eventType, func]) => {
        el.addEventListener(eventType, func);
    });

    return el;
}

const checkLocalStorage = () => {
    if(!getLocalStorageState()) {
        setLocalStorageState(INITIAL_STATE);
    } else {
        state = {
            ...state, 
            ...getLocalStorageState(),
            selected: [],
            isEditing: false,
            isSelecting: false,
            isTooltipActive: false,
        }
        setLocalStorageState(state);
    }
}

const removeAllContacts = () => {
    const allContacts = [...document.querySelectorAll('.contact')];
    allContacts.forEach(contact => contact.remove());
}

const updateFavoritesState = newId => {
    if(!state.favorites.includes(newId)) {
        state.favorites.push(newId);
    } else {
        const idIndex = state.favorites.indexOf(newId)
        state.favorites.splice(idIndex, 1);
    }

    setLocalStorageState(state);
}

const makeCallContact = ({ target }) => {
    window.open('tel:' + target.dataset.tel);
}

const sendEmailContact = ({ target }) => {
    const email = createEl("a", {
        href: `mailto:${target.dataset.email}`
    });
    email.click();
    email.remove();
}

const makeContactFavorite = ({ target }) => {
    target.classList.toggle('favorite');
    const contactEmail = target.dataset.email;
    const selectedContact = state.contacts.filter(contact => contact.email === contactEmail)[0];
    updateFavoritesState(selectedContact.id);
}

const showTooltip = (htmlContextContainer, email) => {
    if(!state.isEditing) {
        state = {
            ...state,
            isTooltipActive: true,
        };
        setLocalStorageState(state);
        createToolTip(htmlContextContainer, email);
    }
}

const hideTooltip = () => {
    state = {
        ...state,
        isTooltipActive: false,
    };
    setLocalStorageState(state);
    const tooltip = document.querySelector('.tooltip');
    tooltip?.remove();
}

const createContactIcons = contact => {
    const favoriteClass = state.favorites.includes(contact.id) ? 'favorite' : '';
    const icons = [
        {
            className: "contact__icon fa-solid fa-mobile",
            data: {
                tel: contact['phone-number'],
            },
            events: {
                click: makeCallContact,
            }
        },
        {
            className: "contact__icon fa-solid fa-at",
            data: {
                email: contact.email,
            },
            events: {
                click: sendEmailContact,
            }
        }, 
        {
            className: "contact__icon fa-solid fa-star " + favoriteClass,
            data: {
                email: contact.email,
            },
            events: {
                click: makeContactFavorite,
            }
        },
        {
            className: "contact__icon fa-solid fa-ellipsis-vertical",
            eventsLi: {
                mouseenter: function() {
                    return showTooltip(this, contact.email)
                },
                mouseleave: hideTooltip,
                click: function() {
                    return showTooltip(this.parentNode, contact.email)
                },
            },
        }
    ];

    return icons.map(icon => {
        const iconLi = createEl('li', {
            className: 'contact__icon-li'
        },
        {
            ...icon.eventsLi,
        });

        const buttonIcon = createEl('button', {
            className: 'contact__icon-button',
            data: {
                ...icon.data,
            }
        },
        {   
            ...icon.events,
        })

        const iconTag = createEl('i', {
            className: icon.className,
            data: {
                ...icon.data,
            }
        })
        
        iconLi.appendChild(buttonIcon);
        buttonIcon.appendChild(iconTag);
        return iconLi;
    })
}

const fillEdiForm = contactInfo => {
    const formElements = [...document.querySelectorAll('.form__input')];
    formElements.forEach(input => {
        input.value = contactInfo[input.name];
    })
}

const editContact = contactEmail => {
    const contactContainer = document.querySelector(`[data-email="${contactEmail}"]`);

    const contactInfo = state.contacts.filter(contact => contact.email === contactEmail)[0];

    const editContactForm = createContactForm(CONTACT_FORM_TYPES.edit);
    contactContainer.appendChild(editContactForm);

    fillEdiForm(contactInfo);
}

const deleteContact = contactEmail => {
    const contactContainer = document.querySelector(`[data-email="${contactEmail}"]`);
    contactContainer.remove();
    const { contacts } = state;
    const contactId = getContactId(contactEmail);
    if(state.favorites.includes(contactId)) {
        updateFavoritesState(contactId);
    }
    const newContacts = contacts.filter(contact => contact.email !== contactEmail);
    removeContactState(newContacts);
    renderContactList();
}

const removeCheckboxes = () => {
    state.isSelecting = false;
    setLocalStorageState(state);
    const checkBoxes = [...document.querySelectorAll('.contact__checkbox')];
    checkBoxes.forEach(checkBox => checkBox.remove());
}

const deleteSelectedContacts = () => {
    const { contacts, selected } = state;
    const newContactState = contacts.filter(contact => !selected.includes(contact.id));
    state.contacts = newContactState;
    setLocalStorageState(state);
}

const removeFooterToggleButtons = () => {
    const footerCancelButton = document.querySelector(`.footer__cancel-button`);
    const footerDeleteButton = document.querySelector(`.footer__delete-button`);
    footerCancelButton?.remove();
    footerDeleteButton?.remove();
}


const renderCancelOrDeleteAllButton = () => {
    let buttonType;
    if (state.selected.length > 0) {
        buttonType = FOOTER_BUTTON_TYPES.delete;
    } else {
        buttonType = FOOTER_BUTTON_TYPES.cancel;
    }
    removeFooterToggleButtons();
    const button = createEl('button', {
        textContent: buttonType,
        className: `footer__toggle-button footer__${buttonType.toLowerCase()}-button`
    }, {
        click: function() {
            if(buttonType === FOOTER_BUTTON_TYPES.delete) {
                deleteSelectedContacts();
                removeContactsList();
                renderContactList();
            } else {
                removeCheckboxes();
                removeFooterToggleButtons();
            }
        }
    })
    const footer = document.querySelector('.footer');
    footer.appendChild(button);
}

const addOrRemoveFromSelected = contactId => {
    if(!state.selected.includes(contactId)) {
        state.selected.push(contactId)
    } else {
        const contactIdIndex = state.selected.indexOf(contactId);
        state.selected.splice(contactIdIndex, 1);
    }
    setLocalStorageState(state);
}

const selectContact = contactEmail => {
    const checkBoxAlreadyExists = !!document.getElementById(`contact__checkbox--${contactEmail}`);
    if(!checkBoxAlreadyExists) {
        const contactNameContainer = document.querySelector(`[data-email="${contactEmail}"]`)
                                         .children[0]
                                         .children[0];
        const checkbox = createEl('input', {
            type: 'checkbox',
            className: 'contact__checkbox',
            id: `contact__checkbox--${contactEmail}`
        }, {
            click: function() {
                const contactId = getContactId(contactEmail);
                addOrRemoveFromSelected(contactId);
                renderCancelOrDeleteAllButton();
            }
        })
        contactNameContainer.appendChild(checkbox);
        renderCancelOrDeleteAllButton();
    }
}

const createToolTip = (contactContainer, email) => {
    const actions = [
        {
            className: 'tooltip__action tooltip__edit',
            textContent: 'Edit',
            events: {
                click: function(event) {
                    event.stopPropagation();
                    hideTooltip();
                    if(!state.isSelecting) {
                        state.isEditing = true;
                        setLocalStorageState(state);
                        editContact(email);
                    }
                },
            }
        },
        {
            className: 'tooltip__action tooltip__delete',
            textContent: 'Delete',
            events: {
                click: function(event) {
                    event.stopPropagation();
                    hideTooltip();
                    deleteContact(email);
                },
            },
        },
        {
            className: 'tooltip__action tooltip__select',
            textContent: 'Select',
            events: {
                click: function(event) {
                    event.stopPropagation();
                    hideTooltip();
                    state.isSelecting = true;
                    setLocalStorageState(state);
                    selectContact(email);
                },
                blur: function() {
                    // The node is being removed by the click event above and therefore triggering the blur event. 
                    // Is there a better way to handle this situation?
                    // https://stackoverflow.com/questions/21926083/failed-to-execute-removechild-on-node
                    if(state.isTooltipActive) {
                        return hideTooltip();
                    }
                },
            },
        },
    ]

    const toolTip = createEl('div', {
        className: 'tooltip',
    });

    const actionsList = createEl('ul', {
        className: 'tooltip__actions'
    });

    actions.forEach(action => {
        const actionLi = createEl('li', {
            className: 'tooltip__action-li'
        },
        {
            ...action.events,
        });

        const actionButtons = createEl('button', {
            textContent: action.textContent,
            className: action.className,
        },
        {
            ...action.events,
        });
        actionLi.appendChild(actionButtons);
        actionsList.appendChild(actionLi);
    })
    toolTip.appendChild(actionsList);
    contactContainer.appendChild(toolTip);
}

const renderContactList = () => {
    removeAllContacts();
    state.contacts.forEach(contact => {
        const contactContainer = createEl('div', {
            className: 'contact',
            data: {
                email: contact.email
            }
        })

        const divWrapper = createEl('div', {
            className: 'contact__div-wrapper'
        })

        const contactNameDiv = createEl('div', {
            className: 'contact__name',
        })

        const contactName = createEl('h2', {
            textContent: `${contact.name} ${contact.surname}`,
        })

        const contactIconsContainer = createEl('div', {
            className: 'contact__icons-container',
        })

        const contactIconsList = createEl('ul', {
            className: 'contact__icons-list',
            data: {
                email: contact.email
            }
        })

        const icons = createContactIcons(contact);
        icons.forEach(icon => {
            contactIconsList.appendChild(icon);
        })

        divWrapper.appendChild(contactNameDiv);
        divWrapper.appendChild(contactIconsContainer);
        contactIconsContainer.appendChild(contactIconsList);
        contactNameDiv.appendChild(contactName);
        divWrapper.appendChild(contactNameDiv);
        divWrapper.appendChild(contactIconsContainer);
        contactContainer.appendChild(divWrapper);
        MAIN.appendChild(contactContainer);
    })
}

const renderAddContactModal = () => {
    const addBtn = document.querySelector('.footer__add-button');
    addBtn.addEventListener('click', () => {
        createAddContactModal();
    })
}

const validateForm = formValues => {
    const formInputs = Object.keys(formValues);
    const errorMessages = {};
    formInputs.forEach(input => {
        const { validations } = FORM_FIELDS.filter(field => field.name === input)[0];

        if(!validations.isRequired && formValues[input] === '') {
            return;
        }

        if(validations.isRequired && formValues[input] === '') {
            errorMessages[input] = `The ${input} can not be empty`;
            return;
        }
        
        if(validations.minLength !== null && formValues[input].length < validations.minLength) {
            errorMessages[input] = `The ${input} is to short`;
            return;
        }

        if(validations.maxLength !== null && formValues[input].length > validations.maxLength) {
            errorMessages[input] = `The ${input} is to long`;
            return;
        }

        if(!validations.regexVal.test(formValues[input])) {
            errorMessages[input] = `The ${input} is not valid`;
            return;
        }
    })

    return errorMessages;
}

const renderErrorMessages = errorMessages => {
    removeErrorMessages();
    Object.keys(errorMessages).forEach(key => {
        const errorInput = document.querySelector(`#${key}`).parentNode;
        const message = createEl('span', {
            textContent: errorMessages[key],
            className: 'form__error-message'
        })
        errorInput.appendChild(message);
    })
}

const removeErrorMessages = () => {
    const errorMessages = [...document.querySelectorAll('.form__error-message')];
    errorMessages.forEach(message => message.remove());
}

const getFormValues = () => {
    let values = {};
    const formElements = [...document.querySelectorAll('.form__input')];
    formElements.forEach(element => {
        values = {
            ...values,
            [element.name]: element.value,
        }
    })
    return values;
}

const createContactForm = formType => {
    const contactForm = createEl('form', {
        className: `form form__${formType.toLowerCase()}`
    });

    FORM_FIELDS.forEach(field => {
        const formGroup = createEl('div', {
            className: 'form__group',
        });

        const divInput = createEl('div', {
            className:'input-div',
        });

        const input = createEl('input', {
            className: `form__input ${field.className}`,
            name: field.name,
            id: field.name,
            type: field.type
        }, {
            focus: removeErrorMessages,
        });

        const label = createEl('label', {
            textContent: field.label,
            className: 'form__label',
            htmlFor: field.name
        })

        divInput.appendChild(input)
        formGroup.appendChild(label);
        formGroup.appendChild(divInput);
        contactForm.appendChild(formGroup);
    })

    const buttonsContainer = createEl('div', {
        className: 'form__buttons-container'
    })

    const actionContactButton = createEl('button', {
        textContent: `${formType} Contact`,
        className: `form__${formType.toLowerCase()}-button`
    }, {
        click: function(event) {
            event.preventDefault();
            if(formType === CONTACT_FORM_TYPES.add) {
                handleAddContactBtnClick();
            } else {
                state.isEditing = false;
                setLocalStorageState(state);
                const selectedContactEmail = this.parentNode.parentNode.parentNode.dataset.email;
                handleEditContactBtnClick(selectedContactEmail);
            }
        }
    })

    const cancelButton = createEl('button', {
        textContent: 'Cancel',
        className: 'form__cancel-button'
    }, {
        click: function(event) {
            event.preventDefault();
            if(formType === CONTACT_FORM_TYPES.add) {
                removeModal();
            } else {
                state.isEditing = false;
                setLocalStorageState(state);
                removeEditContactForm();
            }
        }
    })

    buttonsContainer.appendChild(actionContactButton);
    buttonsContainer.appendChild(cancelButton);
    contactForm.appendChild(buttonsContainer);
    return contactForm;
}

const removeEditContactForm = () => {
    const editForm = document.querySelector('.form__edit');
    editForm.remove();
}

const getContactId = contactEmail => {
    const contact = state.contacts.filter(contact => contact.email === contactEmail)[0];
    return contact.id;
}

const removeContactsList = () => {
    const contactsList = [...document.querySelectorAll('.contact')];
    contactsList.forEach(contact => contact.remove());
}

const updateContacts = newContactState => {
    const { contacts } = state;
    contacts.forEach((contact, index) => {
        if(contact.id === newContactState.id) {
            contacts[index] = newContactState;
            return;
        }
    })
}

const insertIdToUpdatedValues = (inputValues, email) => {
    const contactId = getContactId(email);
    return {
        ...inputValues,
        id: contactId,
    }
}

const handleEditContactBtnClick = contactEmail => {
    const inputValues = getFormValues();
    const errorMessages = validateForm(inputValues);
    if(Object.keys(errorMessages).length === 0) {
        const contactAlreadyExists = checkContactExists(inputValues.email);
        if(!contactAlreadyExists || inputValues.email === contactEmail) {
            const newContactState = insertIdToUpdatedValues(inputValues, contactEmail);
            updateContacts(newContactState)
            setLocalStorageState(state);
            removeContactsList();
            renderContactList();
        } else {
            renderAlreadyExistsError();
        }
    } else {
        renderErrorMessages(errorMessages);
    }
}

const handleAddContactBtnClick = () => {
    const formValues = getFormValues();
    const errorMessages = validateForm(formValues);
    if (Object.keys(errorMessages).length === 0) {
        const contactAlreadyExists = checkContactExists(formValues.email);
        if(!contactAlreadyExists) {
            const valuesWithId = addUniqueId(formValues);
            addContactState(valuesWithId);
            renderContactList();
            removeModal();
        } else {
            renderAlreadyExistsError();
        }
    } else {
        renderErrorMessages(errorMessages);
    }
}

const renderAlreadyExistsError = () => {
    renderErrorMessages({
        email: 'This email is already registered',
    });
}

const checkContactExists = newContactEmail => {
    let contactAlreadyExists = false;
    state.contacts.forEach(contact => {
        if(contact.email === newContactEmail) {
            contactAlreadyExists = true;
            return;
        }
    })
    return contactAlreadyExists;
}

const addContactState = newState => {
    state.contacts.push(newState);
    setLocalStorageState(state);
}

const removeContactState = newState => {
    state.contacts = newState;
    setLocalStorageState(state);
}

const addUniqueId = valuesObj => {
    return {
        ...valuesObj,
        id: crypto.randomUUID(),
    }
}

const removeModal = () => {
    document.querySelector('.modal-container').remove();
}

const createAddContactModal = () => {
    const modalContainer = createEl('div', {
        className: 'modal-container'
    }, {
        click: function ({ target }) {
            if(target.classList.contains('modal-container')) {
                return removeModal()
            }
        },
    })

    const modal = createEl('div', {
        className: 'modal'
    })

    modalContainer.appendChild(modal);
    document.querySelector('#app').appendChild(modalContainer);
    modal.appendChild(createContactForm(CONTACT_FORM_TYPES.add));
}

const INIT = () => {
    checkLocalStorage();
    renderAddContactModal();
    renderContactList();
}

INIT();

// 1 - I used the email as the mean to check the contact's identity, in order to avoid exposing the id as a data-attribute.
// Is there a better strategy to deal with this?

// 2 - Is there a way to avoid the need to hover quickly to the tooltip so it does not hide?

// 3 - See line 391.