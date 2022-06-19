const INITIAL_STATE = {
    contacts: [],
    favorites: [],
    selected: [],
    isTooltipActive: false,
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
            isRequired: false,
            regexVal: /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{3})(?: *x(\d+))?\s*$/i,
        }
    },
];

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
        }
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
    state = {
        ...state,
        isTooltipActive: true,
    };
    createToolTip(htmlContextContainer, email);
}

const hideTooltip = () => {
    state = {
        ...state,
        isTooltipActive: false,
    };
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

const editContact = () => {
    console.log('Edit contact');
}

const deleteContact = contactInfo => {
    const contactContainer = document.querySelector(`[data-email="${contactInfo}"]`);
    contactContainer.remove();
    const { contacts } = state;
    const contactId = contacts.filter(contact => contact.email === contactInfo)[0].id;
    if(state.favorites.includes(contactId)) {
        updateFavoritesState(contactId);
    }
    const newContacts = contacts.filter(contact => contact.email !== contactInfo);
    removeContactState(newContacts);
}

const selectContact = () => {
    console.log('Select contact');
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
                    editContact();
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
                    selectContact();
                },
                blur: function() {
                    // why do I need to check the state here??
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
    const { contacts } = state;
    contacts.forEach(contact => {
        const contactContainer = createEl('div', {
            className: 'contact',
            data: {
                email: contact.email
            }
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

        contactIconsContainer.appendChild(contactIconsList);
        contactNameDiv.appendChild(contactName);
        contactContainer.appendChild(contactNameDiv);
        contactContainer.appendChild(contactIconsContainer);
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

const createAddContactForm = () => {
    const addContactForm = createEl('form', {
        className: 'form'
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
        addContactForm.appendChild(formGroup);
    })

    const addContactButton = createEl('button', {
        textContent: 'Add Contact',
        className: 'form__add-button'
    }, {
        click: function(event) {
            event.preventDefault();
            handleAddContactBtnClick();
        }
    })

    addContactForm.appendChild(addContactButton);
    return addContactForm;
}

const handleAddContactBtnClick = () => {
    const formValues = getFormValues();
    const errorMessages = validateForm(formValues);
    if (Object.keys(errorMessages).length === 0) {
        const contactAlreadyExists = checkContactExists(formValues.email);
        if(!contactAlreadyExists) {
            const valuesWithId = addUniqueId(formValues);
            addContactState(valuesWithId);
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
        }
    })
    return contactAlreadyExists;
}

const addContactState = newState => {
    state.contacts.push(newState);
    setLocalStorageState(state);
    renderContactList();
}

const removeContactState = newState => {
    state.contacts = newState;
    setLocalStorageState(state);
    renderContactList();
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
    modal.appendChild(createAddContactForm());
}

const INIT = () => {
    checkLocalStorage();
    renderAddContactModal();
    renderContactList();
}

INIT();

console.log(state);